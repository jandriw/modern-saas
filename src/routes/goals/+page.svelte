<script lang="ts">
  import {
    Button,
    Dropdown,
    DropdownItem,
    MenuButton
  } from "flowbite-svelte";
  import type { PageData } from "./$types";
  import CreateGoalModal from "./CreateGoalModal.svelte";
	import DeleteGoalModal from "./DeleteGoalModal.svelte";
  import Month from "$lib/components/Month.svelte";
	import DeleteDateModal from "./DeleteDateModal.svelte";

  export let data: PageData;

  interface FilteredDate {
    goal_id: string;
    year: number;
    month: number;
    dates: string[];
  }

  let formAddDate: HTMLFormElement;

  let createGoalOpen = false;
  let deleteGoalOpen = false;
  let deleteDateOpen = false;

  let goalToDelete: string;
  let goalToDeleteTodayProgess: string;

  const thisYear = new Date().getFullYear();
  const thisMonth = new Date().getMonth();

  function handleGoalDelete(goal_id: string) {
    goalToDelete = goal_id;
    deleteGoalOpen = true;
  }

  function handleDateDelete(goal_id: string) {
    goalToDeleteTodayProgess = goal_id;
    deleteDateOpen = true;
  }

  function getDatesForGoal(
    data: FilteredDate[], 
    goalId: string, 
    year: number, 
    month: number
  ): string[] {
    const result = data.find(
      item => item.goal_id === goalId && item.year === year && item.month === month
    );
    return result ? result.dates : [];
  }

  $: dates = data.info

	function handleFormToSubmit(goal_id: string) {
		const registers = getDatesForGoal(dates, goal_id, thisYear, thisMonth)
    let today = new Date().toISOString().split('T')[0];
    let lastDate = registers[registers.length-1]

    if (lastDate === today) {
      handleDateDelete(goal_id)
    } else {
      submitAddDate(goal_id)
    }
	}

  function submitAddDate(goalId: string) {
  // Encuentra el formulario correcto para este goal específico
  const form = document.querySelector(`form[data-goal-id="${goalId}"]`) as HTMLFormElement;
  if (form) {
    form.submit();
  }
}

</script>

<div class="py-20">
  <!-- Contacts Page Header -->
  <div class="flex w-full items-center justify-between pb-6">
    <h1 class="text-3xl">Goals</h1>
    <Button size="sm" on:click={() => (createGoalOpen = true)}>New Goal</Button>
  </div>
  
  <div>
    {#if data.goals}
      {#each data.goals as goal, _i (goal.id)}
        <div>
          <div class="flex w-full items-center justify-between bg-gray-800 px-6">
            <p>{goal.goal}</p>
            <MenuButton class="dots-menu dark:text-white" vertical name="Contact Menu" />
            <Dropdown placement="left-start">
              <DropdownItem href="/contacts/{goal.id}">Edit</DropdownItem>
              <DropdownItem slot="footer" on:click={() => handleGoalDelete(goal.id)}>Delete</DropdownItem>
            </Dropdown>
          </div>
          <div class="flex gap-6 px-5 pt-3 pb-6">
            {#if data.info.length === 0 || !data.info.some(obj => obj.goal_id === goal.id)}
              <Month year={thisYear} month={thisMonth} buttonClicked={() => handleFormToSubmit(goal.id)}/>
            {/if}
            {#each data.info as info, _i}
              {#if (goal.id === info.goal_id)}
                <Month year={info.year} month={info.month} completedDays={info.dates} buttonClicked={() => handleFormToSubmit(goal.id)}/>
              {/if}
            {/each}
          </div>
          <form method="POST" action="?/addDate" bind:this={formAddDate} data-goal-id={goal.id}>
            <input type="hidden" name="goal_id" bind:value="{goal.id}" />
          </form>
        </div>
      {/each}
    {/if}
  </div>
</div>
<CreateGoalModal bind:open={createGoalOpen} data={data.createGoalForm} />
<DeleteGoalModal bind:open={deleteGoalOpen} goalId={goalToDelete} data={data.deleteGoalForm} />
<DeleteDateModal bind:open={deleteDateOpen} goalId={goalToDeleteTodayProgess} data={data.deleteDateForm} />