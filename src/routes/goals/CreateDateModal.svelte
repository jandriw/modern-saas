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
    <h3 class="text-xl font-medium">Have you complete your goal today?</h3>
    <Button type="submit" class="w-full">Done!</Button>
  </form>
</Modal>