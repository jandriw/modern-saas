<script lang="ts">
  import { Tooltip, Progressbar } from 'flowbite-svelte';
  export let data;

  $: convertData = convertToLast91Days(data);
  $: completionPercentage = (convertData.completedCount / 66) * 100; // % de completados
  $: daysLeft = 66 - convertData.completedCount

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
  }

  function convertToLast91Days(data: FilteredDate[]): ConversionResult {
    const today = new Date();
    const last91Days: DayData[][] = Array.from({ length: 7 }, () => Array(13).fill(null));
    let completedCount = 0;
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

    // 📌 Evaluamos si el hábito está formado
    const habitBuilded = completedCount >= 66 && longestMissedStreak <= 3;

    return { last91Days, completedCount, longestMissedStreak, habitBuilded };
  }

</script>

<!-- 📌 Grid de días -->
<div class="flex flex-col-reverse gap-1.5">
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

<!-- 📌 Barra de progreso -->
<div class="mt-4 w-full">
  <Progressbar progress={completionPercentage.toFixed(0)} labelOutside="Complete 66 Days" color="green" />
  <Tooltip placement="top" trigger="hover">
    <p>{convertData.completedCount} / 66 completed days</p>
  </Tooltip>
  <p>{daysLeft} Days left</p>
  <p>Miss Streak: {convertData.longestMissedStreak}</p>
</div>

<style>
  .completed { background-color: #40e27b; } /* Verde */
  .missed { background-color: #ef444484; } /* Rojo */
  .empty { background-color: #1f2937; } /* Gris oscuro */
</style>