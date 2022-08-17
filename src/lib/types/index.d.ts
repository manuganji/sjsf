import { JSONSchemaType as BaseJSONSchemaType } from './ajv';
import type { JSONSchema7TypeName } from 'json-schema';

export type JSONTypes = boolean | string | number | object | null | any[];
export type JSONSchemaType<T> = BaseJSONSchemaType<T> & {
  widget?: string;
  ctx?: Record<string, any>;
};
