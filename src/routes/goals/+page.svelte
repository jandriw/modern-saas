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
	import CreateDateModal from "./CreateDateModal.svelte";

  export let data: PageData;
  let createDateOpen = false;
  let createGoalOpen = false;
  let deleteGoalOpen = false;
  let goalToDelete: string;
  let goalToDone: string;

  function handleGoalDelete(goal_id: string) {
    goalToDelete = goal_id;
    deleteGoalOpen = true;
  }

  function handleGoalCheck(goal_id: string) {
    goalToDone = goal_id
    createDateOpen = true
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
          <div class="flex gap-6 px-6 pt-3 pb-6">
            {#each data.info as info, _i}
              {#if (goal.id === info.goal_id)}
                <Month year={info.year} month={info.month} completedDays={info.dates} />
              {/if}
            {/each}
          </div>
          <button on:click={() => handleGoalCheck(goal.id)}>Check</button>
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
<CreateDateModal bind:open={createDateOpen} goalId={goalToDone} data={data.createDateForm} />