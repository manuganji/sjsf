<script lang="ts" context="module">
  import type { JSONSchemaType } from '$lib/types';
  import { getComponent, getProps } from '$lib/utils';

  // import type { ErrorRecord } from "../../types";
  // import { createProps, defaultValue, getComponent, getProps } from "../../helpers";
  import Layout from '../Layout.svelte';
</script>

<script lang="ts">
  /* recalc a default value */
  // $: if (schema && value == null) {
  //   value = defaultValue<T>(schema, value);
  // }
  export let schema: JSONSchemaType<object>;
  export let value: Record<keyof typeof schema.properties, any> = Object.fromEntries(
    Object.entries(schema.properties).map(([key, prop]) => [key, null])
  );
  export let errors: Error[];
  export let widget: ReturnType<typeof getProps>['widget'];
  const id = widget.id;
  const idPrefix: string = 'sjsf';
  const idSeparator: string = '.';
  let order: Array<string> = widget.order;
</script>

<!-- errors={errors && errors[key]} -->
<Layout {schema} {errors}>
  {#each order as key}
    <svelte:component
      this={getComponent(schema.properties[key], key)}
      {...getProps(schema.properties[key], {
        id: `${id}${idSeparator}${key}`,
        idPrefix: idPrefix,
        idSeparator: idSeparator
      })}
      bind:value={value[key]}
    />
  {/each}
</Layout>
