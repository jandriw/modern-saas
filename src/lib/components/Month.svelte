<script>
  // @ts-nocheck
  
  import Checkbox from "./Checkbox.svelte";
  
  export let year = 2024;
  export let month = 1;
  export let completedDays = []; // Recibe las fechas marcadas como 'YYYY-MM-DD'
  export let buttonClicked;
  
  const daysOfWeek = ["M", "T", "W", "Th", "F", "S", "Su"];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  // Hacemos estos cálculos reactivos para que se actualicen cuando cambia el año o el mes
  $: firstDay = new Date(year, month, 1).getDay();
  $: firstDay = firstDay === 0 ? 6 : firstDay - 1; // Ajuste para que inicie en lunes
  
  $: daysInMonth = new Date(year, month + 1, 0).getDate();
  $: today = new Date();
  
  // Verificamos la reactividad
  $: console.log('Month component - Year:', year, 'Month:', month);
  
  // Normaliza una fecha a formato 'YYYY-MM-DD'
  function formatDate(date) {
    return date.toISOString().split("T")[0];
  }
</script>
  
<div class="main-container">
  <p class="month-header">{monthNames[month]} {year}</p>
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
      year={year} 
      status={completedDays.includes(formatDate(new Date(year, month, i + 2))) ? "checked" : "unchecked"}
      {buttonClicked}
    />
  {/each}
  
  </div>
</div>

<style>
  .main-container {
    display: flex;
    flex-direction: column;
    margin-bottom: 2px;
  }

  .month-header {
    text-align: center;
    place-content: center;
    background-color: rgb(34, 77, 157);
  }
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