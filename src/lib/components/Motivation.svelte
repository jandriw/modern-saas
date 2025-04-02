<script lang="ts">
	import { Tooltip } from "flowbite-svelte";

  export let data: FilteredDate[]

  interface FilteredDate {
  goal_id: string;
  year: number;
  month: number;
  dates: string[];
}

$: motivation = calculateMotivation(data)

function calculateMotivation(data: FilteredDate[]): number | null {
  const today = new Date();
  const past15Days = new Set<string>();

  // Generamos los últimos 15 días como strings en formato YYYY-MM-DD
  for (let i = 14; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    past15Days.add(date.toISOString().split('T')[0]);
  }

  // Conjunto de fechas registradas como completadas
  const completedDays = new Set<string>();
  data.forEach(entry => entry.dates.forEach(date => {
    if (past15Days.has(date)) {
      completedDays.add(date);
    }
  }));

  const completedCount = completedDays.size;
  const failedCount = past15Days.size - completedCount;

  if (completedCount === 0 && failedCount === 0) {
    return null; // No hay datos suficientes
  }

  return Math.floor((completedCount / (completedCount + failedCount)) * 100);
}
</script>

<div class="flex flex-col w-48 items-center bg-gray-800 rounded-md border border-gray-700 px-6 py-4">
  <div class="flex justify-end w-full">

    <div class="w-4 h-4 flex items-center justify-center bg-gray-600 rounded-full text-white text-xs cursor-pointer">
      <p>i</p>
    </div>
    <Tooltip placement="top" class="w-96">
        <p>Consistency is measured based on your 15 last track days. Completed Days against missed days is the result of this measurement. It you are motivated it will be reflected on completed streak days.</p>
    </Tooltip>
  </div>
  <p class="text-white text-xl font-semibold w-full text-left">Motivation</p>
  <p class="text-5xl text-white font-bold mt-3">{motivation}%</p>
</div>


