import type { SvelteComponent, SvelteComponentTyped } from 'svelte/types/runtime';
import type { JSONSchemaType, ValidateFunction, ErrorObject } from 'ajv';

// import * as React from 'react';
export type ASType = 'div' | 'form';

export interface IChangeEvent<ValueType = any> {
  // edit: boolean;
  value: ValueType;
  errors: ErrorObject[];
  // idSchema: IdSchema;
  // schema: JSONSchemaType<ValueType>;
  // uiSchema: UiSchema;
  // status?: string;
}

export type ErrorLayoutProps<ValueType> = {
  errors: ErrorObject[];
  sharedContext: any;
  schema: JSONSchemaType<ValueType>;
  uiSchema: UiSchema;
};

export interface FormProps<ValueType = Record<string, any> | any, ContextType = any> {
  acceptcharset?: string;
  action?: string;
  as?: ASType;
  autoComplete?: string;
  autocomplete?: string; // deprecated
  // children?: React.ReactNode;
  class?: string | ((value: ValueType, errors: null | ErrorObject[]) => string);
  style?: string | ((value: ValueType, errors: null | ErrorObject[]) => string);
  disabled?: boolean;
  readonly?: boolean;
  enctype?: string;
  fields?: { [name: string]: Field };
  id?: string;
  idPrefix?: string;
  idSeparator?: string;
  layouts: {
    // primarily static components that show something than actually change any state
    ArrayFieldLayout?: SvelteComponentTyped<ArrayFieldLayoutProps>;
    ObjectFieldLayout?: SvelteComponentTyped<ObjectFieldLayoutProps>;
    FieldLayout?: SvelteComponentTyped<FieldLayoutProps>;
    ErrorLayout?: SvelteComponentTyped<ErrorLayoutProps<ValueType>>;
  };
  liveOmit?: boolean;
  liveValidate?: boolean;
  method?: string;
  name?: string;
  noHtml5Validate?: boolean;
  noValidate?: boolean;
  omitExtraData?: boolean;
  onBlur?: (Event) => void;
  onChange?: (e: IChangeEvent<ValueType>) => any;
  onError?: (e: any) => any;
  onFocus?: (Event) => void;
  onSubmit?: (e: ISubmitEvent<ValueType>, nativeEvent: typeof FormDataEvent) => any;
  schema: JSONSchemaType<ValueType>;
  sharedContext?: ContextType;
  showErrors?: boolean;
  target?: string;
  transformErrors?: (errors: ErrorObject[]) => ErrorObject[];
  uiSchema?: UiSchema;
  validate?: ValidateFunction<ValueType>;
  value?: ValueType;
  widgets?: { [name: string]: Widget };
}



// export default class Form<T> extends React.Component<FormProps<T>> {
//   validate: (
//     value: T,
//     schema?: FormProps<T>['schema'],
//     additionalMetaSchemas?: FormProps<T>['additionalMetaSchemas'],
//     customFormats?: FormProps<T>['customFormats']
//   ) => { errors: ErrorObject[]; errorSchema: ErrorSchema };
//   onChange: (value: T, newErrorSchema: ErrorSchema) => void;
//   onBlur: () => void;
//   submit: () => void;
// }

export type UISchemaSubmitButtonOptions = {
  submitText?: string;
  norender?: boolean;
  props?: {
    disabled?: boolean;
    className?: string;
    [name: string]: any;
  };
};

export type UiSchema = {
  'ui:field'?: Field | string;
  'ui:widget'?: Widget | string;
  'ui:options'?: { [key: string]: boolean | number | string | object | any[] | null };
  'ui:order'?: string[];
  // 'ui:FieldLayout'?: React.FunctionComponent<FieldLayoutProps>;
  // 'ui:ArrayFieldLayout'?: React.FunctionComponent<ArrayFieldLayoutProps>;
  // 'ui:ObjectFieldLayout'?: React.FunctionComponent<ObjectFieldLayoutProps>;
  [name: string]: any;
  'ui:submitButtonOptions'?: UISchemaSubmitButtonOptions;
};

