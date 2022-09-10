import type { JSONSchema7TypeName } from 'json-schema';
import type { SvelteComponent } from 'svelte';
import ArrayField from './components/fields/ArrayField.svelte';
import InputField from './components/fields/InputField.svelte';
import NullField from './components/fields/NullField.svelte';
import ObjectField from './components/fields/ObjectField.svelte';
import TextareaField from './components/fields/TextareaField.svelte';

export const BY_WIDGET_CODE: Partial<
  Record<JSONSchema7TypeName, Record<string, typeof SvelteComponent>>
> = {
  string: {
    textarea: TextareaField
  }
};

export const BY_SCHEMA_TYPE: Record<JSONSchema7TypeName, typeof SvelteComponent> = {
  integer: InputField,
  number: InputField,
  boolean: InputField,
  string: InputField,
  object: ObjectField,
  array: ArrayField,
  null: NullField
};

// const widgetMap = {
//   boolean: {
//     checkbox: 'CheckboxWidget',
//     radio: 'RadioWidget',
//     select: 'SelectWidget',
//     hidden: 'HiddenWidget'
//   },
//   number: {
//     text: 'TextWidget',
//     select: 'SelectWidget',
//     updown: 'UpDownWidget',
//     range: 'RangeWidget',
//     radio: 'RadioWidget',
//     hidden: 'HiddenWidget'
//   },
//   integer: {
//     text: 'TextWidget',
//     select: 'SelectWidget',
//     updown: 'UpDownWidget',
//     range: 'RangeWidget',
//     radio: 'RadioWidget',
//     hidden: 'HiddenWidget'
//   },
//   array: {
//     select: 'SelectWidget',
//     checkboxes: 'CheckboxesWidget',
//     files: 'FileWidget',
//     hidden: 'HiddenWidget'
//   }
// };
