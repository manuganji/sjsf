<script lang="ts">
  import Form from '$lib/components/Form.svelte';
  import type { JSONSchema7 } from 'json-schema';
  const schema: JSONSchema7 = {
    type: 'object',
    title: 'Integer',
    properties: {
      integer: {
        type: 'integer',
        title: 'Integer',
        default: 0
      }
    }
  };
</script>

<div>{JSON.stringify(schema)}</div>
<Form />
