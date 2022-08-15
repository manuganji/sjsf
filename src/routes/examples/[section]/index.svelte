<script lang="ts" context="module">
  import { page } from '$app/stores';
  import sections from './_sections';
  import Form from '$lib/components/Form.svelte';
</script>

{#each sections[$page.params.section] as schema, index}
  <div id={`Examples${index}`} class={'columns-2 m-4'}>
    <div
      class="rounded box-border border-amber 
      border 
      opacity-90
      border-rounded
    dark:text-white
    bg-gray-3 dark:bg-gray-6
      py-2 px-4"
    >
      <pre class="inline-block">
        <code class="">{JSON.stringify(schema, undefined, 2)}</code>
      </pre>
    </div>
    <Form id={`s${index}`} {schema} />
  </div>
{/each}
