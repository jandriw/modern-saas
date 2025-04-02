<script lang="ts">
  import BarChart from "$lib/components/BarChart.svelte";
  import CompletionChart from "$lib/components/CompletionChart.svelte";
  import Streak from "$lib/components/Streak.svelte";
  import Consistency from "$lib/components/Consistency.svelte";
  import DaylyHeatmap from "$lib/components/DaylyHeatmap.svelte";
  import { filterMonthsForCompletion } from "$lib/stores/stats";
	import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import {
    Button,
    Dropdown,
    Chevron,
    DropdownItem,
  } from "flowbite-svelte";
	import HabitsDayGrid from "$lib/components/HabitsDayGrid.svelte";
	import Motivation from "$lib/components/Motivation.svelte";

  export let data: PageData;

  interface FilteredDate {
    goal_id: string;
    year: number;
    month: number;
    dates: string[];
  }

  let goal = getGoalByGoalID(data.urlGoal)
  let firstRegister = getFirstRegister(data.dates)
  let showData = JSON.stringify(data.dates, null, 4)

  $: filterMonths = filterByLastMonths(data.dates, $filterMonthsForCompletion)
  $: completionSeries = calculateGoalProgress(filterMonths, firstRegister)
  $: barData = transformData(filterMonths)
  $: bestStreak = getBestStreak(data.dates)
  $: currentStreak = getCurrentStreak(data.dates)

  $: allData = JSON.stringify(data.dates, null, 4)
  $: parsedData = JSON.stringify(filterMonths, null, 4)
  $: showSeries = JSON.stringify(completionSeries, null, 4)
  $: parseBardata = JSON.stringify(barData)

  onMount(() => {
    filterMonths = filterByLastMonths(data.dates, $filterMonthsForCompletion)
  })

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

  function getFirstRegister(data: FilteredDate[]): string | null {
      for (const item of data) {
          if (item.dates.length > 0) {
              return item.dates[0]; // La primera fecha encontrada
          }
      }
      return null; // Si no hay fechas en ningún objeto
  }

  function calculateGoalProgress(data: FilteredDate[], firstRegister: string | null): number[] {
    // Obtener la fecha de inicio (primer día del primer mes del array)
    const startYear = data[0].year;
    const startMonth = data[0].month + 1; // Ajustar a 1-indexed
    let startDate = new Date(startYear, startMonth - 1, 1);
    
    // Determinar la fecha de inicio real si firstRegister no es null
    if (firstRegister) {
        const firstRegisterDate = new Date(firstRegister);
        if (startDate < firstRegisterDate) {
            startDate = firstRegisterDate;
        }
    }
    
    // Obtener la fecha de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Generar todas las fechas en el rango
    const allDates = new Set();
    let currentDate = new Date(startDate);
    let totalDays = 1; // Empezamos en 1 para incluir el primer día
    while (currentDate < today) { // Cambiamos la condición para asegurar contar el último día
        const dateStr = currentDate.toISOString().split('T')[0];
        allDates.add(dateStr);
        currentDate.setDate(currentDate.getDate() + 1);
        totalDays++; // Incrementar el total de días
    }
    
    // Obtener los días cumplidos
    const completedDates = new Set();
    data.forEach(entry => {
        entry.dates.forEach(date => completedDates.add(date));
    });
    
    // Calcular días cumplidos y fallados
    const completedDays = completedDates.size;
    const failedDays = totalDays - completedDays;
    
    return [completedDays, failedDays];
}

  function transformData(inputArray: FilteredDate[]) {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const series = inputArray.map(item => item.dates.length);
    const categories = inputArray.map(item => monthNames[item.month]);
    
    return { series, categories };
  }

  function parseDates(data: FilteredDate[]): number[] {
    return data
        .flatMap(entry => entry.dates.map(date => new Date(date).getTime()))
        .sort((a, b) => a - b);
  }

  function getBestStreak(data: FilteredDate[]) {
      const dates = parseDates(data);
      let maxStreak = 0, currentStreak = 1;
      
      for (let i = 1; i < dates.length; i++) {
          const diff = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
          if (diff === 1) {
              currentStreak++;
          } else {
              maxStreak = Math.max(maxStreak, currentStreak);
              currentStreak = 1;
          }
      }
      return Math.max(maxStreak, currentStreak);
  }

  function getCurrentStreak(data: FilteredDate[]) {
      const dates = parseDates(data);
      if (dates.length === 0) return 0;
      
      let streak = 1;
      for (let i = dates.length - 1; i > 0; i--) {
          const diff = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
          if (diff === 1) {
              streak++;
          } else if (diff > 1) {
              break;
          }
      }
      return streak;
  }

</script>
{#if goal === "Error 404: This goal doesn't exist."}
  <h2>{goal}</h2>
{:else}
<div class="flex flex-col items-center w-fit">
  <div>
    <h2>{goal}</h2>
  </div>
  <div class="flex gap-3">
    <CompletionChart {completionSeries} />
    <BarChart dates={barData.series} categories={barData.categories}/>
    <div class="flex flex-col gap-4">
      <Button color="light"><Chevron>See other</Chevron></Button>
        <Dropdown>
          <DropdownItem href="/account">Settings</DropdownItem>
          <DropdownItem href="/account">Billing</DropdownItem>
        </Dropdown>
      <Streak streak={"Best Streak"} streakNumber={bestStreak}/>
      <Streak streakNumber={currentStreak}/>
    </div>
  </div>
  <Consistency data={data.dates} />
  <Motivation data={data.dates} />
  <DaylyHeatmap dataFromParent={data.dates} />
  <HabitsDayGrid data={data.dates} />
</div>
{/if}
<pre>
  {allData}
</pre>