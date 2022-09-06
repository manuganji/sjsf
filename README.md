# sjsf

Svelte JSON Schema Form

Supports JSON Schema `Draft-07`. You can assert for this by checking the `$schema` keyword within your schema before sending it to the form element.

**Supports only a subset of JSON Schema Draft-07.**

- Only `ajv` [`strict` mode](https://ajv.js.org/options.html#strict-mode-options) compliant schema:

Inspired by [React JSON Schema Form](https://github.com/rjsf-team/react-jsonschema-form). Specifically `@rjsf/utils` package in `V5` is super valuable. But there will be a few differences in approach from RJSF.

1. No `UiSchema`
2. Will allow schema extension and a different way of stating UI configuration
3. Uses Vite ecosystem

`Form`

- `schema`
- `sharedContext`
- `getFieldLayout: (schema, value) -> SvelteComponent`
- `getWidget: (schema, value) -> SvelteComponent | Element`
- `getField: (schema, value) -> SvelteComponent`

`FieldLayout`
- `schema`
- `sharedContext`

`Field`
- `schema`
- `getWidget: (schema, value) -> SvelteComponent | Element`

`Widget`
- `schema`
- `value`


**getComponent contract**

1. if `schema.widget` is defined, then look up by `schema.type.widget`.
2. if `schema.format` is defined, then look up by `schema.type.format`.
3. find by `schema.type`

**getProps contract**

1. if `schema.widget` is defined, then look up by `schema.type.widget`.
2. if `schema.format` is defined, then look up by `schema.type.format`.
3. find by `schema.type`

**WIP** Expect 💥 bugs 💥
