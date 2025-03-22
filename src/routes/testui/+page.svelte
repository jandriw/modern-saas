<script>
  // @ts-nocheck
  import CompletionChart from "$lib/components/CompletionChart.svelte";
  import Month from "$lib/components/Month.svelte";
	import TestChart from "$lib/components/TestChart.svelte";
  import HabitsDayGrid from "$lib/components/HabitsDayGrid.svelte";

  let year = 2025
  let month = 1

  const data = [
    {
        "goal_id": "56c87be7-fcbc-4612-ad0e-8285e3681d94",
        "year": 2024,
        "month": 11,
        "dates": [
            "2024-12-28"
        ]
    },
    {
        "goal_id": "56c87be7-fcbc-4612-ad0e-8285e3681d94",
        "year": 2025,
        "month": 0,
        "dates": []
    },
    {
        "goal_id": "56c87be7-fcbc-4612-ad0e-8285e3681d94",
        "year": 2025,
        "month": 1,
        "dates": []
    },
    {
        "goal_id": "56c87be7-fcbc-4612-ad0e-8285e3681d94",
        "year": 2025,
        "month": 2,
        "dates": [
            "2025-03-02",
            "2025-03-06",
            "2025-03-09",
            "2025-03-10",
            "2025-03-11",
            "2025-03-13",
            "2025-03-14",
            "2025-03-15",
            "2025-03-16",
            "2025-03-20",
            "2025-03-21"
        ]
    }
]

  let completionSeries = [80, 15]

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

<CompletionChart {completionSeries} />
<HabitsDayGrid {data}/>