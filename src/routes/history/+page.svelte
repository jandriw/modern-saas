<script lang="ts">
  import { Button, Dropdown, DropdownItem } from 'flowbite-svelte';
  import type { PageData } from "./$types";
  import Month from '$lib/components/Month.svelte';

  export let data: PageData;

  interface FilteredDate {
    goal_id: string | null;
    year: number;
    month: number;
    dates: string[];
  }

  let dropdownOpen = false

  $: dates = data.dates
  $: goals = data.goals
  $: activeGoal = goals[0].goal
  $: goal_id = getGoalIdByGoal(activeGoal)
  $: yearDates = filterByGoalAndYear(dates, goal_id, year)
  
  // Inicializar con el año actual pero permitir cambios
  let year = new Date().getFullYear();
  
  function previousYear() {
    year -= 1;
  }
  
  function nextYear() {
    year += 1;
  }

  function setGoal(goal: string | null) {
    if(!goal) {
      dropdownOpen = false
      return
    }
    activeGoal = goal
    dropdownOpen = false
  }

  function getGoalIdByGoal( goalBuscado: any) {
    const objetoEncontrado = data.goals.find((objeto: { goal: any; }) => objeto.goal === goalBuscado);
    return objetoEncontrado ? objetoEncontrado.id : null;
  }

  function filterByGoalAndYear(
  data: FilteredDate[],
  goalId: string | null,
  year: number
): FilteredDate[] {
  // Primero filtramos los objetos que coincidan con el goal_id y year
  const filteredData = data.filter(
    (item) => item.goal_id === goalId && item.year === year
  );

  // Creamos un objeto para almacenar los meses que ya existen
  const existingMonths: Record<number, boolean> = {};
  
  filteredData.forEach((item) => {
    existingMonths[item.month] = true;
  });

  // Creamos un array con todos los meses del año
  const result: FilteredDate[] = [...filteredData];
  
  // Agregamos los meses faltantes con arrays de fechas vacíos
  for (let month = 0; month <= 11; month++) {
    if (!existingMonths[month]) {
      result.push({
        goal_id: goalId,
        year: year,
        month: month,
        dates: []
      });
    }
  }
  
  // Ordenamos el resultado por mes
  return result.sort((a, b) => a.month - b.month);
}
  
  // Función para manejar clics en los días
  function buttonClicked () {};
</script>

<div class="year-container">
  <Button>{activeGoal}</Button>
  <Dropdown {activeGoal} bind:open={dropdownOpen}>
    {#each goals as goal}
      <DropdownItem on:click={() => setGoal(goal.goal)}>{goal.goal}</DropdownItem>
    {/each}
  </Dropdown>
  <div class="year-header">
    <button class="arrow-button" on:click={previousYear}>←</button>
    <h1 class="year-title">{year}</h1>
    <button 
      class="arrow-button {year >= new Date().getFullYear() ? 'disabled' : ''}" 
      on:click={nextYear} 
      disabled={year >= new Date().getFullYear()}
    >
    →
    </button>
  </div>
  
  <div class="months-grid">
    {#each yearDates as month}
      <div class="month-item">
        <Month year={month.year} month={month.month} completedDays={month.dates} {buttonClicked} />
      </div>
    {/each}
  </div>
</div>

<style>
  .year-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }
  
  .year-header {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    margin-top: 20px;
    width: 100%;
  }
  
  .year-title {
    margin: 0 20px;
    font-size: 2rem;
    font-weight: bold;
  }
  
  .arrow-button {
    background-color: rgb(34, 77, 157);
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .arrow-button:hover {
    background-color: rgb(24, 54, 110);
  }
  
  .months-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(4, auto);
    gap: 20px;
    max-width: 1000px;
  }
  
  .month-item {
    display: flex;
    justify-content: center;
  }

  .disabled {
    background-color: #ccc !important;
    cursor: not-allowed;
    opacity: 0.5;
  }
  
  @media (max-width: 900px) {
    .months-grid {
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(6, auto);
    }
  }
  
  @media (max-width: 600px) {
    .months-grid {
      grid-template-columns: 1fr;
      grid-template-rows: repeat(12, auto);
    }
  }
</style>