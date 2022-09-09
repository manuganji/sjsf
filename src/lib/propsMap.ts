import type { JSONSchemaType } from '$lib/types';

export const BY_WIDGET_CODE: Record<string, Record<string, any>> = {
  string: {
    color: {
      type: 'color'
    },
    email: {
      type: 'email'
    }
  }
};

export const BY_STRING_FORMAT: Record<string, Record<string, any>> = {
  color: {
    type: 'color'
  },
  email: {
    type: 'email'
  }
};

export const BY_SCHEMA_TYPE: Record<string, Record<string, any>> = {
  string: {
    type: 'text'
  },
  integer: {
    type: 'number',
    step: (schema: JSONSchemaType) => {
      if (schema?.multipleOf) {
        let multipleOf = Math.round(Math.abs(schema?.multipleOf));
        if (multipleOf < 1) {
          return 1;
        } else {
          return multipleOf;
        }
      } else {
        return 1;
      }
    }
  },
  number: {
    type: 'number',
    step: (schema: JSONSchemaType) => (schema?.multipleOf ? Math.abs(schema.multipleOf) : undefined)
  },
  boolean: {
    type: 'checkbox'
  }
};
