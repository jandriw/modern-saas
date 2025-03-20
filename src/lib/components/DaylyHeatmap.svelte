<script lang="ts">
  //@ts-nocheck
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  interface FilteredDate {
    goal_id: string;
    year: number;
    month: number;
    dates: string[];
  }

  export let dataFromParent: FilteredDate[];
  
  $: heatmapData = calculateOptimalDays(dataFromParent);

  let chartDiv: HTMLDivElement;
  let chartInstance: ApexCharts;

  let options = {
    chart: {
      type: 'heatmap',
      background: '#1f2937',
      width: '350px',
      height: 110,
      toolbar: { show: false },
    },
    dataLabels: { enabled: false },
    colors: ['#16a34a'],
    xaxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      labels: { style: { colors: '#fff' } }
    },
    yaxis: {
      labels: { style: { colors: '#fff' } }
    },
    grid: {
      borderColor: '#374151'
    },
    tooltip: {
      theme: "dark",
      x: { show: false },
      y: {
        title: { formatter: () => "" }, // Elimina el título del tooltip
        formatter: (val) => val, // Muestra solo el valor
      },
      fillSeriesColor: false,
      marker: { show: false },
      background: "#374151",
    },
    series: [{ name: '', data: heatmapData }]
  };

  // 🛠 Actualizar la serie correctamente
  $: {
    if (chartInstance) {
      chartInstance.updateSeries([{ name: '', data: heatmapData }]);
    }
  }

  // ✅ También en onMount, pasamos las opciones con la serie ya incluida
  onMount(async() => {
    if (browser) {
      const ApexCharts = (await import('apexcharts')).default;
      chartInstance = new ApexCharts(chartDiv, options);
      chartInstance.render();
    }
    return () => {
      if (chartInstance) chartInstance.destroy();
    };
  });

  const weekDaysLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  function calculateOptimalDays(data: FilteredDate[]) {
    const weekDays = Array(7).fill(0); // Inicializar array con 0

    data.forEach(entry => {
      entry.dates.forEach(dateStr => {
        const day = new Date(dateStr).getDay(); // Obtener día (0 = Domingo, ..., 6 = Sábado)
        weekDays[day]++;
      });
    });

    // Reorganizar para que empiece en Lunes y termine en Domingo
    const reorderedDays = [...weekDays.slice(1), weekDays[0]];
    const maxCount = Math.max(...reorderedDays);

    return reorderedDays.map((count, index) => ({
      x: weekDaysLabels[index], // Lunes - Domingo
      y: count
    }));
  }
</script>

<div class="flex flex-col w-fit items-center bg-gray-800 rounded-md border border-gray-700 p-4">
  <div class="w-full px-6">
    <h5 class="mt-5 text-white w-full text-left">Optimal Days</h5>
    <p class="text-slate-400 text-lg font-semibold w-full text-left">Heatmap of activity</p>
  </div>
  <div bind:this={chartDiv}></div>
</div>