<script lang="ts" context="module">
  import type { GetProps } from '$lib/utils';
  import Layout from '$lib/components/Layout.svelte';
  import type { JSONSchemaType } from '$lib/types';
</script>

<script lang="ts">
  export let schema: JSONSchemaType;
  export let widget: ReturnType<GetProps>['widget'] = {
    type: 'text',
    propKey: '',
    required: false
  };
  export let value = 'default' in schema ? schema.default : undefined;
  export let errors: Array<Error> | null = null;

  const examples = [
    ...('default' in schema ? [schema.default] : []),
    ...('examples' in schema
      ? 'default' in schema
        ? schema.examples.filter((i: any) => i !== schema.default)
        : schema.examples
      : [])
  ];
  const commonInputClass = 'dark:bg-warmGray-7 dark:text-warmGray-2 p-2 rounded-sm shadow-inset';
  const inputId = `${widget.id}input`;
  // export const onChange = ;
</script>

<Layout {schema} id={widget.id} required={widget.required}>
  {#if widget['type'] == 'number'}
    <input
      id={inputId}
      class={`${commonInputClass}`}
      name={`${widget.propKey}`}
      required={widget.required}
      type="number"
      bind:value
      step={widget.step(schema)}
      min={'minimum' in schema ? schema.minimum : undefined}
      max={'maximum' in schema ? schema.maximum : undefined}
      on:blur={widget.onBlur}
      on:focus={widget.onFocus}
    />
  {:else if widget['type'] == 'text'}
    <input
      id={inputId}
      class={`${commonInputClass}`}
      name={`${widget.propKey}`}
      type="text"
      bind:value
      required={widget.required}
      on:blur={widget.onBlur}
      on:focus={widget.onFocus}
      list={'examples' in schema ? `${inputId}examples` : undefined}
      placeholder={widget?.placeholder}
      autocomplete={widget?.autocomplete}
    />
    {#if 'examples' in schema}
      <datalist id={`${inputId}examples`}>
        {#each examples as example}
          <option value={example} />
        {/each}
      </datalist>
    {/if}
  {:else if widget['type'] == 'url'}
    <input
      id={inputId}
      class={`${commonInputClass}`}
      name={`${widget.propKey}`}
      type="url"
      bind:value
      required={widget.required}
      on:blur={widget.onBlur}
      on:focus={widget.onFocus}
      list={'examples' in schema ? `${inputId}examples` : undefined}
      placeholder={widget?.placeholder}
      autocomplete={widget?.autocomplete}
    />
    {#if 'examples' in schema}
      <datalist id={`${inputId}examples`}>
        {#each examples as example}
          <option value={example} />
        {/each}
      </datalist>
    {/if}
  {:else if widget['type'] == 'email'}
    <input
      id={inputId}
      class={`${commonInputClass}`}
      name={`${widget.propKey}`}
      type="email"
      bind:value
      required={widget.required}
      on:blur={widget.onBlur}
      on:focus={widget.onFocus}
      list={'examples' in schema ? `${inputId}examples` : undefined}
      placeholder={widget?.placeholder}
      autocomplete={widget?.autocomplete}
    />
    {#if 'examples' in schema}
      <datalist id={`${inputId}examples`}>
        {#each examples as example}
          <option value={example} />
        {/each}
      </datalist>
    {/if}
  {:else if widget['type'] == 'checkbox'}
    <input
      id={inputId}
      class={`${commonInputClass}`}
      name={`${widget.propKey}`}
      type="checkbox"
      bind:value
      required={widget.required}
      on:blur={widget.onBlur}
      on:focus={widget.onFocus}
    />
  {:else if widget['type'] == 'datetime-local'}
    <input
      id={inputId}
      class={`${commonInputClass}`}
      name={`${widget.propKey}`}
      type="datetime-local"
      bind:value
      required={widget.required}
      on:blur={widget.onBlur}
      on:focus={widget.onFocus}
    />
  {:else if widget['type'] == 'date'}
    <input
      id={inputId}
      class={`${commonInputClass}`}
      name={`${widget.propKey}`}
      type="date"
      bind:value
      required={widget.required}
      on:blur={widget.onBlur}
      on:focus={widget.onFocus}
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
