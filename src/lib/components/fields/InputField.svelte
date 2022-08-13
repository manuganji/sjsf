<script lang="ts" context="module">
  import Layout from '$lib/components/Layout.svelte';
  import type { getProps } from '$lib/utils';
  import type { JSONSchema7 } from 'json-schema';
  import type { Action } from 'svelte/action';
  import {colors} from '@unocss/preset-wind'
  colors
</script>

<script lang="ts">
  export let schema: JSONSchema7 = {};
  export let ctx: ReturnType<typeof getProps>['ctx'] = { type: 'text' };
  export let value = 'default' in schema ? schema.default : undefined;
  export let errors: Array<Error> | null = null;

  // export const onChange = ;
</script>

<Layout {schema} id={ctx.id}>
  {#if ctx['type'] == 'number'}
    <input
      class="dark:bg-warmGray-7 dark:text-warmGray-2 p-2 rounded-sm shadow-inset"
      id={ctx.id}
      type="number"
      bind:value
      step={schema?.multipleOf || 1}
      min={'minimum' in schema ? schema.minimum : undefined}
      max={'maximum' in schema ? schema.maximum : undefined}
    />
  {/if}
  {#if ctx['type'] == 'text'}
    <input id={ctx.id} type="text" bind:value />
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
