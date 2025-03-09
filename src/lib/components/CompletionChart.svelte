<script>
  //@ts-nocheck
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { Button, Dropdown, DropdownItem } from 'flowbite-svelte';
  import { filterMonthsForCompletion } from '$lib/stores/stats';

  export let array = [50, 50]
  
  let chartDiv;
  let chartInstance;

  let dropdownOpen = false
  const periods = ["Last Month", "Last 3 Months", "Last Year", "All Data"]
  const monthsPeriods = [1, 3, 12, 0]

  $: activePeriod = periods[1]

  function setPeriod(period) {
    if(!period) {
      dropdownOpen = false
      return
    }
    activePeriod = period
    dropdownOpen = false
    filterMonthsForCompletion.set(monthsPeriods[periods.indexOf(period)])
  }

  $: options = {
    chart: {
      type: "donut",
      background: "#1F2937",
      width: "250px"
    },
    series: array,
    labels: ['Completed', 'Missed'],
    colors: ["#00E396", "#FF4560"], 
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '22px',
              color: "#fff"
            },
            value: {
              show: true,
              fontSize: '16px',
              fontWeight: 600,
              color: '#fff'
            },
            total: {
              show: true,
              label: 'Total days',
              color: "#fff",
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
              }
            }
          }
        }
      }
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["#1F2937"]
    },
    legend: {
      show: false
    }
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
</script>

<div class="flex flex-col w-fit items-center bg-gray-800 rounded-md border border-gray-700 ">
  <div>
    <h5 class="mt-5">85%</h5>
    <p class="text-slate-400 text-lg font-semibold mb-2">Completion ratio</p>
  </div>
  <div bind:this={chartDiv}></div>
  <Button class="text-sm font-medium text-gray-500 dark:text-blue-700 hover:text-gray-900 text-center inline-flex items-center dark:hover:text-white bg-transparent hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent focus:ring-transparent dark:focus:ring-transparent py-0 mb-2">{activePeriod}</Button>
  <Dropdown class="w-40" offset="-6" {activePeriod} bind:open={dropdownOpen}>
    {#each periods as period}
      <DropdownItem on:click={() => setPeriod(period)}>{period}</DropdownItem>
    {/each}
  </Dropdown>
</div>