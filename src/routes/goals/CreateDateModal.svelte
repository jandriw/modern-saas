<script lang="ts">
  import type { CreateDateSchema } from "$lib/schemas";
  import { Button, Modal } from "flowbite-svelte";
  import { superForm } from "sveltekit-superforms/client";
  import type { Validation } from "sveltekit-superforms/index";
  export let data: Validation<CreateDateSchema>;
  export let open = false;
  export let goalId: string;
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
  <form method="POST" action="?/addDate" class="flex flex-col space-y-6" use:enhance>
    <input type="hidden" name="goal_id" bind:value="{goalId}" />
    <h3 class="text-xl font-medium">Mark today as done</h3>
    {#if $errors._errors}
      <span class="block text-red-600 dark:text-red-500">{$errors._errors}</span>
    {/if}
    <label class="space-y-2" for="date">
      <span>Today</span>
      <input type="text" name="date" bind:value={$form.date} />
      {#if $errors.date}
        <span class="block text-red-600 dark:text-red-500">{$errors.date}</span>
      {/if}
    </label>
    <Button type="submit" class="w-full">Done !</Button>
  </form>
</Modal>