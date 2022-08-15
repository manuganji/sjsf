<script lang="ts" context="module">
  import Layout from '$lib/components/Layout.svelte';
  import type { JSONSchemaType } from '$lib/types';
  export const value = null;
</script>

<script lang="ts">
  export let schema: JSONSchemaType<null>;
  export let errors: Error[];
</script>

<Layout {schema} {errors}><p>It's a null value</p></Layout>
