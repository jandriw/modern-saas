<script>
// @ts-nocheck

  import Checkbox from "./Checkbox.svelte";

  export let year = 2024;
  export let month = 1;
  export let completedDays = []; // Recibe las fechas marcadas como 'YYYY-MM-DD'

  const daysOfWeek = ["M", "T", "W", "Th", "F", "S", "Su"];

  let firstDay = new Date(year, month, 1).getDay();
  firstDay = firstDay === 0 ? 6 : firstDay - 1; // Ajuste para que inicie en lunes

  let daysInMonth = new Date(year, month + 1, 0).getDate();
  let today = new Date();

  // Normaliza una fecha a formato 'YYYY-MM-DD'
  function formatDate(date) {
    return date.toISOString().split("T")[0];
  }
</script>

<style>
  .month-container {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 5px;
    width: max-content;
  }

  .day-label {
    font-weight: bold;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
  }

  .empty {
    width: 28px;
    height: 28px;
  }
</style>

<div class="month-container">
  {#each daysOfWeek as day}
    <div class="day-label">{day}</div>
  {/each}

  {#each Array(firstDay) as _}
    <div class="empty"></div>
  {/each}

  {#each Array(daysInMonth) as _, i}
    <Checkbox 
      date={new Date(year, month, i + 1)} 
      today={today} 
      status={completedDays.includes(formatDate(new Date(year, month, i + 2))) ? "checked" : "unchecked"}
    />
  {/each}
</div>