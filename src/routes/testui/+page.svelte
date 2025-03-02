<script>
  // @ts-ignore
  import Month from "$lib/components/Month.svelte";

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
</script>

<main style="display: flex; gap: 10px;">
  <Month year={thisYear} month={thisMonth} completedDays={completedDays} />
</main>
