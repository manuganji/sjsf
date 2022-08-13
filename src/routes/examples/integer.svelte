<script lang="ts">
  import type { JSONSchema7 } from 'json-schema';

  import ExampleLayout from '../../ExampleLayout.svelte';

  const schemas: Array<JSONSchema7> = [
    {
      type: 'integer',
      title: 'Integer default',
      default: 0
    },
    {
      type: 'integer',
      title: 'Integer min max',
      default: 1,
      minimum: 0,
      maximum: 10
    },
    {
      type: 'object',
      title: 'Integer',
      properties: {
        integer: {
          type: 'integer',
          title: 'Integer',
          default: 0
        }
      }
    },
    {
      type: 'object',
      title: 'Integer',
      properties: {
        integer: {
          type: 'integer',
          title: 'Integer',
          default: 1,
          minimum: 0,
          maximum: 10
        }
      }
    }
  ];
</script>

{#each schemas as item, index}
  <ExampleLayout id={`s${index}`} schema={item} />
{/each}
