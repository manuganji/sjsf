<script lang="ts" context="module">
  import {
    getComponent as defGetComponent,
    getProps as defGetProps,
    arrayKeyGetter as defArrayKeyGetter
  } from '$lib/utils';
  import type { JSONSchemaType, JSONTypes } from '$lib/types';
  import Ajv from 'ajv';
</script>

<script lang="ts">
  // import { browser } from '$app/environment';
  let ajvInstance = new Ajv({
    useDefaults: true
  });

  // ajvInstance.validate()
  export let schema: JSONSchemaType;
  export let id: string = 'sjsf';
  export let idPrefix: string = 'sjsf';
  export let idSeparator: string = '.';
  export let value: object | string | boolean | number | null = null;
  const { ctx, ...rest } = schema;
  export let getProps = defGetProps;
  export let getComponent = defGetComponent;
  export let arrayKeyGetter = defArrayKeyGetter;
  const propsToPass = {
    getProps,
    getComponent,
    arrayKeyGetter,
    ...getProps(rest, {
      ...ctx,
      propKey: '',
      id: '',
      idPrefix,
      idSeparator
    })
  };
</script>

<form {id}>
  <svelte:component this={getComponent(schema)} {...propsToPass} bind:value />
  <slot><button class="my-2" type="submit">Submit</button></slot>
</form>
