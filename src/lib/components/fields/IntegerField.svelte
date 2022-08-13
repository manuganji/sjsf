<script lang="ts" context="module">
  import Layout from '$lib/components/Layout.svelte';
  import type { JSONSchema7 } from 'json-schema';
</script>

<script lang="ts">
  export let id: string = '';
  export let schema: JSONSchema7 = {};
  export let value: number = 'default' in schema ? schema.default : undefined;
  export let errors: Array<Error> | null = null;
</script>

<Layout {schema} id={id}>
  <input
    {id}
    type="number"
    bind:value
    step={schema?.multipleOf || 1}
    min={'minimum' in schema ? schema.minimum : undefined}
    max={'maximum' in schema ? schema.maximum : undefined}
  />
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
