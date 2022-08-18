<script lang="ts" context="module">
  import type { LayoutData } from './$types';
  import { goto } from '$app/navigation';
</script>

<script lang="ts">
  import { page } from '$app/stores';

  export let data: LayoutData;
  const { keys } = data;
  let title: string, sectionName: string;
  $: {
    sectionName = $page.params.section;
    title = sectionName[0].toUpperCase() + sectionName.slice(1);
  }
</script>

<svelte:head>
  {#key title} <title>{title} Examples</title> {/key}
</svelte:head>

{#key title}
  <div class="dark:bg-dark-7 h-screen w-full dark:text-white">
    <ul class="flex flex-wrap gap-1 py-4 px-4 bg-gray-1 dark:bg-dark-5">
      {#each keys as section}
        <li
          on:click={() => {
            goto(`/examples/${section}`);
          }}
          class="list-none
          bg-amber-1 dark:bg-amber-7
        border-amber border-2 
          border-solid p-2
          rounded-2
        hover:border-amber-5
          cursor-pointer"
        >
          <a
            class="text-gray-6 hover:text-gray-7 dark:text-white no-underline"
            href={`/examples/${section}`}>{section[0].toUpperCase() + section.slice(1)}</a
          >
        </li>
      {/each}
    </ul>

    <h1 class="px-4">{title} Examples</h1>
    <slot />
  </div>
{/key}
