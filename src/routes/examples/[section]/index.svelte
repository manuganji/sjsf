<script lang="ts" context="module">
  import { page } from '$app/stores';
  import sections from './_sections';
  import Form from '$lib/components/Form.svelte';
</script>

<script lang="ts">
  let value: Array<any> = [];
</script>

{#each sections[$page.params.section] as schema, index}
  <div
    id={`Examples${index}`}
    class="m-4 p-2 flex flex-col 
      bg-gray-1 dark:bg-dark-3
      md:flex-row gap-2 border 
    border-dark-2 rounded"
  >
    <div class="md:w-1/3">
      <p>Schema</p>
      <div
        class="rounded box-border border-amber
      border 
      opacity-90
      border-rounded
    dark:text-white
    bg-gray-3 dark:bg-gray-6
      py-2 px-4"
      >
        <pre><code class="whitespace-pre-wrap">{JSON.stringify(schema, undefined, 2)}</code></pre>
      </div>
    </div>
    <div class="md:w-1/3">
      <p>Form</p>
      <Form id={`s${index}`} {schema} bind:value={value[index]} />
    </div>
    <div class="md:w-1/3">
      <p>Value</p>
      <div
        class="rounded box-border border-amber
        border 
        opacity-90
        border-rounded
      dark:text-white
      bg-gray-3 dark:bg-gray-6
        py-2 px-4"
      >
        <pre><code class="whitespace-pre-wrap">{JSON.stringify(value[index], undefined, 2)}</code>
    </pre>
      </div>
    </div>
  </div>
{/each}
