<script lang="ts" context="module">
  import type { GetComponent, GetProps, ArrayKeyGetter } from '$lib/utils';
  import type { JSONSchemaType } from '$lib/types';
  import Layout from '$lib/components/Layout.svelte';
</script>

<script lang="ts">
  export let getComponent: GetComponent;
  export let getProps: GetProps;
  export let arrayKeyGetter: ArrayKeyGetter;
  export let schema: JSONSchemaType<any[]>;
  export let value: Array<any>;
  export let errors: Error[];
  export let widget: ReturnType<typeof getProps>['widget'];
  const arrayKeyFn = arrayKeyGetter(schema, widget.propKey);
  const id = widget.id;
  const length = value.length;

  const removeItem = (index: number) => {
    if (!value) {
      return;
    }
    value.splice(index, 1);
    value = [...value];
  };

  const swapPosition = (index: number, pos: number) => {
    if (!value) {
      return;
    }
    const current = value[index];
    value[index] = value[pos];
    value[pos] = current;
    value = [...value];
  };

  const submit = (event: CustomEvent) => {
    if (!value) {
      return;
    }
    value = value.concat([event.detail]);
    console.log('Submit', event);
  };

  const reset = (event: CustomEvent) => {
    console.log('Reset', event);
  };

  const addItem = () => {
    const item = defaultValue<T>(schema.items, null);
    value = value ? value.concat([item]) : [item];
  };

  const ItemComponent = getComponent(schema.items, widget.propKey);
  const commonItemProps = getProps(schema.items, {
    ...widget,
    propKey: ''
  });

  function itemProps(index: number) {
    return {
      ...commonItemProps,
      widget: {
        ...commonItemProps.widget,
        id: `${widget.id}${widget.idSeparator}${index}`
      }
    };
  }
</script>

<Layout {schema} {errors} id={widget.id}>
  {#if value}
    {#each value as v, i (arrayKeyFn(v))}
      <svelte:component
        this={ItemComponent}
        {getProps}
        {getComponent}
        {...itemProps(i)}
        bind:value={value[i]}
      />
      <button
        type="button"
        on:click={() => {
          removeItem(i);
        }}>Remove</button
      >
      <button type="button" disabled={i <= 0} on:click={() => swapPosition(i, i - 1)}
        >Move Up</button
      >
      <button type="button" disabled={i + 1 == length} on:click={() => swapPosition(i, i + 1)}
        >Move Down</button
      >
    {/each}
    <button type="button">New</button>
  {/if}
</Layout>
