import { fireEvent } from '@testing-library/svelte';
import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest';

import { createFormComponent, createSandbox, submitForm } from './test_utils';

describe('BooleanField', () => {
  let sandbox;

  const CustomWidget = () => <div id="custom" />;

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should render a boolean field', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'boolean'
      }
    });

    expect(container.querySelectorAll('.field input[type=checkbox]')).toHaveLength((1));
  });

  it('should render a boolean field with the expected id', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'boolean'
      }
    });

    expect(container.querySelector('.field input[type=checkbox]')?.id).eql('root');
  });

  it('should render a boolean field with a label', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'boolean',
        title: 'foo'
      }
    });

    expect(container.querySelector('.field label span')?.textContent).eql('foo');
  });

  describe('HTML5 required attribute', () => {
    it('should not render a required attribute for simple required fields', () => {
      const { container } = createFormComponent({
        schema: {
          type: 'object',
          properties: {
            foo: {
              type: 'boolean'
            }
          },
          required: ['foo']
        }
      });

      expect(container.querySelector('input[type=checkbox]').required).eql(false);
    });

    it('should add a required attribute if the schema uses const with a true value', () => {
      const { container } = createFormComponent({
        schema: {
          type: 'object',
          properties: {
            foo: {
              type: 'boolean',
              const: true
            }
          }
        }
      });

      expect(container.querySelector('input[type=checkbox]').required).eql(true);
    });

    it('should add a required attribute if the schema uses an enum with a single value of true', () => {
      const { container } = createFormComponent({
        schema: {
          type: 'object',
          properties: {
            foo: {
              type: 'boolean',
              enum: [true]
            }
          }
        }
      });

      expect(container.querySelector('input[type=checkbox]').required).eql(true);
    });

    it('should add a required attribute if the schema uses an anyOf with a single value of true', () => {
      const { container } = createFormComponent({
        schema: {
          type: 'object',
          properties: {
            foo: {
              type: 'boolean',
              anyOf: [
                {
                  const: true
                }
              ]
            }
          }
        }
      });

      expect(container.querySelector('input[type=checkbox]').required).eql(true);
    });

    it('should add a required attribute if the schema uses a oneOf with a single value of true', () => {
      const { container } = createFormComponent({
        schema: {
          type: 'object',
          properties: {
            foo: {
              type: 'boolean',
              oneOf: [
                {
                  const: true
                }
              ]
            }
          }
        }
      });

      expect(container.querySelector('input[type=checkbox]').required).eql(true);
    });

    it('should add a required attribute if the schema uses an allOf with a value of true', () => {
      const { container } = createFormComponent({
        schema: {
          type: 'object',
          properties: {
            foo: {
              type: 'boolean',
              allOf: [
                {
                  const: true
                }
              ]
            }
          }
        }
      });

      expect(container.querySelector('input[type=checkbox]').required).eql(true);
    });
  });

  it('should render a single label', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'boolean',
        title: 'foo'
      }
    });

    expect(container.querySelectorAll('.field label')).toHaveLength((1));
  });

  it('should render a description', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'boolean',
        description: 'my description'
      }
    });

    const description = container.querySelector('.field-description');
    expect(description.textContent).eql('my description');
  });

  it('should pass uiSchema to custom widget', () => {
    const CustomCheckboxWidget = ({ uiSchema }) => {
      return <div id="custom-ui-option-value">{uiSchema.custom_field_key['ui:options'].test}</div>;
    };

    const { container } = createFormComponent({
      schema: {
        type: 'boolean',
        description: 'my description'
      },
      widgets: {
        CheckboxWidget: CustomCheckboxWidget
      },
      uiSchema: {
        custom_field_key: {
          'ui:widget': 'checkbox',
          'ui:options': {
            test: 'foo'
          }
        }
      }
    });

    expect(container.querySelector('#custom-ui-option-value').textContent).to.eql('foo');
  });

  it('should render the description using provided description field', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'boolean',
        description: 'my description'
      },
      fields: {
        DescriptionField: ({ description }) => (
          <div className="field-description">{description} overridden</div>
        )
      }
    });

    const description = container.querySelector('.field-description');
    expect(description.textContent).eql('my description overridden');
  });

  it('should assign a default value', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'boolean',
        default: true
      }
    });

    expect(container.querySelector('.field input').checked).eql(true);
  });

  it('formData should default to undefined', () => {
    const { container, onSubmit } = createFormComponent({
      schema: { type: 'boolean' },
      noValidate: true
    });
    submitForm(container);
    expect(onSubmit.mock.lastCall).toEqual({
      formData: undefined
    });
  });

  it('should handle a change event', () => {
    const { container, onChange } = createFormComponent({
      schema: {
        type: 'boolean',
        default: false
      }
    });

    fireEvent.change(container.querySelector('input')!, {
      target: { checked: true }
    });
    expect(onChange.mock.lastCall).toEqual({ formData: true });
  });

  it('should fill field with data', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'boolean'
      },
      formData: true
    });

    expect(container.querySelector('.field input').checked).eql(true);
  });

  it('should render radio widgets with the expected id', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'boolean'
      },
      uiSchema: { 'ui:widget': 'radio' }
    });

    expect(container.querySelector('.field-radio-group').id).eql('root');
  });

  it('should have default enum option labels for radio widgets', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'boolean'
      },
      formData: true,
      uiSchema: { 'ui:widget': 'radio' }
    });

    const labels = [].map.call(
      container.querySelectorAll('.field-radio-group label'),
      (label) => label.textContent
    );
    expect(labels).eql(['Yes', 'No']);
  });

  it('should support enum option ordering for radio widgets', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'boolean',
        enum: [false, true]
      },
      formData: true,
      uiSchema: { 'ui:widget': 'radio' }
    });

    const labels = [].map.call(
      container.querySelectorAll('.field-radio-group label'),
      (label) => label.textContent
    );
    expect(labels).eql(['No', 'Yes']);
  });

  it('should support enumNames for radio widgets', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'boolean',
        enumNames: ['Yes', 'No']
      },
      formData: true,
      uiSchema: { 'ui:widget': 'radio' }
    });

    const labels = [].map.call(
      container.querySelectorAll('.field-radio-group label'),
      (label) => label.textContent
    );
    expect(labels).eql(['Yes', 'No']);
  });

  it('should support oneOf titles for radio widgets', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'boolean',
        oneOf: [
          {
            const: true,
            title: 'Yes'
          },
          {
            const: false,
            title: 'No'
          }
        ]
      },
      formData: true,
      uiSchema: { 'ui:widget': 'radio' }
    });

    const labels = [].map.call(
      container.querySelectorAll('.field-radio-group label'),
      (label) => label.textContent
    );
    expect(labels).eql(['Yes', 'No']);
  });

  it('should preserve oneOf option ordering for radio widgets', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'boolean',
        oneOf: [
          {
            const: false,
            title: 'No'
          },
          {
            const: true,
            title: 'Yes'
          }
        ]
      },
      formData: true,
      uiSchema: { 'ui:widget': 'radio' }
    });

    const labels = [].map.call(
      container.querySelectorAll('.field-radio-group label'),
      (label) => label.textContent
    );
    expect(labels).eql(['No', 'Yes']);
  });

  it('should support inline radio widgets', () => {
    const { container } = createFormComponent({
      schema: { type: 'boolean' },
      formData: true,
      uiSchema: {
        'ui:widget': 'radio',
        'ui:options': {
          inline: true
        }
      }
    });

    expect(container.querySelectorAll('.radio-inline')).toHaveLength((2));
  });

  it('should handle a focus event for radio widgets', () => {
    const onFocus = vi.fn();
    const { container } = createFormComponent({
      schema: {
        type: 'boolean',
        default: false
      },
      uiSchema: {
        'ui:widget': 'radio'
      },
      onFocus
    });

    const element = container.querySelector('.field-radio-group');
    fireEvent.focus(container.querySelector('input')!, {
      target: {
        value: false
      }
    });
    expect(onFocus.calledWith(element.id, false)).to.be.true;
  });

  it('should handle a blur event for radio widgets', () => {
    const onBlur = vi.fn();
    const { container } = createFormComponent({
      schema: {
        type: 'boolean',
        default: false
      },
      uiSchema: {
        'ui:widget': 'radio'
      },
      onBlur
    });

    const element = container.querySelector('.field-radio-group');
    fireEvent.blur(container.querySelector('input')!, {
      target: {
        value: false
      }
    });
    expect(onBlur.calledWith(element.id, false)).to.be.true;
  });

  it('should support enumNames for select', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'boolean',
        enumNames: ['Yes', 'No']
      },
      formData: true,
      uiSchema: { 'ui:widget': 'select' }
    });

    const labels = [].map.call(
      container.querySelectorAll('.field option'),
      (label) => label.textContent
    );
    expect(labels).eql(['', 'Yes', 'No']);
  });

  it('should handle a focus event with checkbox', () => {
    const onFocus = vi.fn();
    const { container } = createFormComponent({
      schema: {
        type: 'boolean',
        default: false
      },
      uiSchema: {
        'ui:widget': 'select'
      },
      onFocus
    });

    const element = container.querySelector('select')!;
    fireEvent.focus(element, {
      target: {
        value: false
      }
    });
    expect(onFocus.calledWith(element.id, false)).to.be.true;
  });

  it('should handle a blur event with select', () => {
    const onBlur = vi.fn();
    const { container } = createFormComponent({
      schema: {
        type: 'boolean',
        default: false
      },
      uiSchema: {
        'ui:widget': 'select'
      },
      onBlur
    });

    const element = container.querySelector('select')!;
    fireEvent.blur(element, {
      target: {
        value: false
      }
    });
    expect(onBlur.calledWith(element.id, false)).to.be.true;
  });

  it('should render the widget with the expected id', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'boolean'
      }
    });

    expect(container.querySelector('input[type=checkbox]').id).eql('root');
  });

  it('should render customized checkbox', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'boolean'
      },
      widgets: {
        CheckboxWidget: CustomWidget
      }
    });

    expect(container.querySelector('#custom')).to.exist;
  });

  it('should handle a focus event with checkbox', () => {
    const onFocus = vi.fn();
    const { container } = createFormComponent({
      schema: {
        type: 'boolean',
        default: false
      },
      uiSchema: {
        'ui:widget': 'checkbox'
      },
      onFocus
    });

    const element = container.querySelector('input')!;
    fireEvent.focus(element, {
      target: {
        checked: false
      }
    });
    expect(onFocus.calledWith(element.id, false)).to.be.true;
  });

  it('should handle a blur event with checkbox', () => {
    const onBlur = vi.fn();
    const { container } = createFormComponent({
      schema: {
        type: 'boolean',
        default: false
      },
      uiSchema: {
        'ui:widget': 'checkbox'
      },
      onBlur
    });

    const element = container.querySelector('input')!;
    fireEvent.blur(element, {
      target: {
        checked: false
      }
    });
    expect(onBlur.calledWith(element.id, false)).to.be.true;
  });

  describe('Label', () => {
    const Widget = (props) => <div id={`label-${props.label}`} />;

    const widgets = { Widget };

    it('should pass field name to widget if there is no title', () => {
      const schema = {
        type: 'object',
        properties: {
          boolean: {
            type: 'boolean'
          }
        }
      };
      const uiSchema = {
        boolean: {
          'ui:widget': 'Widget'
        }
      };

      const { container } = createFormComponent({ schema, widgets, uiSchema });
      expect(container.querySelector('#label-boolean')).to.not.be.null;
    });

    it('should pass schema title to widget', () => {
      const schema = {
        type: 'boolean',
        title: 'test'
      };
      const uiSchema = {
        'ui:widget': 'Widget'
      };

      const { container } = createFormComponent({ schema, widgets, uiSchema });
      expect(container.querySelector('#label-test')).to.not.be.null;
    });

    it('should pass empty schema title to widget', () => {
      const schema = {
        type: 'boolean',
        title: ''
      };
      const uiSchema = {
        'ui:widget': 'Widget'
      };
      const { container } = createFormComponent({ schema, widgets, uiSchema });
      expect(container.querySelector('#label-')).to.not.be.null;
    });
  });

  describe('SelectWidget', () => {
    it('should render a field that contains an enum of booleans', () => {
      const { container } = createFormComponent({
        schema: {
          enum: [true, false]
        }
      });

      expect(container.querySelectorAll('.field select')).toHaveLength((1));
    });

    it('should infer the value from an enum on change', () => {
      const spy = vi.fn();
      const { container } = createFormComponent({
        schema: {
          enum: [true, false]
        },
        onChange: spy
      });

      expect(container.querySelectorAll('.field select')).toHaveLength((1));
      const $select = container.querySelector('.field select')!;
      expect($select.value).eql('');

      fireEvent.change($select, {
        target: { value: 'true' }
      });
      expect($select.value).eql('true');
      expect(spy.mock.lastCall!['formData']).eql(true);
    });

    it('should render a string field with a label', () => {
      const { container } = createFormComponent({
        schema: {
          enum: [true, false],
          title: 'foo'
        }
      });

      expect(container.querySelector('.field label')!.textContent).eql('foo');
    });

    it('should assign a default value', () => {
      const { onChange } = createFormComponent({
        schema: {
          enum: [true, false],
          default: true
        }
      });
      expect(onChange.mock.lastCall).toEqual({
        formData: true
      });
    });

    it('should handle a change event', () => {
      const { container, onChange } = createFormComponent({
        schema: {
          enum: [true, false]
        }
      });

      fireEvent.change(container.querySelector('select')!, {
        target: { value: 'false' }
      });

      expect(onChange.mock.lastCall).toEqual({
        formData: false
      });
    });

    it('should render the widget with the expected id', () => {
      const { container } = createFormComponent({
        schema: {
          enum: [true, false]
        }
      });

      expect(container.querySelector('select')!.id).eql('root');
    });
  });
});
