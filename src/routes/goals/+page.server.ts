import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { setError, superValidate } from "sveltekit-superforms/server";
import { createGoalSchema, deleteGoalSchema } from "$lib/schemas";
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
  return {
    createGoalForm: superValidate(createGoalSchema, {
      id: "create",
    }),
    goals: getGoals(),
    deleteGoalForm: superValidate(deleteGoalSchema, {
      id: "delete",
    }),
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
};