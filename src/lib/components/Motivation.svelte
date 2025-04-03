<script lang="ts">
	import { Tooltip } from "flowbite-svelte";

  export let data: FilteredDate[]

  $: calculatedData = calculateMotivation(data)

  const healthColors = ["bg-red-500", "bg-green-400"];
  const healthMessage = [
    "There are need at least 15 days of record to display a proper measument",
    "This measurement is running propperly"
  ]

  $: healthColor = healthColors[calculatedData.health] ?? "bg-gray-500";

  interface FilteredDate {
    goal_id: string;
    year: number;
    month: number;
    dates: string[];
  }

  function calculateMotivation(data: FilteredDate[]): { motivation: number; health: number } {
    const today = new Date();
    const past15Days = new Set<string>();

    // Generamos los últimos 15 días como strings en formato YYYY-MM-DD
    for (let i = 14; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      past15Days.add(date.toISOString().split('T')[0]);
    }

    // Encontrar el dato más antiguo de todos los registros
    let oldestDate: Date | undefined;
    let completedDays = new Set<string>();

    data.forEach(entry => entry.dates.forEach(dateStr => {
      const date = new Date(dateStr);
      // Actualizar la fecha más antigua si es necesario
      if (oldestDate === undefined || date < oldestDate) {
        oldestDate = date;
      }
      
      // Agregar a días completados si está en los últimos 15 días
      if (past15Days.has(dateStr)) {
        completedDays.add(dateStr);
      }
    }));

    // Si no hay datos, retornamos 0 en motivación y 0 en health
    if (oldestDate === undefined) {
      return { motivation: 0, health: 0 };
    }

    const completedCount = completedDays.size;
    let totalDaysToConsider: number;

    // Verificar si el dato más antiguo está dentro de los últimos 15 días
    const oldest = oldestDate.toISOString().split('T')[0];
    const isWithinLast15Days = past15Days.has(oldest);

    let health = 0;

    if (isWithinLast15Days) {
      // El usuario es nuevo, contamos desde su primer registro hasta hoy
      const daysSinceOldest = Math.floor((today.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      totalDaysToConsider = daysSinceOldest;
      health = daysSinceOldest >= 15 ? 1 : 0; // Se establece health según la cantidad de días
    } else {
      // El usuario tiene más de 15 días, usamos 15 como denominador
      totalDaysToConsider = 15;
      health = 1;
    }

    const motivation = Math.floor((completedCount / totalDaysToConsider) * 100);

    return { motivation, health };
  }

</script>

<div class="flex flex-col w-48 items-center bg-gray-800 rounded-md border border-gray-700 px-6 py-4">
  <div class="flex justify-between w-full">
    <div class="flex items-center gap-2">
      <p class="text-slate-400 text-sm font-semibold">Health:</p>
      <div class={`w-[10px] h-[10px] rounded-full ${healthColor} health-indicator`}></div>
      <Tooltip placement="top">
        <p>{healthMessage[calculatedData.health]}</p>
      </Tooltip>
    </div>
    <div class="w-4 h-4 flex items-center justify-center bg-gray-600 rounded-full text-white text-xs cursor-pointer">
      <p>i</p>
    </div>
    <Tooltip placement="top" class="w-96">
        <p>Motivation is measured based on your 15 last days record. Keep your current completed days streak as greater as possible</p>
    </Tooltip>
  </div>
  <p class="text-white text-xl font-semibold w-full text-left">Motivation</p>
  <p class="text-5xl text-white font-bold mt-3">{calculatedData.motivation}%</p>
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