import { expect, describe, beforeEach, afterEach, it, vi } from 'vitest';
import { render } from 'react-dom';
import { fireEvent } from '@testing-library/dom';
import SelectWidget from '../src/components/widgets/SelectWidget';
import RadioWidget from '../src/components/widgets/RadioWidget';
import { createFormComponent, createSandbox, submitForm } from './test_utils';
import Form from '../lib';

describe('uiSchema', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('custom classNames', () => {
    const schema = {
      type: 'object',
      properties: {
        foo: {
          type: 'string'
        },
        bar: {
          type: 'string'
        }
      }
    };

    const uiSchema = {
      foo: {
        classNames: 'class-for-foo'
      },
      bar: {
        classNames: 'class-for-bar another-for-bar'
      }
    };

    it('should apply custom class names to target widgets', () => {
      const { container } = createFormComponent({ schema, uiSchema });
      const [foo, bar] = container.querySelectorAll('.field-string');

      expect(foo.classList.contains('class-for-foo')).eql(true);
      expect(bar.classList.contains('class-for-bar')).eql(true);
      expect(bar.classList.contains('another-for-bar')).eql(true);
    });
  });

  describe('custom widget', () => {
    describe('root widget', () => {
      const schema = {
        type: 'string'
      };

      const uiSchema = {
        'ui:widget': (props) => {
          return (
            <input
              type="text"
              className="custom"
              value={props.value}
              defaultValue={props.defaultValue}
              required={props.required}
              onChange={(event) => props.onChange(event.target.value)}
            />
          );
        }
      };

      it('should render a root custom widget', () => {
        const { container } = createFormComponent({ schema, uiSchema });

        expect(container.querySelectorAll('.custom')).toHaveLength((1));
      });
    });

    describe('custom options', () => {
      let widget, widgets, schema, uiSchema;

      beforeEach(() => {
        sandbox.stub(console, 'warn');

        widget = ({ label, options }) => <div id={label} style={options} />;
        widget.defaultProps = {
          options: {
            background: 'yellow',
            color: 'green'
          }
        };

        widgets = {
          widget
        };

        // all fields in one schema to catch errors where options passed to one instance
        // of a widget are persistent across all instances
        schema = {
          type: 'object',
          properties: {
            funcAll: {
              type: 'string'
            },
            funcNone: {
              type: 'string'
            },
            stringAll: {
              type: 'string'
            },
            stringNone: {
              type: 'string'
            },
            stringTel: {
              type: 'string'
            }
          }
        };

        uiSchema = {
          // pass widget as function
          funcAll: {
            'ui:widget': {
              component: widget,
              options: {
                background: 'purple'
              }
            },
            'ui:options': {
              margin: '7px'
            },
            'ui:padding': '42px'
          },
          funcNone: {
            'ui:widget': widget
          },

          // pass widget as string
          stringAll: {
            'ui:widget': {
              component: 'widget',
              options: {
                background: 'blue'
              }
            },
            'ui:options': {
              margin: '19px'
            },
            'ui:padding': '41px'
          },
          stringNone: {
            'ui:widget': 'widget'
          },
          stringTel: {
            'ui:options': {
              inputType: 'tel'
            }
          }
        };
      });

      it('should log warning when deprecated ui:widget: {component, options} api is used', () => {
        createFormComponent({
          schema: {
            type: 'string'
          },
          uiSchema: {
            'ui:widget': {
              component: 'widget'
            }
          },
          widgets
        });
        expect(console.warn.calledWithMatch(/ui:widget object is deprecated/)).to.be.true;
      });

      it('should cache MergedWidget instance', () => {
        expect(widget.MergedWidget).not.to.be.ok;
        createFormComponent({
          schema: {
            type: 'string'
          },
          uiSchema: {
            'ui:widget': 'widget'
          },
          widgets
        });
        const cached = widget.MergedWidget;
        expect(cached).to.be.ok;
        createFormComponent({
          schema: {
            type: 'string'
          },
          uiSchema: {
            'ui:widget': 'widget'
          },
          widgets
        });
        expect(widget.MergedWidget).to.equal(cached);
      });

      it('should render merged ui:widget options for widget referenced as function', () => {
        const { container } = createFormComponent({
          schema,
          uiSchema,
          widgets
        });
        const widget = container.querySelector('#funcAll');

        expect(widget.style.background).to.equal('purple');
        expect(widget.style.color).to.equal('green');
        expect(widget.style.margin).to.equal('7px');
        expect(widget.style.padding).to.equal('42px');
      });

      it('should render ui:widget default options for widget referenced as function', () => {
        const { container } = createFormComponent({
          schema,
          uiSchema,
          widgets
        });
        const widget = container.querySelector('#funcNone');

        expect(widget.style.background).to.equal('yellow');
        expect(widget.style.color).to.equal('green');
        expect(widget.style.margin).to.equal('');
        expect(widget.style.padding).to.equal('');
      });

      it('should render merged ui:widget options for widget referenced as string', () => {
        const { container } = createFormComponent({
          schema,
          uiSchema,
          widgets
        });
        const widget = container.querySelector('#stringAll');

        expect(widget.style.background).to.equal('blue');
        expect(widget.style.color).to.equal('green');
        expect(widget.style.margin).to.equal('19px');
        expect(widget.style.padding).to.equal('41px');
      });

      it('should render ui:widget default options for widget referenced as string', () => {
        const { container } = createFormComponent({
          schema,
          uiSchema,
          widgets
        });
        const widget = container.querySelector('#stringNone');

        expect(widget.style.background).to.equal('yellow');
        expect(widget.style.color).to.equal('green');
        expect(widget.style.margin).to.equal('');
        expect(widget.style.padding).to.equal('');
      });

      it('should ui:option inputType for html5 input types', () => {
        const { container } = createFormComponent({
          schema,
          uiSchema,
          widgets
        });
        const widget = container.querySelector("input[type='tel']");
        expect(widget).to.not.be.null;
      });
    });

    describe('nested widget', () => {
      const schema = {
        type: 'object',
        properties: {
          field: {
            type: 'string'
          }
        }
      };

      const uiSchema = {
        field: {
          'ui:widget': 'custom'
        }
      };

      const CustomWidget = (props) => {
        return (
          <input
            type="text"
            className="custom"
            value={props.value}
            defaultValue={props.defaultValue}
            required={props.required}
            onChange={(event) => props.onChange(event.target.value)}
          />
        );
      };

      const widgets = {
        custom: CustomWidget
      };

      it('should render a nested custom widget', () => {
        const { container } = createFormComponent({
          schema,
          uiSchema,
          widgets
        });

        expect(container.querySelectorAll('.custom')).toHaveLength((1));
      });
    });

    describe('options', () => {
      const schema = {
        type: 'object',
        properties: {
          field: {
            type: 'string'
          }
        }
      };

      const CustomWidget = (props) => {
        const { value, options } = props;
        return <input type="text" className={options.className} value={value} />;
      };

      describe('direct reference', () => {
        const uiSchema = {
          field: {
            'ui:widget': CustomWidget,
            'ui:options': {
              className: 'custom'
            }
          }
        };

        it('should render a custom widget with options', () => {
          const { container } = createFormComponent({ schema, uiSchema });

          expect(container.querySelectorAll('.custom')).toHaveLength((1));
        });
      });

      describe('string reference', () => {
        const uiSchema = {
          field: {
            'ui:widget': 'custom',
            'ui:options': {
              className: 'custom'
            }
          }
        };

        const widgets = {
          custom: CustomWidget
        };

        it('should render a custom widget with options', () => {
          const { container } = createFormComponent({
            schema,
            uiSchema,
            widgets
          });

          expect(container.querySelectorAll('.custom')).toHaveLength((1));
        });
      });
    });

    describe('enum fields native options', () => {
      const schema = {
        type: 'object',
        properties: {
          field: {
            type: 'string',
            enum: ['foo', 'bar']
          }
        }
      };

      const CustomWidget = (props) => {
        const { options } = props;
        const { enumOptions, className } = options;
        return (
          <select className={className}>
            {enumOptions.map(({ value }, i) => (
              <option key={i}>{value}</option>
            ))}
          </select>
        );
      };

      const uiSchema = {
        field: {
          'ui:widget': CustomWidget,
          'ui:options': {
            className: 'custom'
          }
        }
      };

      it('should merge enumOptions with custom options', () => {
        const { container } = createFormComponent({ schema, uiSchema });
        expect(container.querySelectorAll('.custom option')).toHaveLength((2));
      });
    });

    describe('enum fields disabled options', () => {
      const schema = {
        type: 'object',
        properties: {
          field: {
            type: 'string',
            enum: ['foo', 'bar']
          }
        }
      };
      const uiSchema = {
        field: {
          'ui:widget': SelectWidget,
          'ui:options': {
            className: 'custom'
          },
          'ui:enumDisabled': ['foo']
        }
      };
      it('should have atleast one option disabled', () => {
        const { container } = createFormComponent({ schema, uiSchema });
        const disabledOptionsLen = uiSchema.field['ui:enumDisabled'].length;
        expect(container.querySelectorAll('option:disabled')).toHaveLength((disabledOptionsLen));
        expect(container.querySelectorAll('option:enabled')).to.have.length.of(
          // Two options, one disabled, plus the placeholder
          2 - disabledOptionsLen + 1
        );
      });
    });

    describe('enum fields disabled radio options', () => {
      const schema = {
        type: 'object',
        properties: {
          field: {
            type: 'string',
            enum: ['foo', 'bar']
          }
        }
      };
      const uiSchema = {
        field: {
          'ui:widget': RadioWidget,
          'ui:options': {
            className: 'custom'
          },
          'ui:enumDisabled': ['foo']
        }
      };
      it('should have atleast one radio option disabled', () => {
        const { container } = createFormComponent({ schema, uiSchema });
        const disabledOptionsLen = uiSchema.field['ui:enumDisabled'].length;
        expect(container.querySelectorAll('input:disabled')).toHaveLength((disabledOptionsLen));
        expect(container.querySelectorAll('input:enabled')).to.have.length.of(
          // Two options, one disabled, plus the placeholder
          2 - disabledOptionsLen
        );
      });
    });
  });

  describe('ui:help', () => {
    it('should render the provided help text', () => {
      const schema = {
        type: 'string'
      };
      const uiSchema = {
        'ui:help': 'plop'
      };

      const { container } = createFormComponent({ schema, uiSchema });

      expect(container.querySelector('p.help-block').textContent).eql('plop');
    });
  });

  describe('ui:title', () => {
    it('should render the provided title text', () => {
      const schema = {
        type: 'string'
      };
      const uiSchema = {
        'ui:title': 'plop'
      };

      const { container } = createFormComponent({ schema, uiSchema });

      expect(container.querySelector('label.control-label').textContent).eql('plop');
    });
  });

  describe('ui:description', () => {
    it('should render the provided description text', () => {
      const schema = {
        type: 'string'
      };
      const uiSchema = {
        'ui:description': 'plop'
      };

      const { container } = createFormComponent({ schema, uiSchema });

      expect(container.querySelector('p.field-description').textContent).eql('plop');
    });
  });

  it('should accept a react element as help', () => {
    const schema = {
      type: 'string'
    };
    const uiSchema = {
      'ui:help': <b>plop</b>
    };

    const { container } = createFormComponent({ schema, uiSchema });

    expect(container.querySelector('div.help-block').textContent).eql('plop');
  });

  describe('ui:focus', () => {
    const shouldFocus = (schema, uiSchema, selector = 'input', formData) => {
      const props = {
        schema,
        uiSchema
      };
      if (typeof formData !== 'undefined') {
        props.formData = formData;
      }

      // activeElement only works correctly in jsdom if
      // the dom tree is connected to the document root.
      // https://github.com/jsdom/jsdom/issues/2723#issuecomment-664476384
      const domcontainer = document.createElement('div');
      document.body.appendChild(domcontainer);
      render(<Form {...props} />, domcontainer);
      expect(domcontainer.querySelector(selector)).eql(document.activeElement);
      document.body.removeChild(domcontainer);
    };

    describe('number', () => {
      it('should focus on integer input', () => {
        shouldFocus(
          {
            type: 'integer'
          },
          { 'ui:autofocus': true }
        );
      });

      it('should focus on integer input, updown widget', () => {
        shouldFocus(
          {
            type: 'integer'
          },
          {
            'ui:widget': 'updown',
            'ui:autofocus': true
          }
        );
      });

      it('should focus on integer input, range widget', () => {
        shouldFocus(
          {
            type: 'integer'
          },
          {
            'ui:widget': 'range',
            'ui:autofocus': true
          }
        );
      });

      it('should focus on integer enum input', () => {
        shouldFocus(
          {
            type: 'integer',
            enum: [1, 2, 3]
          },
          {
            'ui:autofocus': true
          },
          'select'
        );
      });
    });

    describe('string', () => {
      it('should focus on text input', () => {
        shouldFocus(
          {
            type: 'string'
          },
          { 'ui:autofocus': true }
        );
      });

      it('should focus on textarea', () => {
        shouldFocus(
          {
            type: 'string'
          },
          {
            'ui:widget': 'textarea',
            'ui:autofocus': true
          },
          'textarea'
        );
      });

      it('should focus on password input', () => {
        shouldFocus(
          {
            type: 'string'
          },
          {
            'ui:widget': 'password',
            'ui:autofocus': true
          }
        );
      });

      it('should focus on color input', () => {
        shouldFocus(
          {
            type: 'string'
          },
          {
            'ui:widget': 'color',
            'ui:autofocus': true
          }
        );
      });

      it('should focus on email input', () => {
        shouldFocus(
          {
            type: 'string',
            format: 'email'
          },
          { 'ui:autofocus': true }
        );
      });

      it('should focus on uri input', () => {
        shouldFocus(
          {
            type: 'string',
            format: 'uri'
          },
          { 'ui:autofocus': true }
        );
      });

      it('should focus on data-url input', () => {
        shouldFocus(
          {
            type: 'string',
            format: 'data-url'
          },
          { 'ui:autofocus': true }
        );
      });
    });

    describe('object', () => {
      it('should focus on date input', () => {
        shouldFocus(
          {
            type: 'string',
            format: 'date'
          },
          { 'ui:autofocus': true }
        );
      });

      it('should focus on date-time input', () => {
        shouldFocus(
          {
            type: 'string',
            format: 'date-time'
          },
          { 'ui:autofocus': true }
        );
      });

      it('should focus on alt-date input', () => {
        shouldFocus(
          {
            type: 'string',
            format: 'date'
          },
          {
            'ui:widget': 'alt-date',
            'ui:autofocus': true
          },
          'select'
        );
      });

      it('should focus on alt-date-time input', () => {
        shouldFocus(
          {
            type: 'string',
            format: 'date-time'
          },
          {
            'ui:widget': 'alt-datetime',
            'ui:autofocus': true
          },
          'select'
        );
      });
    });

    describe('array', () => {
      it('should focus on multiple files input', () => {
        shouldFocus(
          {
            type: 'array',
            items: {
              type: 'string',
              format: 'data-url'
            }
          },
          { 'ui:autofocus': true }
        );
      });

      it('should focus on first item of a list of strings', () => {
        shouldFocus(
          {
            type: 'array',
            items: {
              type: 'string',
              default: 'foo'
            }
          },
          {
            'ui:autofocus': true
          },
          'input',
          ['foo', 'bar']
        );
      });

      it('should focus on first item of a multiple choices list', () => {
        shouldFocus(
          {
            type: 'array',
            items: {
              type: 'string',
              enum: ['foo', 'bar']
            },
            uniqueItems: true
          },
          {
            'ui:widget': 'checkboxes',
            'ui:autofocus': true
          },
          'input',
          ['bar']
        );
      });
    });

    describe('boolean', () => {
      it('should focus on checkbox input', () => {
        shouldFocus(
          {
            type: 'boolean'
          },
          { 'ui:autofocus': true }
        );
      });

      it('should focus on radio input', () => {
        shouldFocus(
          {
            type: 'boolean'
          },
          {
            'ui:widget': 'radio',
            'ui:autofocus': true
          }
        );
      });

      it('should focus on select input', () => {
        shouldFocus(
          {
            type: 'boolean'
          },
          {
            'ui:widget': 'select',
            'ui:autofocus': true
          },
          'select'
        );
      });
    });
  });

  describe('string', () => {
    const schema = {
      type: 'object',
      properties: {
        foo: {
          type: 'string'
        }
      }
    };

    describe('file', () => {
      const uiSchema = {
        foo: {
          'ui:widget': 'file'
        }
      };

      it('should accept a uiSchema object', () => {
        const { container } = createFormComponent({ schema, uiSchema });

        expect(container.querySelectorAll('input[type=file]')).toHaveLength((1));
      });
    });

    describe('textarea', () => {
      const uiSchema = {
        foo: {
          'ui:widget': 'textarea',
          'ui:placeholder': 'sample'
        }
      };

      it('should accept a uiSchema object', () => {
        const { container } = createFormComponent({ schema, uiSchema });

        expect(container.querySelectorAll('textarea')).toHaveLength((1));
      });

      it('should support formData', () => {
        const { container } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 'a'
          }
        });

        expect(container.querySelector('textarea')!.value).eql('a');
      });

      it('should call onChange handler when text is updated', () => {
        const { container, onChange } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 'a'
          }
        });

        fireEvent.change(container.querySelector('textarea')!, {
          target: {
            value: 'b'
          }
        });

        expect(onChange.mock.lastCall).toEqual({
          formData: { foo: 'b' }
        });
      });

      it('should set a placeholder value', () => {
        const { container } = createFormComponent({ schema, uiSchema });

        expect(container.querySelector('textarea')!.placeholder).eql('sample');
      });
    });

    describe('password', () => {
      const uiSchema = {
        foo: {
          'ui:widget': 'password',
          'ui:placeholder': 'sample'
        }
      };

      it('should accept a uiSchema object', () => {
        const { container } = createFormComponent({ schema, uiSchema });

        expect(container.querySelectorAll('[type=password]')).toHaveLength((1));
      });

      it('should support formData', () => {
        const { container } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 'a'
          }
        });

        expect(container.querySelector('[type=password]').value).eql('a');
      });

      it('should call onChange handler when text is updated is checked', () => {
        const { container, onChange } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 'a'
          }
        });

        fireEvent.change(container.querySelector('[type=password]')!, {
          target: {
            value: 'b'
          }
        });

        expect(onChange.mock.lastCall).toEqual({
          formData: { foo: 'b' }
        });
      });

      it('should set a placeholder value', () => {
        const { container } = createFormComponent({ schema, uiSchema });

        expect(container.querySelector('[type=password]').placeholder).eql('sample');
      });
    });

    describe('color', () => {
      const uiSchema = {
        foo: {
          'ui:widget': 'color'
        }
      };

      it('should accept a uiSchema object', () => {
        const { container } = createFormComponent({ schema, uiSchema });

        expect(container.querySelectorAll('[type=color]')).toHaveLength((1));
      });

      it('should support formData', () => {
        const { container } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: '#151ce6'
          }
        });

        expect(container.querySelector('[type=color]').value).eql('#151ce6');
      });

      it('should call onChange handler when text is updated', () => {
        const { container, onChange } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: '#151ce6'
          }
        });

        fireEvent.change(container.querySelector('[type=color]')!, {
          target: {
            value: '#001122'
          }
        });
        expect(onChange.mock.lastCall).toEqual({
          formData: { foo: '#001122' }
        });
      });
    });

    describe('hidden', () => {
      const uiSchema = {
        foo: {
          'ui:widget': 'hidden'
        }
      };

      it('should accept a uiSchema object', () => {
        const { container } = createFormComponent({ schema, uiSchema });

        expect(container.querySelectorAll('[type=hidden]')).toHaveLength((1));
      });

      it('should support formData', () => {
        const { container } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 'a'
          }
        });

        expect(container.querySelector('[type=hidden]').value).eql('a');
      });

      it('should map widget value to a typed event property', () => {
        const { container, onSubmit } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 'a'
          }
        });

        submitForm(container);

        expect(onSubmit.mock.lastCall).toEqual({
          formData: { foo: 'a' }
        });
      });
    });
  });

  describe('string (enum)', () => {
    const schema = {
      type: 'object',
      properties: {
        foo: {
          type: 'string',
          enum: ['a', 'b']
        }
      }
    };

    describe('radio', () => {
      const uiSchema = {
        foo: {
          'ui:widget': 'radio'
        }
      };

      it('should accept a uiSchema object', () => {
        const { container } = createFormComponent({ schema, uiSchema });

        expect(container.querySelectorAll('[type=radio]')).toHaveLength((2));
      });

      it('should support formData', () => {
        const { container } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 'b'
          }
        });

        expect(container.querySelectorAll('[type=radio]')[1].checked).eql(true);
      });

      it('should call onChange handler when value is updated', () => {
        const { container, onChange } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 'a'
          }
        });

        fireEvent.change(container.querySelectorAll('[type=radio]')[1], {
          target: {
            checked: true
          }
        });

        expect(onChange.mock.lastCall).toEqual({
          formData: { foo: 'b' }
        });
      });
    });
  });

  describe('number', () => {
    const schema = {
      type: 'object',
      properties: {
        foo: {
          type: 'number',
          multipleOf: 1,
          minimum: 10,
          maximum: 100
        }
      }
    };

    describe('updown', () => {
      const uiSchema = {
        foo: {
          'ui:widget': 'updown'
        }
      };

      it('should accept a uiSchema object', () => {
        const { container } = createFormComponent({ schema, uiSchema });

        expect(container.querySelectorAll('[type=number]')).toHaveLength((1));
      });

      it('should support formData', () => {
        const { container } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 3.14
          }
        });

        expect(container.querySelector('[type=number]').value).eql('3.14');
      });

      it('should call onChange handler when value is updated', () => {
        const { container, onChange } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 3.14
          }
        });

        fireEvent.change(container.querySelector('[type=number]')!, {
          target: {
            value: '6.28'
          }
        });

        expect(onChange.mock.lastCall).toEqual({
          formData: { foo: 6.28 }
        });
      });

      describe('Constraint attributes', () => {
        let input;

        beforeEach(() => {
          const { container } = createFormComponent({ schema, uiSchema });
          input = container.querySelector('[type=number]');
        });

        it('should support the minimum constraint', () => {
          expect(input.getAttribute('min')).eql('10');
        });

        it('should support maximum constraint', () => {
          expect(input.getAttribute('max')).eql('100');
        });

        it("should support '0' as minimum and maximum constraints", () => {
          const schema = {
            type: 'number',
            minimum: 0,
            maximum: 0
          };
          const uiSchema = {
            'ui:widget': 'updown'
          };
          const { container } = createFormComponent({ schema, uiSchema });
          input = container.querySelector('[type=number]');

          expect(input.getAttribute('min')).eql('0');
          expect(input.getAttribute('max')).eql('0');
        });

        it('should support the multipleOf constraint', () => {
          expect(input.getAttribute('step')).eql('1');
        });
      });
    });

    describe('range', () => {
      const uiSchema = {
        foo: {
          'ui:widget': 'range'
        }
      };

      it('should accept a uiSchema object', () => {
        const { container } = createFormComponent({ schema, uiSchema });

        expect(container.querySelectorAll('[type=range]')).toHaveLength((1));
      });

      it('should support formData', () => {
        const { container } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 13.14
          }
        });

        expect(container.querySelector('[type=range]').value).eql('13.14');
      });

      it('should call onChange handler when value is updated', () => {
        const { container, onChange } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 3.14
          }
        });

        fireEvent.change(container.querySelector('[type=range]')!, {
          target: {
            value: '6.28'
          }
        });

        expect(onChange.mock.lastCall).toEqual({
          formData: { foo: 6.28 }
        });
      });

      describe('Constraint attributes', () => {
        let input;

        beforeEach(() => {
          const { container } = createFormComponent({ schema, uiSchema });
          input = container.querySelector('[type=range]');
        });

        it('should support the minimum constraint', () => {
          expect(input.getAttribute('min')).eql('10');
        });

        it('should support maximum constraint', () => {
          expect(input.getAttribute('max')).eql('100');
        });

        it("should support '0' as minimum and maximum constraints", () => {
          const schema = {
            type: 'number',
            minimum: 0,
            maximum: 0
          };
          const uiSchema = {
            'ui:widget': 'range'
          };
          const { container } = createFormComponent({ schema, uiSchema });
          input = container.querySelector('[type=range]');

          expect(input.getAttribute('min')).eql('0');
          expect(input.getAttribute('max')).eql('0');
        });

        it('should support the multipleOf constraint', () => {
          expect(input.getAttribute('step')).eql('1');
        });
      });
    });

    describe('radio', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: {
            type: 'number',
            enum: [3.14159, 2.718, 1.4142]
          }
        }
      };

      const uiSchema = {
        foo: {
          'ui:widget': 'radio'
        }
      };

      it('should accept a uiSchema object', () => {
        const { container } = createFormComponent({ schema, uiSchema });

        expect(container.querySelectorAll('[type=radio]')).toHaveLength((3));
      });

      it('should support formData', () => {
        const { container } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 2.718
          }
        });

        expect(container.querySelectorAll('[type=radio]')[1].checked).eql(true);
      });

      it('should call onChange handler when value is updated', () => {
        const { container, onChange } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 1.4142
          }
        });

        fireEvent.change(container.querySelectorAll('[type=radio]')[2], {
          target: {
            checked: true
          }
        });

        expect(onChange.mock.lastCall).toEqual({
          formData: { foo: 1.4142 }
        });
      });
    });

    describe('hidden', () => {
      const uiSchema = {
        foo: {
          'ui:widget': 'hidden'
        }
      };

      it('should accept a uiSchema object', () => {
        const { container } = createFormComponent({ schema, uiSchema });

        expect(container.querySelectorAll('[type=hidden]')).toHaveLength((1));
      });

      it('should support formData', () => {
        const { container } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 42
          }
        });

        expect(container.querySelector('[type=hidden]').value).eql('42');
      });

      it('should map widget value to a typed event property', () => {
        const { container, onSubmit } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 42
          }
        });

        submitForm(container);

        expect(onSubmit.mock.lastCall).toEqual({
          formData: { foo: 42 }
        });
      });
    });
  });

  describe('integer', () => {
    const schema = {
      type: 'object',
      properties: {
        foo: {
          type: 'integer'
        }
      }
    };

    describe('updown', () => {
      const uiSchema = {
        foo: {
          'ui:widget': 'updown'
        }
      };

      it('should accept a uiSchema object', () => {
        const { container } = createFormComponent({ schema, uiSchema });

        expect(container.querySelectorAll('[type=number]')).toHaveLength((1));
      });

      it('should support formData', () => {
        const { container } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 3
          }
        });

        expect(container.querySelector('[type=number]').value).eql('3');
      });

      it('should call onChange handler when value is updated', () => {
        const { container, onChange } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 3
          }
        });

        fireEvent.change(container.querySelector('[type=number]')!, {
          target: {
            value: '6'
          }
        });

        expect(onChange.mock.lastCall).toEqual({
          formData: { foo: 6 }
        });
      });
    });

    describe('range', () => {
      const uiSchema = {
        foo: {
          'ui:widget': 'range'
        }
      };

      it('should accept a uiSchema object', () => {
        const { container } = createFormComponent({ schema, uiSchema });

        expect(container.querySelectorAll('[type=range]')).toHaveLength((1));
      });

      it('should support formData', () => {
        const { container } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 3
          }
        });

        expect(container.querySelector('[type=range]').value).eql('3');
      });

      it('should call onChange handler when value is updated', () => {
        const { container, onChange } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 3
          }
        });

        fireEvent.change(container.querySelector('[type=range]')!, {
          target: {
            value: '6'
          }
        });

        expect(onChange.mock.lastCall).toEqual({
          formData: { foo: 6 }
        });
      });
    });

    describe('radio', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: {
            type: 'integer',
            enum: [1, 2]
          }
        }
      };

      const uiSchema = {
        foo: {
          'ui:widget': 'radio'
        }
      };

      it('should accept a uiSchema object', () => {
        const { container } = createFormComponent({ schema, uiSchema });

        expect(container.querySelectorAll('[type=radio]')).toHaveLength((2));
      });

      it('should support formData', () => {
        const { container } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 2
          }
        });

        expect(container.querySelectorAll('[type=radio]')[1].checked).eql(true);
      });

      it('should call onChange handler when value is updated', () => {
        const { container, onChange } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 1
          }
        });

        fireEvent.change(container.querySelectorAll('[type=radio]')[1], {
          target: {
            checked: true
          }
        });

        expect(onChange.mock.lastCall).toEqual({
          formData: { foo: 2 }
        });
      });
    });

    describe('hidden', () => {
      const uiSchema = {
        foo: {
          'ui:widget': 'hidden'
        }
      };

      it('should accept a uiSchema object', () => {
        const { container } = createFormComponent({ schema, uiSchema });

        expect(container.querySelectorAll('[type=hidden]')).toHaveLength((1));
      });

      it('should support formData', () => {
        const { container } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 42
          }
        });

        expect(container.querySelector('[type=hidden]').value).eql('42');
      });

      it('should map widget value to a typed event property', () => {
        const { container, onSubmit } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: 42
          }
        });

        submitForm(container);

        expect(onSubmit.mock.lastCall).toEqual({
          formData: { foo: 42 }
        });
      });
    });
  });

  describe('boolean', () => {
    const schema = {
      type: 'object',
      properties: {
        foo: {
          type: 'boolean'
        }
      }
    };

    describe('radio', () => {
      const uiSchema = {
        foo: {
          'ui:widget': 'radio'
        }
      };

      it('should accept a uiSchema object', () => {
        const { container } = createFormComponent({ schema, uiSchema });

        expect(container.querySelectorAll('[type=radio]')).toHaveLength((2));
        expect(container.querySelectorAll('[type=radio]')[0]).not.eql(null);
        expect(container.querySelectorAll('[type=radio]')[1]).not.eql(null);
      });

      it('should render boolean option labels', () => {
        const { container } = createFormComponent({ schema, uiSchema });
        const labels = [].map.call(
          container.querySelectorAll('.field-radio-group label'),
          (container) => container.textContent
        );

        expect(labels).eql(['Yes', 'No']);
      });

      it('should support formData', () => {
        const { container } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: false
          }
        });

        expect(container.querySelectorAll('[type=radio]')[1].checked).eql(true);
      });

      it('should call onChange handler when false is checked', () => {
        const { container, onChange } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: true
          }
        });

        fireEvent.change(container.querySelectorAll('[type=radio]')[1], {
          target: {
            checked: true
          }
        });

        expect(onChange.mock.lastCall).toEqual({
          formData: { foo: false }
        });
      });

      it('should call onChange handler when true is checked', () => {
        const { container, onChange } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: false
          }
        });

        fireEvent.change(container.querySelectorAll('[type=radio]')[0], {
          target: {
            checked: true
          }
        });

        expect(onChange.mock.lastCall).toEqual({
          formData: { foo: true }
        });
      });
    });

    describe('select', () => {
      const uiSchema = {
        foo: {
          'ui:widget': 'select'
        }
      };

      it('should accept a uiSchema object', () => {
        const { container } = createFormComponent({ schema, uiSchema });

        expect(container.querySelectorAll('select option')).toHaveLength((3));
      });

      it('should render boolean option labels', () => {
        const { container } = createFormComponent({ schema, uiSchema });

        expect(container.querySelectorAll('option')[1].textContent).eql('Yes');
        expect(container.querySelectorAll('option')[2].textContent).eql('No');
      });

      it('should call onChange handler when true is selected', () => {
        const { container, onChange } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: false
          }
        });

        fireEvent.change(container.querySelector('select')!, {
          // DOM option change events always return strings
          target: {
            value: 'true'
          }
        });

        expect(onChange.mock.lastCall).toEqual({
          formData: { foo: true }
        });
      });

      it('should call onChange handler when false is selected', () => {
        const { container, onChange } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: false
          }
        });

        fireEvent.change(container.querySelector('select')!, {
          // DOM option change events always return strings
          target: {
            value: 'false'
          }
        });

        expect(onChange.mock.lastCall).toEqual({
          formData: { foo: false }
        });
      });
    });

    describe('hidden', () => {
      const uiSchema = {
        foo: {
          'ui:widget': 'hidden'
        }
      };

      it('should accept a uiSchema object', () => {
        const { container } = createFormComponent({ schema, uiSchema });

        expect(container.querySelectorAll('[type=hidden]')).toHaveLength((1));
      });

      it('should support formData', () => {
        const { container } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: true
          }
        });

        expect(container.querySelector('[type=hidden]').value).eql('true');
      });

      it('should map widget value to a typed event property', () => {
        const { container, onSubmit } = createFormComponent({
          schema,
          uiSchema,
          formData: {
            foo: true
          }
        });

        submitForm(container);

        expect(onSubmit.mock.lastCall).toEqual({
          formData: { foo: true }
        });
      });
    });
  });

  describe('custom root field id', () => {
    it('should use a custom root field id for objects', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: {
            type: 'string'
          },
          bar: {
            type: 'string'
          }
        }
      };
      const uiSchema = {
        'ui:rootFieldId': 'myform'
      };
      const { container } = createFormComponent({ schema, uiSchema });

      const ids = [].map.call(container.querySelectorAll('input[type=text]'), (container) => container.id);
      expect(ids).eql(['myform_foo', 'myform_bar']);
    });

    it('should use a custom root field id for arrays', () => {
      const schema = {
        type: 'array',
        items: {
          type: 'string'
        }
      };
      const uiSchema = {
        'ui:rootFieldId': 'myform'
      };
      const { container } = createFormComponent({
        schema,
        uiSchema,
        formData: ['foo', 'bar']
      });

      const ids = [].map.call(container.querySelectorAll('input[type=text]'), (container) => container.id);
      expect(ids).eql(['myform_0', 'myform_1']);
    });

    it('should use a custom root field id for array of objects', () => {
      const schema = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            foo: {
              type: 'string'
            },
            bar: {
              type: 'string'
            }
          }
        }
      };
      const uiSchema = {
        'ui:rootFieldId': 'myform'
      };
      const { container } = createFormComponent({
        schema,
        uiSchema,
        formData: [
          {
            foo: 'foo1',
            bar: 'bar1'
          },
          {
            foo: 'foo2',
            bar: 'bar2'
          }
        ]
      });

      const ids = [].map.call(container.querySelectorAll('input[type=text]'), (container) => container.id);
      expect(ids).eql(['myform_0_foo', 'myform_0_bar', 'myform_1_foo', 'myform_1_bar']);
    });
  });

  describe('Disabled', () => {
    describe('Fields', () => {
      describe('ArrayField', () => {
        let container;

        beforeEach(() => {
          const schema = {
            type: 'array',
            items: {
              type: 'string'
            }
          };
          const uiSchema = {
            'ui:disabled': true
          };
          const formData = ['a', 'b'];

          let rendered = createFormComponent({
            schema,
            uiSchema,
            formData
          });
          container = rendered.container;
        });

        it('should disable an ArrayField', () => {
          const disabled = [].map.call(
            container.querySelectorAll('[type=text]'),
            (container) => container.disabled
          );
          expect(disabled).eql([true, true]);
        });

        it('should disable the Add button', () => {
          expect(container.querySelector('.array-item-add button').disabled).eql(true);
        });

        it('should disable the Delete button', () => {
          expect(container.querySelector('.array-item-remove').disabled).eql(true);
        });
      });

      describe('ObjectField', () => {
        let container;

        beforeEach(() => {
          const schema = {
            type: 'object',
            properties: {
              foo: {
                type: 'string'
              },
              bar: {
                type: 'string'
              }
            }
          };
          const uiSchema = {
            'ui:disabled': true
          };

          let rendered = createFormComponent({ schema, uiSchema });
          container = rendered.container;
        });

        it('should disable an ObjectField', () => {
          const disabled = [].map.call(
            container.querySelectorAll('[type=text]'),
            (container) => container.disabled
          );
          expect(disabled).eql([true, true]);
        });
      });
    });

    describe('Widgets', () => {
      function shouldBeDisabled(selector, schema, uiSchema) {
        const { container } = createFormComponent({ schema, uiSchema });
        expect(container.querySelector(selector).disabled).eql(true);
      }

      it('should disable a text widget', () => {
        shouldBeDisabled(
          'input[type=text]',
          {
            type: 'string'
          },
          { 'ui:disabled': true }
        );
      });

      it('should disabled a file widget', () => {
        const { container } = createFormComponent({
          schema: {
            type: 'string',
            format: 'data-url'
          },
          uiSchema: {
            'ui:disabled': true
          }
        });
        expect(container.querySelector('input[type=file]').hasAttribute('disabled')).eql(true);
      });

      it('should disable a textarea widget', () => {
        shouldBeDisabled(
          'textarea',
          {
            type: 'string'
          },
          {
            'ui:disabled': true,
            'ui:widget': 'textarea'
          }
        );
      });

      it('should disable a number text widget', () => {
        shouldBeDisabled(
          'input[type=number]',
          {
            type: 'number'
          },
          { 'ui:disabled': true }
        );
      });

      it('should disable a number widget', () => {
        shouldBeDisabled(
          'input[type=number]',
          {
            type: 'number'
          },
          {
            'ui:disabled': true,
            'ui:widget': 'updown'
          }
        );
      });

      it('should disable a range widget', () => {
        shouldBeDisabled(
          'input[type=range]',
          {
            type: 'number'
          },
          {
            'ui:disabled': true,
            'ui:widget': 'range'
          }
        );
      });

      it('should disable a select widget', () => {
        shouldBeDisabled(
          'select',
          {
            type: 'string',
            enum: ['a', 'b']
          },
          { 'ui:disabled': true }
        );
      });

      it('should disable a checkbox widget', () => {
        shouldBeDisabled(
          'input[type=checkbox]',
          {
            type: 'boolean'
          },
          { 'ui:disabled': true }
        );
      });

      it('should disable a radio widget', () => {
        shouldBeDisabled(
          'input[type=radio]',
          {
            type: 'boolean'
          },
          {
            'ui:disabled': true,
            'ui:widget': 'radio'
          }
        );
      });

      it('should disable a color widget', () => {
        shouldBeDisabled(
          'input[type=color]',
          {
            type: 'string',
            format: 'color'
          },
          { 'ui:disabled': true }
        );
      });

      it('should disable a password widget', () => {
        shouldBeDisabled(
          'input[type=password]',
          {
            type: 'string'
          },
          {
            'ui:disabled': true,
            'ui:widget': 'password'
          }
        );
      });

      it('should disable an email widget', () => {
        shouldBeDisabled(
          'input[type=email]',
          {
            type: 'string',
            format: 'email'
          },
          { 'ui:disabled': true }
        );
      });

      it('should disable a date widget', () => {
        shouldBeDisabled(
          'input[type=date]',
          {
            type: 'string',
            format: 'date'
          },
          { 'ui:disabled': true }
        );
      });

      it('should disable a datetime widget', () => {
        shouldBeDisabled(
          'input[type=datetime-local]',
          {
            type: 'string',
            format: 'date-time'
          },
          { 'ui:disabled': true }
        );
      });

      it('should disable an alternative date widget', () => {
        const { container } = createFormComponent({
          schema: {
            type: 'string',
            format: 'date'
          },
          uiSchema: {
            'ui:disabled': true,
            'ui:widget': 'alt-date'
          }
        });

        const disabled = [].map.call(container.querySelectorAll('select'), (container) => container.disabled);
        expect(disabled).eql([true, true, true]);
      });

      it('should disable an alternative datetime widget', () => {
        const { container } = createFormComponent({
          schema: {
            type: 'string',
            format: 'date-time'
          },
          uiSchema: {
            'ui:disabled': true,
            'ui:widget': 'alt-datetime'
          }
        });

        const disabled = [].map.call(container.querySelectorAll('select'), (container) => container.disabled);
        expect(disabled).eql([true, true, true, true, true, true]);
      });
    });
  });

  describe('Readonly', () => {
    describe('Fields', () => {
      describe('ArrayField', () => {
        let container;

        beforeEach(() => {
          const schema = {
            type: 'array',
            items: {
              type: 'string'
            }
          };
          const uiSchema = {
            'ui:readonly': true
          };
          const formData = ['a', 'b'];

          let rendered = createFormComponent({
            schema,
            uiSchema,
            formData
          });
          container = rendered.container;
        });

        it('should mark as readonly an ArrayField', () => {
          const disabled = [].map.call(container.querySelectorAll('[type=text]'), (container) =>
            container.hasAttribute('readonly')
          );
          expect(disabled).eql([true, true]);
        });

        it('should disable the Add button', () => {
          expect(container.querySelector('.array-item-add button').disabled).eql(true);
        });

        it('should disable the Delete button', () => {
          expect(container.querySelector('.array-item-remove').disabled).eql(true);
        });
      });

      describe('ObjectField', () => {
        let container;

        beforeEach(() => {
          const schema = {
            type: 'object',
            properties: {
              foo: {
                type: 'string'
              },
              bar: {
                type: 'string'
              }
            }
          };
          const uiSchema = {
            'ui:readonly': true
          };

          let rendered = createFormComponent({ schema, uiSchema });
          container = rendered.container;
        });

        it('should mark as readonly an ObjectField', () => {
          const disabled = [].map.call(container.querySelectorAll('[type=text]'), (container) =>
            container.hasAttribute('readonly')
          );
          expect(disabled).eql([true, true]);
        });
      });
    });

    describe('Widgets', () => {
      function shouldBeReadonly(selector, schema, uiSchema) {
        const { container } = createFormComponent({ schema, uiSchema });
        expect(container.querySelector(selector).hasAttribute('readonly')).eql(true);
      }
      function shouldBeDisabled(selector, schema, uiSchema) {
        const { container } = createFormComponent({ schema, uiSchema });
        expect(container.querySelector(selector).disabled).eql(true);
      }

      it('should mark as readonly a text widget', () => {
        shouldBeReadonly(
          'input[type=text]',
          {
            type: 'string'
          },
          { 'ui:readonly': true }
        );
      });

      it('should mark as readonly a file widget', () => {
        // We mark a file widget as readonly by disabling it.
        const { container } = createFormComponent({
          schema: {
            type: 'string',
            format: 'data-url'
          },
          uiSchema: {
            'ui:readonly': true
          }
        });
        expect(container.querySelector('input[type=file]').hasAttribute('disabled')).eql(true);
      });

      it('should mark as readonly a textarea widget', () => {
        shouldBeReadonly(
          'textarea',
          {
            type: 'string'
          },
          {
            'ui:readonly': true,
            'ui:widget': 'textarea'
          }
        );
      });

      it('should mark as readonly a number text widget', () => {
        shouldBeReadonly(
          'input[type=number]',
          {
            type: 'number'
          },
          { 'ui:readonly': true }
        );
      });

      it('should mark as readonly a number widget', () => {
        shouldBeReadonly(
          'input[type=number]',
          {
            type: 'number'
          },
          {
            'ui:readonly': true,
            'ui:widget': 'updown'
          }
        );
      });

      it('should mark as readonly a range widget', () => {
        shouldBeReadonly(
          'input[type=range]',
          {
            type: 'number'
          },
          {
            'ui:readonly': true,
            'ui:widget': 'range'
          }
        );
      });

      it('should mark readonly as disabled on a select widget', () => {
        shouldBeDisabled(
          'select',
          {
            type: 'string',
            enum: ['a', 'b']
          },
          { 'ui:readonly': true }
        );
      });

      it('should mark as readonly a color widget', () => {
        shouldBeReadonly(
          'input[type=color]',
          {
            type: 'string',
            format: 'color'
          },
          { 'ui:readonly': true }
        );
      });

      it('should mark as readonly a password widget', () => {
        shouldBeReadonly(
          'input[type=password]',
          {
            type: 'string'
          },
          {
            'ui:readonly': true,
            'ui:widget': 'password'
          }
        );
      });

      it('should mark as readonly a url widget', () => {
        shouldBeReadonly(
          'input[type=url]',
          {
            type: 'string',
            format: 'uri'
          },
          { 'ui:readonly': true }
        );
      });

      it('should mark as readonly an email widget', () => {
        shouldBeReadonly(
          'input[type=email]',
          {
            type: 'string',
            format: 'email'
          },
          { 'ui:readonly': true }
        );
      });

      it('should mark as readonly a date widget', () => {
        shouldBeReadonly(
          'input[type=date]',
          {
            type: 'string',
            format: 'date'
          },
          { 'ui:readonly': true }
        );
      });

      it('should mark as readonly a datetime widget', () => {
        shouldBeReadonly(
          'input[type=datetime-local]',
          {
            type: 'string',
            format: 'date-time'
          },
          { 'ui:readonly': true }
        );
      });

      it('should mark readonly as disabled on an alternative date widget', () => {
        const { container } = createFormComponent({
          schema: {
            type: 'string',
            format: 'date'
          },
          uiSchema: {
            'ui:readonly': true,
            'ui:widget': 'alt-date'
          }
        });

        const readonly = [].map.call(container.querySelectorAll('select'), (container) =>
          container.hasAttribute('disabled')
        );
        expect(readonly).eql([true, true, true]);
      });

      it('should mark readonly as disabled on an alternative datetime widget', () => {
        const { container } = createFormComponent({
          schema: {
            type: 'string',
            format: 'date-time'
          },
          uiSchema: {
            'ui:readonly': true,
            'ui:widget': 'alt-datetime'
          }
        });

        const readonly = [].map.call(container.querySelectorAll('select'), (container) =>
          container.hasAttribute('disabled')
        );
        expect(readonly).eql([true, true, true, true, true, true]);
      });
    });
  });

  describe('Readonly in schema', () => {
    describe('Fields', () => {
      describe('ArrayField', () => {
        let container;

        beforeEach(() => {
          const schema = {
            type: 'array',
            items: {
              type: 'string'
            },
            readOnly: true
          };
          const uiSchema = {};
          const formData = ['a', 'b'];

          let rendered = createFormComponent({ schema, uiSchema, formData });
          container = rendered.container;
        });

        it('should mark as readonly an ArrayField', () => {
          const disabled = [].map.call(container.querySelectorAll('[type=text]'), (container) =>
            container.hasAttribute('readonly')
          );
          expect(disabled).eql([true, true]);
        });

        it('should disable the Add button', () => {
          expect(container.querySelector('.array-item-add button').disabled).eql(true);
        });

        it('should disable the Delete button', () => {
          expect(container.querySelector('.array-item-remove').disabled).eql(true);
        });
      });

      describe('ObjectField', () => {
        let container;

        beforeEach(() => {
          const schema = {
            type: 'object',
            properties: {
              foo: {
                type: 'string'
              },
              bar: {
                type: 'string'
              }
            },
            readOnly: true
          };
          const uiSchema = {};

          let rendered = createFormComponent({ schema, uiSchema });
          container = rendered.container;
        });

        it('should mark as readonly an ObjectField', () => {
          const disabled = [].map.call(container.querySelectorAll('[type=text]'), (container) =>
            container.hasAttribute('readonly')
          );
          expect(disabled).eql([true, true]);
        });
      });
    });

    describe('Widgets', () => {
      function shouldBeReadonly(selector, schema, uiSchema) {
        const { container } = createFormComponent({ schema, uiSchema });
        expect(container.querySelector(selector).hasAttribute('readonly')).eql(true);
      }
      function shouldBeDisabled(selector, schema, uiSchema) {
        const { container } = createFormComponent({ schema, uiSchema });
        expect(container.querySelector(selector).disabled).eql(true);
      }

      it('should mark as readonly a text widget', () => {
        shouldBeReadonly(
          'input[type=text]',
          {
            type: 'string',
            readOnly: true
          },
          {}
        );
      });

      it('should mark as readonly a file widget', () => {
        // We mark a file widget as readonly by disabling it.
        const { container } = createFormComponent({
          schema: {
            type: 'string',
            format: 'data-url',
            readOnly: true
          },
          uiSchema: {}
        });
        expect(container.querySelector('input[type=file]').hasAttribute('disabled')).eql(true);
      });

      it('should mark as readonly a textarea widget', () => {
        shouldBeReadonly(
          'textarea',
          {
            type: 'string',
            readOnly: true
          },
          {
            'ui:widget': 'textarea'
          }
        );
      });

      it('should mark as readonly a number text widget', () => {
        shouldBeReadonly(
          'input[type=number]',
          {
            type: 'number',
            readOnly: true
          },
          {}
        );
      });

      it('should mark as readonly a number widget', () => {
        shouldBeReadonly(
          'input[type=number]',
          {
            type: 'number',
            readOnly: true
          },
          {
            'ui:widget': 'updown'
          }
        );
      });

      it('should mark as readonly a range widget', () => {
        shouldBeReadonly(
          'input[type=range]',
          {
            type: 'number',
            readOnly: true
          },
          {
            'ui:widget': 'range'
          }
        );
      });

      it('should mark readonly as disabled on a select widget', () => {
        shouldBeDisabled(
          'select',
          {
            type: 'string',
            enum: ['a', 'b'],
            readOnly: true
          },
          {}
        );
      });

      it('should mark as readonly a color widget', () => {
        shouldBeReadonly(
          'input[type=color]',
          {
            type: 'string',
            format: 'color',
            readOnly: true
          },
          {}
        );
      });

      it('should mark as readonly a password widget', () => {
        shouldBeReadonly(
          'input[type=password]',
          {
            type: 'string',
            readOnly: true
          },
          {
            'ui:widget': 'password'
          }
        );
      });

      it('should mark as readonly a url widget', () => {
        shouldBeReadonly(
          'input[type=url]',
          {
            type: 'string',
            format: 'uri',
            readOnly: true
          },
          {}
        );
      });

      it('should mark as readonly an email widget', () => {
        shouldBeReadonly('input[type=email]', {
          type: 'string',
          format: 'email',
          readOnly: true
        });
      });

      it('should mark as readonly a date widget', () => {
        shouldBeReadonly('input[type=date]', {
          type: 'string',
          format: 'date',
          readOnly: true
        });
      });

      it('should mark as readonly a datetime widget', () => {
        shouldBeReadonly('input[type=datetime-local]', {
          type: 'string',
          format: 'date-time',
          readOnly: true
        });
      });

      it('should mark readonly as disabled on an alternative date widget', () => {
        const { container } = createFormComponent({
          schema: {
            type: 'string',
            format: 'date',
            readOnly: true
          },
          uiSchema: {
            'ui:widget': 'alt-date'
          }
        });

        const readonly = [].map.call(container.querySelectorAll('select'), (container) =>
          container.hasAttribute('disabled')
        );
        expect(readonly).eql([true, true, true]);
      });

      it('should mark readonly as disabled on an alternative datetime widget', () => {
        const { container } = createFormComponent({
          schema: {
            type: 'string',
            format: 'date-time',
            readOnly: true
          },
          uiSchema: {
            'ui:widget': 'alt-datetime'
          }
        });

        const readonly = [].map.call(container.querySelectorAll('select'), (container) =>
          container.hasAttribute('disabled')
        );
        expect(readonly).eql([true, true, true, true, true, true]);
      });
    });
  });
});
