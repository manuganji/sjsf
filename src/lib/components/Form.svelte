<script lang="ts" context="module">
  import { getComponent, getProps } from '$lib/utils';
  import type { JSONSchemaType } from '$lib/types';
  import type { JSONSchema7TypeName } from 'json-schema';
</script>

<script lang="ts">
  export let schema: JSONSchemaType<JSONSchema7TypeName>;
  export let id: string = 'sjsf';
  export let idPrefix: string = 'sjsf';
  export let idSeparator: string = '.';
  export let value;
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
    bind:value
  />
</form>
