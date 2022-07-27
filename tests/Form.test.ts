import { expect, describe, beforeEach, afterEach, it, vi } from 'vitest';
import React, { createRef } from 'react';
import { renderIntoDocument, Simulate } from 'react-dom/test-utils';
import { render, findDOMcontainer } from 'react-dom';
import { Portal } from 'react-portal';

import Form from '../src/lib';
import {
  createComponent,
  createFormComponent,
  createSandbox,
  describeRepeated,
  submitForm
} from './test_utils';
import { fireEvent } from '@testing-library/svelte';

describeRepeated('Form common', (createFormComponent) => {
  let sandbox;

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('Empty schema', () => {
    it('should render a form tag', () => {
      const { container } = createFormComponent({ schema: {} });

      expect(container.tagName).eql('FORM');
    });

    it('should render a submit button', () => {
      const { container } = createFormComponent({ schema: {} });

      expect(container.querySelectorAll('button[type=submit]')).toHaveLength(1);
    });

    it('should render children buttons', () => {
      const props = { schema: {} };
      const comp = renderIntoDocument(
        <Form {...props}>
          <button type="submit">Submit</button>
          <button type="submit">Another submit</button>
        </Form>
      );
      const container = findDOMcontainer(comp);
      expect(container.querySelectorAll('button[type=submit]')).toHaveLength(2);
    });

    it("should render errors if schema isn't object", () => {
      const props = {
        schema: {
          type: 'object',
          title: 'object',
          properties: {
            firstName: 'some mame',
            address: {
              $ref: '#/definitions/address'
            }
          },
          definitions: {
            address: {
              street: 'some street'
            }
          }
        }
      };
      const comp = renderIntoDocument(
        <Form {...props}>
          <button type="submit">Submit</button>
        </Form>
      );
      const container = findDOMcontainer(comp);
      expect(container.querySelector('.unsupported-field').textContent).to.contain(
        'Unknown field type undefined'
      );
    });
  });

  describe('on component creation', () => {
    let onChangeProp;
    let formData;
    let schema;

    function createComponent() {
      renderIntoDocument(
        <Form schema={schema} onChange={onChangeProp} formData={formData}>
          <button type="submit">Submit</button>
          <button type="submit">Another submit</button>
        </Form>
      );
    }

    beforeEach(() => {
      onChangeProp = vi.fn();
      schema = {
        type: 'object',
        title: 'root object',
        required: ['count'],
        properties: {
          count: {
            type: 'number',
            default: 789
          }
        }
      };
    });

    describe('when props.formData does not equal the default values', () => {
      beforeEach(() => {
        formData = {
          foo: 123
        };
        createComponent();
      });

      it('should call props.onChange with current state', () => {
        expect(onChangeProp).toHaveBeenCalledOnce();
        expect(onChangeProp).toHaveBeenCalledWith({
          formData: { ...formData, count: 789 },
          schema,
          errorSchema: {},
          errors: [],
          edit: true,
          uiSchema: {},
          idSchema: { $id: 'root', count: { $id: 'root_count' } },
          additionalMetaSchemas: undefined
        });
      });
    });

    describe('when props.formData equals the default values', () => {
      beforeEach(() => {
        formData = {
          count: 789
        };
        createComponent();
      });

      it('should not call props.onChange', () => {
        expect(onChangeProp).not.toHaveBeenCalled();
      });
    });
  });

  describe('Option idPrefix', function () {
    it('should change the rendered ids', function () {
      const schema = {
        type: 'object',
        title: 'root object',
        required: ['foo'],
        properties: {
          count: {
            type: 'number'
          }
        }
      };
      const comp = renderIntoDocument(<Form schema={schema} idPrefix="rjsf" />);
      const container = findDOMcontainer(comp);
      const inputs = container.querySelectorAll('input');
      const ids = [];
      for (var i = 0, len = inputs.length; i < len; i++) {
        const input = inputs[i];
        ids.push(input.getAttribute('id'));
      }
      expect(ids).to.eql(['rjsf_count']);
      expect(container.querySelector('fieldset')!.id).to.eql('rjsf');
    });
  });

  describe('Changing idPrefix', function () {
    it('should work with simple example', function () {
      const schema = {
        type: 'object',
        title: 'root object',
        required: ['foo'],
        properties: {
          count: {
            type: 'number'
          }
        }
      };
      const comp = renderIntoDocument(<Form schema={schema} idPrefix="rjsf" />);
      const container = findDOMcontainer(comp);
      const inputs = container.querySelectorAll('input');
      const ids = [];
      for (var i = 0, len = inputs.length; i < len; i++) {
        const input = inputs[i];
        ids.push(input.getAttribute('id'));
      }
      expect(ids).to.eql(['rjsf_count']);
      expect(container.querySelector('fieldset')!.id).to.eql('rjsf');
    });

    it('should work with oneOf', function () {
      const schema = {
        $schema: 'http://json-schema.org/draft-06/schema#',
        type: 'object',
        properties: {
          connector: {
            type: 'string',
            enum: ['aws', 'gcp'],
            title: 'Provider',
            default: 'aws'
          }
        },
        dependencies: {
          connector: {
            oneOf: [
              {
                type: 'object',
                properties: {
                  connector: {
                    type: 'string',
                    enum: ['aws']
                  },
                  key_aws: {
                    type: 'string'
                  }
                }
              },
              {
                type: 'object',
                properties: {
                  connector: {
                    type: 'string',
                    enum: ['gcp']
                  },
                  key_gcp: {
                    type: 'string'
                  }
                }
              }
            ]
          }
        }
      };

      const comp = renderIntoDocument(<Form schema={schema} idPrefix="rjsf" />);
      const container = findDOMcontainer(comp);
      const inputs = container.querySelectorAll('input');
      const ids = [];
      for (var i = 0, len = inputs.length; i < len; i++) {
        const input = inputs[i];
        ids.push(input.getAttribute('id'));
      }
      expect(ids).to.eql(['rjsf_key_aws']);
    });
  });

  describe('Option idSeparator', function () {
    it('should change the rendered ids', function () {
      const schema = {
        type: 'object',
        title: 'root object',
        required: ['foo'],
        properties: {
          count: {
            type: 'number'
          }
        }
      };
      const comp = renderIntoDocument(<Form schema={schema} idSeparator="." />);
      const container = findDOMcontainer(comp);
      const inputs = container.querySelectorAll('input');
      const ids = [];
      for (var i = 0, len = inputs.length; i < len; i++) {
        const input = inputs[i];
        ids.push(input.getAttribute('id'));
      }
      expect(ids).to.eql(['root.count']);
    });
  });

  describe('Custom field template', () => {
    const schema = {
      type: 'object',
      title: 'root object',
      required: ['foo'],
      properties: {
        foo: {
          type: 'string',
          description: 'this is description',
          minLength: 32
        }
      }
    };

    const uiSchema = {
      foo: {
        'ui:help': 'this is help'
      }
    };

    const formData = { foo: 'invalid' };

    function FieldTemplate(props) {
      const {
        id,
        classNames,
        label,
        help,
        rawHelp,
        required,
        description,
        rawDescription,
        errors,
        rawErrors,
        children
      } = props;
      return (
        <div className={'my-template ' + classNames}>
          <label htmlFor={id}>
            {label}
            {required ? '*' : null}
          </label>
          {description}
          {children}
          {errors}
          {help}
          <span className="raw-help">{`${rawHelp} rendered from the raw format`}</span>
          <span className="raw-description">
            {`${rawDescription} rendered from the raw format`}
          </span>
          {rawErrors ? (
            <ul>
              {rawErrors.map((error, i) => (
                <li key={i} className="raw-error">
                  {error}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      );
    }

    let container;

    beforeEach(() => {
      container = createFormComponent({
        schema,
        uiSchema,
        formData,
        FieldTemplate,
        liveValidate: true
      }).container;
    });

    it('should use the provided field template', () => {
      expect(container.querySelector('.my-template')).to.exist;
    });

    it('should use the provided template for labels', () => {
      expect(container.querySelector('.my-template > label').textContent).eql('root object');
      expect(container.querySelector('.my-template .field-string > label').textContent).eql('foo*');
    });

    it('should pass description as the provided React element', () => {
      expect(container.querySelector('#root_foo__description').textContent).eql(
        'this is description'
      );
    });

    it('should pass rawDescription as a string', () => {
      expect(container.querySelector('.raw-description').textContent).eql(
        'this is description rendered from the raw format'
      );
    });

    it('should pass errors as the provided React component', () => {
      expect(container.querySelectorAll('.error-detail li')).toHaveLength(1);
    });

    it('should pass rawErrors as an array of strings', () => {
      expect(container.querySelectorAll('.raw-error')).toHaveLength(1);
    });

    it('should pass help as a the provided React element', () => {
      expect(container.querySelector('.help-block').textContent).eql('this is help');
    });

    it('should pass rawHelp as a string', () => {
      expect(container.querySelector('.raw-help').textContent).eql(
        'this is help rendered from the raw format'
      );
    });
  });

  describe('ui options submitButtonOptions', () => {
    it('should not render a submit button', () => {
      const props = {
        schema: {},
        uiSchema: { 'ui:submitButtonOptions': { norender: true } }
      };
      const comp = renderIntoDocument(<Form {...props} />);
      const container = findDOMcontainer(comp);

      expect(container.querySelectorAll('button[type=submit]')).toHaveLength(0);
    });

    it('should render a submit button with text Confirm', () => {
      const props = {
        schema: {},
        uiSchema: { 'ui:submitButtonOptions': { submitText: 'Confirm' } }
      };
      const comp = renderIntoDocument(<Form {...props} />);
      const container = findDOMcontainer(comp);
      expect(container.querySelector('button[type=submit]').textContent).eql('Confirm');
    });
  });

  describe('Custom submit buttons', () => {
    // Submit events on buttons are not fired on disconnected forms
    // So we need to add the DOM tree to the body in this case.
    // See: https://github.com/jsdom/jsdom/pull/1865
    // https://developer.mozilla.org/en-US/docs/Web/API/container/isConnected
    const domcontainer = document.createElement('div');
    beforeEach(() => {
      document.body.appendChild(domcontainer);
    });
    afterEach(() => {
      document.body.removeChild(domcontainer);
    });
    it('should submit the form when clicked', (done) => {
      let submitCount = 0;
      const onSubmit = () => {
        submitCount++;
        if (submitCount === 2) {
          done();
        }
      };

      const comp = render(
        <Form onSubmit={onSubmit} schema={{}}>
          <button type="submit" value="Submit button" />
          <button type="submit" value="Another submit button" />
        </Form>,
        domcontainer
      );
      const container = findDOMcontainer(comp);
      const buttons = container.querySelectorAll('button[type=submit]');
      buttons[0].click();
      buttons[1].click();
    });
  });

  describe('Schema definitions', () => {
    it('should use a single schema definition reference', () => {
      const schema = {
        definitions: {
          testdef: { type: 'string' }
        },
        $ref: '#/definitions/testdef'
      };

      const { container } = createFormComponent({ schema });

      expect(container.querySelectorAll('input[type=text]')).toHaveLength(1);
    });

    it('should handle multiple schema definition references', () => {
      const schema = {
        definitions: {
          testdef: { type: 'string' }
        },
        type: 'object',
        properties: {
          foo: { $ref: '#/definitions/testdef' },
          bar: { $ref: '#/definitions/testdef' }
        }
      };

      const { container } = createFormComponent({ schema });

      expect(container.querySelectorAll('input[type=text]')).toHaveLength(2);
    });

    it('should handle deeply referenced schema definitions', () => {
      const schema = {
        definitions: {
          testdef: { type: 'string' }
        },
        type: 'object',
        properties: {
          foo: {
            type: 'object',
            properties: {
              bar: { $ref: '#/definitions/testdef' }
            }
          }
        }
      };

      const { container } = createFormComponent({ schema });

      expect(container.querySelectorAll('input[type=text]')).toHaveLength(1);
    });

    it('should handle references to deep schema definitions', () => {
      const schema = {
        definitions: {
          testdef: {
            type: 'object',
            properties: {
              bar: { type: 'string' }
            }
          }
        },
        type: 'object',
        properties: {
          foo: { $ref: '#/definitions/testdef/properties/bar' }
        }
      };

      const { container } = createFormComponent({ schema });

      expect(container.querySelectorAll('input[type=text]')).toHaveLength(1);
    });

    it('should handle referenced definitions for array items', () => {
      const schema = {
        definitions: {
          testdef: { type: 'string' }
        },
        type: 'object',
        properties: {
          foo: {
            type: 'array',
            items: { $ref: '#/definitions/testdef' }
          }
        }
      };

      const { container } = createFormComponent({
        schema,
        formData: {
          foo: ['blah']
        }
      });

      expect(container.querySelectorAll('input[type=text]')).toHaveLength(1);
    });

    it('should not crash with null values for property with additionalProperties', () => {
      const schema = {
        type: 'object',
        properties: {
          data: {
            additionalProperties: {
              type: 'string'
            },
            type: 'object'
          }
        }
      };

      const { container } = createFormComponent({
        schema,
        formData: {
          data: null
        }
      });

      expect(container).to.not.be.null;
    });

    it('should not crash with non-object values for property with additionalProperties', () => {
      const schema = {
        type: 'object',
        properties: {
          data1: {
            additionalProperties: {
              type: 'string'
            },
            type: 'object'
          },
          data2: {
            additionalProperties: {
              type: 'string'
            },
            type: 'object'
          }
        }
      };

      const { container } = createFormComponent({
        schema,
        formData: {
          data1: 123,
          data2: ['one', 'two', 'three']
        }
      });

      expect(container).to.not.be.null;
    });

    it('should raise for non-existent definitions referenced', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: { $ref: '#/definitions/nonexistent' }
        }
      };

      expect(() => createFormComponent({ schema })).to.Throw(Error, /#\/definitions\/nonexistent/);
    });

    it('should propagate referenced definition defaults', () => {
      const schema = {
        definitions: {
          testdef: { type: 'string', default: 'hello' }
        },
        $ref: '#/definitions/testdef'
      };

      const { container } = createFormComponent({ schema });

      expect(container.querySelector('input[type=text]').value).eql('hello');
    });

    it('should propagate nested referenced definition defaults', () => {
      const schema = {
        definitions: {
          testdef: { type: 'string', default: 'hello' }
        },
        type: 'object',
        properties: {
          foo: { $ref: '#/definitions/testdef' }
        }
      };

      const { container } = createFormComponent({ schema });

      expect(container.querySelector('input[type=text]').value).eql('hello');
    });

    it('should propagate referenced definition defaults for array items', () => {
      const schema = {
        definitions: {
          testdef: { type: 'string', default: 'hello' }
        },
        type: 'array',
        items: {
          $ref: '#/definitions/testdef'
        }
      };

      const { container } = createFormComponent({ schema });

      fireEvent.click(container.querySelector('.array-item-add button'));

      expect(container.querySelector('input[type=text]').value).eql('hello');
    });

    it('should propagate referenced definition defaults in objects with additionalProperties', () => {
      const schema = {
        definitions: {
          testdef: { type: 'string' }
        },
        type: 'object',
        additionalProperties: {
          $ref: '#/definitions/testdef'
        }
      };

      const { container } = createFormComponent({ schema });

      fireEvent.click(container.querySelector('.btn-add'));

      expect(container.querySelector('input[type=text]').value).eql('newKey');
    });

    it('should propagate referenced definition defaults in objects with additionalProperties that have a type present', () => {
      // Though `additionalProperties` has a `type` present here, it also has a `$ref` so that
      // referenced schema should override it.
      const schema = {
        definitions: {
          testdef: { type: 'number' }
        },
        type: 'object',
        additionalProperties: {
          type: 'string',
          $ref: '#/definitions/testdef'
        }
      };

      const { container } = createFormComponent({ schema });

      fireEvent.click(container.querySelector('.btn-add'));

      expect(container.querySelector('input[type=number]').value).eql('0');
    });

    it('should recursively handle referenced definitions', () => {
      const schema = {
        $ref: '#/definitions/container',
        definitions: {
          container: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              children: {
                type: 'array',
                items: {
                  $ref: '#/definitions/container'
                }
              }
            }
          }
        }
      };

      const { container } = createFormComponent({ schema });

      expect(container.querySelector('#root_children_0_name')).to.not.exist;

      fireEvent.click(container.querySelector('.array-item-add button'));

      expect(container.querySelector('#root_children_0_name')).to.exist;
    });

    it('should follow recursive references', () => {
      const schema = {
        definitions: {
          bar: { $ref: '#/definitions/qux' },
          qux: { type: 'string' }
        },
        type: 'object',
        required: ['foo'],
        properties: {
          foo: { $ref: '#/definitions/bar' }
        }
      };
      const { container } = createFormComponent({ schema });

      expect(container.querySelectorAll('input[type=text]')).toHaveLength(1);
    });

    it('should follow multiple recursive references', () => {
      const schema = {
        definitions: {
          bar: { $ref: '#/definitions/bar2' },
          bar2: { $ref: '#/definitions/qux' },
          qux: { type: 'string' }
        },
        type: 'object',
        required: ['foo'],
        properties: {
          foo: { $ref: '#/definitions/bar' }
        }
      };
      const { container } = createFormComponent({ schema });

      expect(container.querySelectorAll('input[type=text]')).toHaveLength(1);
    });

    it('should priorize definition over schema type property', () => {
      // Refs bug #140
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          childObj: {
            type: 'object',
            $ref: '#/definitions/childObj'
          }
        },
        definitions: {
          childObj: {
            type: 'object',
            properties: {
              otherName: { type: 'string' }
            }
          }
        }
      };

      const { container } = createFormComponent({ schema });

      expect(container.querySelectorAll('input[type=text]')).toHaveLength(2);
    });

    it('should priorize local properties over definition ones', () => {
      // Refs bug #140
      const schema = {
        type: 'object',
        properties: {
          foo: {
            title: 'custom title',
            $ref: '#/definitions/objectDef'
          }
        },
        definitions: {
          objectDef: {
            type: 'object',
            title: 'definition title',
            properties: {
              field: { type: 'string' }
            }
          }
        }
      };

      const { container } = createFormComponent({ schema });

      expect(container.querySelector('legend')!.textContent).eql('custom title');
    });

    it('should propagate and handle a resolved schema definition', () => {
      const schema = {
        definitions: {
          enumDef: { type: 'string', enum: ['a', 'b'] }
        },
        type: 'object',
        properties: {
          name: { $ref: '#/definitions/enumDef' }
        }
      };

      const { container } = createFormComponent({ schema });

      expect(container.querySelectorAll('option')).toHaveLength(3);
    });
  });

  describe('Default value handling on clear', () => {
    const schema = {
      type: 'string',
      default: 'foo'
    };

    it('should not set default when a text field is cleared', () => {
      const { container } = createFormComponent({ schema, formData: 'bar' });

      fireEvent.change(container.querySelector('input')!, {
        target: { value: '' }
      });

      expect(container.querySelector('input')!.value).eql('');
    });
  });

  describe('Defaults array items default propagation', () => {
    const schema = {
      type: 'object',
      title: 'lvl 1 obj',
      properties: {
        object: {
          type: 'object',
          title: 'lvl 2 obj',
          properties: {
            array: {
              type: 'array',
              items: {
                type: 'object',
                title: 'lvl 3 obj',
                properties: {
                  bool: {
                    type: 'boolean',
                    default: true
                  }
                }
              }
            }
          }
        }
      }
    };

    it('should propagate deeply nested defaults to submit handler', () => {
      const { container: container, onSubmit } = createFormComponent({ schema });

      fireEvent.click(container.querySelector('.array-item-add button'));
      fireEvent.submit(container);

      expect(onSubmit.mock.lastCall).toEqual({
        formData: {
          object: {
            array: [
              {
                bool: true
              }
            ]
          }
        }
      });
    });
  });

  describe('Submit handler', () => {
    it('should call provided submit handler with form state', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: { type: 'string' }
        }
      };
      const formData = {
        foo: 'bar'
      };
      const onSubmit = vi.fn();
      const event = { type: 'submit' };
      const { container } = createFormComponent({
        schema,
        formData,
        onSubmit
      });

      fireEvent.submit(container, event);

      expect(onSubmit.mock.calls.map(([args, _]) => args)).toBe([{ formData, schema }, event]);
    });

    it('should not call provided submit handler on validation errors', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: {
            type: 'string',
            minLength: 1
          }
        }
      };
      const formData = {
        foo: ''
      };
      const onSubmit = vi.fn();
      const onError = vi.fn();
      const { container } = createFormComponent({
        schema,
        formData,
        onSubmit,
        onError
      });

      fireEvent.submit(container);

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Change handler', () => {
    it('should call provided change handler on form state change with schema and uiSchema', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: {
            type: 'string'
          }
        }
      };
      const uiSchema = {
        foo: { 'ui:field': 'textarea' }
      };

      const formData = {
        foo: ''
      };
      const onChange = vi.fn();
      const { container } = createFormComponent({
        schema,
        uiSchema,
        formData,
        onChange
      });

      fireEvent.change(container.querySelector('[type=text]')!, {
        target: { value: 'new' }
      });

      sinon.assert.calledWithMatch(onChange, {
        formData: {
          foo: 'new'
        },
        schema,
        uiSchema
      });
    });
  });
  describe('Blur handler', () => {
    it('should call provided blur handler on form input blur event', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: {
            type: 'string'
          }
        }
      };
      const formData = {
        foo: ''
      };
      const onBlur = vi.fn();
      const { container } = createFormComponent({ schema, formData, onBlur });

      const input = container.querySelector('[type=text]');
      fireEvent.blur(input, {
        target: { value: 'new' }
      });

      sinon.assert.calledWithMatch(onBlur, input.id, 'new');
    });
  });

  describe('Focus handler', () => {
    it('should call provided focus handler on form input focus event', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: {
            type: 'string'
          }
        }
      };
      const formData = {
        foo: ''
      };
      const onFocus = vi.fn();
      const { container } = createFormComponent({ schema, formData, onFocus });

      const input = container.querySelector('[type=text]');
      fireEvent.focus(input, {
        target: { value: 'new' }
      });

      sinon.assert.calledWithMatch(onFocus, input.id, 'new');
    });
  });

  describe('Error handler', () => {
    it('should call provided error handler on validation errors', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: {
            type: 'string',
            minLength: 1
          }
        }
      };
      const formData = {
        foo: ''
      };
      const onError = vi.fn();
      const { container } = createFormComponent({ schema, formData, onError });

      fireEvent.submit(container);

      expect(onError).toHaveBeenCalledOnce();
    });
  });

  describe('Schema and external formData updates', () => {
    let comp;
    let onChangeProp;
    let formProps;
    let rerender;

    beforeEach(() => {
      onChangeProp = vi.fn();
      formProps = {
        schema: {
          type: 'string',
          default: 'foobar'
        },
        formData: 'some value',
        onChange: onChangeProp
      };
      let { component: comp, rerender } = createFormComponent(formProps);
    });

    describe('when the form data is set to null', () => {
      beforeEach(() =>
        rerender({
          ...formProps,
          formData: null
        })
      );

      it('should call onChange', () => {
        expect(onChangeProp).toHaveBeenCalledOnce();
        expect(onChangeProp.mock.lastCall).toEqual({
          additionalMetaSchemas: undefined,
          edit: true,
          errorSchema: {},
          errors: [],
          formData: 'foobar',
          idSchema: { $id: 'root' },
          schema: formProps.schema,
          uiSchema: {}
        });
      });
    });

    describe('when the schema default is changed but formData is not changed', () => {
      const newSchema = {
        type: 'string',
        default: 'the new default'
      };

      beforeEach(() =>
        rerender({
          ...formProps,
          schema: newSchema,
          formData: 'some value'
        })
      );

      it('should not call onChange', () => {
        expect(onChangeProp).not.toHaveBeenCalled();
      });
    });

    describe('when the schema default is changed and formData is changed', () => {
      const newSchema = {
        type: 'string',
        default: 'the new default'
      };

      beforeEach(() =>
        rerender({
          ...formProps,
          schema: newSchema,
          formData: 'something else'
        })
      );

      it('should not call onChange', () => {
        expect(onChangeProp).not.toHaveBeenCalled();
      });
    });

    describe('when the schema default is changed and formData is nulled', () => {
      const newSchema = {
        type: 'string',
        default: 'the new default'
      };

      beforeEach(() =>
        rerender({
          ...formProps,
          schema: newSchema,
          formData: null
        })
      );

      it('should call onChange', () => {
        expect(onChangeProp).toHaveBeenCalledOnce();
        sinon.assert.calledWithMatch(onChangeProp, {
          schema: newSchema,
          formData: 'the new default'
        });
      });
    });

    describe('when the onChange prop sets formData to a falsey value', () => {
      class TestForm extends React.Component {
        constructor() {
          super();

          this.state = {
            formData: {}
          };
        }

        onChange = () => {
          this.setState({ formData: this.props.falseyValue });
        };

        render() {
          const schema = {
            type: 'object',
            properties: {
              value: {
                type: 'string'
              }
            }
          };
          return <Form onChange={this.onChange} schema={schema} formData={this.state.formData} />;
        }
      }

      const falseyValues = [0, false, null, undefined, NaN];

      falseyValues.forEach((falseyValue) => {
        it("Should not crash due to 'Maximum call stack size exceeded...'", () => {
          // It is expected that this will throw an error due to non-matching propTypes,
          // so the error message needs to be inspected
          try {
            createComponent(TestForm, { falseyValue });
          } catch (e) {
            expect(e.message).to.not.equal('Maximum call stack size exceeded');
          }
        });
      });
    });
  });

  describe('External formData updates', () => {
    describe('root level', () => {
      const formProps = {
        schema: { type: 'string' },
        liveValidate: true
      };

      it('should call submit handler with new formData prop value', () => {
        const { component: comp, container: container, onSubmit } = createFormComponent(formProps);

        rerender({
          ...formProps,
          onSubmit,
          formData: 'yo'
        });
        submitForm(container);
        expect(onSubmit.mock.lastCall).toEqual({
          formData: 'yo'
        });
      });

      it('should validate formData when the schema is updated', () => {
        const { component: comp, container: container, onError } = createFormComponent(formProps);

        rerender({
          ...formProps,
          onError,
          formData: 'yo',
          schema: { type: 'number' }
        });
        submitForm(container);
        expect(onError.mock.lastCall).toEqual([
          {
            message: 'should be number',
            name: 'type',
            params: { type: 'number' },
            property: '',
            schemaPath: '#/type',
            stack: 'should be number'
          }
        ]);
      });
    });

    describe('object level', () => {
      it('should call submit handler with new formData prop value', () => {
        const formProps = {
          schema: { type: 'object', properties: { foo: { type: 'string' } } }
        };
        const { component: comp, onSubmit, container: container } = createFormComponent(formProps);

        rerender({
          ...formProps,
          onSubmit,
          formData: { foo: 'yo' }
        });

        submitForm(container);
        expect(onSubmit.mock.lastCall).toEqual({
          formData: { foo: 'yo' }
        });
      });
    });

    describe('array level', () => {
      it('should call submit handler with new formData prop value', () => {
        const schema = {
          type: 'array',
          items: {
            type: 'string'
          }
        };
        const { component: comp, container: container, onSubmit } = createFormComponent({ schema });

        rerender({ schema, onSubmit, formData: ['yo'] });

        submitForm(container);
        expect(onSubmit.mock.lastCall).toEqual({
          formData: ['yo']
        });
      });
    });
  });

  describe('Internal formData updates', () => {
    it('root', () => {
      const formProps = {
        schema: { type: 'string' },
        liveValidate: true
      };
      const { container: container, onChange } = createFormComponent(formProps);

      fireEvent.change(container.querySelector('input[type=text]')!, {
        target: { value: 'yo' }
      });

      expect(onChange.mock.lastCall).toEqual({
        formData: 'yo'
      });
    });
    it('object', () => {
      const { container: container, onChange } = createFormComponent({
        schema: {
          type: 'object',
          properties: {
            foo: {
              type: 'string'
            }
          }
        }
      });

      fireEvent.change(container.querySelector('input[type=text]')!, {
        target: { value: 'yo' }
      });

      expect(onChange.mock.lastCall).toEqual({
        formData: { foo: 'yo' }
      });
    });
    it('array of strings', () => {
      const schema = {
        type: 'array',
        items: {
          type: 'string'
        }
      };
      const { container: container, onChange } = createFormComponent({ schema });

      fireEvent.click(container.querySelector('.array-item-add button'));

      fireEvent.change(container.querySelector('input[type=text]')!, {
        target: { value: 'yo' }
      });
      expect(onChange.mock.lastCall).toEqual({
        formData: ['yo']
      });
    });
    it('array of objects', () => {
      const schema = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' }
          }
        }
      };
      const { container: container, onChange } = createFormComponent({ schema });

      fireEvent.click(container.querySelector('.array-item-add button'));

      fireEvent.change(container.querySelector('input[type=text]')!, {
        target: { value: 'yo' }
      });

      expect(onChange.mock.lastCall).toEqual({
        formData: [{ name: 'yo' }]
      });
    });
    it('dependency with array of objects', () => {
      const schema = {
        definitions: {},
        type: 'object',
        properties: {
          show: {
            type: 'boolean'
          }
        },
        dependencies: {
          show: {
            oneOf: [
              {
                properties: {
                  show: {
                    const: true
                  },
                  participants: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: {
                          type: 'string'
                        }
                      }
                    }
                  }
                }
              }
            ]
          }
        }
      };
      const { container: container, onChange } = createFormComponent({ schema });

      fireEvent.change(container.querySelector('[type=checkbox]')!, {
        target: { checked: true }
      });

      fireEvent.click(container.querySelector('.array-item-add button'));

      fireEvent.change(container.querySelector('input[type=text]')!, {
        target: { value: 'yo' }
      });

      expect(onChange.mock.lastCall).toEqual({
        formData: {
          show: true,
          participants: [{ name: 'yo' }]
        }
      });
    });
  });

  describe('Error contextualization', () => {
    describe('on form state updated', () => {
      const schema = {
        type: 'string',
        minLength: 8
      };

      describe('Lazy validation', () => {
        it('should not update the errorSchema when the formData changes', () => {
          const { container: container, onChange } = createFormComponent({ schema });

          fireEvent.change(container.querySelector('input[type=text]')!, {
            target: { value: 'short' }
          });
          expect(onChange.mock.lastCall).toEqual({
            errorSchema: {}
          });
        });

        it('should not denote an error in the field', () => {
          const { container } = createFormComponent({ schema });

          fireEvent.change(container.querySelector('input[type=text]')!, {
            target: { value: 'short' }
          });

          expect(container.querySelectorAll('.field-error')).toHaveLength(0);
        });

        it("should clean contextualized errors up when they're fixed", () => {
          const altSchema = {
            type: 'object',
            properties: {
              field1: { type: 'string', minLength: 8 },
              field2: { type: 'string', minLength: 8 }
            }
          };
          const { container } = createFormComponent({
            schema: altSchema,
            formData: {
              field1: 'short',
              field2: 'short'
            }
          });

          fireEvent.submit(container);

          // Fix the first field
          fireEvent.change(container.querySelectorAll('input[type=text]')[0], {
            target: { value: 'fixed error' }
          });
          fireEvent.submit(container);

          expect(container.querySelectorAll('.field-error')).toHaveLength(1);

          // Fix the second field
          fireEvent.change(container.querySelectorAll('input[type=text]')[1], {
            target: { value: 'fixed error too' }
          });
          fireEvent.submit(container);

          // No error remaining, shouldn't throw.
          fireEvent.submit(container);

          expect(container.querySelectorAll('.field-error')).toHaveLength(0);
        });
      });

      describe('Live validation', () => {
        it('should update the errorSchema when the formData changes', () => {
          const { container: container, onChange } = createFormComponent({
            schema,
            liveValidate: true
          });

          fireEvent.change(container.querySelector('input[type=text]')!, {
            target: { value: 'short' }
          });

          expect(onChange.mock.lastCall).toEqual({
            errorSchema: {
              __errors: ['should NOT be shorter than 8 characters']
            }
          });
        });

        it('should denote the new error in the field', () => {
          const { container } = createFormComponent({
            schema,
            liveValidate: true
          });

          fireEvent.change(container.querySelector('input[type=text]')!, {
            target: { value: 'short' }
          });

          expect(container.querySelectorAll('.field-error')).toHaveLength(1);
          expect(container.querySelector('.field-string .error-detail').textContent).eql(
            'should NOT be shorter than 8 characters'
          );
        });
      });

      describe('Disable validation onChange event', () => {
        it('should not update errorSchema when the formData changes', () => {
          const { container: container, onChange } = createFormComponent({
            schema,
            noValidate: true,
            liveValidate: true
          });

          fireEvent.change(container.querySelector('input[type=text]')!, {
            target: { value: 'short' }
          });

          expect(onChange.mock.lastCall).toEqual({
            errorSchema: {}
          });
        });
      });

      describe('Disable validation onSubmit event', () => {
        it('should not update errorSchema when the formData changes', () => {
          const { container: container, onSubmit } = createFormComponent({
            schema,
            noValidate: true
          });

          fireEvent.change(container.querySelector('input[type=text]')!, {
            target: { value: 'short' }
          });
          fireEvent.submit(container);

          expect(onSubmit.mock.lastCall).toEqual({
            errorSchema: {}
          });
        });
      });
    });

    describe('on form submitted', () => {
      const schema = {
        type: 'string',
        minLength: 8
      };

      it('should call the onError handler', () => {
        const onError = vi.fn();
        const { container } = createFormComponent({ schema, onError });

        fireEvent.change(container.querySelector('input[type=text]')!, {
          target: { value: 'short' }
        });
        fireEvent.submit(container);

        sinon.assert.calledWithMatch(
          onError,
          sinon.match((value) => {
            return (
              value.length === 1 && value[0].message === 'should NOT be shorter than 8 characters'
            );
          })
        );
      });

      it('should reset errors and errorSchema state to initial state after correction and resubmission', () => {
        const {
          container: container,
          onError,
          onSubmit
        } = createFormComponent({
          schema
        });

        fireEvent.change(container.querySelector('input[type=text]')!, {
          target: { value: 'short' }
        });
        fireEvent.submit(container);

        expect(onError.mock.lastCall).toEqual([
          {
            message: 'should NOT be shorter than 8 characters',
            name: 'minLength',
            params: { limit: 8 },
            property: '',
            schemaPath: '#/minLength',
            stack: 'should NOT be shorter than 8 characters'
          }
        ]);
        expect(onError).toHaveBeenCalledOnce();
        onError.mockClear();

        fireEvent.change(container.querySelector('input[type=text]')!, {
          target: { value: 'long enough' }
        });
        fireEvent.submit(container);
        expect(onError).not.toHaveBeenCalled();
        expect(onSubmit.mock.lastCall).toEqual({
          errors: [],
          errorSchema: {},
          schemaValidationErrors: [],
          schemaValidationErrorSchema: {}
        });
      });

      it('should reset errors from UI after correction and resubmission', () => {
        const { container } = createFormComponent({
          schema
        });

        fireEvent.change(container.querySelector('input[type=text]')!, {
          target: { value: 'short' }
        });
        fireEvent.submit(container);

        const errorListHTML =
          '<li class="text-danger">should NOT be shorter than 8 characters</li>';
        const errors = container.querySelectorAll('.error-detail');
        // Check for errors attached to the field
        expect(errors).to.have.lengthOf(1);
        expect(errors[0]).to.have.property('innerHTML');
        expect(errors[0].innerHTML).to.be.eql(errorListHTML);

        fireEvent.change(container.querySelector('input[type=text]')!, {
          target: { value: 'long enough' }
        });
        fireEvent.submit(container);
        expect(container.querySelectorAll('.error-detail')).to.have.lengthOf(0);
      });
    });

    describe('root level', () => {
      const formProps = {
        liveValidate: true,
        schema: {
          type: 'string',
          minLength: 8
        },
        formData: 'short'
      };

      it('should reflect the contextualized error in state', () => {
        const { container: container, onError } = createFormComponent(formProps);
        submitForm(container);
        expect(onError.mock.lastCall).toEqual([
          {
            message: 'should NOT be shorter than 8 characters',
            name: 'minLength',
            params: { limit: 8 },
            property: '',
            schemaPath: '#/minLength',
            stack: 'should NOT be shorter than 8 characters'
          }
        ]);
      });

      it('should denote the error in the field', () => {
        const { container } = createFormComponent(formProps);

        expect(container.querySelectorAll('.field-error')).toHaveLength(1);
        expect(container.querySelector('.field-string .error-detail').textContent).eql(
          'should NOT be shorter than 8 characters'
        );
      });
    });

    describe('root level with multiple errors', () => {
      const formProps = {
        liveValidate: true,
        schema: {
          type: 'string',
          minLength: 8,
          pattern: 'd+'
        },
        formData: 'short'
      };

      it('should reflect the contextualized error in state', () => {
        const { container: container, onError } = createFormComponent(formProps);
        submitForm(container);
        expect(onError.mock.lastCall).toEqual([
          {
            message: 'should NOT be shorter than 8 characters',
            name: 'minLength',
            params: { limit: 8 },
            property: '',
            schemaPath: '#/minLength',
            stack: 'should NOT be shorter than 8 characters'
          },
          {
            message: 'should match pattern "d+"',
            name: 'pattern',
            params: { pattern: 'd+' },
            property: '',
            schemaPath: '#/pattern',
            stack: 'should match pattern "d+"'
          }
        ]);
      });

      it('should denote the error in the field', () => {
        const { container } = createFormComponent(formProps);

        const licontainers = container.querySelectorAll('.field-string .error-detail li');
        const errors = [].map.call(licontainers, (li) => li.textContent);

        expect(errors).eql([
          'should NOT be shorter than 8 characters',
          'should match pattern "d+"'
        ]);
      });
    });

    describe('nested field level', () => {
      const schema = {
        type: 'object',
        properties: {
          level1: {
            type: 'object',
            properties: {
              level2: {
                type: 'string',
                minLength: 8
              }
            }
          }
        }
      };

      const formProps = {
        schema,
        liveValidate: true,
        formData: {
          level1: {
            level2: 'short'
          }
        }
      };

      it('should reflect the contextualized error in state', () => {
        const { container: container, onError } = createFormComponent(formProps);

        submitForm(container);
        expect(onError.mock.lastCall).toEqual([
          {
            message: 'should NOT be shorter than 8 characters',
            name: 'minLength',
            params: { limit: 8 },
            property: '.level1.level2',
            schemaPath: '#/properties/level1/properties/level2/minLength',
            stack: '.level1.level2 should NOT be shorter than 8 characters'
          }
        ]);
      });

      it('should denote the error in the field', () => {
        const { container } = createFormComponent(formProps);
        const errorDetail = container.querySelector('.field-object .field-string .error-detail');

        expect(container.querySelectorAll('.field-error')).toHaveLength(1);
        expect(errorDetail.textContent).eql('should NOT be shorter than 8 characters');
      });
    });

    describe('array indices', () => {
      const schema = {
        type: 'array',
        items: {
          type: 'string',
          minLength: 4
        }
      };

      const formProps = {
        schema,
        liveValidate: true,
        formData: ['good', 'bad', 'good']
      };

      it('should contextualize the error for array indices', () => {
        const { container: container, onError } = createFormComponent(formProps);

        submitForm(container);
        expect(onError.mock.lastCall).toEqual([
          {
            message: 'should NOT be shorter than 4 characters',
            name: 'minLength',
            params: { limit: 4 },
            property: '[1]',
            schemaPath: '#/items/minLength',
            stack: '[1] should NOT be shorter than 4 characters'
          }
        ]);
      });

      it('should denote the error in the item field in error', () => {
        const { container } = createFormComponent(formProps);
        const fieldcontainers = container.querySelectorAll('.field-string');

        const licontainers = fieldcontainers[1].querySelectorAll('.field-string .error-detail li');
        const errors = [].map.call(licontainers, (li) => li.textContent);

        expect(fieldcontainers[1].classList.contains('field-error')).eql(true);
        expect(errors).eql(['should NOT be shorter than 4 characters']);
      });

      it('should not denote errors on non impacted fields', () => {
        const { container } = createFormComponent(formProps);
        const fieldcontainers = container.querySelectorAll('.field-string');

        expect(fieldcontainers[0].classList.contains('field-error')).eql(false);
        expect(fieldcontainers[2].classList.contains('field-error')).eql(false);
      });
    });

    describe('nested array indices', () => {
      const schema = {
        type: 'object',
        properties: {
          level1: {
            type: 'array',
            items: {
              type: 'string',
              minLength: 4
            }
          }
        }
      };

      const formProps = { schema, liveValidate: true };

      it('should contextualize the error for nested array indices', () => {
        const { container: container, onError } = createFormComponent({
          ...formProps,
          formData: {
            level1: ['good', 'bad', 'good', 'bad']
          }
        });
        submitForm(container);
        expect(onError.mock.lastCall).toEqual([
          {
            message: 'should NOT be shorter than 4 characters',
            name: 'minLength',
            params: { limit: 4 },
            property: '.level1[1]',
            schemaPath: '#/properties/level1/items/minLength',
            stack: '.level1[1] should NOT be shorter than 4 characters'
          },
          {
            message: 'should NOT be shorter than 4 characters',
            name: 'minLength',
            params: { limit: 4 },
            property: '.level1[3]',
            schemaPath: '#/properties/level1/items/minLength',
            stack: '.level1[3] should NOT be shorter than 4 characters'
          }
        ]);
      });

      it('should denote the error in the nested item field in error', () => {
        const { container } = createFormComponent({
          ...formProps,
          formData: {
            level1: ['good', 'bad', 'good']
          }
        });

        const licontainers = container.querySelectorAll('.field-string .error-detail li');
        const errors = [].map.call(licontainers, (li) => li.textContent);

        expect(errors).eql(['should NOT be shorter than 4 characters']);
      });
    });

    describe('nested arrays', () => {
      const schema = {
        type: 'object',
        properties: {
          outer: {
            type: 'array',
            items: {
              type: 'array',
              items: {
                type: 'string',
                minLength: 4
              }
            }
          }
        }
      };

      const formData = {
        outer: [
          ['good', 'bad'],
          ['bad', 'good']
        ]
      };

      const formProps = { schema, formData, liveValidate: true };

      it('should contextualize the error for nested array indices', () => {
        const { container: container, onError } = createFormComponent(formProps);

        submitForm(container);
        expect(onError.mock.lastCall).toEqual([
          {
            message: 'should NOT be shorter than 4 characters',
            name: 'minLength',
            params: { limit: 4 },
            property: '.outer[0][1]',
            schemaPath: '#/properties/outer/items/items/minLength',
            stack: '.outer[0][1] should NOT be shorter than 4 characters'
          },
          {
            message: 'should NOT be shorter than 4 characters',
            name: 'minLength',
            params: { limit: 4 },
            property: '.outer[1][0]',
            schemaPath: '#/properties/outer/items/items/minLength',
            stack: '.outer[1][0] should NOT be shorter than 4 characters'
          }
        ]);
      });

      it('should denote the error in the nested item field in error', () => {
        const { container } = createFormComponent(formProps);
        const fields = container.querySelectorAll('.field-string');
        const errors = [].map.call(fields, (field) => {
          const li = field.querySelector('.error-detail li');
          return li && li.textContent;
        });

        expect(errors).eql([
          null,
          'should NOT be shorter than 4 characters',
          'should NOT be shorter than 4 characters',
          null
        ]);
      });
    });

    describe('array nested items', () => {
      const schema = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            foo: {
              type: 'string',
              minLength: 4
            }
          }
        }
      };

      const formProps = {
        schema,
        liveValidate: true,
        formData: [{ foo: 'good' }, { foo: 'bad' }, { foo: 'good' }]
      };

      it('should contextualize the error for array nested items', () => {
        const { container: container, onError } = createFormComponent(formProps);

        submitForm(container);
        expect(onError.mock.lastCall).toEqual([
          {
            message: 'should NOT be shorter than 4 characters',
            name: 'minLength',
            params: { limit: 4 },
            property: '[1].foo',
            schemaPath: '#/items/properties/foo/minLength',
            stack: '[1].foo should NOT be shorter than 4 characters'
          }
        ]);
      });

      it('should denote the error in the array nested item', () => {
        const { container } = createFormComponent(formProps);
        const fieldcontainers = container.querySelectorAll('.field-string');

        const licontainers = fieldcontainers[1].querySelectorAll('.field-string .error-detail li');
        const errors = [].map.call(licontainers, (li) => li.textContent);

        expect(fieldcontainers[1].classList.contains('field-error')).eql(true);
        expect(errors).eql(['should NOT be shorter than 4 characters']);
      });
    });

    describe('schema dependencies', () => {
      const schema = {
        type: 'object',
        properties: {
          branch: {
            type: 'number',
            enum: [1, 2, 3],
            default: 1
          }
        },
        required: ['branch'],
        dependencies: {
          branch: {
            oneOf: [
              {
                properties: {
                  branch: {
                    enum: [1]
                  },
                  field1: {
                    type: 'number'
                  }
                },
                required: ['field1']
              },
              {
                properties: {
                  branch: {
                    enum: [2]
                  },
                  field1: {
                    type: 'number'
                  },
                  field2: {
                    type: 'number'
                  }
                },
                required: ['field1', 'field2']
              }
            ]
          }
        }
      };

      it('should only show error for property in selected branch', () => {
        const { container: container, onChange } = createFormComponent({
          schema,
          liveValidate: true
        });

        fireEvent.change(container.querySelector('input[type=number]')!, {
          target: { value: 'not a number' }
        });

        expect(onChange.mock.lastCall).toEqual({
          errorSchema: { field1: { __errors: ['should be number'] } }
        });
      });

      it('should only show errors for properties in selected branch', () => {
        const { container: container, onChange } = createFormComponent({
          schema,
          liveValidate: true,
          formData: { branch: 2 }
        });

        fireEvent.change(container.querySelector('input[type=number]')!, {
          target: { value: 'not a number' }
        });

        expect(onChange.mock.lastCall).toEqual({
          errorSchema: {
            field1: {
              __errors: ['should be number']
            },
            field2: {
              __errors: ['is a required property']
            }
          }
        });
      });

      it('should not show any errors when branch is empty', () => {
        const { container: container, onChange } = createFormComponent({
          schema,
          liveValidate: true,
          formData: { branch: 3 }
        });

        fireEvent.change(container.querySelector('select')!, {
          target: { value: 3 }
        });

        expect(onChange.mock.lastCall).toEqual({
          errorSchema: {}
        });
      });
    });
  });

  describe('Schema and formData updates', () => {
    // https://github.com/rjsf-team/react-jsonschema-form/issues/231
    const schema = {
      type: 'object',
      properties: {
        foo: { type: 'string' },
        bar: { type: 'string' }
      }
    };

    it('should replace state when props remove formData keys', () => {
      const formData = { foo: 'foo', bar: 'bar' };
      const {
        component: comp,
        container: container,
        onChange
      } = createFormComponent({
        schema,
        formData
      });

      rerender({
        onChange,
        schema: {
          type: 'object',
          properties: {
            bar: { type: 'string' }
          }
        },
        formData: { bar: 'bar' }
      });

      fireEvent.change(container.querySelector('#root_bar')!, {
        target: { value: 'baz' }
      });

      expect(onChange.mock.lastCall).toEqual({
        formData: { bar: 'baz' }
      });
    });

    it('should replace state when props change formData keys', () => {
      const formData = { foo: 'foo', bar: 'bar' };
      const {
        component: comp,
        container: container,
        onChange
      } = createFormComponent({
        schema,
        formData
      });

      rerender({
        onChange,
        schema: {
          type: 'object',
          properties: {
            foo: { type: 'string' },
            baz: { type: 'string' }
          }
        },
        formData: { foo: 'foo', baz: 'bar' }
      });

      fireEvent.change(container.querySelector('#root_baz')!, {
        target: { value: 'baz' }
      });

      expect(onChange.mock.lastCall).toEqual({
        formData: { foo: 'foo', baz: 'baz' }
      });
    });
  });

  describe('idSchema updates based on formData', () => {
    const schema = {
      type: 'object',
      properties: {
        a: { type: 'string', enum: ['int', 'bool'] }
      },
      dependencies: {
        a: {
          oneOf: [
            {
              properties: {
                a: { enum: ['int'] }
              }
            },
            {
              properties: {
                a: { enum: ['bool'] },
                b: { type: 'boolean' }
              }
            }
          ]
        }
      }
    };

    it('should not update idSchema for a falsey value', () => {
      const formData = { a: 'int' };
      const {
        component: comp,
        container: container,
        onSubmit
      } = createFormComponent({
        schema,
        formData
      });

      rerender({
        onSubmit,
        schema: {
          type: 'object',
          properties: {
            a: { type: 'string', enum: ['int', 'bool'] }
          },
          dependencies: {
            a: {
              oneOf: [
                {
                  properties: {
                    a: { enum: ['int'] }
                  }
                },
                {
                  properties: {
                    a: { enum: ['bool'] },
                    b: { type: 'boolean' }
                  }
                }
              ]
            }
          }
        },
        formData: { a: 'int' }
      });

      submitForm(container);
      expect(onSubmit.mock.lastCall).toEqual({
        idSchema: { $id: 'root', a: { $id: 'root_a' } }
      });
    });

    it('should update idSchema based on truthy value', () => {
      const formData = {
        a: 'int'
      };
      const {
        component: comp,
        container: container,
        onSubmit
      } = createFormComponent({
        schema,
        formData
      });
      rerender({
        onSubmit,
        schema: {
          type: 'object',
          properties: {
            a: { type: 'string', enum: ['int', 'bool'] }
          },
          dependencies: {
            a: {
              oneOf: [
                {
                  properties: {
                    a: { enum: ['int'] }
                  }
                },
                {
                  properties: {
                    a: { enum: ['bool'] },
                    b: { type: 'boolean' }
                  }
                }
              ]
            }
          }
        },
        formData: { a: 'bool' }
      });
      submitForm(container);
      expect(onSubmit.mock.lastCall).toEqual({
        idSchema: {
          $id: 'root',
          a: { $id: 'root_a' },
          b: { $id: 'root_b' }
        }
      });
    });
  });

  describe('Form disable prop', () => {
    const schema = {
      type: 'object',
      properties: {
        foo: { type: 'string' },
        bar: { type: 'string' }
      }
    };
    const formData = { foo: 'foo', bar: 'bar' };

    it('should enable all items', () => {
      const { container } = createFormComponent({ schema, formData });

      expect(container.querySelectorAll('input:disabled')).toHaveLength(0);
    });

    it('should disable all items', () => {
      const { container } = createFormComponent({
        schema,
        formData,
        disabled: true
      });

      expect(container.querySelectorAll('input:disabled')).toHaveLength(2);
    });
  });

  describe('Form readonly prop', () => {
    const schema = {
      type: 'object',
      properties: {
        foo: { type: 'string' },
        bar: { type: 'object', properties: { baz: { type: 'string' } } }
      }
    };
    const formData = { foo: 'foo', bar: { baz: 'baz' } };

    it('should not have any readonly items', () => {
      const { container } = createFormComponent({ schema, formData });

      expect(container.querySelectorAll('input:read-only')).toHaveLength(0);
    });

    it('should readonly all items', () => {
      const { container } = createFormComponent({
        schema,
        formData,
        readonly: true
      });

      expect(container.querySelectorAll('input:read-only')).toHaveLength(2);
    });
  });

  describe('Attributes', () => {
    const formProps = {
      schema: {},
      id: 'test-form',
      className: 'test-class other-class',
      name: 'testName',
      method: 'post',
      target: '_blank',
      action: '/users/list',
      autoComplete: 'off',
      enctype: 'multipart/form-data',
      acceptcharset: 'ISO-8859-1',
      noHtml5Validate: true
    };

    let container;

    beforeEach(() => {
      container = createFormComponent(formProps).container;
    });

    it('should set attr id of form', () => {
      expect(container.getAttribute('id')).eql(formProps.id);
    });

    it('should set attr class of form', () => {
      expect(container.getAttribute('class')).eql(formProps.className);
    });

    it('should set attr name of form', () => {
      expect(container.getAttribute('name')).eql(formProps.name);
    });

    it('should set attr method of form', () => {
      expect(container.getAttribute('method')).eql(formProps.method);
    });

    it('should set attr target of form', () => {
      expect(container.getAttribute('target')).eql(formProps.target);
    });

    it('should set attr action of form', () => {
      expect(container.getAttribute('action')).eql(formProps.action);
    });

    it('should set attr autocomplete of form', () => {
      expect(container.getAttribute('autocomplete')).eql(formProps.autoComplete);
    });

    it('should set attr enctype of form', () => {
      expect(container.getAttribute('enctype')).eql(formProps.enctype);
    });

    it('should set attr acceptcharset of form', () => {
      expect(container.getAttribute('accept-charset')).eql(formProps.acceptcharset);
    });

    it('should set attr novalidate of form', () => {
      expect(container.getAttribute('novalidate')).not.to.be.null;
    });
  });

  describe('Deprecated autocomplete attribute', () => {
    it('should set attr autocomplete of form', () => {
      const formProps = {
        schema: {},
        autocomplete: 'off'
      };
      const container = createFormComponent(formProps).container;
      expect(container.getAttribute('autocomplete')).eql(formProps.autocomplete);
    });

    it('should log deprecation warning when it is used', () => {
      sandbox.stub(console, 'warn');
      createFormComponent({
        schema: {},
        autocomplete: 'off'
      });
      expect(console.warn.calledWithMatch(/Using autocomplete property of Form is deprecated/)).to
        .be.true;
    });

    it('should use autoComplete value if both autocomplete and autoComplete are used', () => {
      const formProps = {
        schema: {},
        autocomplete: 'off',
        autoComplete: 'on'
      };
      const container = createFormComponent(formProps).container;
      expect(container.getAttribute('autocomplete')).eql(formProps.autoComplete);
    });
  });

  describe('Custom format updates', () => {
    it('Should update custom formats when customFormats is changed', () => {
      const formProps = {
        liveValidate: true,
        formData: {
          areaCode: '123455'
        },
        schema: {
          type: 'object',
          properties: {
            areaCode: {
              type: 'string',
              format: 'area-code'
            }
          }
        },
        uiSchema: {
          areaCode: {
            'ui:widget': 'area-code'
          }
        },
        widgets: {
          'area-code': () => <div id="custom" />
        }
      };

      const { component: comp, container: container, onError } = createFormComponent(formProps);

      submitForm(container);
      expect(onError).not.toHaveBeenCalled();

      rerender({
        ...formProps,
        onError,
        customFormats: {
          'area-code': /^\d{3}$/
        }
      });

      submitForm(container);
      expect(onError.mock.lastCall).toEqual([
        {
          message: 'should match format "area-code"',
          name: 'format',
          params: { format: 'area-code' },
          property: '.areaCode',
          schemaPath: '#/properties/areaCode/format',
          stack: '.areaCode should match format "area-code"'
        }
      ]);
    });
  });

  describe('Meta schema updates', () => {
    it('Should update allowed meta schemas when additionalMetaSchemas is changed', () => {
      const formProps = {
        liveValidate: true,
        schema: {
          $schema: 'http://json-schema.org/draft-04/schema#',
          type: 'string',
          minLength: 8,
          pattern: 'd+'
        },
        formData: 'short',
        additionalMetaSchemas: []
      };

      const { component: comp, container: container, onError } = createFormComponent(formProps);
      submitForm(container);
      expect(onError.mock.lastCall).toEqual([
        {
          stack: 'no schema with key or ref "http://json-schema.org/draft-04/schema#"'
        }
      ]);

      rerender({
        ...formProps,
        onError,
        additionalMetaSchemas: [require('ajv/lib/refs/json-schema-draft-04.json')]
      });

      submitForm(container);
      expect(onError.mock.lastCall).toEqual([
        {
          message: 'should NOT be shorter than 8 characters',
          name: 'minLength',
          params: { limit: 8 },
          property: '',
          schemaPath: '#/minLength',
          stack: 'should NOT be shorter than 8 characters'
        },
        {
          message: 'should match pattern "d+"',
          name: 'pattern',
          params: { pattern: 'd+' },
          property: '',
          schemaPath: '#/pattern',
          stack: 'should match pattern "d+"'
        }
      ]);

      rerender({ ...formProps, onError });

      submitForm(container);
      expect(onError.mock.lastCall).toEqual([
        {
          stack: 'no schema with key or ref "http://json-schema.org/draft-04/schema#"'
        }
      ]);
    });
  });

  describe('Changing the tagName', () => {
    it('should render the component using the custom tag name', () => {
      const tagName = 'span';
      const { container } = createFormComponent({ schema: {}, tagName });
      expect(container.tagName).eql(tagName.toUpperCase());
    });

    it('should render the component using a ComponentType', () => {
      const Component = (props) => <div {...props} id="test" />;
      const { container } = createFormComponent({ schema: {}, tagName: Component });
      expect(container.id).eql('test');
    });
  });

  describe('Nested forms', () => {
    it('should call provided submit handler with form state', () => {
      const innerOnSubmit = vi.fn();
      const outerOnSubmit = vi.fn();
      let innerRef;

      class ArrayTemplateWithForm extends React.Component {
        constructor(props) {
          super(props);
          innerRef = createRef();
        }

        render() {
          const innerFormProps = {
            schema: {},
            onSubmit: innerOnSubmit
          };

          return (
            <Portal>
              <div className="array" ref={innerRef}>
                <Form {...innerFormProps}>
                  <button className="array-form-submit" type="submit">
                    Submit
                  </button>
                </Form>
              </div>
            </Portal>
          );
        }
      }

      const outerFormProps = {
        schema: {
          type: 'array',
          title: 'my list',
          description: 'my description',
          items: { type: 'string' }
        },
        formData: ['foo', 'bar'],
        ArrayFieldTemplate: ArrayTemplateWithForm,
        onSubmit: outerOnSubmit
      };
      createFormComponent(outerFormProps);
      const arrayForm = innerRef.current.querySelector('form');
      const arraySubmit = arrayForm.querySelector('.array-form-submit');

      arraySubmit.click();
      expect(innerOnSubmit).toHaveBeenCalledOnce();
      expect(outerOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Dependencies', () => {
    it('should not give a validation error by duplicating enum values in dependencies', () => {
      const schema = {
        title: 'A registration form',
        description: 'A simple form example.',
        type: 'object',
        properties: {
          type1: {
            type: 'string',
            title: 'Type 1',
            enum: ['FOO', 'BAR', 'BAZ']
          },
          type2: {
            type: 'string',
            title: 'Type 2',
            enum: ['GREEN', 'BLUE', 'RED']
          }
        },
        dependencies: {
          type1: {
            properties: {
              type1: {
                enum: ['FOO']
              },
              type2: {
                enum: ['GREEN']
              }
            }
          }
        }
      };
      const formData = {
        type1: 'FOO'
      };
      const { container: container, onError } = createFormComponent({ schema, formData });
      fireEvent.submit(container);
      expect(onError).not.toHaveBeenCalled();
    });
    it('should show dependency defaults for uncontrolled components', () => {
      const schema = {
        type: 'object',
        properties: {
          firstName: { type: 'string' }
        },
        dependencies: {
          firstName: {
            properties: {
              lastName: { type: 'string', default: 'Norris' }
            }
          }
        }
      };
      const { container } = createFormComponent({ schema });

      fireEvent.change(container.querySelector('#root_firstName')!, {
        target: { value: 'Chuck' }
      });
      expect(container.querySelector('#root_lastName').value).eql('Norris');
    });
  });
});

describe('Form omitExtraData and liveOmit', () => {
  it('should call getUsedFormData when the omitExtraData prop is true and liveOmit is true', () => {
    const schema = {
      type: 'object',
      properties: {
        foo: {
          type: 'string'
        }
      }
    };
    const formData = {
      foo: 'bar'
    };
    const onChange = vi.fn();
    const omitExtraData = true;
    const liveOmit = true;
    const { container: container, component: comp } = createFormComponent({
      schema,
      formData,
      onChange,
      omitExtraData,
      liveOmit
    });

    
    sandbox.stub(comp, 'getUsedFormData').returns({
      foo: ''
    });

    fireEvent.change(container.querySelector('[type=text]')!, {
      target: { value: 'new' }
    });

    sinon.assert.calledOnce(comp.getUsedFormData);
  });

  it('should not call getUsedFormData when the omitExtraData prop is true and liveOmit is unspecified', () => {
    const schema = {
      type: 'object',
      properties: {
        foo: {
          type: 'string'
        }
      }
    };
    const formData = {
      foo: 'bar'
    };
    const onChange = vi.fn();
    const omitExtraData = true;
    const { container: container, component: comp } = createFormComponent({
      schema,
      formData,
      onChange,
      omitExtraData
    });

    sandbox.stub(comp, 'getUsedFormData').returns({
      foo: ''
    });

    fireEvent.change(container.querySelector('[type=text]')!, {
      target: { value: 'new' }
    });

    expect(comp.getUsedFormData).not.toHaveBeenCalled();
  });

  describe('getUsedFormData', () => {
    it('should call getUsedFormData when the omitExtraData prop is true', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: {
            type: 'string'
          }
        }
      };
      const formData = {
        foo: ''
      };
      const onSubmit = vi.fn();
      const onError = vi.fn();
      const omitExtraData = true;
      const { component: comp, container: container } = createFormComponent({
        schema,
        formData,
        onSubmit,
        onError,
        omitExtraData
      });

      sandbox.stub(comp, 'getUsedFormData').returns({
        foo: ''
      });

      fireEvent.submit(container);

      sinon.assert.calledOnce(comp.getUsedFormData);
    });
    it('should just return the single input form value', () => {
      const schema = {
        title: 'A single-field form',
        type: 'string'
      };
      const formData = 'foo';
      const onSubmit = vi.fn();
      const { component: comp } = createFormComponent({
        schema,
        formData,
        onSubmit
      });

      const result = comp.getUsedFormData(formData, []);
      expect(result).eql('foo');
    });

    it('should return the root level array', () => {
      const schema = {
        type: 'array',
        items: {
          type: 'string'
        }
      };
      const formData = [];
      const onSubmit = vi.fn();
      const { component: comp } = createFormComponent({
        schema,
        formData,
        onSubmit
      });

      const result = comp.getUsedFormData(formData, []);
      expect(result).eql([]);
    });

    it('should call getUsedFormData with data from fields in event', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: { type: 'string' }
        }
      };
      const formData = {
        foo: 'bar'
      };
      const onSubmit = vi.fn();
      const { component: comp } = createFormComponent({
        schema,
        formData,
        onSubmit
      });

      const result = comp.getUsedFormData(formData, ['foo']);
      expect(result).eql({ foo: 'bar' });
    });

    it('unused form values should be omitted', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: { type: 'string' },
          baz: { type: 'string' },
          list: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                details: { type: 'string' }
              }
            }
          }
        }
      };

      const formData = {
        foo: 'bar',
        baz: 'buzz',
        list: [
          { title: 'title0', details: 'details0' },
          { title: 'title1', details: 'details1' }
        ]
      };
      const onSubmit = vi.fn();
      const { component: comp } = createFormComponent({
        schema,
        formData,
        onSubmit
      });

      const result = comp.getUsedFormData(formData, ['foo', 'list.0.title', 'list.1.details']);
      expect(result).eql({
        foo: 'bar',
        list: [{ title: 'title0' }, { details: 'details1' }]
      });
    });
  });

  describe('getFieldNames()', () => {
    it('should return an empty array for a single input form', () => {
      const schema = {
        type: 'string'
      };

      const formData = 'foo';

      const onSubmit = vi.fn();
      const { component: comp } = createFormComponent({
        schema,
        formData,
        onSubmit
      });

      const pathSchema = {
        $name: ''
      };

      const fieldNames = comp.getFieldNames(pathSchema, formData);
      expect(fieldNames).eql([]);
    });

    it('should get field names from pathSchema', () => {
      const schema = {};

      const formData = {
        extra: {
          foo: 'bar'
        },
        level1: {
          level2: 'test',
          anotherThing: {
            anotherThingNested: 'abc',
            extra: 'asdf',
            anotherThingNested2: 0
          }
        },
        level1a: 1.23
      };

      const onSubmit = vi.fn();
      const { component: comp } = createFormComponent({
        schema,
        formData,
        onSubmit
      });

      const pathSchema = {
        $name: '',
        level1: {
          $name: 'level1',
          level2: { $name: 'level1.level2' },
          anotherThing: {
            $name: 'level1.anotherThing',
            anotherThingNested: {
              $name: 'level1.anotherThing.anotherThingNested'
            },
            anotherThingNested2: {
              $name: 'level1.anotherThing.anotherThingNested2'
            }
          }
        },
        level1a: {
          $name: 'level1a'
        }
      };

      const fieldNames = comp.getFieldNames(pathSchema, formData);
      expect(fieldNames.sort()).eql(
        [
          'level1a',
          'level1.level2',
          'level1.anotherThing.anotherThingNested',
          'level1.anotherThing.anotherThingNested2'
        ].sort()
      );
    });

    it('should get field marked as additionalProperties', () => {
      const schema = {};

      const formData = {
        extra: {
          foo: 'bar'
        },
        level1: {
          level2: 'test',
          extra: 'foo',
          mixedMap: {
            namedField: 'foo',
            key1: 'val1'
          }
        },
        level1a: 1.23
      };

      const onSubmit = vi.fn();
      const { component: comp } = createFormComponent({
        schema,
        formData,
        onSubmit
      });

      const pathSchema = {
        $name: '',
        level1: {
          $name: 'level1',
          level2: { $name: 'level1.level2' },
          mixedMap: {
            $name: 'level1.mixedMap',
            __rjsf_additionalProperties: true,
            namedField: { $name: 'level1.mixedMap.namedField' } // this name should not be returned, as the root object paths should be returned for objects marked with additionalProperties
          }
        },
        level1a: {
          $name: 'level1a'
        }
      };

      const fieldNames = comp.getFieldNames(pathSchema, formData);
      expect(fieldNames.sort()).eql(['level1a', 'level1.level2', 'level1.mixedMap'].sort());
    });

    it('should get field names from pathSchema with array', () => {
      const schema = {};

      const formData = {
        address_list: [
          {
            street_address: '21, Jump Street',
            city: 'Babel',
            state: 'Neverland'
          },
          {
            street_address: '1234 Schema Rd.',
            city: 'New York',
            state: 'Arizona'
          }
        ]
      };

      const onSubmit = vi.fn();
      const { component: comp } = createFormComponent({
        schema,
        formData,
        onSubmit
      });

      const pathSchema = {
        $name: '',
        address_list: {
          '0': {
            $name: 'address_list.0',
            city: {
              $name: 'address_list.0.city'
            },
            state: {
              $name: 'address_list.0.state'
            },
            street_address: {
              $name: 'address_list.0.street_address'
            }
          },
          '1': {
            $name: 'address_list.1',
            city: {
              $name: 'address_list.1.city'
            },
            state: {
              $name: 'address_list.1.state'
            },
            street_address: {
              $name: 'address_list.1.street_address'
            }
          }
        }
      };

      const fieldNames = comp.getFieldNames(pathSchema, formData);
      expect(fieldNames.sort()).eql(
        [
          'address_list.0.city',
          'address_list.0.state',
          'address_list.0.street_address',
          'address_list.1.city',
          'address_list.1.state',
          'address_list.1.street_address'
        ].sort()
      );
    });
  });

  it('should not omit data on change with omitExtraData=false and liveOmit=false', () => {
    const omitExtraData = false;
    const liveOmit = false;
    const schema = {
      type: 'object',
      properties: {
        foo: { type: 'string' },
        bar: { type: 'string' }
      }
    };
    const formData = { foo: 'foo', baz: 'baz' };
    const { container: container, onChange } = createFormComponent({
      schema,
      formData,
      omitExtraData,
      liveOmit
    });

    fireEvent.change(container.querySelector('#root_foo')!, {
      target: { value: 'foobar' }
    });

    expect(onChange.mock.lastCall).toEqual({
      formData: { foo: 'foobar', baz: 'baz' }
    });
  });

  it('should not omit data on change with omitExtraData=true and liveOmit=false', () => {
    const omitExtraData = true;
    const liveOmit = false;
    const schema = {
      type: 'object',
      properties: {
        foo: { type: 'string' },
        bar: { type: 'string' }
      }
    };
    const formData = { foo: 'foo', baz: 'baz' };
    const { container: container, onChange } = createFormComponent({
      schema,
      formData,
      omitExtraData,
      liveOmit
    });

    fireEvent.change(container.querySelector('#root_foo')!, {
      target: { value: 'foobar' }
    });

    expect(onChange.mock.lastCall).toEqual({
      formData: { foo: 'foobar', baz: 'baz' }
    });
  });

  it('should not omit data on change with omitExtraData=false and liveOmit=true', () => {
    const omitExtraData = false;
    const liveOmit = true;
    const schema = {
      type: 'object',
      properties: {
        foo: { type: 'string' },
        bar: { type: 'string' }
      }
    };
    const formData = { foo: 'foo', baz: 'baz' };
    const { container: container, onChange } = createFormComponent({
      schema,
      formData,
      omitExtraData,
      liveOmit
    });

    fireEvent.change(container.querySelector('#root_foo')!, {
      target: { value: 'foobar' }
    });

    expect(onChange.mock.lastCall).toEqual({
      formData: { foo: 'foobar', baz: 'baz' }
    });
  });

  it('should omit data on change with omitExtraData=true and liveOmit=true', () => {
    const omitExtraData = true;
    const liveOmit = true;
    const schema = {
      type: 'object',
      properties: {
        foo: { type: 'string' },
        bar: { type: 'string' }
      }
    };
    const formData = { foo: 'foo', baz: 'baz' };
    const { container: container, onChange } = createFormComponent({
      schema,
      formData,
      omitExtraData,
      liveOmit
    });

    fireEvent.change(container.querySelector('#root_foo')!, {
      target: { value: 'foobar' }
    });

    expect(onChange.mock.lastCall).toEqual({
      formData: { foo: 'foobar' }
    });
  });

  it('should not omit additionalProperties on change with omitExtraData=true and liveOmit=true', () => {
    const omitExtraData = true;
    const liveOmit = true;
    const schema = {
      type: 'object',
      properties: {
        foo: { type: 'string' },
        bar: { type: 'string' },
        add: {
          type: 'object',
          additionalProperties: {}
        }
      }
    };
    const formData = { foo: 'foo', baz: 'baz', add: { prop: 123 } };
    const { container: container, onChange } = createFormComponent({
      schema,
      formData,
      omitExtraData,
      liveOmit
    });

    fireEvent.change(container.querySelector('#root_foo')!, {
      target: { value: 'foobar' }
    });

    expect(onChange.mock.lastCall).toEqual({
      formData: { foo: 'foobar', add: { prop: 123 } }
    });
  });

  it('should rename formData key if key input is renamed in a nested object with omitExtraData=true and liveOmit=true', () => {
    const { container: container, onChange } = createFormComponent(
      {
        schema: {
          type: 'object',
          properties: {
            nested: {
              additionalProperties: { type: 'string' }
            }
          }
        },
        formData: { nested: { key1: 'value' } }
      },
      { omitExtraData: true, liveOmit: true }
    );

    const textcontainer = container.querySelector('#root-key');
    fireEvent.blur(textcontainer, {
      target: { value: 'key1new' }
    });

    expect(onChange.mock.lastCall).toEqual({
      formData: { nested: { key1new: 'value' } }
    });
  });

  describe('Async errors', () => {
    it('should render the async errors', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: { type: 'string' },
          candy: {
            type: 'object',
            properties: {
              bar: { type: 'string' }
            }
          }
        }
      };

      const extraErrors = {
        foo: {
          __errors: ['some error that got added as a prop']
        },
        candy: {
          bar: {
            __errors: ['some other error that got added as a prop']
          }
        }
      };

      const { container } = createFormComponent({ schema, extraErrors });

      expect(container.querySelectorAll('.error-detail li')).toHaveLength(2);
    });

    it('should not block form submission', () => {
      const onSubmit = vi.fn();
      const schema = {
        type: 'object',
        properties: {
          foo: { type: 'string' }
        }
      };

      const extraErrors = {
        foo: {
          __errors: ['some error that got added as a prop']
        }
      };

      const { container } = createFormComponent({ schema, extraErrors, onSubmit });
      fireEvent.submit(container);
      expect(onSubmit).toHaveBeenCalledOnce();
    });

    it('should reset when props extraErrors changes and noValidate is true', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: { type: 'string' }
        }
      };

      const extraErrors = {
        foo: {
          __errors: ['foo']
        }
      };

      const props = {
        schema,
        noValidate: true
      };
      const { component: comp } = createFormComponent({
        ...props,
        extraErrors
      });

      rerender({
        ...props,
        extraErrors: {}
      });

      expect(comp.state.errorSchema).eql({});
      expect(comp.state.errors).eql([]);
    });

    it('should reset when props extraErrors changes and liveValidate is false', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: { type: 'string' }
        }
      };

      const extraErrors = {
        foo: {
          __errors: ['foo']
        }
      };

      const props = {
        schema,
        liveValidate: false
      };
      const { component: comp } = createFormComponent({
        ...props,
        extraErrors
      });

      rerender({
        ...props,
        extraErrors: {}
      });

      expect(comp.state.errorSchema).eql({});
      expect(comp.state.errors).eql([]);
    });
  });

  it('should keep schema errors when extraErrors set after submit and liveValidate is false', () => {
    const schema = {
      type: 'object',
      properties: {
        foo: { type: 'string' }
      },
      required: ['foo']
    };

    const extraErrors = {
      foo: {
        __errors: ['foo']
      }
    };

    const onSubmit = vi.fn();

    const props = {
      schema,
      onSubmit,
      liveValidate: false
    };
    const event = { type: 'submit' };
    const { component, container } = createFormComponent(props);

    fireEvent.submit(container, event);
    expect(container.querySelectorAll('.error-detail li')).toHaveLength(1);

    rerender({
      ...props,
      extraErrors
    });

    expect(container.querySelectorAll('.error-detail li')).toHaveLength(2);
  });
});