export type FieldId = {
  $id: string;
};

export type IdSchema<T = any> = {
  [key in keyof T]: IdSchema<T[key]>;
} & FieldId;

export type FieldPath = {
  $name: string;
};

export type PathSchema<T = any> = {
  [key in keyof T]: PathSchema<T[key]>;
} & FieldPath;

export interface WidgetProps<ValueType = any> {
  id: string;
  schema: JSONSchemaType<ValueType>;
  uiSchema: UiSchema;
  value: any;
  required: boolean;
  disabled: boolean;
  readonly: boolean;
  autofocus: boolean;
  placeholder: string;
  onChange: (value: any) => void;
  options: NonNullable<UiSchema['ui:options']>;
  sharedContext: any;
  onBlur: () => void;
  onFocus: () => void;
  label: string;
  multiple: boolean;
  rawErrors: string[];
  [prop: string]: any; // Allow for other props
}

export type Widget = SvelteComponentTyped<WidgetProps>;

// export interface Registry {
//   fields: { [name: string]: Field };
//   widgets: { [name: string]: Widget };
//   definitions: { [name: string]: any };
//   sharedContext: any;
//   rootSchema: JSONSchemaType;
// }

export interface FieldProps<ValueType = any> {
  schema: JSONSchemaType<ValueType>;
  uiSchema: UiSchema;
  idSchema: IdSchema;
  value: ValueType;
  onChange?: (e: IChangeEvent<ValueType>) => any;
  onBlur: () => void;
  onFocus: () => void;
  sharedContext: any;
  autofocus: boolean;
  disabled: boolean;
  readonly: boolean;
  required: boolean;
  name: string;
  [prop: string]: any; // Allow for other props
}

export type Field = SvelteComponentTyped<FieldProps>;

export type FieldLayoutProps<T = any> = {
  id: string;
  classNames: string;
  label: string;
  description: SvelteComponent;
  rawDescription: string;
  errors: SvelteComponent;
  rawErrors: string[];
  help: SvelteComponent;
  rawHelp: string;
  hidden: boolean;
  required: boolean;
  readonly: boolean;
  disabled: boolean;
  displayLabel: boolean;
  fields: Field[];
  schema: JSONSchemaType<T>;
  uiSchema: UiSchema;
  sharedContext: any;
  value: T;
  onChange: (value: T) => void;
  onKeyChange: (value: string) => () => void;
  onDropPropertyClick: (value: string) => () => void;
};

export type ArrayFieldLayoutProps<T = any> = {
  DescriptionField: SvelteComponentTyped<{
    id: string;
    description: string | SvelteComponent;
  }>;
  TitleField: SvelteComponentTyped<{ id: string; title: string; required: boolean }>;
  canAdd: boolean;
  className: string;
  disabled: boolean;
  idSchema: IdSchema;
  items: {
    className: string;
    disabled: boolean;
    hasMoveDown: boolean;
    hasMoveUp: boolean;
    hasRemove: boolean;
    hasToolbar: boolean;
    index: number;
    onAddIndexClick: (index: number) => (event?: any) => void;
    onDropIndexClick: (index: number) => (event?: any) => void;
    onReorderClick: (index: number, newIndex: number) => (event?: any) => void;
    readonly: boolean;
    key: string;
  }[];
  onAddClick: (event?: any) => void;
  readonly: boolean;
  required: boolean;
  schema: JSONSchemaType<T>;
  uiSchema: UiSchema;
  title: string;
  sharedContext: any;
  value: T;
};

