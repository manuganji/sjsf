<script lang="ts" context="module">
  import Layout from '$lib/components/Layout.svelte';
  import type { getProps } from '$lib/utils';
  import type { JSONSchemaType } from '$lib/types';
  import type { JSONSchema7TypeName } from 'json-schema';
  import { colors } from '@unocss/preset-wind';
  colors;
</script>

<script lang="ts">
  export let schema: JSONSchemaType<JSONSchema7TypeName>;
  export let widget: ReturnType<typeof getProps>['widget'] = { type: 'text' };
  export let value = 'default' in schema ? schema.default : undefined;
  export let errors: Array<Error> | null = null;

  const commonInputClass = 'dark:bg-warmGray-7 dark:text-warmGray-2 p-2 rounded-sm shadow-inset';

  // export const onChange = ;
</script>

<Layout {schema} id={widget.id} required={widget.required}>
  {#if widget['type'] == 'number'}
    <input
      class={`${commonInputClass}`}
      id={widget.id}
      required={widget.required}
      type="number"
      bind:value
      step={schema?.multipleOf || 1}
      min={'minimum' in schema ? schema.minimum : undefined}
      max={'maximum' in schema ? schema.maximum : undefined}
    />
  {/if}
  {#if widget['type'] == 'text'}
    <input
      class={`${commonInputClass}`}
      id={widget.id}
      type="text"
      bind:value
      required={widget.required}
    />
  {/if}
  {#if widget['type'] == 'checkbox'}
    <input
      class={`${commonInputClass}`}
      id={widget.id}
      type="checkbox"
      bind:value
      required={widget.required}
    />
  {/if}
</Layout>

<!-- 

export type JSONSchema<
  Value = any,
  SchemaType = Value extends boolean ? "boolean"
    : Value extends null ? "null"
    : Value extends number ? "number" | "integer"
    : Value extends string ? "string"
    : Value extends unknown[] ? "array"
    : Value extends Record<string | number, unknown> ? "object"
    : JSONSchema.TypeValue,
> = boolean |  -->
