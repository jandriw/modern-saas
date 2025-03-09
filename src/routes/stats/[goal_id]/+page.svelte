<script lang="ts">
  import CompletionChart from "$lib/components/CompletionChart.svelte";
  import { filterMonthsForCompletion } from "$lib/stores/stats";
  import type { PageData } from "./$types";

  export let data: PageData;

  interface FilteredDate {
    goal_id: string;
    year: number;
    month: number;
    dates: string[];
  }

  let goal = getGoalByGoalID(data.urlGoal)
  let showData = JSON.stringify(data.dates, null, 4)

  $: filterMonths = filterByLastMonths(data.dates, $filterMonthsForCompletion)
  $: parsedData = JSON.stringify(filterMonths, null, 4)

  if (!goal) {
    goal = "Error 404: This goal doesn't exist."
  }

  function getGoalByGoalID( goalIDBuscado: any) {
    const objetoEncontrado = data.goals.find((objeto: { id: any; }) => objeto.id === goalIDBuscado);
    return objetoEncontrado ? objetoEncontrado.goal : null;
  }

  function filterByLastMonths(data: FilteredDate[], months: number): FilteredDate[] {
    if (months === 0) return data; // No filtrado, devuelve todo

    const today = new Date();
    const cutoffDate = new Date(today.getFullYear(), today.getMonth() - months, 1);

    return data.filter(entry => {
        const entryDate = new Date(entry.year, entry.month - 1, 1); // Crear fecha base del mes
        return entryDate >= cutoffDate;
    });
  }

</script>
{#if goal === "Error 404: This goal doesn't exist."}
  <h2>{goal}</h2>
{:else}
  <h2>{goal}</h2>
  <CompletionChart />
{/if}
<pre>
  {showData}
</pre>
<p>Other Data:</p>
<pre>
  {parsedData}
</pre>