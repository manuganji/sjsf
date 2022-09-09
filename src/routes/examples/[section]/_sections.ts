import type { JSONSchemaType, JSONTypes } from '$lib/types';
import type { JSONSchema7TypeName } from 'json-schema';

const sections: Record<string, Array<JSONSchemaType<JSONTypes>>> = {
  // null: [
  //   {
  //     type: 'null',
  //     title: 'Null',
  //     description: 'This is a null field'
  //   }
  // ],
  array: [
    {
      type: 'array',
      title: 'Array of strings',
      description: 'This is an array field',
      items: {
        type: 'string',
        title: 'String',
        description: 'This is a string field'
      }
    },
    {
      type: 'object',
      title: 'Object with an array',
      description: 'This is an object with an array field',
      properties: {
        integer: {
          type: 'integer',
          title: 'Integer',
          description: 'This is an integer field'
        },
        array: {
          type: 'array',
          title: 'Array',
          description: 'This is an array field',
          items: {
            type: 'number',
            title: 'Number',
            description: 'This is a number field'
          }
        }
      }
    }
  ],
  string: [
    {
      type: 'string',
      enum: ['foo', 'bar'],
      default: 'bar'
    },
    {
      type: 'string',
      enum: ['foo', 'bar']
    },
    {
      type: ['string', 'null'],
      enum: ['foo', 'bar'],
      ctx: {
        placeholder: 'Test'
      }
    },
    {
      type: 'string',
      enum: ['foo', 'bar'],
      ctx: {
        placeholder: 'Test'
      }
    },
    {
      type: 'string',
      description: 'This is a string field',
      examples: ['one', 'two', 'three']
    },
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
        float: {
          type: 'number',
          title: 'Float',
          default: 0,
          multipleOf: 0.01
        }
      }
    },
    {
      type: 'object',
      title: 'Float object min max',
      properties: {
        float: {
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
      type: 'integer',
      enum: [1, 2, 5],
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
