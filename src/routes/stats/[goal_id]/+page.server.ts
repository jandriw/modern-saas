import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { setError, superValidate } from "sveltekit-superforms/server";
import { createDateSchema, createGoalSchema, deleteGoalSchema, deleteDateSchema } from "$lib/schemas";
import { supabaseAdmin } from "$lib/server/supabase-admin";

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.getSession();
  if (!session) {
    throw redirect(302, "/login");
  }

  let urlGoal = event.params.goal_id

  async function getGoals() {
    const { data: goals, error: goalsError } = await event.locals.supabase.from("goals").select("*");

    if (goalsError) {
      throw error(500, "Error fetching goals, please try again later.");
    }
    return goals;
  }

  interface CompletedDays {
    [goal_id: string]: {
      [year: string]: {
        [month: string]: string[];
      };
    };
  }

  interface FilteredDate {
    goal_id: string;
    year: number;
    month: number;
    dates: string[];
  }
  
  async function getCompletedDays(): Promise<CompletedDays> {
    const { data: completedDays, error: daysError } = await event.locals.supabase
      .from("dates")
      .select("goal_id, date")
      .eq("goal_id", event.params.goal_id)
      .order("date", { ascending: true });
  
    if (daysError) {
      throw error(500, "Error fetching completed days, please try again later.");
    }
  
    const groupedDays: CompletedDays = {};
  
    completedDays.forEach(({ goal_id, date }: { goal_id: string; date: string }) => {
      const [year, month] = date.split("-");
      const jsMonth = (parseInt(month, 10) - 1).toString().padStart(2, "0"); // Convertir a formato JS
      
      if (!groupedDays[goal_id]) {
        groupedDays[goal_id] = {};
      }
      if (!groupedDays[goal_id][year]) {
        groupedDays[goal_id][year] = {};
      }
      if (!groupedDays[goal_id][year][jsMonth]) {
        groupedDays[goal_id][year][jsMonth] = [];
      }
      groupedDays[goal_id][year][jsMonth].push(date);
    });
  
    // Rellenar los meses vacíos dentro del rango de fechas en el orden correcto
    Object.keys(groupedDays).forEach((goal_id) => {
      const goalEntries = Object.entries(groupedDays[goal_id]);
      if (goalEntries.length === 0) return;
      
      const years = Object.keys(groupedDays[goal_id]).map(Number).sort((a, b) => a - b);
      const firstYear = years[0];
      const lastYear = years[years.length - 1];
      
      const firstMonth = Math.min(...Object.keys(groupedDays[goal_id][firstYear.toString()]).map(Number));
      const lastMonth = Math.max(...Object.keys(groupedDays[goal_id][lastYear.toString()]).map(Number));
      
      const minDate = new Date(firstYear, firstMonth, 1);
      const maxDate = new Date(lastYear, lastMonth, 1);
      
      let currentDate = new Date(minDate);
      while (currentDate <= maxDate) {
        const year = currentDate.getFullYear().toString();
        const month = currentDate.getMonth().toString().padStart(2, "0");
        
        if (!groupedDays[goal_id][year]) {
          groupedDays[goal_id][year] = {};
        }
        if (!groupedDays[goal_id][year][month]) {
          groupedDays[goal_id][year][month] = [];
        }
        
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    });
  
    return groupedDays;
  }

  function displayAllDates(groupedDays: CompletedDays): FilteredDate[] {
    const filteredDates: FilteredDate[] = [];
    
    Object.keys(groupedDays).forEach((goal_id) => {
      const allDates: { year: number; month: number }[] = [];
      
      Object.keys(groupedDays[goal_id]).forEach((year) => {
        Object.keys(groupedDays[goal_id][year]).forEach((month) => {
          allDates.push({ year: Number(year), month: Number(month) });
        });
      });
      
      // Mantenemos el ordenamiento cronológico
      allDates.sort((a, b) => a.year === b.year ? a.month - b.month : a.year - b.year);
      
      // En lugar de slice(-4), usamos todos los meses
      allDates.forEach(({ year, month }) => {
        filteredDates.push({
          goal_id,
          year,
          month,
          dates: groupedDays[goal_id][year.toString()][month.toString().padStart(2, "0")],
        });
      });
    });
    
    return filteredDates;
  }

  let days = await getCompletedDays()

  return {
    goals: await getGoals(),
    dates: await displayAllDates(days),
    urlGoal: urlGoal
  };
};