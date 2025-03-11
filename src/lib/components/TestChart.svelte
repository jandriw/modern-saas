<script>
  //@ts-nocheck
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  
  let chartDiv;
  let chartInstance;
  
  export let options = {
    chart: {
      type: "bar",
    },
    series: [
      {
        name: "sales",
        data: [30, 40, 35, 50, 0, 60, 70, 91, 125],
      },
    ],
    xaxis: {
      categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999],
    },
  };
  
  onMount(async () => {
    if (browser) {
      const ApexCharts = (await import('apexcharts')).default;
      const { chart } = await import('svelte-apexcharts');
      
      // Inicializa el gráfico manualmente
      chartInstance = new ApexCharts(chartDiv, options);
      chartInstance.render();
    }
    
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  });
</script>

<div bind:this={chartDiv}></div>