export type ObjectFieldLayoutProps<T = any> = {
  DescriptionField: SvelteComponentTyped<{
    id: string;
    description: string | SvelteComponent;
  }>;
  TitleField: SvelteComponentTyped<{ id: string; title: string; required: boolean }>;
  title: string;
  description: string;
  disabled: boolean;
  properties: {
    content: SvelteComponent
    name: string;
    disabled: boolean;
    readonly: boolean;
    hidden: boolean;
  }[];
  onAddClick: (schema: JSONSchemaType<T>) => () => void;
  readonly: boolean;
  required: boolean;
  schema: JSONSchemaType<T>;
  uiSchema: UiSchema;
  idSchema: IdSchema;
  value: T;
  sharedContext: any;
};

export type ISubmitEvent<T> = IChangeEvent<T>;

// export type FieldError = string;

// type FieldValidation = {
//   __errors: FieldError[];
//   addError: (message: string) => void;
// };

// type FormSubmit<T = any> = {
//   value: T;
// };

// export type ThemeProps<T = any> = Omit<FormProps<T>, 'schema'>;

// export function withTheme<T = any>(
//   themeProps: ThemeProps<T>
// ): React.ComponentClass<FormProps<T>> | React.FunctionComponent<FormProps<T>>;

// export type AddButtonProps = {
//   className: string;
//   onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
//   disabled: boolean;
// };

// export module utils {
//   export const ADDITIONAL_PROPERTY_FLAG: string;

//   export function canExpand(schema: JSONSchemaType, uiSchema: UiSchema, value: any): boolean;

//   export function getDefaultRegistry(): Registry;

//   export function getSchemaType(schema: JSONSchemaType): string;

//   export function getWidget(
//     schema: JSONSchemaType,
//     widget: Widget | string,
//     registeredWidgets?: { [name: string]: Widget }
//   ): Widget;

//   export function hasWidget(
//     schema: JSONSchemaType,
//     widget: Widget | string,
//     registeredWidgets?: { [name: string]: Widget }
//   ): boolean;

//   export function computeDefaults<T = any>(
//     schema: JSONSchemaType,
//     parentDefaults: JSONSchemaType['default'][],
//     definitions: Registry['definitions'],
//     rawvalue?: T,
//     includeUndefinedValues?: boolean
//   ): JSONSchemaType['default'][];

//   export function getDefaultFormState<T = any>(
//     schema: JSONSchemaType,
//     value: T,
//     definitions?: Registry['definitions'],
//     includeUndefinedValues?: boolean
//   ): T | JSONSchemaType['default'][];

//   export function getUiOptions(uiSchema: UiSchema): UiSchema['ui:options'];

//   export function getSubmitButtonOptions(uiSchema: UiSchema): UISchemaSubmitButtonOptions;

//   export function getDisplayLabel(
//     schema: JSONSchemaType,
//     uiSchema: UiSchema,
//     rootSchema?: JSONSchemaType
//   ): boolean;

//   export function isObject(thing: any): boolean;

//   export function mergeObjects(obj1: object, obj2: object, concatArrays?: boolean): object;

//   export function asNumber(value: string | null): number | string | undefined | null;

//   export function orderProperties(properties: [], order: []): [];

//   export function isConstant(schema: JSONSchemaType): boolean;

//   export function toConstant(schema: JSONSchemaType): JSONSchemaTypeType | JSONSchemaType['const'];

//   export function isSelect(_schema: JSONSchemaType, definitions?: Registry['definitions']): boolean;

//   export function isMultiSelect(
//     schema: JSONSchemaType,
//     definitions?: Registry['definitions']
//   ): boolean;

//   export function isFilesArray(
//     schema: JSONSchemaType,
//     uiSchema: UiSchema,
//     definitions?: Registry['definitions']
//   ): boolean;

//   export function isFixedItems(schema: JSONSchemaType): boolean;

//   export function allowAdditionalItems(schema: JSONSchemaType): boolean;

//   export function optionsList(schema: JSONSchemaType): {
//     schema?: JSONSchemaTypeDefinition;
//     label: string;
//     value: string;
//   }[];

