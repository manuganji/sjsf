import { JSONSchema7 as BaseJSONSchema7 } from 'json-schema';

declare module 'json-schema' {
  interface JSONSchema7 extends BaseJSONSchema7 {
    widget?: string;
    ctx?: Record<string, any>;
  }
}
