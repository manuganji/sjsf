<script lang="ts" context="module">
  import { getComponent as defGetComponent, getProps as defGetProps } from '$lib/utils';
  import type { JSONSchemaType } from '$lib/types';
  import type { JSONSchema7TypeName } from 'json-schema';
</script>

<script lang="ts">
  export let schema: JSONSchemaType<JSONSchema7TypeName>;
  export let id: string = 'sjsf';
  export let idPrefix: string = 'sjsf';
  export let idSeparator: string = '.';
  export let value: object | string | boolean | number | null;
  const { ctx, ...rest } = schema;
  export let getProps = defGetProps;
  export let getComponent = defGetComponent;
  const propsToPass = {
    getProps,
    getComponent,
    ...getProps(rest, {
      ...ctx,
      propKey: '',
      id,
      idPrefix,
      idSeparator
    })
  };
</script>

<form {id}>
  <svelte:component this={getComponent(schema)} {...propsToPass} bind:value />
  <slot><button class="my-2" type="submit">Submit</button></slot>
</form>