//   export function guessType(value: any): JSONSchemaTypeTypeName;

//   export function stubExistingAdditionalProperties<T = any>(
//     schema: JSONSchemaType,
//     definitions?: Registry['definitions'],
//     value?: T
//   ): JSONSchemaType;

//   export function resolveSchema<T = any>(
//     schema: JSONSchemaTypeDefinition,
//     definitions?: Registry['definitions'],
//     value?: T
//   ): JSONSchemaType;

//   export function retrieveSchema<T = any>(
//     schema: JSONSchemaTypeDefinition,
//     definitions?: Registry['definitions'],
//     value?: T
//   ): JSONSchemaType;

//   export function deepEquals<T>(a: T, b: T): boolean;

//   export function shouldRender(comp: React.Component, nextProps: any, nextState: any): boolean;

//   export function toIdSchema<T = any>(
//     schema: JSONSchemaTypeDefinition,
//     id: string,
//     definitions: Registry['definitions'],
//     value?: T,
//     idPrefix?: string,
//     idSeparator?: string
//   ): IdSchema | IdSchema[];

//   export function toPathSchema<T = any>(
//     schema: JSONSchemaTypeDefinition,
//     name: string | undefined,
//     definitions: Registry['definitions'],
//     value?: T
//   ): PathSchema | PathSchema[];

//   export interface DateObject {
//     year: number;
//     month: number;
//     day: number;
//     hour: number;
//     minute: number;
//     second: number;
//   }

//   export function parseDateString(dateString: string, includeTime?: boolean): DateObject;

//   export function toDateString(dateObject: DateObject, time?: boolean): string;

//   export function utcToLocal(jsonDate: string): string;

//   export function localToUTC(dateString: string): Date;

//   export function pad(num: number, size: number): string;

//   export function setState(instance: React.Component, state: any, callback: Function): void;

//   export function dataURItoBlob(dataURI: string): { name: string; blob: Blob };

//   export interface IRangeSpec {
//     min?: number;
//     max?: number;
//     step?: number;
//   }

//   export function rangeSpec(schema: JSONSchemaType): IRangeSpec;

//   export function getMatchingOption(
//     value: any,
//     options: JSONSchemaType[],
//     definitions: Registry['definitions']
//   ): number;

//   export function schemaRequiresTrueValue(schema: JSONSchemaType): boolean;
// }

// declare module '@rjsf/core/lib/components/fields/SchemaField' {
//   import { JSONSchemaType } from 'json-schema';
//   import { FieldProps, UiSchema, IdSchema, FormValidation } from '@rjsf/core';

//   export type SchemaFieldProps<T = any> = Pick<
//     FieldProps<T>,
//     'schema' | 'uiSchema' | 'idSchema' | 'value' | 'errorSchema' | 'registry' | 'sharedContext'
//   >;

//   export default class SchemaField extends React.Component<SchemaFieldProps> {}
// }

// declare module '@rjsf/core/lib/components/fields/ObjectField' {
//   import { FieldProps } from '@rjsf/core';

//   export type ObjectFieldProps<T = any> = FieldProps<T>;

//   export default class ObjectField extends React.Component<ObjectFieldProps> {}
// }

// declare module '@rjsf/core/lib/validate' {
//   import { JSONSchemaTypeDefinition } from 'json-schema';
//   import { ErrorObject, ErrorSchema, FormProps } from '@rjsf/core';

//   export default function validatevalue<T = any>(
//     value: T,
//     schema: JSONSchemaTypeDefinition,
//     customValidate?: FormProps<T>['validate'],
//     transformErrors?: FormProps<T>['transformErrors'],
//     additionalMetaSchemas?: FormProps<T>['additionalMetaSchemas'],
//     customFormats?: FormProps<T>['customFormats']
//   ): { errors: ErrorObject[]; errorSchema: ErrorSchema };
// }
