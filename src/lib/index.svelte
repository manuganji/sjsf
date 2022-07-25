<script lang="ts">
	import type { JSONSchema7 } from 'json-schema';
	export let schema: JSONSchema7 = null;
	let value: any | null = null;
</script>

<input
	default={value}
	on:keyup|preventDefault={({ target }) => {
		value = target?.value;
	}}
	type={'integer'}
/>

<p id="value">{value}</p>
