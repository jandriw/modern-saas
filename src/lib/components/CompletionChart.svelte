<script>
  //@ts-nocheck
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { Button, Dropdown, DropdownItem } from 'flowbite-svelte';
  
  let chartDiv;
  let chartInstance;

  export let options = {
    chart: {
      type: "donut",
      background: "#1F2937",
      width: "250px"
    },
    series: [50, 50],
    labels: ['Positive', 'Negative'],
    colors: ["#00E396", "#FF4560"], 
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        donut: {
          expandOnClick: true, // Habilita el efecto de expansión al hacer clic
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
              label: 'Total',
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
    <h4 class="mt-2">85%</h4>
    <h5 class="text-slate-300 text-lg font-semibold mb-2">Completion Ratio</h5>
  </div>
  <div bind:this={chartDiv}></div>
  <Button class="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 text-center inline-flex items-center dark:hover:text-white bg-transparent hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent focus:ring-transparent dark:focus:ring-transparent py-0">Last 3 Months</Button>
      <Dropdown class="w-40" offset="-6">
        <DropdownItem>Last Month</DropdownItem>
        <DropdownItem>Last 3 Months</DropdownItem>
        <DropdownItem>Last Year</DropdownItem>
        <DropdownItem>All Data</DropdownItem>
      </Dropdown>
</div>