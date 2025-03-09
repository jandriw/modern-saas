<script lang="ts">
  import CompletionChart from "$lib/components/CompletionChart.svelte";
	import { error } from "@sveltejs/kit";
  import type { PageData } from "./$types";

  export let data: PageData;

  let goal = getGoalByGoalID(data.urlGoal)

  if (!goal) {
    goal = "Error 404: This goal doesn't exist."
  }

  function getGoalByGoalID( goalIDBuscado: any) {
    const objetoEncontrado = data.goals.find((objeto: { id: any; }) => objeto.id === goalIDBuscado);
    return objetoEncontrado ? objetoEncontrado.goal : null;
  }

</script>
{#if goal === "Error 404: This goal doesn't exist."}
  <h2>{goal}</h2>
{:else}
  <h2>{goal}</h2>
  <CompletionChart />
{/if}