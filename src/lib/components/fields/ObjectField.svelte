<script lang="ts" context="module">
  import type { JSONSchemaType } from '$lib/types';
  import type { ArrayKeyGetter, GetComponent, GetProps } from '$lib/utils';
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
  export let errors: Error[];
  export let widget: ReturnType<typeof getProps>['widget'];
  const id = widget.id;
  let order: Array<string> = widget.order;
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
        ...widget,
        propKey: `${widget.propKey ? [widget.propKey, key].join('.') : key}`,
        id: `${id}${widget.idSeparator}${key}`
      })}
      bind:value={value[key]}
    />
  {/each}
</Layout>
