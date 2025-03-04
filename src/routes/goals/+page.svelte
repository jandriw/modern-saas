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

  let displayedInfo = JSON.stringify(data.info, null, 4)
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
              <Month year={thisYear} month={thisMonth} />
            {/if}
            {#each data.info as info, _i}
              {#if (goal.id === info.goal_id)}
                <Month year={info.year} month={info.month} completedDays={info.dates} />
              {/if}
            {/each}
          </div>
          <form method="POST" action="?/addDate">
            <input type="hidden" name="goal_id" bind:value="{goal.id}" />
            <button type="submit">Check</button>
          </form>
          <button on:click={() => handleDateDelete(goal.id)}>Uncheck</button>
        </div>
      {/each}
    {/if}
  </div>
  <pre>
    {displayedInfo}
  </pre>
</div>
<CreateGoalModal bind:open={createGoalOpen} data={data.createGoalForm} />
<DeleteGoalModal bind:open={deleteGoalOpen} goalId={goalToDelete} data={data.deleteGoalForm} />
<DeleteDateModal bind:open={deleteDateOpen} goalId={goalToDeleteTodayProgess} data={data.deleteDateForm} />