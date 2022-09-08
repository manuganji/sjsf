// import { expect, describe, beforeEach, afterEach, it, vi } from 'vitest';

import { createFormComponent, submitForm } from './test_utils';
import { fireEvent } from '@testing-library/dom';
import { cleanup, render, type RenderResult } from '@testing-library/svelte';
import type { SvelteComponent } from 'svelte';
import Form from '$lib/components/Form.svelte';

describe('Number input', () => {
  beforeEach(() => {
    cleanup();
  });

  const attributeCases = [
    {
      schema: {
        type: 'number',
        multipleOf: 5
      },
      attr: 'step',
      value: '5'
    },
    {
      schema: {
        type: 'number',
        minimum: 0
      },
      attr: 'min',
      value: '0'
    },
    {
      schema: {
        type: 'number',
        maximum: 100
      },
      attr: 'max',
      value: '100'
    }
  ];

  attributeCases.forEach(function (value, index) {
    it(`case ${index} ${JSON.stringify(value.schema)}, ${value.attr}: ${value.value}`, () => {
      const { container } = createFormComponent({
        schema: value.schema
      });
      expect(container.querySelectorAll(`input`)!).toHaveLength(1);
      expect(container.querySelector(`input`)!.getAttribute(value.attr)).to.eql(value.value);
    });
  });

  it('should render a string field with a label', () => {
    const schema = {
      type: 'number',
      title: 'foo'
    };
    const { container, rerender } = render(Form, {
      props: {
        id: 'b1',
        schema
      }
    });
    expect(container.querySelector('#b1 label')!.textContent).eql('foo*');
    rerender({
      id: 'b1',
      schema: {
        ...schema,
        type: ['null', schema.type]
      }
    });
    expect(container.querySelector('#b1 label')!.textContent).eql('foo');
  });

  it('should render a string field with a description', () => {
    const { container } = render(Form, {
      props: {
        id: 'b2',
        schema: {
          type: 'number',
          description: 'bar'
        }
      }
    });
    expect(container.querySelector('#b2 input + .description')!.textContent).eql('bar');
  });

  it('formData should default to undefined', () => {
    const { container } = render(Form, {
      props: {
        id: 'b2',
        schema: { type: 'number' }
      }
    });

    submitForm(container);
    expect(onSubmit.mock.lastCall).toEqual({
      formData: undefined
    });
  });

  it('should assign a default value', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'number',
        default: 2
      }
    });

    expect(container.querySelector('.field input')!.value).eql('2');
  });

  it('should handle a change event', () => {
    const { container: container, onChange } = createFormComponent({
      schema: {
        type: 'number'
      }
    });

    fireEvent.change(container.querySelector('input')!, {
      target: { value: '2' }
    });

    expect(onChange.mock.lastCall).toEqual({
      formData: 2
    });
  });

  it('should handle a blur event', () => {
    const onBlur = vi.fn();
    const { container } = createFormComponent({
      schema: {
        type: 'number'
      },
      onBlur
    });

    const input = container.querySelector('input')!;
    fireEvent.blur(input, {
      target: { value: '2' }
    });

    expect(onBlur.calledWith(input.id, 2));
  });

  it('should handle a focus event', () => {
    const onFocus = vi.fn();
    const { container } = createFormComponent({
      schema: {
        type: 'number'
      },
      onFocus
    });

    const input = container.querySelector('input')!;
    fireEvent.focus(input, {
      target: { value: '2' }
    });

    expect(onFocus.calledWith(input.id, 2));
  });

  it('should fill field with data', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'number'
      },
      formData: 2
    });

    expect(container.querySelector('.field input')!.value).eql('2');
  });

  describe('when inputting a number that ends with a dot and/or zero it should normalize it, without changing the input value', () => {
    const { container, onChange } = createFormComponent({
      schema: {
        type: 'number'
      }
    });

    const $input = container.querySelector('input')!;

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
        fireEvent.change($input, {
          target: { value: test.input }
        });

        expect(onChange.mock.lastCall).toEqual({
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
      }
    });

    const $input = container.querySelector('input')!;

    fireEvent.change($input, {
      target: { value: '.00' }
    });

    expect(onChange.mock.lastCall).toEqual({
      formData: 0
    });
    expect($input.value).eql('.00');
  });

  it('should update input values correctly when formData prop changes', () => {
    const schema = {
      type: 'number'
    };

    const {
      component: comp,
      container: container,
      rerender
    } = createFormComponent({
      schema,
      formData: 2.03
    });

    const $input = container.querySelector('input')!;

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
      }
    });

    expect(container.querySelector('input')!.id).eql('root');
  });

  it('should render with trailing zeroes', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'number'
      }
    });

    fireEvent.change(container.querySelector('input')!, {
      target: { value: '2.' }
    });
    // "2." is not really a valid number in a input field of type number
    // so we need to use getAttribute("value") instead since .value outputs the empty string
    expect(container.querySelector('.field input')!.getAttribute('value')).eql('2.');

    fireEvent.change(container.querySelector('input')!, {
      target: { value: '2.0' }
    });
    expect(container.querySelector('.field input')!.value).eql('2.0');

    fireEvent.change(container.querySelector('input')!, {
      target: { value: '2.00' }
    });
    expect(container.querySelector('.field input')!.value).eql('2.00');

    fireEvent.change(container.querySelector('input')!, {
      target: { value: '2.000' }
    });
    expect(container.querySelector('.field input')!.value).eql('2.000');
  });

  it('should allow a zero to be input', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'number'
      }
    });

    fireEvent.change(container.querySelector('input')!, {
      target: { value: '0' }
    });
    expect(container.querySelector('.field input')!.value).eql('0');
  });

  // it('should render customized StringField', () => {
  //   const CustomStringField = () => <div id="custom" />;

  //   const { container } = createFormComponent({
  //     schema: {
  //       type: 'number'
  //     },
  //     uiSchema,
  //     fields: {
  //       StringField: CustomStringField
  //     }
  //   });

  //   expect(container.querySelector('#custom')).to.exist;
  // });
});

