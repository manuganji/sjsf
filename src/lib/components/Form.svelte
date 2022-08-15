<script lang="ts" context="module">
  import { getComponent, getProps } from '$lib/utils';
  import type { JSONSchema7 } from 'json-schema';
</script>

<script lang="ts">
  export let schema: JSONSchema7;
  export let id: string = 'sjsf';
  export let idPrefix: string = 'sjsf';
  export let idSeparator: string = '.';
  const { ctx, ...rest } = schema;
</script>

<form {id}>
  <svelte:component
    this={getComponent(schema)}
    {...getProps(rest, {
      ...ctx,
      id,
      idPrefix,
      idSeparator
    })}
  />
</form>
