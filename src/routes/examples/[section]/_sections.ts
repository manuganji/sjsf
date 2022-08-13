import type { JSONSchema7 } from 'json-schema';

const sections: Record<string, Array<JSONSchema7>> = {
  float: [
    {
      type: 'number',
      title: 'Float default',
      default: 0
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