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
    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    const MS_PER_WEEK = MS_PER_DAY * 7;
    
    // Convertir las fechas en un solo array
    const allDates = data.flatMap(entry => entry.dates.map(date => new Date(date)));

    if (allDates.length === 0) {
        return { score: 0, health: 0, message: "Not enough data to calculate consistency." };
    }

    // Ordenar fechas y obtener la primera y última
    allDates.sort((a, b) => a.getTime() - b.getTime());

    const firstDate = allDates[0];
    const lastDate = allDates[allDates.length - 1];

    // Calcular semanas transcurridas
    const totalWeeks = Math.ceil((lastDate.getTime() - firstDate.getTime()) / MS_PER_WEEK);

    if (totalWeeks < 4) {
        return { score: 0, health: 0, message: "More weeks of tracking are needed for an accurate consistency calculation (0 to 4 weeks)." };
    }

    // Agrupar por semana
    const weeks = new Map();
    allDates.forEach(date => {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Normalizar a inicio de la semana (domingo)
        const weekKey = weekStart.toISOString().split('T')[0];

        if (!weeks.has(weekKey)) weeks.set(weekKey, 0);
        weeks.set(weekKey, weeks.get(weekKey) + 1);
    });

    // Obtener valores semanales y calcular desviación de frecuencia
    const weeklyCounts = [...weeks.values()];
    const avg = weeklyCounts.reduce((sum, val) => sum + val, 0) / weeklyCounts.length;
    const variance = weeklyCounts.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / weeklyCounts.length;
    const consistencyScore = Math.max(0, 100 - Math.sqrt(variance) * 10); // Normalización a 0-100

    // Determinar el mensaje y la salud del dato
    let message = "Strong consistency detected with a solid data foundation (16+ weeks).";
    let health = 3; // High

    if (totalWeeks < 8) {
        message = "Initial pattern detected, but variations may still occur (4 to 8 weeks).";
        health = 1; // Low
    } else if (totalWeeks < 12) {
        message = "More stable pattern detected, but improvements are possible (8 to 12 weeks).";
        health = 2; // Medium
    } else if (totalWeeks < 16) {
        message = "Reliable data for evaluating consistency (12 to 16 weeks).";
        health = 2; // Medium
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
        <p>This metric evaluates consistency over time.</p>
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