import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { setError, superValidate } from "sveltekit-superforms/server";
import { createDateSchema, createGoalSchema, deleteGoalSchema } from "$lib/schemas";
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

  async function getCompletedDays() {
    const { data: completedDays, error: daysError } = await event.locals.supabase
      .from("dates")
      .select("goal_id, date")
      .order("date", { ascending: true });
  
    if (daysError) {
      throw error(500, "Error fetching completed days, please try again later.");
    }
  
    // Definir el tipo del objeto acumulador
    const groupedDays: Record<string, string[]> = completedDays.reduce((acc, entry) => {
      if (!acc[entry.goal_id]) {
        acc[entry.goal_id] = [];
      }
      acc[entry.goal_id].push(entry.date);
      return acc;
    }, {} as Record<string, string[]>);
  
    return groupedDays;
  }
  
  return {
    createGoalForm: superValidate(createGoalSchema, {
      id: "create",
    }),
    goals: await getGoals(),
    deleteGoalForm: superValidate(deleteGoalSchema, {
      id: "delete",
    }),
    dates: await getCompletedDays(),
    createDateForm: superValidate(createDateSchema, {
      id: "date"
    })
  };
};

//TODO: Crear nuevo 'action' llamado addDate tomando como base cualquiera de los existentes. Ver los schemas necesarios y probar

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
    console.log("addDate Submitted")
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
};