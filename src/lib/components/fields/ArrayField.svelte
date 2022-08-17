<script lang="ts">
  import Layout from '$lib/components/Layout.svelte';
  type T = Array<any>;
  // const p = createProps<T, ErrorRecord>([]);
  export let value = p.value;
  export let errors = p.errors;
  export let schema = p.schema;
  export let components = p.components;

  /* recalc a default value */
  $: if (schema && value === null) {
    value = defaultValue<T>(schema, value);
  }

  const removeItem = (index: number) => {
    if (!value) {
      return;
    }
    value.splice(index, 1);
    value = [...value];
  };

  const moveItem = (index: number, pos: number) => {
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
</script>

<!-- TODO:
key expression for string, number, boolean arrays 
key expression for object arrays
key expression for array of arrays
-->

{#if components && schema && schema.items && schema.items.type}
  <Layout {schema} {errors}>
    {#if value}
      {#each value as v, i (i)}
        <svelte:component
          this={getComponent(schema, components.itemWrapper, 'itemWrapper')}
          {schema}
          props={getProps(schema, components.itemWrapper, 'itemWrapper')}
        >
          <svelte:component
            this={getComponent(schema.items, components.fields[schema.items.type], 'field')}
            props={getProps(schema.items, components.fields[schema.items.type], 'field')}
            {components}
            schema={schema.items}
            bind:value={v}
            errors={errors && errors[i]}
          />

          <div slot="ctrl">
            <svelte:component
              this={getComponent(schema, components.itemCtrl, 'itemCtrl')}
              {schema}
              props={getProps(schema, components.itemCtrl, 'itemCtrl')}
              remove={() => {
                removeItem(i);
              }}
              moveUp={() => {
                moveItem(i, i - 1);
              }}
              moveDown={() => {
                moveItem(i, i + 1);
              }}
              position={i}
              length={value.length}
            />
          </div>
        </svelte:component>
      {/each}
    {/if}

    <svelte:component
      this={getComponent(schema, components.addItem, 'addItem')}
      {addItem}
      props={getProps(schema, components.addItem, 'addItem')}
    />
  </Layout>
{/if}
