import { expect, describe, beforeEach, afterEach, it, vi } from 'vitest';
import { Simulate } from 'react-dom/test-utils';

import { createFormComponent, createSandbox, submitForm } from './test_utils';

describe('NumberField', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('Number widget', () => {
    it('should use step to represent the multipleOf keyword', () => {
      const { container } = createFormComponent({
        schema: {
          type: 'number',
          multipleOf: 5
        }
      });

      expect(container.querySelector('input').step).to.eql('5');
    });

    it('should use min to represent the minimum keyword', () => {
      const { container } = createFormComponent({
        schema: {
          type: 'number',
          minimum: 0
        }
      });

      expect(container.querySelector('input').min).to.eql('0');
    });

    it('should use max to represent the maximum keyword', () => {
      const { container } = createFormComponent({
        schema: {
          type: 'number',
          maximum: 100
        }
      });

      expect(container.querySelector('input').max).to.eql('100');
    });

    it('should use step to represent the multipleOf keyword', () => {
      const { container } = createFormComponent({
        schema: {
          type: 'number',
          multipleOf: 5
        }
      });

      expect(container.querySelector('input').step).to.eql('5');
    });

    it('should use min to represent the minimum keyword', () => {
      const { container } = createFormComponent({
        schema: {
          type: 'number',
          minimum: 0
        }
      });

      expect(container.querySelector('input').min).to.eql('0');
    });

    it('should use max to represent the maximum keyword', () => {
      const { container } = createFormComponent({
        schema: {
          type: 'number',
          maximum: 100
        }
      });

      expect(container.querySelector('input').max).to.eql('100');
    });
  });
  describe('Number and text widget', () => {
    let uiSchemas = [
      {},
      {
        'ui:options': {
          inputType: 'text'
        }
      }
    ];
    for (let uiSchema of uiSchemas) {
      it('should render a string field with a label', () => {
        const { container } = createFormComponent({
          schema: {
            type: 'number',
            title: 'foo'
          },
          uiSchema
        });

        expect(container.querySelector('.field label').textContent).eql('foo');
      });

      it('should render a string field with a description', () => {
        const { container } = createFormComponent({
          schema: {
            type: 'number',
            description: 'bar'
          },
          uiSchema
        });

        expect(container.querySelector('.field-description').textContent).eql('bar');
      });

      it('formData should default to undefined', () => {
        const { container: container, onSubmit } = createFormComponent({
          schema: { type: 'number' },
          uiSchema,
          noValidate: true
        });

        submitForm(container);
        sinon.assert.calledWithMatch(onSubmit.lastCall, {
          formData: undefined
        });
      });

      it('should assign a default value', () => {
        const { container } = createFormComponent({
          schema: {
            type: 'number',
            default: 2
          },
          uiSchema
        });

        expect(container.querySelector('.field input').value).eql('2');
      });

      it('should handle a change event', () => {
        const { container: container, onChange } = createFormComponent({
          schema: {
            type: 'number'
          },
          uiSchema
        });

        Simulate.change(container.querySelector('input'), {
          target: { value: '2' }
        });

        sinon.assert.calledWithMatch(onChange.lastCall, {
          formData: 2
        });
      });

      it('should handle a blur event', () => {
        const onBlur = sandbox.spy();
        const { container } = createFormComponent({
          schema: {
            type: 'number'
          },
          uiSchema,
          onBlur
        });

        const input = container.querySelector('input');
        Simulate.blur(input, {
          target: { value: '2' }
        });

        expect(onBlur.calledWith(input.id, 2));
      });

      it('should handle a focus event', () => {
        const onFocus = sandbox.spy();
        const { container } = createFormComponent({
          schema: {
            type: 'number'
          },
          uiSchema,
          onFocus
        });

        const input = container.querySelector('input');
        Simulate.focus(input, {
          target: { value: '2' }
        });

        expect(onFocus.calledWith(input.id, 2));
      });

      it('should fill field with data', () => {
        const { container } = createFormComponent({
          schema: {
            type: 'number'
          },
          uiSchema,
          formData: 2
        });

        expect(container.querySelector('.field input').value).eql('2');
      });

      describe('when inputting a number that ends with a dot and/or zero it should normalize it, without changing the input value', () => {
        const { container: container, onChange } = createFormComponent({
          schema: {
            type: 'number'
          },
          uiSchema
        });

        const $input = container.querySelector('input');

        const tests = [
          {
            input: '2.',
            output: 2
          },
          {
            input: '2.0',
            output: 2
          },
          {
            input: '2.3',
            output: 2.3
          },
          {
            input: '2.30',
            output: 2.3
          },
          {
            input: '2.300',
            output: 2.3
          },
          {
            input: '2.3001',
            output: 2.3001
          },
          {
            input: '2.03',
            output: 2.03
          },
          {
            input: '2.003',
            output: 2.003
          },
          {
            input: '2.00300',
            output: 2.003
          },
          {
            input: '200300',
            output: 200300
          }
        ];

        tests.forEach((test) => {
          it(`should work with an input value of ${test.input}`, () => {
            Simulate.change($input, {
              target: { value: test.input }
            });

            sinon.assert.calledWithMatch(onChange.lastCall, {
              formData: test.output
            });
            // "2." is not really a valid number in a input field of type number
            // so we need to use getAttribute("value") instead since .value outputs the empty string
            expect($input.getAttribute('value')).eql(test.input);
          });
        });
      });

      it('should normalize values beginning with a decimal point', () => {
        const { container: container, onChange } = createFormComponent({
          schema: {
            type: 'number'
          },
          uiSchema
        });

        const $input = container.querySelector('input');

        Simulate.change($input, {
          target: { value: '.00' }
        });

        sinon.assert.calledWithMatch(onChange.lastCall, {
          formData: 0
        });
        expect($input.value).eql('.00');
      });

      it('should update input values correctly when formData prop changes', () => {
        const schema = {
          type: 'number'
        };

        const { component: comp, container: container, rerender } = createFormComponent({
          schema,
          uiSchema,
          formData: 2.03
        });

        const $input = container.querySelector('input');

        expect($input.value).eql('2.03');

        rerender({
          schema,
          formData: 203
        });

        expect($input.value).eql('203');
      });

      it('should render the widget with the expected id', () => {
        const { container } = createFormComponent({
          schema: {
            type: 'number'
          },
          uiSchema
        });

        expect(container.querySelector('input').id).eql('root');
      });

      it('should render with trailing zeroes', () => {
        const { container } = createFormComponent({
          schema: {
            type: 'number'
          },
          uiSchema
        });

        Simulate.change(container.querySelector('input'), {
          target: { value: '2.' }
        });
        // "2." is not really a valid number in a input field of type number
        // so we need to use getAttribute("value") instead since .value outputs the empty string
        expect(container.querySelector('.field input').getAttribute('value')).eql('2.');

        Simulate.change(container.querySelector('input'), {
          target: { value: '2.0' }
        });
        expect(container.querySelector('.field input').value).eql('2.0');

        Simulate.change(container.querySelector('input'), {
          target: { value: '2.00' }
        });
        expect(container.querySelector('.field input').value).eql('2.00');

        Simulate.change(container.querySelector('input'), {
          target: { value: '2.000' }
        });
        expect(container.querySelector('.field input').value).eql('2.000');
      });

      it('should allow a zero to be input', () => {
        const { container } = createFormComponent({
          schema: {
            type: 'number'
          },
          uiSchema
        });

        Simulate.change(container.querySelector('input'), {
          target: { value: '0' }
        });
        expect(container.querySelector('.field input').value).eql('0');
      });

      it('should render customized StringField', () => {
        const CustomStringField = () => <div id="custom" />;

        const { container } = createFormComponent({
          schema: {
            type: 'number'
          },
          uiSchema,
          fields: {
            StringField: CustomStringField
          }
        });

        expect(container.querySelector('#custom')).to.exist;
      });
    }
  });

  describe('SelectWidget', () => {
    it('should render a number field', () => {
      const { container } = createFormComponent({
        schema: {
          type: 'number',
          enum: [1, 2]
        }
      });

      expect(container.querySelectorAll('.field select')).to.have.length.of(1);
    });

    it('should infer the value from an enum on change', () => {
      const spy = vi.fn();
      const { container } = createFormComponent({
        schema: {
          enum: [1, 2]
        },
        onChange: spy
      });

      expect(container.querySelectorAll('.field select')).to.have.length.of(1);
      const $select = container.querySelector('.field select');
      expect($select.value).eql('');

      Simulate.change(container.querySelector('.field select'), {
        target: { value: '1' }
      });
      expect($select.value).eql('1');
      expect(spy.lastCall.args[0].formData).eql(1);
    });

    it('should render a string field with a label', () => {
      const { container } = createFormComponent({
        schema: {
          type: 'number',
          enum: [1, 2],
          title: 'foo'
        }
      });

      expect(container.querySelector('.field label').textContent).eql('foo');
    });

    it('should assign a default value', () => {
      const { onChange } = createFormComponent({
        schema: {
          type: 'number',
          enum: [1, 2],
          default: 1
        },
        noValidate: true
      });

      sinon.assert.calledWithMatch(onChange.lastCall, { formData: 1 });
    });

    it('should handle a change event', () => {
      const { container: container, onChange } = createFormComponent({
        schema: {
          type: 'number',
          enum: [1, 2]
        }
      });

      Simulate.change(container.querySelector('select'), {
        target: { value: '2' }
      });

      sinon.assert.calledWithMatch(onChange.lastCall, { formData: 2 });
    });

    it('should fill field with data', () => {
      const { container: container, onSubmit } = createFormComponent({
        schema: {
          type: 'number',
          enum: [1, 2]
        },
        formData: 2
      });
      submitForm(container);
      sinon.assert.calledWithMatch(onSubmit.lastCall, { formData: 2 });
    });

    it('should render the widget with the expected id', () => {
      const { container } = createFormComponent({
        schema: {
          type: 'number',
          enum: [1, 2]
        }
      });

      expect(container.querySelector('select').id).eql('root');
    });

    it('should render a select element with a blank option, when default value is not set.', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: {
            type: 'number',
            enum: [0]
          }
        }
      };

      const { container } = createFormComponent({
        schema
      });

      const selects = container.querySelectorAll('select');
      expect(selects[0].value).eql('');

      const options = container.querySelectorAll('option');
      expect(options.length).eql(2);
      expect(options[0].innerHTML).eql('');
    });

    it('should render a select element without a blank option, if a default value is set.', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: {
            type: 'number',
            enum: [2],
            default: 2
          }
        }
      };

      const { container } = createFormComponent({
        schema
      });

      const selects = container.querySelectorAll('select');
      expect(selects[0].value).eql('2');

      const options = container.querySelectorAll('option');
      expect(options.length).eql(1);
      expect(options[0].innerHTML).eql('2');
    });

    it('should render a select element without a blank option, if the default value is 0.', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: {
            type: 'number',
            enum: [0],
            default: 0
          }
        }
      };

      const { container } = createFormComponent({
        schema
      });

      const selects = container.querySelectorAll('select');
      expect(selects[0].value).eql('0');

      const options = container.querySelectorAll('option');
      expect(options.length).eql(1);
      expect(options[0].innerHTML).eql('0');
    });
  });
});
