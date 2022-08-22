<script lang="ts">
  import Form from '$lib/components/Form.svelte';
</script>

<Form
  schema={{
    type: 'object',
    title: 'object',
    properties: {
      firstName: 'some mame',
      address: {
        $ref: '#/definitions/address'
      }
    },
    definitions: {
      address: {
        street: 'some street'
      }
    }
  }}
>
  <button type="submit">Submit</button>
</Form>
