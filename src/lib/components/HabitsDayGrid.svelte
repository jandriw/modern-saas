<script lang="ts">
	import { browser } from '$app/environment';
  import { Tooltip } from 'flowbite-svelte';
	import { onMount } from 'svelte';
  export let data;

  let chartDiv: HTMLDivElement;
  let chartMissDiv: HTMLDivElement;
  let chartInstance: ApexCharts;
  let chartMissInstance: ApexCharts;

  $: convertData = convertToLast91Days(data);

  //Dias Completados
  $: completedDays = convertData.completedCount > 66 ? 66 : convertData.completedCount
  $: daysLeft = 66 - completedDays
  $: completionSeries = [completedDays, daysLeft]

  //Racha de 3 dias fallidos
  $: missStreak = convertData.longestMissedStreak > 3 ? 3 : convertData.longestMissedStreak
  $: missDaysLeft = 3 - missStreak
  $: missSeries = [missStreak, missDaysLeft]

  //Dias fallidos (no debe superar 30)
  $: missedDays = convertData.missedDaysCount > 30 ? 30 : convertData.missedDaysCount
  $: daysLeftConsolidation = 30 - missedDays
  $: completionSeriesConsolidation = [missedDays, daysLeftConsolidation]

  //Racha de 10 dias fallidos
  $: missStreakConsolidation = convertData.longestMissedStreak > 10 ? 10 : convertData.longestMissedStreak
  $: missDaysLeftConsolidation = 10 - missStreakConsolidation
  $: missSeriesConsolidation = [missStreakConsolidation, missDaysLeftConsolidation]

  //Estado del componente (Building / Consolidating)
  $: habitStatus = convertData.habitBuilded ? "Consolidating" : "Building"
  $: habitStatusMessage = convertData.habitBuilded ? 
    "You have successfully built a habit! 💪🏼 To maintain it, don’t let your missed streak exceed 10 days or have more than 30 days of inactivity in the last 91 days." :
    "To advance to the habit consolidation phase, complete your goal for 66 days within the last 91 days and keep your missed streak below 3 days. 🚀"

  interface FilteredDate {
    goal_id: string;
    year: number;
    month: number;
    dates: string[];
  }

  interface DayData {
    date: string;
    status: "completed" | "missed" | "empty";
  }

  interface ConversionResult {
    last91Days: DayData[][];
    completedCount: number;
    longestMissedStreak: number;
    habitBuilded: boolean;
    missedDaysCount: number;
  }

  function convertToLast91Days(data: FilteredDate[]): ConversionResult {
    const today = new Date();
    const last91Days: DayData[][] = Array.from({ length: 7 }, () => Array(13).fill(null));
    let completedCount = 0;
    let missedDaysCount = 0;
    let longestMissedStreak = 0;
    let currentMissedStreak = 0;

    const recordedDates = new Set<string>();
    data.forEach(entry => entry.dates.forEach(date => recordedDates.add(date)));

    const allDates = Array.from(recordedDates).sort();
    const firstRecordedDate = allDates.length ? new Date(allDates[0]) : today;

    for (let i = 90; i >= 0; i--) {
        const currentDate = new Date();
        currentDate.setDate(today.getDate() - i);
        const dateStr = currentDate.toISOString().split("T")[0];

        let status: "completed" | "missed" | "empty";
        if (currentDate < firstRecordedDate) {
            status = "empty";
        } else {
            if (recordedDates.has(dateStr)) {
                status = "completed";
                completedCount++;
                currentMissedStreak = 0; // Reiniciamos la racha de fallos
            } else {
                status = "missed";
                missedDaysCount++; // Contamos los días fallidos totales
                currentMissedStreak++;
                if (currentMissedStreak > longestMissedStreak) {
                    longestMissedStreak = currentMissedStreak;
                }
            }
        }

        const col = 12 - Math.floor(i / 7);
        const row = i % 7;

        last91Days[row][col] = { date: dateStr, status };
    }

    // 📌 Evaluamos si el hábito se ha perdido
    const habitLost = longestMissedStreak >= 10 || missedDaysCount >= 30;

    // 📌 Si el hábito se ha perdido, habitBuilded = false
    const habitBuilded = completedCount >= 66 && longestMissedStreak <= 3 && !habitLost;

    return { last91Days, completedCount, longestMissedStreak, missedDaysCount, habitBuilded };
  }

  let optionsMiss = {
    chart: {
      type: "donut",
      background: "#1F2937",
      width: "180px",
    },
    series: missSeries,
    labels: ['Miss Streak', 'Days Left'],
    colors: ["#FF4560", "#1F2937"],
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
              fontSize: '12px',
              color: "#fff",
            },
            value: {
              show: true,
              fontSize: '16px',
              fontWeight: 600,
              color: '#fff',
            },
            total: {
              show: true,
              label: 'Max Fail Streak',
              color: "#fff",
              formatter: function (w: { globals: { seriesTotals: any[]; }; }) {
                return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
              },
            },
          },
        },
      },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["#1F2937"],
    },
    legend: {
      show: false,
    },
  };

  let options = {
    chart: {
      type: "donut",
      background: "#1F2937",
      width: "180px",
    },
    series: completionSeries,
    labels: ['Done Days', 'Days Left'],
    colors: ["#00E396", "#1F2937"],
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
              color: "#fff",
            },
            value: {
              show: true,
              fontSize: '16px',
              fontWeight: 600,
              color: '#fff',
            },
            total: {
              show: true,
              label: 'Total days',
              color: "#fff",
              formatter: function (w: { globals: { seriesTotals: any[]; }; }) {
                return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
              },
            },
          },
        },
      },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["#1F2937"],
    },
    legend: {
      show: false,
    },
  };

  let optionsConsolidation = {
    chart: {
      type: "donut",
      background: "#1F2937",
      width: "180px",
    },
    series: completionSeriesConsolidation,
    labels: ['Missed Days', 'Days Left'],
    colors: ["#FF4560", "#1F2937"],
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
              fontSize: '12px',
              color: "#fff",
            },
            value: {
              show: true,
              fontSize: '16px',
              fontWeight: 600,
              color: '#fff',
            },
            total: {
              show: true,
              label: 'Missed Days',
              color: "#fff",
              formatter: function (w: { globals: { seriesTotals: any[]; }; }) {
                return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
              },
            },
          },
        },
      },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["#1F2937"],
    },
    legend: {
      show: false,
    },
  };

  let optionsMissConsolidation = {
    chart: {
      type: "donut",
      background: "#1F2937",
      width: "180px",
    },
    series: missSeriesConsolidation,
    labels: ['Miss Streak', 'Days Left'],
    colors: ["#FF4560", "#1F2937"],
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
              fontSize: '12px',
              color: "#fff",
            },
            value: {
              show: true,
              fontSize: '16px',
              fontWeight: 600,
              color: '#fff',
            },
            total: {
              show: true,
              label: 'Max Fail Streak',
              color: "#fff",
              formatter: function (w: { globals: { seriesTotals: any[]; }; }) {
                return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
              },
            },
          },
        },
      },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["#1F2937"],
    },
    legend: {
      show: false,
    },
  };

  onMount(async () => {
    if (browser) {
      const ApexCharts = (await import('apexcharts')).default;

      chartInstance = new ApexCharts(chartDiv, options);
      chartInstance.render();

      chartMissInstance = new ApexCharts(chartMissDiv, optionsMiss);
      chartMissInstance.render();
    }

    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
      if (chartMissInstance) {
        chartMissInstance.destroy();
      }
    };
  });

  // ✅ Actualiza la serie del gráfico cuando cambie completionSeries
  $: {
    if(convertData.habitBuilded) {
      if (chartInstance) {
        chartInstance.updateSeries(completionSeriesConsolidation);
      }
      if (chartMissInstance) {
        chartMissInstance.updateSeries(missSeriesConsolidation);
      }
    } else {
      if (chartInstance) {
        chartInstance.updateSeries(completionSeries);
      }
      if (chartMissInstance) {
        chartMissInstance.updateSeries(missSeries);
      }
    }
  }

