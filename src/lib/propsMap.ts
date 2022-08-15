export const BY_WIDGET_CODE: Record<string, Record<string, any>> = {
  string: {
    color: {
      type: 'color'
    }
  }
};

export const BY_STRING_FORMAT: Record<string, Record<string, any>> = {};

export const BY_SCHEMA_TYPE: Record<string, Record<string, any>> = {
  string: {
    type: 'text'
  },
  integer: {
    type: 'number',
    step: 1
  },
  number: {
    type: 'number'
  },
  boolean: {
    type: 'checkbox'
  }
};
