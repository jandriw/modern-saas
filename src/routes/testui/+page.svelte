<script>
// @ts-nocheck

  import Checkbox from "$lib/components/Checkbox.svelte";
  import Month from "$lib/components/Month.svelte";

  // Definimos fechas de ejemplo
  let today = new Date();
  let yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  let futureDate = new Date();
  futureDate.setDate(today.getDate() + 1);

  let oldDate = new Date();
  oldDate.setDate(today.getDate() - 5);
</script>

<main style="display: flex; gap: 10px;">
  <!-- Casilla pasada con check -->
  <Checkbox date={oldDate} status="checked" />

  <!-- Casilla pasada sin check -->
  <Checkbox date={yesterday} status="unchecked" />

  <!-- Casilla activa (día actual) -->
  <Checkbox date={today} />

  <!-- Casilla futura -->
  <Checkbox date={futureDate} />

  <Month year={2025} month={3} />
</main>