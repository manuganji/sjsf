<script lang="ts" context="module">
  import {
    getComponent as defGetComponent,
    getProps as defGetProps,
    arrayKeyGetter as defArrayKeyGetter
  } from '$lib/utils';
  import { onMount } from 'svelte';
  import type { JSONSchemaType, JSONTypes } from '$lib/types';
  import Ajv from 'ajv';
</script>

<script lang="ts">
  let ajvInstance = new Ajv({
    useDefaults: true
  });

  // ajvInstance.validate()
  export let schema: JSONSchemaType;
  export let id: string = 'sjsf';
  export let idPrefix: string = 'sjsf';
  export let idSeparator: string = '.';
  export let value: any;
  export let onBlur: ((propKey: string) => void) | undefined = undefined;
  export let onFocus: ((propKey: string) => void) | undefined = undefined;
  export let onSubmit: ((arg0: SubmitEvent) => void) | undefined = undefined;
  export let action: string = '';
  export let method: string = '';


  onMount(function () {
    if (typeof value == 'undefined' && 'default' in schema) {
      value = schema.default;
    }
  });

  const { ctx, widget, ...rest } = schema;
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
      idSeparator,
      onBlur,
      onFocus
    })
  };
  let Component = getComponent(rest, widget);
</script>

{#if onSubmit}
  <form {id} on:submit|preventDefault={onSubmit}>
    <svelte:component this={Component} {...propsToPass} bind:value />
    <slot><button class="my-2" type="submit">Submit</button></slot>
  </form>
{:else}
  <form {id} {action} {method}>
    <svelte:component this={Component} {...propsToPass} bind:value />
    <slot><button class="my-2" type="submit">Submit</button></slot>
  </form>
{/if}
