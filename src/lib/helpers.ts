import { SvelteComponent } from "svelte";
import { SvelteComponent as InternalSvelteComponent } from "svelte/internal";

import type { JSONObject, JSONSchema } from "@pyoner/svelte-form-common";

import type {
  FieldProps,
  Errors,
} from "./types";

export function objectDefaultValue(schema: JSONSchema, value: JSONObject | null): JSONObject {
  const v: JSONObject = {};
  const { properties } = schema;
  if (properties) {
    for (let k in properties) {
      const propSchema = properties[k];

      if (typeof propSchema !== "boolean") {
        const item = value && value[k];
        v[k] = defaultValue(propSchema, item);
      }
    }
  }
  return v;
}

export function defaultValue<T extends any>(schema: JSONSchema, value: T | null): T | null {
  if (value === undefined) {
    value = null;
  }

  if (value == null && schema.default !== undefined) {
    value = schema.default as T;
  }

  switch (schema.type) {
    case "object":
      return objectDefaultValue(schema, <JSONObject>value) as T;

    case "array":
      return (value || []) as T;
  }

  return value;
}