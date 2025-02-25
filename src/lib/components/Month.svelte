<script>
  import Checkbox from "./Checkbox.svelte";

  export let year = 2024; // Año del mes a mostrar
  export let month = 1; // Febrero (Los meses en JS van de 0 a 11)

  // Días de la semana
  const daysOfWeek = ["M", "T", "W", "Th", "F", "S", "Su"];

  // Obtener el primer día del mes (0 = Domingo, 6 = Sábado)
  let firstDay = new Date(year, month, 1).getDay();
  firstDay = firstDay === 0 ? 6 : firstDay - 1; // Ajustar para que empiece en lunes

  // Obtener la cantidad de días del mes
  let daysInMonth = new Date(year, month + 1, 0).getDate();

  // Obtener la fecha de hoy
  let today = new Date();
</script>

<!-- Encabezado con los días de la semana -->
<style>
  .month-container {
    display: grid;
    grid-template-columns: repeat(7, 1fr); /* 7 columnas de tamaño igual */
    gap: 5px; /* Espaciado uniforme en todas direcciones */
    width: max-content;
  }

  .day-label {
    font-weight: bold;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px; /* Tamaño igual a las casillas */
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
    <Checkbox date={new Date(year, month, i + 1)} today={today} />
  {/each}
</div>
