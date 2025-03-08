<script>
  // @ts-ignore
  import Month from "$lib/components/Month.svelte";
	import TestChart from "$lib/components/TestChart.svelte";

  let year = 2025
  let month = 1

  function buttonClicked() {}

  // Fechas en las que se cumplió el objetivo (formato 'YYYY-MM-DD')
  let completedDays = [
    "2025-02-01",
    "2025-02-03",
    "2025-02-05",
    "2025-02-07",
    "2025-02-10",
    "2025-02-15",
    "2025-02-20"
  ];

  const thisYear = new Date().getFullYear();
  const thisMonth = new Date().getMonth();
  const today = new Date(). getDate();
</script>

<input type="number" bind:value={year}>
<input type="number" bind:value={month}>

<main style="display: flex; gap: 10px;">
  <Month {year} {month} completedDays={completedDays} {buttonClicked}/>
  <TestChart />
</main>