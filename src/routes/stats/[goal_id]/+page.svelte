<script lang="ts">
  import CompletionChart from "$lib/components/CompletionChart.svelte";
  import type { PageData } from "./$types";

  export let data: PageData;

  let goal = getGoalByGoalID(data.urlGoal)

  function getGoalByGoalID( goalIDBuscado: any) {
    const objetoEncontrado = data.goals.find((objeto: { id: any; }) => objeto.id === goalIDBuscado);
    return objetoEncontrado ? objetoEncontrado.goal : null;
  }

</script>
<h2>{goal}</h2>
<CompletionChart />