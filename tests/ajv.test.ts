import { ajv } from '$lib/validate';
import { copyDefaults } from '$lib/utils';
import Ajv from 'ajv';

describe('Ajv Settings', () => {
  let validate;
  // let ajv: typeof Ajv;
  beforeAll(() => {});

  it('ajv is an instance of Ajv', () => {
    expect(ajv).toBeInstanceOf(Ajv);
  });

  it('default options', () => {
    expect(ajv.opts.useDefaults).toBe('empty');
    expect(ajv.opts.allErrors).toBe(true);
    expect(ajv.opts.strict).toBe(true);
  });
});

describe('Computes default for unset', () => {
  it('copies default from $ref schemas over to the point', () => {
    expect(
      copyDefaults({
        type: 'object',
        definitions: {
          a: {
            type: 'string',
            default: 'a'
          }
        },
        properties: {
          p1: {
            $ref: '#/definitions/a'
          },
          p2: {
            type: 'integer',
            default: 2
          },
          p3: {
            type: 'object',
            properties: {
              d1: {
                $ref: '#/definitions/a'
              }
            }
          }
        }
      })
    ).toEqual({
      type: 'object',
      definitions: {
        a: {
          type: 'string',
          default: 'a'
        }
      },
      properties: {
        p1: {
          $ref: '#/definitions/a',
          default: 'a'
        },
        p2: {
          type: 'integer',
          default: 2
        },
        p3: {
          type: 'object',
          properties: {
            d1: {
              $ref: '#/definitions/a',
              default: 'a'
            }
          }
        }
      }
    });
  });
});
