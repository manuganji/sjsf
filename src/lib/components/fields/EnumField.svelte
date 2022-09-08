<script lang="ts" context="module">
  import type { GetProps } from '$lib/utils';
  import Layout from '$lib/components/Layout.svelte';
  import type { JSONSchemaType } from '$lib/types';
  import { onMount } from 'svelte';
</script>

<script lang="ts">
  export let schema: JSONSchemaType;
  export let widget: ReturnType<GetProps>['widget'] = { type: 'text' };
  export let value;
  export let errors: Array<Error> | null = null;
</script>

{#key widget.required}
  <Layout {schema} id={widget.id} required={widget.required ? true : false}>
    <select
      bind:value
      on:change={(e) => {
        console.info('changed', value);
      }}
      required={widget.required ? true : undefined}
    >
      {#if !widget.required} <option value={undefined} /> {/if}
      {#each schema.enum as enumItem}
        <option value={enumItem}>{enumItem}</option>
      {/each}
    </select>
  </Layout>
{/key}
