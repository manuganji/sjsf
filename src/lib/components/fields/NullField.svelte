<script lang="ts">
  import { createProps, defaultValue } from '../../helpers';
  import Layout from '$lib/components/Layout.svelte';

  const p = createProps<null>();
  export let value = p.value;
  export let errors = p.errors;
  export let schema = p.schema;
  export let components = p.components;
  export let props = p.props;

  let checked = false;
</script>

{#if schema && components}
  <Layout {schema} {errors}>
    <input {...props} type="checkbox" bind:checked />
  </Layout>
{/if}
