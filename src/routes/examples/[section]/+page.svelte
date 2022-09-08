<script lang="ts" context="module">
  import Form from '$lib/components/Form.svelte';
  import { differentiatedSchemaType } from '$lib/utils';
  import type { PageData } from './$types';
</script>

<script lang="ts">
  export let data: PageData;
  const { examples } = data;
  let value: Array<any> = new Array(examples.length).map((_, index) => {
    switch (differentiatedSchemaType(examples[index])) {
      case 'object':
        return {};
      case 'array':
        return [];
      default:
        return undefined;
    }
  });
  
  console.log(value);
</script>

{#each examples as schema, index}
  <div
    id={`Examples${index}`}
    class="m-4 p-2 flex flex-col 
      bg-gray-1 dark:bg-dark-6
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
    bg-gray-3 dark:bg-dark-3
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
      bg-gray-3 dark:bg-dark-3
        py-2 px-4"
      >
        <pre><code class="whitespace-pre-wrap">{JSON.stringify(value[index], undefined, 2)}</code>
    </pre>
      </div>
    </div>
  </div>
{/each}
