<script>
  // @ts-nocheck
  export let date;
  export let today = new Date();
  export let status = null; // "checked" o "unchecked"
  export let buttonClicked;
  export let year; // Recibe el año que representa Month.svelte

  function normalizeDate(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function spare() {}

  function handleClick() {
    if (isToday) {
      buttonClicked();
    } else {
      spare();
    }
  }

  let normalizedDate = normalizeDate(date);
  
  // Normalizamos "hoy" al mismo año que el año representado por Month
  let normalizedToday = new Date(year, today.getMonth(), today.getDate());

  $: isPast = year < today.getFullYear() || (year === today.getFullYear() && normalizedDate < normalizedToday);
  $: isToday = year === today.getFullYear() && normalizedDate.getTime() === normalizedToday.getTime();
  $: isFuture = year > today.getFullYear() || (year === today.getFullYear() && normalizedDate > normalizedToday);
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div 
  class="checkbox {isPast ? 'past ' + status : isToday ? 'today ' + status : 'future'}" 
  on:click={handleClick}
>
</div>

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
    opacity: 0.7;
    cursor: default;
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
    cursor: default;
  }
</style>