<script lang="ts" context="module">
  import type { GetProps } from '$lib/utils'
  import Layout from '$lib/components/Layout.svelte';
  import type { JSONSchemaType } from '$lib/types';
</script>

<script lang="ts">
  export let schema: JSONSchemaType;
  export let widget: ReturnType<GetProps>['widget'] = { type: 'text' };
  export let value = 'default' in schema ? schema.default : undefined;
  export let errors: Array<Error> | null = null;

  const commonInputClass = 'dark:bg-warmGray-7 dark:text-warmGray-2 p-2 rounded-sm shadow-inset';

  // export const onChange = ;
</script>

<Layout {schema} id={widget.id} required={widget.required}>
  {#if widget['type'] == 'number'}
    <input
      class={`${commonInputClass}`}
      name={`${widget.propKey}`}
      required={widget.required}
      type="number"
      bind:value
      step={widget.step(schema)}
      min={'minimum' in schema ? schema.minimum : undefined}
      max={'maximum' in schema ? schema.maximum : undefined}
    />
  {/if}
  {#if widget['type'] == 'text'}
    <input
      class={`${commonInputClass}`}
      name={`${widget.propKey}`}
      type="text"
      bind:value
      required={widget.required}
    />
  {/if}
  {#if widget['type'] == 'checkbox'}
    <input
      class={`${commonInputClass}`}
      name={`${widget.propKey}`}
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
