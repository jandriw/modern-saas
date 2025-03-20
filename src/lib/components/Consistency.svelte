<script lang="ts">
  import { Tooltip } from 'flowbite-svelte';

  interface FilteredDate {
    goal_id: string;
    year: number;
    month: number;
    dates: string[];
  }

  export let data: FilteredDate[]

  const calculatedData = calculateConsistency(data)
  const healthColors = ["bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-green-400"];
  const healthColor = healthColors[calculatedData.health];

  function calculateConsistency(data: FilteredDate[]) {
    if (!data || data.length === 0) {
        return { score: 0, health: 0, message: "Not enough data to calculate consistency." };
    }

    // Convertir las fechas a objetos Date y ordenarlas
    let allDates = data.flatMap(entry => entry.dates.map(date => new Date(date))).sort((a, b) => a.getTime() - b.getTime());

    if (allDates.length === 0) {
        return { score: 0, health: 0, message: "Not enough data to calculate consistency." };
    }

    const firstDate = allDates[0];
    const lastDate = allDates[allDates.length - 1];
    const totalDays = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (totalDays < 28) {
        return { score: 0, health: 0, message: "More weeks of tracking are needed." };
    }

    // Calcular días sin actividad
    const uniqueActiveDays = new Set(allDates.map(date => date.toDateString())).size;
    const inactivityPercentage = ((totalDays - uniqueActiveDays) / totalDays) * 100;

    // Aplicar penalización basada en el porcentaje de inactividad
    let gapPenalty = 0;
    if (inactivityPercentage > 50) {
        gapPenalty = 50;
    } else if (inactivityPercentage > 40) {
        gapPenalty = 40;
    } else if (inactivityPercentage > 30) {
        gapPenalty = 30;
    } else if (inactivityPercentage > 15) {
        gapPenalty = 20;
    } else if (inactivityPercentage > 7) {
        gapPenalty = 10;
    }

    // Agrupar por semana y calcular la variabilidad en la actividad
    const weeks = new Map();
    allDates.forEach(date => {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Ajustar al inicio de la semana (domingo)
        const weekKey = weekStart.toISOString().split('T')[0];

        weeks.set(weekKey, (weeks.get(weekKey) || 0) + 1);
    });

    const weeklyCounts = Array.from(weeks.values());
    const avg = weeklyCounts.reduce((sum, val) => sum + val, 0) / weeklyCounts.length;
    const variance = weeklyCounts.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / weeklyCounts.length;
    let consistencyScore = Math.max(0, 100 - Math.sqrt(variance) * 10 - gapPenalty);

    // Determinar el mensaje y la salud
    let message = "Strong consistency detected.";
    let health = 3;

    if (totalDays < 56) {
        message = "Initial pattern detected (4 to 8 weeks).";
        health = 1;
    } else if (totalDays < 84) {
        message = "More stable pattern (8 to 12 weeks).";
        health = 2;
    } else if (totalDays < 112) {
        message = "Reliable data (12 to 16 weeks).";
        health = 2;
    }

    return { score: Math.round(consistencyScore), health, message };
}
</script>

<div class="flex flex-col w-48 items-center bg-gray-800 rounded-md border border-gray-700 px-6 py-4">
  <div class="flex justify-between w-full">
    <div class="flex items-center gap-2">
      <p class="text-slate-400 text-sm font-semibold">Health:</p>
      <div class={`w-[10px] h-[10px] rounded-full ${healthColor} health-indicator`}></div>
      <Tooltip placement="top">
        <p>{calculatedData.message}</p>
      </Tooltip>
  </div>
    <div class="w-4 h-4 flex items-center justify-center bg-gray-600 rounded-full text-white text-xs cursor-pointer">
      <p>i</p>
    </div>
    <Tooltip placement="top">
        <p>Consistency is measured based on your weekly regularity, activity variability, and periods without recorded data. To improve, maintain a steady pace and avoid long breaks. 🚀</p>
    </Tooltip>
  </div>
  <p class="text-white text-xl font-semibold w-full text-left">Consistency</p>
  <p class="text-5xl text-white font-bold mt-3">{calculatedData.score}%</p>
</div>

<style>
  @keyframes pulse {
    0% { opacity: 0.7; }
    50% { opacity: 1; }
    100% { opacity: 0.7; }
  }
  .health-indicator {
    animation: pulse 2s infinite ease-in-out;
    box-shadow: 0 0 6px rgba(255, 255, 255, 0.6);
  }
</style>