<script lang="ts" context="module">
  import type { JSONSchemaType } from 'ajv';
  import type { JSONSchema7Type } from 'json-schema';
  import BaseInput from '$lib/components/widgets/BaseInput.svelte';
</script>

<script lang="ts">
  export let schema: JSONSchemaType<JSONSchema7Type>;
  export let idPrefix: string = '';
  export let idSeparator: string = '';
  export let key: string = '';
  export let value: any = null;
  const widget = (schema) => {
    if (schema.type === 'integer') {
      return BaseInput;
    }
  };
</script>

{#if schema?.title}
  <label for={`${idPrefix}${idSeparator}${key}`}>{schema.title}</label>
{/if}

<svelte:component this={widget(schema)} {value} id={`${idPrefix}${idSeparator}${key}`} />
