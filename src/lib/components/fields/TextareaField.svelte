<script lang="ts" context="module">
  import type { GetProps } from '$lib/utils';
  import Layout from '$lib/components/Layout.svelte';
  import type { JSONSchemaType } from '$lib/types';
  import { onMount } from 'svelte';
</script>

<script lang="ts">
  export let schema: JSONSchemaType;
  export let widget: ReturnType<GetProps>['widget'] = {
    type: 'text',
    propKey: '',
    required: false
  };
  export let value: string;
  export let errors: Array<Error> | null = null;

  const commonInputClass = 'dark:bg-warmGray-7 dark:text-warmGray-2 p-2 rounded-sm shadow-inset';
  const inputId = `${widget.id}input`;

  onMount(() => {
    if ('default' in schema && !value) {
      value = schema.default;
    }
  });

</script>

<Layout {schema} id={widget.id} required={widget.required}>
  {@debug schema}
  <textarea
    id={inputId}
    class={`${commonInputClass}`}
    name={`${widget.propKey}`}
    bind:value
    required={widget.required}
    on:blur={widget.onBlur}
    on:focus={widget.onFocus}
    placeholder={widget?.placeholder}
    autocomplete={widget?.autocomplete}
    rows={widget?.rows}
  />
</Layout>
