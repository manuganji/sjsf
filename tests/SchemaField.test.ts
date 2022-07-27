import { expect, describe, beforeEach, afterEach, it } from 'vitest';
import { fireEvent } from '@testing-library/dom';

import SchemaField from '../src/lib/components/fields/SchemaField';
import TitleField from '../src/lib/components/fields/TitleField';
import DescriptionField from '../src/lib/components/fields/DescriptionField';

import { createFormComponent, createSandbox } from './test_utils';
import { getDefaultRegistry } from '../src/lib/defaultRegistry';

describe('SchemaField', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('registry', () => {
    it('should provide expected registry as prop', () => {
      let receivedProps;
      const schema = {
        type: 'object',
        definitions: {
          a: { type: 'string' }
        }
      };
      createFormComponent({
        schema,
        uiSchema: {
          'ui:field': (props) => {
            receivedProps = props;
            return null;
          }
        }
      });

      const { registry } = receivedProps;
      expect(registry).eql({
        widgets: getDefaultRegistry().widgets,
        fields: getDefaultRegistry().fields,
        definitions: schema.definitions,
        rootSchema: schema,
        ArrayFieldTemplate: undefined,
        FieldTemplate: undefined,
        ObjectFieldTemplate: undefined,
        formContext: {}
      });
    });
    it('should set definitions to empty object if it is undefined', () => {
      let receivedProps;
      const schema = {
        type: 'object'
      };
      createFormComponent({
        schema,
        uiSchema: {
          'ui:field': (props) => {
            receivedProps = props;
            return null;
          }
        }
      });

      const { registry } = receivedProps;
      expect(registry).eql({
        widgets: getDefaultRegistry().widgets,
        fields: getDefaultRegistry().fields,
        definitions: {},
        rootSchema: schema,
        ArrayFieldTemplate: undefined,
        FieldTemplate: undefined,
        ObjectFieldTemplate: undefined,
        formContext: {}
      });
    });
  });

  describe('Unsupported field', () => {
    it('should warn on invalid field type', () => {
      const { container } = createFormComponent({
        schema: { type: 'invalid' }
      });

      expect(container.querySelector('.unsupported-field').textContent).to.contain(
        'Unknown field type invalid'
      );
    });

    it('should be able to be overwritten with a custom UnsupportedField component', () => {
      const CustomUnsupportedField = function () {
        return <span id="custom">Custom UnsupportedField</span>;
      };

      const fields = { UnsupportedField: CustomUnsupportedField };
      const { container } = createFormComponent({
        schema: { type: 'invalid' },
        fields
      });

      expect(container.querySelectorAll('#custom')[0].textContent).to.eql('Custom UnsupportedField');
    });
  });

  describe('Custom SchemaField component', () => {
    const CustomSchemaField = function (props) {
      return (
        <div id="custom">
          <SchemaField {...props} />
        </div>
      );
    };

    it('should use the specified custom SchemaType property', () => {
      const fields = { SchemaField: CustomSchemaField };
      const { container } = createFormComponent({
        schema: { type: 'string' },
        fields
      });

      expect(container.querySelectorAll('#custom > .field input[type=text]')).toHaveLength((1));
    });
  });

  describe('ui:field support', () => {
    class MyObject extends React.Component {
      constructor(props) {
        super(props);
      }

      render() {
        return <div id="custom" />;
      }
    }

    const schema = {
      type: 'object',
      properties: {
        foo: { type: 'string' },
        bar: { type: 'string' }
      }
    };

    it('should use provided direct custom component for object', () => {
      const uiSchema = { 'ui:field': MyObject };

      const { container } = createFormComponent({ schema, uiSchema });

      expect(container.querySelectorAll('#custom')).toHaveLength((1));

      expect(container.querySelectorAll('label')).toHaveLength((0));
    });

    it('should use provided direct custom component for specific property', () => {
      const uiSchema = {
        foo: { 'ui:field': MyObject }
      };

      const { container } = createFormComponent({ schema, uiSchema });

      expect(container.querySelectorAll('#custom')).toHaveLength((1));

      expect(container.querySelectorAll('input')).toHaveLength((1));

      expect(container.querySelectorAll('label')).toHaveLength((1));
    });

    it('should provide custom field the expected fields', () => {
      let receivedProps;
      createFormComponent({
        schema,
        uiSchema: {
          'ui:field': (props) => {
            receivedProps = props;
            return null;
          }
        }
      });

      const { registry } = receivedProps;
      expect(registry.widgets).eql(getDefaultRegistry().widgets);
      expect(registry.rootSchema).eql(schema);
      expect(registry.fields).to.be.an('object');
      expect(registry.fields.SchemaField).eql(SchemaField);
      expect(registry.fields.TitleField).eql(TitleField);
      expect(registry.fields.DescriptionField).eql(DescriptionField);
    });

    it('should use registered custom component for object', () => {
      const uiSchema = { 'ui:field': 'myobject' };
      const fields = { myobject: MyObject };

      const { container } = createFormComponent({ schema, uiSchema, fields });

      expect(container.querySelectorAll('#custom')).toHaveLength((1));
    });

    it('should handle referenced schema definitions', () => {
      const schema = {
        definitions: {
          foobar: {
            type: 'object',
            properties: {
              foo: { type: 'string' },
              bar: { type: 'string' }
            }
          }
        },
        $ref: '#/definitions/foobar'
      };
      const uiSchema = { 'ui:field': 'myobject' };
      const fields = { myobject: MyObject };

      const { container } = createFormComponent({ schema, uiSchema, fields });

      expect(container.querySelectorAll('#custom')).toHaveLength((1));
    });

    it('should not pass classNames to child component', () => {
      const CustomSchemaField = function (props) {
        return <SchemaField {...props} uiSchema={{ ...props.uiSchema, 'ui:field': undefined }} />;
      };

      const schema = {
        type: 'string'
      };
      const uiSchema = {
        'ui:field': 'customSchemaField',
        classNames: 'foo'
      };
      const fields = { customSchemaField: CustomSchemaField };

      const { container } = createFormComponent({ schema, uiSchema, fields });

      expect(container.querySelectorAll('.foo')).toHaveLength((1));
    });
  });

  describe('label support', () => {
    const schema = {
      type: 'object',
      properties: {
        foo: { type: 'string' }
      }
    };

    it('should render label by default', () => {
      const { container } = createFormComponent({ schema });
      expect(container.querySelectorAll('label')).toHaveLength((1));
    });

    it('should render label if ui:options label is set to true', () => {
      const uiSchema = {
        foo: { 'ui:options': { label: true } }
      };

      const { container } = createFormComponent({ schema, uiSchema });
      expect(container.querySelectorAll('label')).toHaveLength((1));
    });

    it('should not render label if ui:options label is set to false', () => {
      const uiSchema = {
        foo: { 'ui:options': { label: false } }
      };

      const { container } = createFormComponent({ schema, uiSchema });
      expect(container.querySelectorAll('label')).toHaveLength((0));
    });

    it('should render label even when type object is missing', () => {
      const schema = {
        title: 'test',
        properties: {
          foo: { type: 'string' }
        }
      };
      const { container } = createFormComponent({ schema });
      expect(container.querySelectorAll('label')).toHaveLength((1));
    });
  });

  describe('description support', () => {
    const schema = {
      type: 'object',
      properties: {
        foo: { type: 'string', description: 'A Foo field' },
        bar: { type: 'string' }
      }
    };

    it('should render description if available from the schema', () => {
      const { container } = createFormComponent({ schema });

      expect(container.querySelectorAll('#root_foo__description')).toHaveLength((1));
    });

    it('should render description if available from a referenced schema', () => {
      // Overriding.
      const schemaWithReference = {
        type: 'object',
        properties: {
          foo: { $ref: '#/definitions/foo' },
          bar: { type: 'string' }
        },
        definitions: {
          foo: {
            type: 'string',
            description: 'A Foo field'
          }
        }
      };
      const { container } = createFormComponent({
        schema: schemaWithReference
      });

      const matches = container.querySelectorAll('#root_foo__description');
      expect(matches).toHaveLength((1));
      expect(matches[0].textContent).to.equal('A Foo field');
    });

    it('should not render description if not available from schema', () => {
      const { container } = createFormComponent({ schema });

      expect(container.querySelectorAll('#root_bar__description')).toHaveLength((0));
    });

    it('should render a customized description field', () => {
      const CustomDescriptionField = ({ description }) => <div id="custom">{description}</div>;

      const { container } = createFormComponent({
        schema,
        fields: {
          DescriptionField: CustomDescriptionField
        }
      });

      expect(container.querySelector('#custom').textContent).to.eql('A Foo field');
    });
  });

  describe('errors', () => {
    const schema = {
      type: 'object',
      properties: {
        foo: { type: 'string' }
      }
    };

    const uiSchema = {
      'ui:field': (props) => {
        const { uiSchema, ...fieldProps } = props; //eslint-disable-line
        return <SchemaField {...fieldProps} />;
      }
    };

    function validate(formData, errors) {
      errors.addError('container');
      errors.foo.addError('test');
      return errors;
    }

    it('should render its own errors', () => {
      const { container } = createFormComponent({
        schema,
        uiSchema,
        validate
      });
      fireEvent.submit(container);

      const matches = container.querySelectorAll(
        'form > .form-group > div > .error-detail .text-danger'
      );
      expect(matches).toHaveLength((1));
      expect(matches[0].textContent).to.eql('container');
    });

    it('should pass errors to child component', () => {
      const { container } = createFormComponent({
        schema,
        uiSchema,
        validate
      });
      fireEvent.submit(container);

      const matches = container.querySelectorAll('form .form-group .form-group .text-danger');
      expect(matches).toHaveLength((1));
      expect(matches[0].textContent).to.contain('test');
    });

    describe('Custom error rendering', () => {
      const customStringWidget = (props) => {
        return <div className="custom-text-widget">{props.rawErrors}</div>;
      };

      it('should pass rawErrors down to custom widgets', () => {
        const { container } = createFormComponent({
          schema,
          uiSchema,
          validate,
          widgets: { BaseInput: customStringWidget }
        });
        fireEvent.submit(container);

        const matches = container.querySelectorAll('.custom-text-widget');
        expect(matches).toHaveLength((1));
        expect(matches[0].textContent).to.eql('test');
      });
    });

    describe('hideError flag and errors', () => {
      const hideUiSchema = {
        'ui:hideError': true,
        ...uiSchema
      };

      it('should not render its own default errors', () => {
        const { container } = createFormComponent({
          schema,
          uiSchema: hideUiSchema,
          validate
        });
        fireEvent.submit(container);

        const matches = container.querySelectorAll(
          'form > .form-group > div > .error-detail .text-danger'
        );
        expect(matches).toHaveLength((0));
      });

      it('should not show default errors in child component', () => {
        const { container } = createFormComponent({
          schema,
          uiSchema: hideUiSchema,
          validate
        });
        fireEvent.submit(container);

        const matches = container.querySelectorAll('form .form-group .form-group .text-danger');
        expect(matches).toHaveLength((0));
      });

      describe('Custom error rendering', () => {
        const customStringWidget = (props) => {
          return <div className="custom-text-widget">{props.rawErrors}</div>;
        };

        it('should pass rawErrors down to custom widgets and render them', () => {
          const { container } = createFormComponent({
            schema,
            uiSchema: hideUiSchema,
            validate,
            widgets: { BaseInput: customStringWidget }
          });
          fireEvent.submit(container);

          const matches = container.querySelectorAll('.custom-text-widget');
          expect(matches).toHaveLength((1));
          expect(matches[0].textContent).to.eql('test');
        });
      });
    });
    describe('hideError flag false for child should show errors', () => {
      const hideUiSchema = {
        'ui:hideError': true,
        'ui:field': (props) => {
          const { uiSchema, ...fieldProps } = props; //eslint-disable-line
          // Pass the children schema in after removing the global one
          return <SchemaField {...fieldProps} uiSchema={{ 'ui:hideError': false }} />;
        }
      };

      it('should not render its own default errors', () => {
        const { container } = createFormComponent({
          schema,
          uiSchema: hideUiSchema,
          validate
        });
        fireEvent.submit(container);

        const matches = container.querySelectorAll(
          'form > .form-group > div > .error-detail .text-danger'
        );
        expect(matches).toHaveLength((0));
      });

      it('should show errors on child component', () => {
        const { container } = createFormComponent({
          schema,
          uiSchema: hideUiSchema,
          validate
        });
        fireEvent.submit(container);

        const matches = container.querySelectorAll('form .form-group .form-group .text-danger');
        expect(matches).toHaveLength((1));
        expect(matches[0].textContent).to.contain('test');
      });
    });
  });
});
