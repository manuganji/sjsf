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
  it.todo(
    'copies default from additionalProperties, unevaluatedProperties, patternProperties, propertyNames'
  );
  it.todo(
    'copies default for array of items in array schema'
  );
  it('copies default from anyOf schemas over to the point', () => {
    expect(
      copyDefaults({
        type: 'object',
        definitions: {
          a: {
            type: 'integer',
            default: 1
          },
          b: {
            type: 'string',
            default: 'b'
          }
        },
        properties: {
          p1: {
            $ref: '#/definitions/a'
          },
          items: {
            type: 'array',
            items: {
              type: 'object',
              anyOf: [
                {
                  properties: {
                    foo: {
                      $ref: '#/definitions/b'
                    }
                  }
                },
                {
                  properties: {
                    bar: {
                      $ref: '#/definitions/b'
                    }
                  }
                }
              ]
            }
          }
        },
        anyOf: [
          {
            title: 'First method of identification',
            properties: {
              firstName: {
                $ref: '#/definitions/b',
                title: 'First name',
                default: 'Chuck'
              },
              lastName: {
                $ref: '#/definitions/b',
                title: 'Last name'
              }
            }
          },
          {
            title: 'Second method of identification',
            properties: {
              idCode: {
                $ref: '#/definitions/b',
                title: 'ID code'
              }
            }
          }
        ]
      })
    ).toEqual({
      type: 'object',
      definitions: {
        a: {
          type: 'integer',
          default: 1
        },
        b: {
          type: 'string',
          default: 'b'
        }
      },
      properties: {
        p1: {
          $ref: '#/definitions/a',
          default: 1
        },
        items: {
          type: 'array',
          items: {
            type: 'object',
            anyOf: [
              {
                properties: {
                  foo: {
                    $ref: '#/definitions/b',
                    default: 'b'
                  }
                }
              },
              {
                properties: {
                  bar: {
                    $ref: '#/definitions/b',
                    default: 'b'
                  }
                }
              }
            ]
          }
        }
      },
      anyOf: [
        {
          title: 'First method of identification',
          properties: {
            firstName: {
              $ref: '#/definitions/b',
              title: 'First name',
              default: 'Chuck'
            },
            lastName: {
              $ref: '#/definitions/b',
              title: 'Last name',
              default: 'b'
            }
          }
        },
        {
          title: 'Second method of identification',
          properties: {
            idCode: {
              $ref: '#/definitions/b',
              title: 'ID code',
              default: 'b'
            }
          }
        }
      ]
    });
  });

  it('copies default from oneOf schemas over to the point', () => {
    expect(
      copyDefaults({
        type: 'object',
        definitions: {
          a: {
            type: 'integer',
            default: 1
          },
          b: {
            type: 'string',
            default: 'b'
          }
        },
        properties: {
          p1: {
            $ref: '#/definitions/a'
          },
          items: {
            type: 'array',
            items: {
              type: 'object',
              oneOf: [
                {
                  properties: {
                    foo: {
                      $ref: '#/definitions/b'
                    }
                  }
                },
                {
                  properties: {
                    bar: {
                      $ref: '#/definitions/b'
                    }
                  }
                }
              ]
            }
          }
        },
        oneOf: [
          {
            title: 'First method of identification',
            properties: {
              firstName: {
                $ref: '#/definitions/b',
                title: 'First name',
                default: 'Chuck'
              },
              lastName: {
                $ref: '#/definitions/b',
                title: 'Last name'
              }
            }
          },
          {
            title: 'Second method of identification',
            properties: {
              idCode: {
                $ref: '#/definitions/b',
                title: 'ID code'
              }
            }
          }
        ]
      })
    ).toEqual({
      type: 'object',
      definitions: {
        a: {
          type: 'integer',
          default: 1
        },
        b: {
          type: 'string',
          default: 'b'
        }
      },
      properties: {
        p1: {
          $ref: '#/definitions/a',
          default: 1
        },
        items: {
          type: 'array',
          items: {
            type: 'object',
            oneOf: [
              {
                properties: {
                  foo: {
                    $ref: '#/definitions/b',
                    default: 'b'
                  }
                }
              },
              {
                properties: {
                  bar: {
                    $ref: '#/definitions/b',
                    default: 'b'
                  }
                }
              }
            ]
          }
        }
      },
      oneOf: [
        {
          title: 'First method of identification',
          properties: {
            firstName: {
              $ref: '#/definitions/b',
              title: 'First name',
              default: 'Chuck'
            },
            lastName: {
              $ref: '#/definitions/b',
              title: 'Last name',
              default: 'b'
            }
          }
        },
        {
          title: 'Second method of identification',
          properties: {
            idCode: {
              $ref: '#/definitions/b',
              title: 'ID code',
              default: 'b'
            }
          }
        }
      ]
    });
  });

  it('copies default from allOf schemas over to the point', () => {
    expect(
      copyDefaults({
        type: 'object',
        definitions: {
          a: {
            type: 'integer',
            default: 1
          },
          b: {
            type: 'string',
            default: 'b'
          }
        },
        properties: {
          p1: {
            $ref: '#/definitions/a'
          },
          items: {
            type: 'array',
            items: {
              type: 'object',
              allOf: [
                {
                  properties: {
                    foo: {
                      $ref: '#/definitions/b'
                    }
                  }
                },
                {
                  properties: {
                    bar: {
                      $ref: '#/definitions/b'
                    }
                  }
                }
              ]
            }
          }
        },
        allOf: [
          {
            title: 'First method of identification',
            properties: {
              firstName: {
                $ref: '#/definitions/b',
                title: 'First name',
                default: 'Chuck'
              },
              lastName: {
                $ref: '#/definitions/b',
                title: 'Last name'
              }
            }
          },
          {
            title: 'Second method of identification',
            properties: {
              idCode: {
                $ref: '#/definitions/b',
                title: 'ID code'
              }
            }
          }
        ]
      })
    ).toEqual({
      type: 'object',
      definitions: {
        a: {
          type: 'integer',
          default: 1
        },
        b: {
          type: 'string',
          default: 'b'
        }
      },
      properties: {
        p1: {
          $ref: '#/definitions/a',
          default: 1
        },
        items: {
          type: 'array',
          items: {
            type: 'object',
            allOf: [
              {
                properties: {
                  foo: {
                    $ref: '#/definitions/b',
                    default: 'b'
                  }
                }
              },
              {
                properties: {
                  bar: {
                    $ref: '#/definitions/b',
                    default: 'b'
                  }
                }
              }
            ]
          }
        }
      },
      allOf: [
        {
          title: 'First method of identification',
          properties: {
            firstName: {
              $ref: '#/definitions/b',
              title: 'First name',
              default: 'Chuck'
            },
            lastName: {
              $ref: '#/definitions/b',
              title: 'Last name',
              default: 'b'
            }
          }
        },
        {
          title: 'Second method of identification',
          properties: {
            idCode: {
              $ref: '#/definitions/b',
              title: 'ID code',
              default: 'b'
            }
          }
        }
      ]
    });
  });

  it('copies defaults into if then else schema', () => {
    expect(
      copyDefaults({
        definitions: {
          p1: {
            type: 'string',
            default: 'p1'
          },
          p2: {
            type: 'string',
            default: 'p2'
          }
        },
        type: 'object',
        properties: {
          animal: {
            enum: ['Cat', 'Fish']
          }
        },
        allOf: [
          {
            if: {
              properties: {
                animal: {
                  $ref: '#/definitions/p1'
                }
              }
            },
            then: {
              properties: {
                food: {
                  $ref: '#/definitions/p1'
                }
              },
              required: ['food']
            }
          },
          {
            if: {
              properties: {
                animal: {
                  const: 'Fish'
                }
              }
            },
            then: {
              properties: {
                food: {
                  $ref: '#/definitions/p2',
                  enum: ['insect', 'worms']
                },
                water: {
                  type: 'string',
                  enum: ['lake', 'sea']
                }
              },
              required: ['food', 'water']
            }
          },
          {
            required: ['animal']
          }
        ]
      })
    ).toEqual({
      definitions: {
        p1: {
          type: 'string',
          default: 'p1'
        },
        p2: {
          type: 'string',
          default: 'p2'
        }
      },
      type: 'object',
      properties: {
        animal: {
          enum: ['Cat', 'Fish']
        }
      },
      allOf: [
        {
          if: {
            properties: {
              animal: {
                $ref: '#/definitions/p1',
                default: 'p1'
              }
            }
          },
          then: {
            properties: {
              food: {
                $ref: '#/definitions/p1',
                default: 'p1'
              }
            },
            required: ['food']
          }
        },
        {
          if: {
            properties: {
              animal: {
                const: 'Fish'
              }
            }
          },
          then: {
            properties: {
              food: {
                $ref: '#/definitions/p2',
                default: 'p2',
                enum: ['insect', 'worms']
              },
              water: {
                type: 'string',
                enum: ['lake', 'sea']
              }
            },
            required: ['food', 'water']
          }
        },
        {
          required: ['animal']
        }
      ]
    });
  });

  it('plays nicely with if then else when they are boolean', () => {
    expect(
      copyDefaults({
        definitions: {
          p1: {
            type: 'string',
            default: 'p1'
          },
          p2: {
            type: 'string',
            default: 'p2'
          }
        },
        type: 'object',
        properties: {
          animal: {
            enum: ['Cat', 'Fish']
          }
        },
        allOf: [
          {
            if: true,
            then: {
              properties: {
                food: {
                  $ref: '#/definitions/p1'
                }
              },
              required: ['food']
            }
          },
          {
            if: {
              properties: {
                animal: {
                  const: 'Fish'
                }
              }
            },
            then: false
          },
          {
            required: ['animal']
          }
        ]
      })
    ).toEqual({
      definitions: {
        p1: {
          type: 'string',
          default: 'p1'
        },
        p2: {
          type: 'string',
          default: 'p2'
        }
      },
      type: 'object',
      properties: {
        animal: {
          enum: ['Cat', 'Fish']
        }
      },
      allOf: [
        {
          if: true,
          then: {
            properties: {
              food: {
                $ref: '#/definitions/p1',
                default: 'p1'
              }
            },
            required: ['food']
          }
        },
        {
          if: {
            properties: {
              animal: {
                const: 'Fish'
              }
            }
          },
          then: false
        },
        {
          required: ['animal']
        }
      ]
    });
  });
});
