<script lang="ts">
  import type { PageData } from "./$types";

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