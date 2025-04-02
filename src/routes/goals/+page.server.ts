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
      .order("date", { ascending: true });

    if (daysError) {
      throw error(500, "Error fetching completed days, please try again later.");
    }

    const groupedDays: CompletedDays = {};

    completedDays.forEach(({ goal_id, date }: { goal_id: string; date: string }) => {
      const [year, month] = date.split("-");
      const jsMonth = (parseInt(month, 10) - 1).toString().padStart(2, "0");
      
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

    return groupedDays;
  }

  function displayDates(groupedDays: CompletedDays): FilteredDate[] {
    const filteredDates: FilteredDate[] = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0-11 format para JavaScript
    
    Object.keys(groupedDays).forEach((goal_id) => {
      const allDates: { year: number; month: number }[] = [];
      let minYear = currentYear;
      let minMonth = currentMonth;
      let maxYear = currentYear;
      let maxMonth = currentMonth;
      
      // Determinar el rango de fechas para este goal
      Object.keys(groupedDays[goal_id]).forEach((year) => {
        Object.keys(groupedDays[goal_id][year]).forEach((month) => {
          const yearNum = Number(year);
          const monthNum = Number(month);
          
          // Actualizar mínimos
          if (yearNum < minYear || (yearNum === minYear && monthNum < minMonth)) {
            minYear = yearNum;
            minMonth = monthNum;
          }
          
          // Actualizar máximos (asegurando que incluimos al menos el mes actual)
          if (yearNum > maxYear || (yearNum === maxYear && monthNum > maxMonth)) {
            maxYear = yearNum;
            maxMonth = monthNum;
          }
        });
      });
      
      // Asegurarse de que el mes actual esté dentro del rango
      if (maxYear < currentYear || (maxYear === currentYear && maxMonth < currentMonth)) {
        maxYear = currentYear;
        maxMonth = currentMonth;
      }
      
      // Generar todos los meses consecutivos dentro del rango
      let tempDate = new Date(minYear, minMonth, 1);
      const endDate = new Date(maxYear, maxMonth, 1);
      
      while (tempDate <= endDate) {
        allDates.push({
          year: tempDate.getFullYear(),
          month: tempDate.getMonth()
        });
        
        // Avanzar al siguiente mes
        tempDate.setMonth(tempDate.getMonth() + 1);
      }
      
      // Ordenar las fechas (aunque ya deberían estar ordenadas)
      allDates.sort((a, b) => a.year === b.year ? a.month - b.month : a.year - b.year);
      
      // Tomar solo los últimos 4 meses
      const lastFourMonths = allDates.slice(-4);
      
      lastFourMonths.forEach(({ year, month }) => {
        // Convertir el número de mes a string con padding para mantener compatibilidad
        const monthStr = month.toString().padStart(2, "0");
        
        // Verificar si existen datos para este mes
        const dates = groupedDays[goal_id]?.[year.toString()]?.[monthStr] || [];
        
        filteredDates.push({
          goal_id,
          year,
          month,
          dates: dates,
        });
      });
    });
    
    return filteredDates;
  }

  let days = await getCompletedDays();
  
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

    const deleteDateForm = await superValidate(event, deleteDateSchema, {
      id: "deleteDate",
    });

    if (!deleteDateForm.valid) {
      return fail(400, {
        deleteDateForm,
      });
    }

    const { error: deleteDateError } = await event.locals.supabase
      .from("dates")
      .delete()
      .eq("goal_id", deleteDateForm.data.id)
      .eq("date", deleteDateForm.data.date);

    if (deleteDateError) {
      return setError(deleteDateForm, null, "Error deleting today's progress");
    }

    return {
      deleteDateForm,
    };
  },
};