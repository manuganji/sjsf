import { fireEvent } from '@testing-library/dom';
import { expect, describe, beforeEach, afterEach, it, vi } from 'vitest';

import { createFormComponent, createSandbox } from './test_utils';

describe('anyOf', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should not render a select element if the anyOf keyword is not present', () => {
    const schema = {
      type: 'object',
      properties: {
        foo: { type: 'string' }
      }
    };

    const { container } = createFormComponent({
      schema
    });

    expect(container.querySelectorAll('select')).toHaveLength((0));
  });

  it('should render a select element if the anyOf keyword is present', () => {
    const schema = {
      type: 'object',
      anyOf: [
        {
          properties: {
            foo: { type: 'string' }
          }
        },
        {
          properties: {
            bar: { type: 'string' }
          }
        }
      ]
    };

    const { container } = createFormComponent({
      schema
    });

    expect(container.querySelectorAll('select')).toHaveLength(1);
    expect(container.querySelector('select')!.id).eql('root__anyof_select');
  });

  it('should assign a default value and set defaults on option change', () => {
    const { container: container, onChange } = createFormComponent({
      schema: {
        anyOf: [
          {
            type: 'object',
            properties: {
              foo: { type: 'string', default: 'defaultfoo' }
            }
          },
          {
            type: 'object',
            properties: {
              foo: { type: 'string', default: 'defaultbar' }
            }
          }
        ]
      }
    });
    expect(onChange.mock.lastCall).toEqual({
      formData: { foo: 'defaultfoo' }
    });

    const $select = container.querySelector('select')!;

    fireEvent.change($select, {
      target: { value: $select.options[1].value }
    });

    expect(onChange.mock.lastCall).toEqual({
      formData: { foo: 'defaultbar' }
    });
  });

  it('should assign a default value and set defaults on option change when using references', () => {
    const { container: container, onChange } = createFormComponent({
      schema: {
        anyOf: [
          {
            type: 'object',
            properties: {
              foo: { type: 'string', default: 'defaultfoo' }
            }
          },
          {
            $ref: '#/definitions/bar'
          }
        ],
        definitions: {
          bar: {
            type: 'object',
            properties: {
              foo: { type: 'string', default: 'defaultbar' }
            }
          }
        }
      }
    });
    expect(onChange.mock.lastCall).toEqual({
      formData: { foo: 'defaultfoo' }
    });

    const $select = container.querySelector('select')!;

    fireEvent.change($select, {
      target: { value: $select.options[1].value }
    });

    expect(onChange.mock.lastCall).toEqual({
      formData: { foo: 'defaultbar' }
    });
  });

  it("should assign a default value and set defaults on option change with 'type': 'object' missing", () => {
    const { container: container, onChange } = createFormComponent({
      schema: {
        type: 'object',
        anyOf: [
          {
            properties: {
              foo: { type: 'string', default: 'defaultfoo' }
            }
          },
          {
            properties: {
              foo: { type: 'string', default: 'defaultbar' }
            }
          }
        ]
      }
    });

    expect(onChange.mock.lastCall).toEqual({
      formData: { foo: 'defaultfoo' }
    });

    const $select = container.querySelector('select')!;

    fireEvent.change($select, {
      target: { value: $select.options[1].value }
    });

    expect(onChange.mock.lastCall).toEqual({
      formData: { foo: 'defaultbar' }
    });
  });

  it('should render a custom widget', () => {
    const schema = {
      type: 'object',
      anyOf: [
        {
          properties: {
            foo: { type: 'string' }
          }
        },
        {
          properties: {
            bar: { type: 'string' }
          }
        }
      ]
    };
    const widgets = {
      SelectWidget: () => {
        return <section id="CustomSelect">Custom Widget</section>;
      }
    };

    const { container } = createFormComponent({
      schema,
      widgets
    });

    expect(container.querySelector('#CustomSelect')).to.exist;
  });

  it('should change the rendered form when the select value is changed', () => {
    const schema = {
      type: 'object',
      anyOf: [
        {
          properties: {
            foo: { type: 'string' }
          }
        },
        {
          properties: {
            bar: { type: 'string' }
          }
        }
      ]
    };

    const { container } = createFormComponent({
      schema
    });

    expect(container.querySelectorAll('#root_foo')).toHaveLength((1));
    expect(container.querySelectorAll('#root_bar')).toHaveLength((0));

    const $select = container.querySelector('select')!;

    fireEvent.change($select, {
      target: { value: $select.options[1].value }
    });

    expect(container.querySelectorAll('#root_foo')).toHaveLength((0));
    expect(container.querySelectorAll('#root_bar')).toHaveLength((1));
  });

  it('should handle change events', () => {
    const schema = {
      type: 'object',
      anyOf: [
        {
          properties: {
            foo: { type: 'string' }
          }
        },
        {
          properties: {
            bar: { type: 'string' }
          }
        }
      ]
    };

    const { container: container, onChange } = createFormComponent({
      schema
    });

    fireEvent.change(container.querySelector('input#root_foo')!, {
      target: { value: 'Lorem ipsum dolor sit amet' }
    });

    expect(onChange.mock.lastCall).toEqual({
      formData: { foo: 'Lorem ipsum dolor sit amet' }
    });
  });

  it('should clear previous data when changing options', () => {
    const schema = {
      type: 'object',
      properties: {
        buzz: { type: 'string' }
      },
      anyOf: [
        {
          properties: {
            foo: { type: 'string' }
          }
        },
        {
          properties: {
            bar: { type: 'string' }
          }
        }
      ]
    };

    const { container: container, onChange } = createFormComponent({
      schema
    });

    fireEvent.change(container.querySelector('input#root_buzz')!, {
      target: { value: 'Lorem ipsum dolor sit amet' }
    });

    fireEvent.change(container.querySelector('input#root_foo')!, {
      target: { value: 'Consectetur adipiscing elit' }
    });

    expect(onChange.mock.lastCall).toEqual({
      formData: {
        buzz: 'Lorem ipsum dolor sit amet',
        foo: 'Consectetur adipiscing elit'
      }
    });

    const $select = container.querySelector('select')!;

    fireEvent.change($select, {
      target: { value: $select.options[1].value }
    });

    expect(onChange.mock.lastCall).toEqual({
      formData: {
        buzz: 'Lorem ipsum dolor sit amet',
        foo: undefined
      }
    });
  });

  it('should support options with different types', () => {
    const schema = {
      type: 'object',
      properties: {
        userId: {
          anyOf: [
            {
              type: 'number'
            },
            {
              type: 'string'
            }
          ]
        }
      }
    };

    const { container: container, onChange } = createFormComponent({
      schema
    });

    fireEvent.change(container.querySelector('input#root_userId')!, {
      target: { value: 12345 }
    });

    expect(onChange.mock.lastCall).toEqual({
      formData: { userId: 12345 }
    });

    const $select = container.querySelector('select')!;

    fireEvent.change($select, {
      target: { value: $select.options[1].value }
    });

    expect(onChange.mock.lastCall).toEqual({
      formData: { userId: undefined }
    });

    fireEvent.change(container.querySelector('input#root_userId')!, {
      target: { value: 'Lorem ipsum dolor sit amet' }
    });

    expect(onChange.mock.lastCall).toEqual({
      formData: { userId: 'Lorem ipsum dolor sit amet' }
    });
  });

  it('should support custom fields', () => {
    const schema = {
      type: 'object',
      properties: {
        userId: {
          anyOf: [
            {
              type: 'number'
            },
            {
              type: 'string'
            }
          ]
        }
      }
    };

    const CustomField = () => {
      return <div id="custom-anyof-field" />;
    };

    const { container } = createFormComponent({
      schema,
      fields: {
        AnyOfField: CustomField
      }
    });

    expect(container.querySelectorAll('#custom-anyof-field')).to.have.length(1);
  });

  it('should select the correct field when the form is rendered from existing data', () => {
    const schema = {
      type: 'object',
      properties: {
        userId: {
          anyOf: [
            {
              type: 'number'
            },
            {
              type: 'string'
            }
          ]
        }
      }
    };

    const { container } = createFormComponent({
      schema,
      formData: {
        userId: 'foobarbaz'
      }
    });

    expect(container.querySelector('select')!.value).eql('1');
  });

  it('should select the correct field when the formData property is updated', () => {
    const schema = {
      type: 'object',
      properties: {
        userId: {
          anyOf: [
            {
              type: 'number'
            },
            {
              type: 'string'
            }
          ]
        }
      }
    };

    const {
      component: comp,
      container: container,
      rerender
    } = createFormComponent({
      schema
    });

    expect(container.querySelector('select')!.value).eql('0');

    rerender({
      schema,
      formData: {
        userId: 'foobarbaz'
      }
    });

    expect(container.querySelector('select')!.value).eql('1');
  });

  it('should not change the selected option when entering values', () => {
    const schema = {
      type: 'object',
      anyOf: [
        {
          title: 'First method of identification',
          properties: {
            firstName: {
              type: 'string'
            },
            lastName: {
              type: 'string'
            }
          }
        },
        {
          title: 'Second method of identification',
          properties: {
            idCode: {
              type: 'string'
            }
          }
        }
      ]
    };

    const { container } = createFormComponent({
      schema
    });

    const $select = container.querySelector('select')!;

    expect($select.value).eql('0');

    fireEvent.change($select, {
      target: { value: $select.options[1].value }
    });

    expect($select.value).eql('1');

    fireEvent.change(container.querySelector('input#root_idCode')!, {
      target: { value: 'Lorem ipsum dolor sit amet' }
    });

    expect($select.value).eql('1');
  });

  it('should not change the selected option when entering values and the subschema uses `anyOf`', () => {
    const schema = {
      type: 'object',
      anyOf: [
        {
          title: 'First method of identification',
          properties: {
            firstName: {
              type: 'string'
            },
            lastName: {
              type: 'string'
            }
          }
        },
        {
          title: 'Second method of identification',
          properties: {
            idCode: {
              type: 'string'
            }
          },
          anyOf: [
            {
              properties: {
                foo: {
                  type: 'string'
                }
              }
            },
            {
              properties: {
                bar: {
                  type: 'string'
                }
              }
            }
          ]
        }
      ]
    };

    const { container } = createFormComponent({
      schema
    });

    const $select = container.querySelector('select')!;

    expect($select.value).eql('0');

    fireEvent.change($select, {
      target: { value: $select.options[1].value }
    });

    expect($select.value).eql('1');

    fireEvent.change(container.querySelector('input#root_idCode')!, {
      target: { value: 'Lorem ipsum dolor sit amet' }
    });

    expect($select.value).eql('1');
  });

  it('should not change the selected option when entering values and the subschema uses `allOf`', () => {
    const schema = {
      type: 'object',
      anyOf: [
        {
          title: 'First method of identification',
          properties: {
            firstName: {
              type: 'string'
            },
            lastName: {
              type: 'string'
            }
          }
        },
        {
          title: 'Second method of identification',
          properties: {
            idCode: {
              type: 'string'
            }
          },
          allOf: [
            {
              properties: {
                foo: {
                  type: 'string'
                }
              }
            },
            {
              properties: {
                bar: {
                  type: 'string'
                }
              }
            }
          ]
        }
      ]
    };

    const { container } = createFormComponent({
      schema
    });

    const $select = container.querySelector('select')!;

    expect($select.value).eql('0');

    fireEvent.change($select, {
      target: { value: $select.options[1].value }
    });

    expect($select.value).eql('1');

    fireEvent.change(container.querySelector('input#root_idCode')!, {
      target: { value: 'Lorem ipsum dolor sit amet' }
    });

    expect($select.value).eql('1');
  });

  it('should not mutate a schema that contains nested anyOf and allOf', () => {
    const schema = {
      type: 'object',
      anyOf: [
        {
          properties: {
            foo: { type: 'string' }
          },
          allOf: [
            {
              properties: {
                baz: { type: 'string' }
              }
            }
          ],
          anyOf: [
            {
              properties: {
                buzz: { type: 'string' }
              }
            }
          ]
        }
      ]
    };

    createFormComponent({
      schema
    });

    expect(schema).to.eql({
      type: 'object',
      anyOf: [
        {
          properties: {
            foo: { type: 'string' }
          },
          allOf: [
            {
              properties: {
                baz: { type: 'string' }
              }
            }
          ],
          anyOf: [
            {
              properties: {
                buzz: { type: 'string' }
              }
            }
          ]
        }
      ]
    });
  });

  it('should use title from refs schema before using fallback generated value as title', () => {
    const schema = {
      definitions: {
        address: {
          title: 'Address',
          type: 'object',
          properties: {
            street: {
              title: 'Street',
              type: 'string'
            }
          }
        },
        person: {
          title: 'Person',
          type: 'object',
          properties: {
            name: {
              title: 'Name',
              type: 'string'
            }
          }
        },
        nested: {
          $ref: '#/definitions/person'
        }
      },
      anyOf: [
        {
          $ref: '#/definitions/address'
        },
        {
          $ref: '#/definitions/nested'
        }
      ]
    };

    const { container } = createFormComponent({
      schema
    });

    let options = container.querySelectorAll('option');
    expect(options[0].firstChild!.containerValue).eql('Address');
    expect(options[1].firstChild!.containerValue).eql('Person');
  });

  it('should collect schema from $ref even when ref is within properties', () => {
    const schema = {
      properties: {
        address: {
          title: 'Address',
          type: 'object',
          properties: {
            street: {
              title: 'Street',
              type: 'string'
            }
          }
        },
        person: {
          title: 'Person',
          type: 'object',
          properties: {
            name: {
              title: 'Name',
              type: 'string'
            }
          }
        },
        nested: {
          $ref: '#/properties/person'
        }
      },
      anyOf: [
        {
          $ref: '#/properties/address'
        },
        {
          $ref: '#/properties/nested'
        }
      ]
    };

    const { container } = createFormComponent({
      schema
    });

    let options = container.querySelectorAll('option');
    expect(options[0].firstChild!.containerValue).eql('Address');
    expect(options[1].firstChild!.containerValue).eql('Person');
  });

  describe('Arrays', () => {
    it('should correctly render form inputs for anyOf inside array items', () => {
      const schema = {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              anyOf: [
                {
                  properties: {
                    foo: {
                      type: 'string'
                    }
                  }
                },
                {
                  properties: {
                    bar: {
                      type: 'string'
                    }
                  }
                }
              ]
            }
          }
        }
      };

      const { container } = createFormComponent({
        schema
      });

      expect(container.querySelector('.array-item-add button')).not.eql(null);

      fireEvent.click(container.querySelector('.array-item-add button'));

      expect(container.querySelectorAll('select')).toHaveLength((1));

      expect(container.querySelectorAll('input#root_foo')).toHaveLength((1));
    });

    it('should not change the selected option when switching order of items for anyOf inside array items', () => {
      const schema = {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              anyOf: [
                {
                  properties: {
                    foo: {
                      type: 'string'
                    }
                  }
                },
                {
                  properties: {
                    bar: {
                      type: 'string'
                    }
                  }
                }
              ]
            }
          }
        }
      };

      const { container } = createFormComponent({
        schema,
        formData: {
          items: [
            {},
            {
              bar: 'defaultbar'
            }
          ]
        }
      });

      let selects = container.querySelectorAll('select');
      expect(selects[0].value).eql('0');
      expect(selects[1].value).eql('1');

      const moveUpBtns = container.querySelectorAll('.array-item-move-up');
      fireEvent.click(moveUpBtns[1]);

      selects = container.querySelectorAll('select');
      expect(selects[0].value).eql('1');
      expect(selects[1].value).eql('0');
    });

    it('should correctly update inputs for anyOf inside array items after being moved down', () => {
      const schema = {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              anyOf: [
                {
                  properties: {
                    foo: {
                      type: 'string'
                    }
                  }
                },
                {
                  properties: {
                    bar: {
                      type: 'string'
                    }
                  }
                }
              ]
            }
          }
        }
      };

      const { container } = createFormComponent({
        schema,
        formData: {
          items: [{}, {}]
        }
      });

      const moveDownBtns = container.querySelectorAll('.array-item-move-down');
      fireEvent.click(moveDownBtns[0]);

      const strInputs = container.querySelectorAll('fieldset .field-string input[type=text]');

      fireEvent.change(strInputs[1], { target: { value: 'bar' } });
      expect(strInputs[1].value).eql('bar');
    });

    it('should correctly set the label of the options', () => {
      const schema = {
        type: 'object',
        anyOf: [
          {
            title: 'Foo',
            properties: {
              foo: { type: 'string' }
            }
          },
          {
            properties: {
              bar: { type: 'string' }
            }
          },
          {
            $ref: '#/definitions/baz'
          }
        ],
        definitions: {
          baz: {
            title: 'Baz',
            properties: {
              baz: { type: 'string' }
            }
          }
        }
      };

      const { container } = createFormComponent({
        schema
      });

      const $select = container.querySelector('select')!;

      expect($select.options[0].text).eql('Foo');
      expect($select.options[1].text).eql('Option 2');
      expect($select.options[2].text).eql('Baz');
    });

    it('should correctly render mixed types for anyOf inside array items', () => {
      const schema = {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              anyOf: [
                {
                  type: 'string'
                },
                {
                  type: 'object',
                  properties: {
                    foo: {
                      type: 'integer'
                    },
                    bar: {
                      type: 'string'
                    }
                  }
                }
              ]
            }
          }
        }
      };

      const { container } = createFormComponent({
        schema
      });

      expect(container.querySelector('.array-item-add button')).not.eql(null);

      fireEvent.click(container.querySelector('.array-item-add button'));

      const $select = container.querySelector('select')!;
      expect($select).not.eql(null);
      fireEvent.change($select, {
        target: { value: $select.options[1].value }
      });

      expect(container.querySelectorAll('input#root_foo')).toHaveLength((1));
      expect(container.querySelectorAll('input#root_bar')).toHaveLength((1));
    });

    it('should correctly infer the selected option based on value', () => {
      const schema = {
        $ref: '#/defs/any',
        defs: {
          chain: {
            type: 'object',
            title: 'Chain',
            properties: {
              id: {
                enum: ['chain']
              },
              components: {
                type: 'array',
                items: { $ref: '#/defs/any' }
              }
            }
          },

          map: {
            type: 'object',
            title: 'Map',
            properties: {
              id: { enum: ['map'] },
              fn: { $ref: '#/defs/any' }
            }
          },

          to_absolute: {
            type: 'object',
            title: 'To Absolute',
            properties: {
              id: { enum: ['to_absolute'] },
              base_url: { type: 'string' }
            }
          },

          transform: {
            type: 'object',
            title: 'Transform',
            properties: {
              id: { enum: ['transform'] },
              property_key: { type: 'string' },
              transformer: { $ref: '#/defs/any' }
            }
          },
          any: {
            anyOf: [
              { $ref: '#/defs/chain' },
              { $ref: '#/defs/map' },
              { $ref: '#/defs/to_absolute' },
              { $ref: '#/defs/transform' }
            ]
          }
        }
      };

      const { container } = createFormComponent({
        schema,
        formData: {
          id: 'chain',
          components: [
            {
              id: 'map',
              fn: {
                id: 'transform',
                property_key: 'uri',
                transformer: {
                  id: 'to_absolute',
                  base_url: 'http://localhost'
                }
              }
            }
          ]
        }
      });

      const idSelects = container.querySelectorAll('select#root_id');

      expect(idSelects).to.have.length(4);
      expect(idSelects[0].value).eql('chain');
      expect(idSelects[1].value).eql('map');
      expect(idSelects[2].value).eql('transform');
      expect(idSelects[3].value).eql('to_absolute');
    });
  });
  describe('hideError works with anyOf', () => {
    const schema = {
      type: 'object',
      properties: {
        userId: {
          anyOf: [
            {
              type: 'number'
            },
            {
              type: 'string'
            }
          ]
        }
      }
    };
    function validate(formData, errors) {
      errors.userId.addError('test');
      return errors;
    }

    it('should show error on options with different types', () => {
      const { container } = createFormComponent({
        schema,
        validate
      });

      fireEvent.change(container.querySelector('input#root_userId')!, {
        target: { value: 12345 }
      });
      fireEvent.submit(container);

      let inputs = container.querySelectorAll('.form-group.field-error input[type=number]');
      expect(inputs[0].id).eql('root_userId');

      const $select = container.querySelector('select')!;

      fireEvent.change($select, {
        target: { value: $select.options[1].value }
      });

      fireEvent.change(container.querySelector('input#root_userId')!, {
        target: { value: 'Lorem ipsum dolor sit amet' }
      });
      fireEvent.submit(container);

      inputs = container.querySelectorAll('.form-group.field-error input[type=text]');
      expect(inputs[0].id).eql('root_userId');
    });
    it('should NOT show error on options with different types when hideError: true', () => {
      const { container } = createFormComponent({
        schema,
        uiSchema: {
          'ui:hideError': true
        },
        validate
      });

      fireEvent.change(container.querySelector('input#root_userId')!, {
        target: { value: 12345 }
      });
      fireEvent.submit(container);

      let inputs = container.querySelectorAll('.form-group.field-error input[type=number]');
      expect(inputs).toHaveLength((0));

      const $select = container.querySelector('select')!;

      fireEvent.change($select, {
        target: { value: $select.options[1].value }
      });

      fireEvent.change(container.querySelector('input#root_userId')!, {
        target: { value: 'Lorem ipsum dolor sit amet' }
      });
      fireEvent.submit(container);

      inputs = container.querySelectorAll('.form-group.field-error input[type=text]');
      expect(inputs).toHaveLength((0));
    });
  });
});
