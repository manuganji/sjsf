import { expect, describe, beforeEach, afterEach, it, vi } from 'vitest';
import { Simulate } from 'react-dom/test-utils';

import { createFormComponent, createSandbox, submitForm } from './test_utils';

describe('ObjectField', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('schema', () => {
    const schema = {
      type: 'object',
      title: 'my object',
      description: 'my description',
      required: ['foo'],
      default: {
        foo: 'hey',
        bar: true
      },
      properties: {
        foo: {
          title: 'Foo',
          type: 'string'
        },
        bar: {
          type: 'boolean'
        }
      }
    };

    it('should render a fieldset', () => {
      const { container } = createFormComponent({ schema });

      const fieldset = container.querySelectorAll('fieldset');
      expect(fieldset).to.have.length.of(1);
      expect(fieldset[0].id).eql('root');
    });

    it('should render a fieldset legend', () => {
      const { container } = createFormComponent({ schema });

      const legend = container.querySelector('fieldset > legend');

      expect(legend.textContent).eql('my object');
      expect(legend.id).eql('root__title');
    });

    it('should render a hidden object', () => {
      const { container } = createFormComponent({
        schema,
        uiSchema: {
          'ui:widget': 'hidden'
        }
      });
      expect(container.querySelector('div.hidden > fieldset')).to.exist;
    });

    it('should render a customized title', () => {
      const CustomTitleField = ({ title }) => <div id="custom">{title}</div>;

      const { container } = createFormComponent({
        schema,
        fields: {
          TitleField: CustomTitleField
        }
      });
      expect(container.querySelector('fieldset > #custom').textContent).to.eql('my object');
    });

    it('should render a customized description', () => {
      const CustomDescriptionField = ({ description }) => <div id="custom">{description}</div>;

      const { container } = createFormComponent({
        schema,
        fields: { DescriptionField: CustomDescriptionField }
      });
      expect(container.querySelector('fieldset > #custom').textContent).to.eql('my description');
    });

    it('should render a default property label', () => {
      const { container } = createFormComponent({ schema });

      expect(container.querySelector('.field-boolean label').textContent).eql('bar');
    });

    it('should render a string property', () => {
      const { container } = createFormComponent({ schema });

      expect(container.querySelectorAll('.field input[type=text]')).to.have.length.of(1);
    });

    it('should render a boolean property', () => {
      const { container } = createFormComponent({ schema });

      expect(container.querySelectorAll('.field input[type=checkbox]')).to.have.length.of(1);
    });

    it('should handle a default object value', () => {
      const { container } = createFormComponent({ schema });

      expect(container.querySelector('.field input[type=text]').value).eql('hey');
      expect(container.querySelector('.field input[type=checkbox]').checked).eql(true);
    });

    it('should handle required values', () => {
      const { container } = createFormComponent({ schema });

      // Required field is <input type="text" required="">
      expect(container.querySelector('input[type=text]').getAttribute('required')).eql('');
      expect(container.querySelector('.field-string label').textContent).eql('Foo*');
    });

    it('should fill fields with form data', () => {
      const { container } = createFormComponent({
        schema,
        formData: {
          foo: 'hey',
          bar: true
        }
      });

      expect(container.querySelector('.field input[type=text]').value).eql('hey');
      expect(container.querySelector('.field input[type=checkbox]').checked).eql(true);
    });

    it('should handle object fields change events', () => {
      const { container, onChange } = createFormComponent({ schema });

      Simulate.change(container.querySelector('input[type=text]'), {
        target: { value: 'changed' }
      });

      sinon.assert.calledWithMatch(onChange.lastCall, {
        formData: { foo: 'changed' }
      });
    });

    it('should handle object fields with blur events', () => {
      const onBlur = sandbox.spy();
      const { container } = createFormComponent({ schema, onBlur });

      const input = container.querySelector('input[type=text]');
      Simulate.blur(input, {
        target: { value: 'changed' }
      });

      expect(onBlur.calledWith(input.id, 'changed')).to.be.true;
    });

    it('should handle object fields with focus events', () => {
      const onFocus = sandbox.spy();
      const { container } = createFormComponent({ schema, onFocus });

      const input = container.querySelector('input[type=text]');
      Simulate.focus(input, {
        target: { value: 'changed' }
      });

      expect(onFocus.calledWith(input.id, 'changed')).to.be.true;
    });

    it('should render the widget with the expected id', () => {
      const { container } = createFormComponent({ schema });

      expect(container.querySelector('input[type=text]').id).eql('root_foo');
      expect(container.querySelector('input[type=checkbox]').id).eql('root_bar');
    });
  });

  describe('fields ordering', () => {
    const schema = {
      type: 'object',
      properties: {
        foo: { type: 'string' },
        bar: { type: 'string' },
        baz: { type: 'string' },
        qux: { type: 'string' }
      }
    };

    it('should use provided order', () => {
      const { container } = createFormComponent({
        schema,
        uiSchema: {
          'ui:order': ['baz', 'qux', 'bar', 'foo']
        }
      });
      const labels = [].map.call(container.querySelectorAll('.field > label'), (l) => l.textContent);

      expect(labels).eql(['baz', 'qux', 'bar', 'foo']);
    });

    it('should insert unordered properties at wildcard position', () => {
      const { container } = createFormComponent({
        schema,
        uiSchema: {
          'ui:order': ['baz', '*', 'foo']
        }
      });
      const labels = [].map.call(container.querySelectorAll('.field > label'), (l) => l.textContent);

      expect(labels).eql(['baz', 'bar', 'qux', 'foo']);
    });

    it('should use provided order also if order list contains extraneous properties', () => {
      const { container } = createFormComponent({
        schema,
        uiSchema: {
          'ui:order': ['baz', 'qux', 'bar', 'wut?', 'foo', 'huh?']
        }
      });

      const labels = [].map.call(container.querySelectorAll('.field > label'), (l) => l.textContent);

      expect(labels).eql(['baz', 'qux', 'bar', 'foo']);
    });

    it('should throw when order list misses an existing property', () => {
      const { container } = createFormComponent({
        schema,
        uiSchema: {
          'ui:order': ['baz', 'bar']
        }
      });

      expect(container.querySelector('.config-error').textContent).to.match(
        /does not contain properties 'foo', 'qux'/
      );
    });

    it('should throw when more than one wildcard is present', () => {
      const { container } = createFormComponent({
        schema,
        uiSchema: {
          'ui:order': ['baz', '*', 'bar', '*']
        }
      });

      expect(container.querySelector('.config-error').textContent).to.match(
        /contains more than one wildcard/
      );
    });

    it('should order referenced schema definitions', () => {
      const refSchema = {
        definitions: {
          testdef: { type: 'string' }
        },
        type: 'object',
        properties: {
          foo: { $ref: '#/definitions/testdef' },
          bar: { $ref: '#/definitions/testdef' }
        }
      };

      const { container } = createFormComponent({
        schema: refSchema,
        uiSchema: {
          'ui:order': ['bar', 'foo']
        }
      });
      const labels = [].map.call(container.querySelectorAll('.field > label'), (l) => l.textContent);

      expect(labels).eql(['bar', 'foo']);
    });

    it('should order referenced object schema definition properties', () => {
      const refSchema = {
        definitions: {
          testdef: {
            type: 'object',
            properties: {
              foo: { type: 'string' },
              bar: { type: 'string' }
            }
          }
        },
        type: 'object',
        properties: {
          root: { $ref: '#/definitions/testdef' }
        }
      };

      const { container } = createFormComponent({
        schema: refSchema,
        uiSchema: {
          root: {
            'ui:order': ['bar', 'foo']
          }
        }
      });
      const labels = [].map.call(container.querySelectorAll('.field > label'), (l) => l.textContent);

      expect(labels).eql(['bar', 'foo']);
    });

    it('should render the widget with the expected id', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: { type: 'string' },
          bar: { type: 'string' }
        }
      };

      const { container } = createFormComponent({
        schema,
        uiSchema: {
          'ui:order': ['bar', 'foo']
        }
      });

      const ids = [].map.call(container.querySelectorAll('input[type=text]'), (container) => container.id);
      expect(ids).eql(['root_bar', 'root_foo']);
    });
  });

  describe('Title', () => {
    const TitleField = (props) => <div id={`title-${props.title}`} />;

    const fields = { TitleField };

    it('should pass field name to TitleField if there is no title', () => {
      const schema = {
        type: 'object',
        properties: {
          object: {
            type: 'object',
            properties: {}
          }
        }
      };

      const { container } = createFormComponent({ schema, fields });
      expect(container.querySelector('#title-object')).to.not.be.null;
    });

    it('should pass schema title to TitleField', () => {
      const schema = {
        type: 'object',
        properties: {},
        title: 'test'
      };

      const { container } = createFormComponent({ schema, fields });
      expect(container.querySelector('#title-test')).to.not.be.null;
    });

    it('should pass empty schema title to TitleField', () => {
      const schema = {
        type: 'object',
        properties: {},
        title: ''
      };
      const { container } = createFormComponent({ schema, fields });
      expect(container.querySelector('#title-')).to.be.null;
    });
  });

  describe('additionalProperties', () => {
    const schema = {
      type: 'object',
      additionalProperties: {
        type: 'string'
      }
    };

    it('should automatically add a property field if in formData', () => {
      const { container } = createFormComponent({
        schema,
        formData: { first: 1 }
      });

      expect(container.querySelectorAll('.field-string')).to.have.length.of(1);
    });

    it('should apply uiSchema to additionalProperties', () => {
      const { container } = createFormComponent({
        schema,
        uiSchema: {
          additionalProperties: {
            'ui:title': 'CustomName'
          }
        },
        formData: {
          property1: 'test'
        }
      });
      const labels = container.querySelectorAll('label.control-label');
      expect(labels[0].textContent).eql('CustomName Key');
      expect(labels[1].textContent).eql('CustomName');
    });

    it('should not throw validation errors if additionalProperties is undefined', () => {
      const undefinedAPSchema = {
        ...schema,
        properties: { second: { type: 'string' } }
      };
      delete undefinedAPSchema.additionalProperties;
      const { container, onSubmit, onError } = createFormComponent({
        schema: undefinedAPSchema,
        formData: { nonschema: 1 }
      });

      submitForm(container);
      sinon.assert.calledWithMatch(onSubmit.lastCall, {
        formData: { nonschema: 1 }
      });

      sinon.assert.notCalled(onError);
    });

    it('should throw a validation error if additionalProperties is false', () => {
      const { container, onSubmit, onError } = createFormComponent({
        schema: {
          ...schema,
          additionalProperties: false,
          properties: { second: { type: 'string' } }
        },
        formData: { nonschema: 1 }
      });
      submitForm(container);
      sinon.assert.notCalled(onSubmit);
      sinon.assert.calledWithMatch(onError.lastCall, [
        {
          message: 'is an invalid additional property',
          name: 'additionalProperties',
          params: { additionalProperty: 'nonschema' },
          property: "['nonschema']",
          schemaPath: '#/additionalProperties',
          stack: "['nonschema'] is an invalid additional property"
        }
      ]);
    });

    it('should still obey properties if additionalProperties is defined', () => {
      const { container } = createFormComponent({
        schema: {
          ...schema,
          properties: {
            definedProperty: {
              type: 'string'
            }
          }
        }
      });

      expect(container.querySelectorAll('.field-string')).to.have.length.of(1);
    });

    it('should render a label for the additional property key', () => {
      const { container } = createFormComponent({
        schema,
        formData: { first: 1 }
      });

      expect(container.querySelector("[for='root_first-key']").textContent).eql('first Key');
    });

    it('should render a label for the additional property key if additionalProperties is true', () => {
      const { container } = createFormComponent({
        schema: { ...schema, additionalProperties: true },
        formData: { first: 1 }
      });

      expect(container.querySelector("[for='root_first-key']").textContent).eql('first Key');
    });

    it('should not render a label for the additional property key if additionalProperties is false', () => {
      const { container } = createFormComponent({
        schema: { ...schema, additionalProperties: false },
        formData: { first: 1 }
      });

      expect(container.querySelector("[for='root_first-key']")).eql(null);
    });

    it('should render a text input for the additional property key', () => {
      const { container } = createFormComponent({
        schema,
        formData: { first: 1 }
      });

      expect(container.querySelector('#root_first-key').value).eql('first');
    });

    it('should render a label for the additional property value', () => {
      const { container } = createFormComponent({
        schema,
        formData: { first: 1 }
      });

      expect(container.querySelector("[for='root_first']").textContent).eql('first');
    });

    it('should render a text input for the additional property value', () => {
      const { container } = createFormComponent({
        schema,
        formData: { first: 1 }
      });

      expect(container.querySelector('#root_first').value).eql('1');
    });

    it('should rename formData key if key input is renamed', () => {
      const { container, onChange } = createFormComponent({
        schema,
        formData: { first: 1 }
      });

      const textcontainer = container.querySelector('#root_first-key');
      Simulate.blur(textcontainer, {
        target: { value: 'newFirst' }
      });

      sinon.assert.calledWithMatch(onChange.lastCall, {
        formData: { newFirst: 1, first: undefined }
      });
    });

    it('should retain and display user-input data if key-value pair has a title present in the schema when renaming key', () => {
      const { container, onChange } = createFormComponent({
        schema: {
          type: 'object',
          additionalProperties: {
            title: 'Custom title',
            type: 'string'
          }
        },
        formData: { 'Custom title': 1 }
      });

      const textcontainer = container.querySelector('#root_Custom\\ title-key');
      Simulate.blur(textcontainer, {
        target: { value: 'Renamed custom title' }
      });

      sinon.assert.calledWithMatch(onChange.lastCall, {
        formData: { 'Renamed custom title': 1 }
      });

      const keyInput = container.querySelector('#root_Renamed\\ custom\\ title-key');
      expect(keyInput.value).eql('Renamed custom title');

      const keyInputLabel = container.querySelector('label[for="root_Renamed\\ custom\\ title-key"]');
      expect(keyInputLabel.textContent).eql('Renamed custom title Key');
    });

    it('should retain object title when renaming key', () => {
      const { container } = createFormComponent({
        schema: {
          title: 'Object title',
          type: 'object',
          additionalProperties: {
            type: 'string'
          }
        },
        formData: { 'Custom title': 1 }
      });

      const textcontainer = container.querySelector('#root_Custom\\ title-key');
      Simulate.blur(textcontainer, {
        target: { value: 'Renamed custom title' }
      });

      const title = container.querySelector('#root__title');
      expect(title.textContent).eql('Object title');
    });

    it('should keep order of renamed key-value pairs while renaming key', () => {
      const { container, onChange } = createFormComponent({
        schema,
        formData: { first: 1, second: 2, third: 3 }
      });

      const textcontainer = container.querySelector('#root_second-key');
      Simulate.blur(textcontainer, {
        target: { value: 'newSecond' }
      });

      sinon.assert.calledWithMatch(onChange.lastCall, {
        formData: { first: 1, newSecond: 2, third: 3 }
      });

      expect(Object.keys(onChange.lastCall.args[0].formData)).eql(['first', 'newSecond', 'third']);
    });

    it('should attach suffix to formData key if new key already exists when key input is renamed', () => {
      const formData = {
        first: 1,
        second: 2
      };
      const { container, onChange } = createFormComponent({
        schema,
        formData
      });

      const textcontainer = container.querySelector('#root_first-key');
      Simulate.blur(textcontainer, {
        target: { value: 'second' }
      });

      sinon.assert.calledWithMatch(onChange.lastCall, {
        formData: { second: 2, 'second-1': 1 }
      });
    });

    it('should not attach suffix when input is only clicked', () => {
      const formData = {
        first: 1
      };
      const { container, onChange } = createFormComponent({
        schema,
        formData
      });

      const textcontainer = container.querySelector('#root_first-key');
      Simulate.blur(textcontainer);

      sinon.assert.notCalled(onChange);
    });

    it('should continue incrementing suffix to formData key until that key name is unique after a key input collision', () => {
      const formData = {
        first: 1,
        second: 2,
        'second-1': 2,
        'second-2': 2,
        'second-3': 2,
        'second-4': 2,
        'second-5': 2,
        'second-6': 2
      };
      const { container, onChange } = createFormComponent({
        schema,
        formData
      });

      const textcontainer = container.querySelector('#root_first-key');
      Simulate.blur(textcontainer, {
        target: { value: 'second' }
      });

      sinon.assert.calledWithMatch(onChange.lastCall, {
        formData: {
          second: 2,
          'second-1': 2,
          'second-2': 2,
          'second-3': 2,
          'second-4': 2,
          'second-5': 2,
          'second-6': 2,
          'second-7': 1
        }
      });
    });

    it('should have an expand button', () => {
      const { container } = createFormComponent({ schema });

      expect(container.querySelector('.object-property-expand button')).not.eql(null);
    });

    it('should not have an expand button if expandable is false', () => {
      const { container } = createFormComponent({
        schema,
        uiSchema: { 'ui:options': { expandable: false } }
      });

      expect(container.querySelector('.object-property-expand button')).to.be.null;
    });

    it('should add a new property when clicking the expand button', () => {
      const { container, onChange } = createFormComponent({ schema });

      Simulate.click(container.querySelector('.object-property-expand button'));

      sinon.assert.calledWithMatch(onChange.lastCall, {
        formData: {
          newKey: 'New Value'
        }
      });
    });

    it("should add a new property with suffix when clicking the expand button and 'newKey' already exists", () => {
      const { container, onChange } = createFormComponent({
        schema,
        formData: { newKey: 1 }
      });

      Simulate.click(container.querySelector('.object-property-expand button'));
      sinon.assert.calledWithMatch(onChange.lastCall, {
        formData: {
          'newKey-1': 'New Value'
        }
      });
    });

    it('should not provide an expand button if length equals maxProperties', () => {
      const { container } = createFormComponent({
        schema: { maxProperties: 1, ...schema },
        formData: { first: 1 }
      });

      expect(container.querySelector('.object-property-expand button')).to.be.null;
    });

    it('should provide an expand button if length is less than maxProperties', () => {
      const { container } = createFormComponent({
        schema: { maxProperties: 2, ...schema },
        formData: { first: 1 }
      });

      expect(container.querySelector('.object-property-expand button')).not.eql(null);
    });

    it('should not provide an expand button if expandable is expliclty false regardless of maxProperties value', () => {
      const { container } = createFormComponent({
        schema: { maxProperties: 2, ...schema },
        formData: { first: 1 },
        uiSchema: {
          'ui:options': {
            expandable: false
          }
        }
      });

      expect(container.querySelector('.object-property-expand button')).to.be.null;
    });

    it('should ignore expandable value if maxProperties constraint is not satisfied', () => {
      const { container } = createFormComponent({
        schema: { maxProperties: 1, ...schema },
        formData: { first: 1 },
        uiSchema: {
          'ui:options': {
            expandable: true
          }
        }
      });

      expect(container.querySelector('.object-property-expand button')).to.be.null;
    });

    it('should not have delete button if expand button has not been clicked', () => {
      const { container } = createFormComponent({ schema });

      expect(container.querySelector('.form-group > .btn-danger')).eql(null);
    });

    it('should have delete button if expand button has been clicked', () => {
      const { container } = createFormComponent({
        schema
      });

      expect(
        container.querySelector(
          '.form-group > .form-additional > .form-additional + .col-xs-2 .btn-danger'
        )
      ).eql(null);

      Simulate.click(container.querySelector('.object-property-expand button'));

      expect(container.querySelector('.form-group > .row > .form-additional + .col-xs-2 > .btn-danger'))
        .to.not.be.null;
    });

    it('delete button should delete key-value pair', () => {
      const { container } = createFormComponent({
        schema,
        formData: { first: 1 }
      });
      expect(container.querySelector('#root_first-key').value).to.eql('first');
      Simulate.click(
        container.querySelector('.form-group > .row > .form-additional + .col-xs-2 > .btn-danger')
      );
      expect(container.querySelector('#root_first-key')).to.not.exist;
    });

    it('delete button should delete correct pair', () => {
      const { container } = createFormComponent({
        schema,
        formData: { first: 1, second: 2, third: 3 }
      });
      const selector = '.form-group > .row > .form-additional + .col-xs-2 > .btn-danger';
      expect(container.querySelectorAll(selector).length).to.eql(3);
      Simulate.click(container.querySelectorAll(selector)[1]);
      expect(container.querySelector('#root_second-key')).to.not.exist;
      expect(container.querySelectorAll(selector).length).to.eql(2);
    });

    it('deleting content of value input should not delete pair', () => {
      const { container, onChange } = createFormComponent({
        schema,
        formData: { first: 1 }
      });

      Simulate.change(container.querySelector('#root_first'), {
        target: { value: '' }
      });

      sinon.assert.calledWithMatch(onChange.lastCall, {
        formData: { first: '' }
      });
    });

    it('should change content of value input to boolean false', () => {
      const { container, onChange } = createFormComponent({
        schema: {
          ...schema,
          additionalProperties: true
        },
        formData: { first: true }
      });

      Simulate.change(container.querySelector('#root_first'), {
        target: { checked: false }
      });

      sinon.assert.calledWithMatch(onChange.lastCall, {
        formData: { first: false }
      });
    });

    it('should change content of value input to number 0', () => {
      const { container, onChange } = createFormComponent({
        schema: {
          ...schema,
          additionalProperties: true
        },
        formData: { first: 1 }
      });

      Simulate.change(container.querySelector('#root_first'), {
        target: { value: 0 }
      });

      sinon.assert.calledWithMatch(onChange.lastCall, {
        formData: { first: 0 }
      });
    });

    it('should change content of value input to null', () => {
      const { container, onChange } = createFormComponent({
        schema,
        formData: { first: 'str' }
      });

      Simulate.change(container.querySelector('#root_first'), {
        target: { value: null }
      });

      sinon.assert.calledWithMatch(onChange.lastCall, {
        formData: { first: null }
      });
    });
  });
});
