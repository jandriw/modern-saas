<script>
  import Month from '$lib/components/Month.svelte';
  
  // Inicializar con el año actual pero permitir cambios
  let year = new Date().getFullYear();
  /**
	 * @type {never[]}
	 */
   export let completedDays = []; // Recibe las fechas marcadas como 'YYYY-MM-DD'
  
  function previousYear() {
    year -= 1;
  }
  
  function nextYear() {
    year += 1;
  }
  
  // Función para manejar clics en los días
  export let buttonClicked = () => {};
  
  // Array con los índices de los meses (0-11)
  const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  
  // Clave única para forzar la recreación de los componentes Month cuando cambia el año
  $: yearKey = `year-${year}`;
</script>

<div class="year-container">
  <div class="year-header">
    <button class="arrow-button" on:click={previousYear}>←</button>
    <h1 class="year-title">{year}</h1>
    <button class="arrow-button" on:click={nextYear}>→</button>
  </div>
  
  <div class="months-grid">
    {#each months as month (yearKey + '-' + month)}
      <div class="month-item">
        <Month {year} {month} {completedDays} {buttonClicked} />
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