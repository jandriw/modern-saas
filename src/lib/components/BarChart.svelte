<script>
  //@ts-nocheck
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  let chartDiv;
  let chartInstance;
  let startIndex = 0;

  export let dates = [12, 23, 30];
  export let categories = ["Nov", "Dec", "Jan"];

  let options = {
    chart: {
      type: "bar",
      background: "#1F2937",
      height: 300,
      toolbar: { show: false },
    },
    series: [{ name: "Sales", data: dates.slice(0, 12) }],
    xaxis: {
      categories: categories.slice(0, 12),
      labels: { style: { colors: "#D1D5DB" } },
      tickPlacement: "on",
    },
    yaxis: {
      min: 0,
      max: 30,
      tickAmount: 3,
      labels: { style: { colors: "#D1D5DB" } },
    },
    colors: ["#3B82F6"],
    dataLabels: { enabled: false },
    stroke: { width: 2 },
    grid: { borderColor: "#6B7280" },
    tooltip: {
      theme: "dark",
      x: { show: false },
      y: {
        title: { formatter: () => "" },
        formatter: (val) => val,
      },
      fillSeriesColor: false,
      marker: { show: false },
      background: "#374151",
    },
  };

  onMount(async () => {
    if (browser) {
      const ApexCharts = (await import('apexcharts')).default;
      chartInstance = new ApexCharts(chartDiv, options);
      chartInstance.render();
    }

    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  });

  // 🔄 Actualiza los datos cuando `dates` o `categories` cambian
  $: {
    if (chartInstance) {
      chartInstance.updateSeries([{ name: "Sales", data: dates }]);
      chartInstance.updateOptions({ xaxis: { categories: categories } });
    }
  }

  function updateChart() {
    let endIndex = startIndex + 12;
    if (chartInstance) {
      chartInstance.updateSeries([{ name: "Sales", data: dates.slice(startIndex, endIndex) }]);
      chartInstance.updateOptions({ xaxis: { categories: categories.slice(startIndex, endIndex) } });
    }
  }

  function moveLeft() {
    if (startIndex > 0) {
      startIndex -= 1;
      updateChart();
    }
  }

  function moveRight() {
    if (startIndex + 12 < dates.length) {
      startIndex += 1;
      updateChart();
    }
  }
</script>

<div class="flex items-center space-x-2 bg-gray-800 rounded-md border border-gray-700 p-4">
  {#if dates.length > 12}
    <button 
      on:click={moveLeft} 
      class="text-white text-2xl font-bold px-2 py-1 rounded-md transition duration-200 hover:text-gray-400 disabled:text-gray-600 disabled:cursor-not-allowed"
      disabled={startIndex === 0}
    >←</button>
  {/if}

  <div class="w-[455px] max-w-full">
    <div bind:this={chartDiv}></div>
  </div>

  {#if dates.length > 12}
    <button 
      on:click={moveRight} 
      class="text-white text-2xl font-bold px-2 py-1 rounded-md transition duration-200 hover:text-gray-400 disabled:text-gray-600 disabled:cursor-not-allowed"
      disabled={startIndex + 12 >= dates.length}
    >→</button>
  {/if}
</div>
