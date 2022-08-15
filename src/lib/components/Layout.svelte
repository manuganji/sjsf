<script lang="ts">
  import type { JSONSchema7 } from 'json-schema';
  export let id: string = '';
  export let errors: Error[] | null = null;
  export let schema: JSONSchema7;
  export let required: boolean = false;
</script>

{#if schema}
  {#if schema.type == 'object' || schema.type == 'array'}
    <fieldset class="flex flex-col gap-y-2">
      <legend
        >{schema.title}{#if required}<span class="text-red">*</span>{/if}</legend
      >

      {#if schema.description}
        <div class="description">{schema.description}</div>
      {/if}

      <slot>A field is not implemented</slot>

      {#if errors && errors.length}
        {#each errors as error}
          <div class="error">{error.message}</div>
        {/each}
      {/if}
    </fieldset>
  {:else}
    <div class="flex flex-col gap-y-2">
      {#if schema.title}
        <label class="label" for={id}
          >{schema.title}{#if required}<span class="text-red">*</span>{/if}</label
        >
      {/if}

      <slot {id} {schema}>A field is not implemented</slot>

      {#if errors && errors.length}
        {#each errors as error}
          <div class="error">{error.message}</div>
        {/each}
      {/if}

      {#if schema.description}
        <div class="description">{schema.description}</div>
      {/if}
    </div>
  {/if}
{/if}

<style>
  .error {
    color: red;
  }
</style>
