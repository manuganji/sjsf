import type { JSONSchema7 } from 'json-schema';

const sections: Record<string, Array<JSONSchema7>> = {
  string: [
    {
      type: 'string',
      title: 'String',
      description: 'This is a string field'
    },
    {
      type: ['string', 'null'],
      title: 'Optional string',
      description: 'This is an optional string field'
    }
  ],
  boolean: [
    {
      type: 'boolean',
      title: 'Boolean',
      description: 'This is a boolean field'
    },
    {
      type: ['boolean', 'null'],
      title: 'Optional boolean',
      description: 'This is an optional boolean field'
    }
  ],
  float: [
    {
      type: 'number',
      title: 'Float default',
      default: 0
    },
    {
      type: ['number', 'null'],
      title: 'Optional float',
      description: 'This is an optional float field'
    },
    {
      type: 'number',
      title: 'Float min max',
      default: 1,
      minimum: 0,
      maximum: 10
    },
    {
      type: 'object',
      title: 'Float object',
      properties: {
        integer: {
          type: 'number',
          title: 'Float',
          default: 0
        }
      }
    },
    {
      type: 'object',
      title: 'Float object min max',
      properties: {
        integer: {
          type: 'number',
          title: 'Integer',
          default: 1,
          minimum: 0,
          maximum: 10
        }
      }
    }
  ],
  integer: [
    {
      type: 'integer',
      title: 'Integer default',
      default: 0
    },
    {
      type: ['integer', 'null'],
      title: 'Optional integer',
      description: 'This is an optional integer field'
    },
    {
      type: 'integer',
      title: 'Integer min max',
      default: 1,
      minimum: 0,
      maximum: 10
    },
    {
      type: 'object',
      title: 'Integer',
      properties: {
        integer: {
          type: 'integer',
          title: 'Integer',
          default: 0
        }
      }
    },
    {
      type: 'object',
      title: 'Integer',
      properties: {
        integer: {
          type: 'integer',
          title: 'Integer',
          default: 1,
          minimum: 0,
          maximum: 10
        }
      }
    }
  ]
};

export default sections;
