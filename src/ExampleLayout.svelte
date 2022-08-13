<script lang="ts">
  import type { JSONSchema7 } from 'json-schema';
  export let schema: JSONSchema7;
  export let id: string;
  import Form from '$lib/components/Form.svelte';
</script>

<div class={'columns-2 m-4'}>
  <div class="rounded box-border border-amber border border-rounded bg-gray-3 py-2 px-4">
    <pre class="inline-block "><code>{JSON.stringify(schema, undefined, 2)}</code></pre>
  </div>
  <Form {id} {schema} />
</div>