</script>

<div class="flex flex-col items-center bg-gray-800 rounded-md border border-gray-700 px-6 py-4">
  <h2 class="w-full text-left">Habit Builder</h2>
  <p class="text-slate-400 text-lg font-semibold w-full text-left">Status: {habitStatus}</p>
  <Tooltip placement="top" class="w-96">
    <p>{habitStatusMessage}</p>
  </Tooltip>
  <div class="flex w-full">
    <div class="flex flex-col-reverse gap-1.5 grow-0 mx-1">
      {#each convertData.last91Days as row}
        <div class="flex gap-1.5">
          {#each row as day}
            {#if day.status === 'completed'}
              <div class="w-4 h-4 rounded-sm completed hover:scale-110 hover:ring-2 hover:ring-white"></div>
              <Tooltip placement="top" trigger="hover">
                <p>{day.date}</p>
              </Tooltip>
            {:else}
              <div class="w-4 h-4 rounded-sm hover:scale-110 hover:ring-2 hover:ring-white" class:missed={day.status === 'missed'} class:empty={day.status === 'empty'}></div>
            {/if}
          {/each}
        </div>
      {/each}
    </div>
    <div class="w-full grow-2">
      <div class="mt-4 w-full">
        <div class="flex">
          <div bind:this={chartDiv}></div>
          <div bind:this={chartMissDiv}></div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .completed { background-color: #40e27b; } /* Verde */
  .missed { background-color: #ef444484; } /* Rojo */
  .empty { background-color: #11161c; } /* Gris oscuro */
</style>