describe('Should handle a float/undefined multipleOf incase of an integer schema', () => {
  const cases: Array<number | [number, number] | [undefined, number]> = [
    2.03,
    2.52,
    [0.1, 1],
    3,
    [-1, 1],
    [undefined, 1]
  ];

  beforeEach(() => {
    cleanup();
  });

  cases.forEach(function (item, index) {
    it(`${Array.isArray(item) ? item[0] : item}`, () => {
      const { container } = createFormComponent({
        schema: {
          type: 'integer',
          multipleOf: Array.isArray(item) ? item[0] : item
        }
      });
      expect(container.querySelector(`input`)!.getAttribute('step')).to.eql(
        Math.round(Array.isArray(item) ? item[1] : item).toString()
      );
    });
  });
});

describe('Should handle a float/undefined multipleOf for a number schema', () => {
  const cases: Array<number | [number, number] | [undefined, null]> = [
    2.52,
    0.1,
    3,
    [-0.1, 0.1],
    [-1, 1],
    [undefined, null]
  ];

  beforeEach(() => {
    cleanup();
  });

  cases.forEach(function (item, index) {
    it(`${Array.isArray(item) ? item[0] : item}`, () => {
      const { container } = createFormComponent({
        schema: {
          type: 'number',
          multipleOf: Array.isArray(item) ? item[0] : item
        }
      });
      expect(container.querySelector(`input`)!.getAttribute('step')).to.eql(
        Array.isArray(item) ? (item[1] ? item[1].toString() : item[1]) : item.toString()
      );
    });
  });
});

describe('With enum', () => {
  it('should render a number field', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'number',
        enum: [1, 2]
      }
    });

    expect(container.querySelectorAll('select')).toHaveLength(1);
  });

  it('should infer the value from an enum on change', () => {
    const spy = vi.fn();
    const { container } = createFormComponent({
      schema: {
        enum: [1, 2]
      },
      onChange: spy
    });

    expect(container.querySelectorAll('.field select')).toHaveLength(1);
    const $select = container.querySelector('.field select')!;
    expect($select.value).eql('');

    fireEvent.change(container.querySelector('.field select')!, {
      target: { value: '1' }
    });
    expect($select.value).eql('1');
    expect(spy.mock.lastCall!['formData']).eql(1);
  });

  it('should render a string field with a label', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'number',
        enum: [1, 2],
        title: 'foo'
      }
    });

    expect(container.querySelector('.field label')!.textContent).eql('foo');
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

    expect(onChange.mock.lastCall).toEqual({ formData: 1 });
  });

  it('should handle a change event', () => {
    const { container: container, onChange } = createFormComponent({
      schema: {
        type: 'number',
        enum: [1, 2]
      }
    });

    fireEvent.change(container.querySelector('select')!, {
      target: { value: '2' }
    });

    expect(onChange.mock.lastCall).toEqual({ formData: 2 });
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
    expect(onSubmit.mock.lastCall).toEqual({ formData: 2 });
  });

  it('should render the widget with the expected id', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'number',
        enum: [1, 2]
      }
    });

    expect(container.querySelector('select')!.id).eql('root');
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
