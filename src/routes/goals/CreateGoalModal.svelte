<script lang="ts">
  import type { CreateGoalSchema } from "$lib/schemas";
  import { Button, Modal } from "flowbite-svelte";
  import { superForm } from "sveltekit-superforms/client";
  import type { Validation } from "sveltekit-superforms/index";
  export let data: Validation<CreateGoalSchema>;
  export let open = false;
  const { form, errors, enhance } = superForm(data, {
    resetForm: true,
    onResult: ({ result }) => {
      if (result.type === "success") {
        open = false;
        return;
      }
    },
  });
</script>

<Modal bind:open size="xs" autoclose={false} class="w-full">
  <form method="POST" action="?/createGoal" class="flex flex-col space-y-6" use:enhance>
    <h3 class="text-xl font-medium">Create a new Goal</h3>
    {#if $errors._errors}
      <span class="block text-red-600 dark:text-red-500">{$errors._errors}</span>
    {/if}
    <label class="space-y-2" for="goal">
      <span>Goal</span>
      <input type="text" name="goal" bind:value={$form.goal} />
      {#if $errors.goal}
        <span class="block text-red-600 dark:text-red-500">{$errors.goal}</span>
      {/if}
    </label>
    <Button type="submit" class="w-full">Create Goal</Button>
  </form>
</Modal>