<script lang="ts" context="module">
  import type { GetProps } from '$lib/utils';
  import Layout from '$lib/components/Layout.svelte';
  import type { JSONSchemaType } from '$lib/types';
  import { onMount } from 'svelte';
import { isNull, isUndefined } from 'lodash-es';
</script>

<script lang="ts">
  export let schema: JSONSchemaType;
  export let widget: ReturnType<GetProps>['widget'] = { type: 'text' };
  export let value;
  export let errors: Array<Error> | null = null;
  onMount(function () {
    if (isUndefined(value) || isNull(value)) {
      value = 'default' in schema ? schema.default : value;
    }
  });
</script>

<Layout {schema} id={widget.id} required={widget.required ? true : false}>
  <select
    bind:value
    required={widget.required ? true : undefined}
  >
    {#if widget.required}
      <option value={null} disabled hidden>{widget?.placeholder || ''}</option>
    {:else}
      <option value={null}>{widget?.placeholder || ''}</option>
    {/if}
    {#each schema.enum as enumItem}
      <option value={enumItem}>{enumItem}</option>
    {/each}
  </select>
</Layout>
