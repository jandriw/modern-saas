<script lang="ts">
  import {
    Button,
    Dropdown,
    DropdownItem,
    MenuButton,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
  } from "flowbite-svelte";
  import type { PageData } from "./$types";
  import CreateGoalModal from "./CreateGoalModal.svelte";
	import DeleteGoalModal from "./DeleteGoalModal.svelte";
  export let data: PageData;
  let createGoalOpen = false;
  let deleteGoalOpen = false;
  let goalToDelete: string;
  function handleGoalDelete(goal_id: string) {
    goalToDelete = goal_id;
    deleteGoalOpen = true;
  }
</script>

<div class="py-20">
  <!-- Contacts Page Header -->
  <div class="flex w-full items-center justify-between pb-6">
    <h1 class="text-3xl">Goals</h1>
    <Button size="sm" on:click={() => (createGoalOpen = true)}>New Goal</Button>
  </div>
  <!-- Contacts Table -->
  <Table shadow divClass="min-h-full">
    <TableHead>
      <TableHeadCell>Goal</TableHeadCell>
      <TableHeadCell />
    </TableHead>
    <TableBody>
      {#each data.goals as goal, _i (goal.id)}
        <TableBodyRow>
          <TableBodyCell>{goal.goal ?? "--"}</TableBodyCell>
          <TableBodyCell>
            <MenuButton class="dots-menu dark:text-white" vertical name="Contact Menu" />
            <Dropdown placement="left-start">
              <DropdownItem href="/contacts/{goal.id}">Edit</DropdownItem>
              <DropdownItem slot="footer" on:click={() => handleGoalDelete(goal.id)}>Delete</DropdownItem>
            </Dropdown>
          </TableBodyCell>
        </TableBodyRow>
      {/each}
    </TableBody>
  </Table>
</div>
<CreateGoalModal bind:open={createGoalOpen} data={data.createGoalForm} />
<DeleteGoalModal bind:open={deleteGoalOpen} goalId={goalToDelete} data={data.deleteGoalForm} />