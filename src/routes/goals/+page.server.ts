import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { setError, superValidate } from "sveltekit-superforms/server";
import { createDateSchema, createGoalSchema, deleteGoalSchema, deleteDateSchema } from "$lib/schemas";
import { supabaseAdmin } from "$lib/server/supabase-admin";

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.getSession();
  if (!session) {
    throw redirect(302, "/login");
  }

  async function getGoals() {
    const { data: goals, error: goalsError } = await event.locals.supabase.from("goals").select("*").limit(10);

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
  
  function displayDates(groupedDays: CompletedDays): FilteredDate[] {
    const filteredDates: FilteredDate[] = [];
    
    Object.keys(groupedDays).forEach((goal_id) => {
      const allDates: { year: number; month: number }[] = [];
      
      Object.keys(groupedDays[goal_id]).forEach((year) => {
        Object.keys(groupedDays[goal_id][year]).forEach((month) => {
          allDates.push({ year: Number(year), month: Number(month) });
        });
      });
      
      allDates.sort((a, b) => a.year === b.year ? a.month - b.month : a.year - b.year);
      
      const lastFourMonths = allDates.slice(-4);
      
      lastFourMonths.forEach(({ year, month }) => {
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
    createGoalForm: superValidate(createGoalSchema, {
      id: "create",
    }),
    goals: await getGoals(),
    deleteGoalForm: superValidate(deleteGoalSchema, {
      id: "delete",
    }),
    info: displayDates(days),
    createDateForm: superValidate(createDateSchema, {
      id: "date"
    }),
    deleteDateForm: superValidate(deleteDateSchema, {
      id: "deleteDate"
    })
  };
};

export const actions: Actions = {
  createGoal: async (event) => {
    const session = await event.locals.getSession();
    if (!session) {
      throw error(401, "Unauthorized");
    }

    const createGoalForm = await superValidate(event, createGoalSchema, {
      id: "create",
    });

    if (!createGoalForm.valid) {
      return fail(400, {
        createGoalForm,
      });
    }

    const { error: createGoalError } = await supabaseAdmin.from("goals").insert({
      ...createGoalForm.data,
      user_id: session.user.id,
    });

    if (createGoalError) {
      console.log(createGoalError);
      return setError(createGoalForm, null, "Error creating goal.");
    }

    return {
      createGoalForm,
    };
  },

  deleteGoal: async (event) => {
    const session = await event.locals.getSession();
    if (!session) {
      throw error(401, "Unauthorized");
    }

    const deleteGoalForm = await superValidate(event.url, deleteGoalSchema, {
      id: "delete",
    });

    if (!deleteGoalForm.valid) {
      return fail(400, {
        deleteGoalForm,
      });
    }

    const { error: deleteGoalError } = await event.locals.supabase
      .from("goals")
      .delete()
      .eq("id", deleteGoalForm.data.id);

    if (deleteGoalError) {
      return setError(deleteGoalForm, null, "Error deleting goal");
    }

    return {
      deleteGoalForm,
    };
  },

  addDate: async (event) => {
    const session = await event.locals.getSession();
    if (!session) {
      throw error(401, "Unauthorized");
    }

    const createDateForm = await superValidate(event, createDateSchema, {
      id: "date",
    });

    if (!createDateForm.valid) {
      return fail(400, {
        createDateForm,
      });
    }

    const { error: createDateError } = await supabaseAdmin.from("dates").insert({
      date: createDateForm.data.date,
      goal_id: createDateForm.data.goal_id,
      user_id: session.user.id,
    });

    if (createDateError) {
      console.log(createDateError);
      return setError(createDateForm, null, "Error creating date.");
    }

    return {
      createDateForm,
    };
  },

  deleteDate: async (event) => {
    const session = await event.locals.getSession();
    if (!session) {
      throw error(401, "Unauthorized");
    }

    const deleteDateForm = await superValidate(event.url, deleteDateSchema, {
      id: "deleteDate",
    });

    if (!deleteDateForm.valid) {
      return fail(400, {
        deleteDateForm,
      });
    }

    let today = new Date().toISOString().split('T')[0];

    const { error: deleteDateError } = await event.locals.supabase
      .from("dates")
      .delete()
      .eq("goal_id", deleteDateForm.data.id)
      .eq("date", today);

    if (deleteDateError) {
      return setError(deleteDateForm, null, "Error deleting today's progress");
    }

    return {
      deleteDateForm,
    };
  },
};