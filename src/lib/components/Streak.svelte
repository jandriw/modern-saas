<script>
  //@ts-nocheck
  export let streak = "Current Streak"
  export let streakNumber = 8

  function splitWord(str) {
    return [str.split(/\s+/)[0], str.split(/\s+/)[1]];
  }

  let title = splitWord(streak)
    
</script>

<div class="flex flex-col w-32 items-center bg-gray-800 rounded-md border border-gray-700 px-10">
  <div class="flex flex-col mt-2">
    <p class="text-slate-400 text-lg font-semibold text-center">{title[0]}</p>
    <p class="text-slate-400 text-lg font-semibold text-center -mt-2">{title[1]}</p>
  </div>
  <div>
    <p class="text-5xl text-green-400">{streakNumber}</p>
  </div>
  <div>
    <p class="mb-2">Days</p>
  </div>
</div>