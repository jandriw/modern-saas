<script>
// @ts-nocheck

  export let date; // Fecha de la casilla
  export let today = new Date(); // Fecha actual
  export let status = null; // "checked", "unchecked", o null para días futuros

  // Normalizamos las fechas para que la comparación solo tenga en cuenta año, mes y día.
  function normalizeDate(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  let normalizedToday = normalizeDate(today);
  let normalizedDate = normalizeDate(date);

  let isPast = normalizedDate < normalizedToday;
  let isToday = normalizedDate.getTime() === normalizedToday.getTime();
  let isFuture = normalizedDate > normalizedToday;

  function toggleCheck() {
    if (isToday) {
      status = status === "checked" ? "unchecked" : "checked";
    }
  }
</script>

<style>
  .checkbox {
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #ccc;
    border-radius: 4px;
    font-size: 1.2rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
  }

  .past {
    background: #444;
    border-color: #666;
    color: white;
    opacity: 0.5;
  }

  .past.checked::after {
    content: "✔";
    color: #4caf50;
  }

  .past.unchecked::after {
    content: "✖";
    color: #ff5252;
  }

  .today {
    border-color: #4caf50;
    box-shadow: 0 0 5px #4caf50;
  }

  .today.checked::after {
    content: "✔";
    color: #4caf50;
  }

  .future {
    background: #222;
    opacity: 1;
    cursor: not-allowed;
  }
</style>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div 
  class="checkbox {isPast ? `past ${status}` : isToday ? `today ${status}` : 'future'}" 
  on:click={toggleCheck}
>
</div>
