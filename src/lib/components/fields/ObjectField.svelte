<script lang="ts" context="module">
  import type { JSONSchemaType } from '$lib/types';
  import type { ArrayKeyGetter, GetComponent, GetProps } from '$lib/utils';
  import { has, omit } from 'lodash-es';
  import { onMount } from 'svelte';
  import Layout from '../Layout.svelte';
</script>

<script lang="ts">
  export let getComponent: GetComponent;
  export let getProps: GetProps;
  export let arrayKeyGetter: ArrayKeyGetter;
  export let schema: JSONSchemaType<object>;
  export let value: Record<keyof typeof schema.properties, any> = Object.fromEntries(
    Object.entries(schema.properties).map(([key, prop]) => [key, null])
  );
  let required: Set<string> | null;
  $: {
    required = 'required' in schema ? new Set(schema.required) : null;
  }

  export let errors: Error[];
  export let widget: ReturnType<typeof getProps>['widget'];
  const id = widget.id;
  let order: Array<string> = widget.order;

  onMount(function () {
    for (let key in schema.properties) {
      if (value && !(key in value)) {
        value[key] = 'default' in schema.properties[key] ? schema.properties[key].default : null;
      }
    }
  });
</script>

<!-- errors={errors && errors[key]} -->
<Layout {schema} {errors} {id}>
  {#each order as key}
    <svelte:component
      this={getComponent(schema.properties[key], key)}
      {getProps}
      {getComponent}
      {arrayKeyGetter}
      {...getProps(schema.properties[key], {
        ...omit(widget, 'order'),
        required: required ? required.has(key) : false,
        propKey: `${widget.propKey ? [widget.propKey, key].join('.') : key}`,
        id: `${id}${widget.idSeparator}${key}`
      })}
      bind:value={value[key]}
    />
  {/each}
</Layout>
