// import { expect, describe, beforeEach, afterEach, it, vi } from 'vitest';

import { blurNode, changeValue, createFormComponent, focusNode, submitForm } from './test_utils';
import { fireEvent } from '@testing-library/dom';
import { cleanup, render, type RenderResult } from '@testing-library/svelte';
import type { SvelteComponent } from 'svelte';
import Form from '$lib/components/Form.svelte';
import { omit } from 'lodash-es';

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
      schema,
      value: null
    });
    expect(container.querySelector('label')!.textContent).eql('foo*');
    rerender({
      schema: {
        ...schema,
        type: ['null', schema.type]
      },
      value: null
    });
    expect(container.querySelector('label')!.textContent).eql('foo');
  });

  it('should render a string field with a description', () => {
    const { container } = render(Form, {
      schema: {
        type: 'number',
        description: 'bar'
      },
      value: null
    });
    expect(container.querySelector('input + .description')!.textContent).eql('bar');
  });

  it('value should default to undefined', async () => {
    const { container, onSubmit } = createFormComponent(
      {
        schema: { type: 'number' }
      },
      true
    );

    await submitForm(container.querySelector('form')!);
    expect(container.querySelector('input')?.value).to.eq('');
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('should assign a default value', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'number',
        default: 2
      }
    });

    expect(container.querySelector('input')!.value).eql('2');
  });

  it('should handle a blur event', async () => {
    const { container, onBlur } = createFormComponent(
      {
        schema: {
          type: 'number'
        }
      },
      true
    );

    const input = container.querySelector('input')!;
    await blurNode(input);

    expect(onBlur).toHaveBeenCalledOnce();
    expect(onBlur).lastCalledWith('');
  });

  it('should handle a focus event', () => {
    const { container, onFocus } = createFormComponent(
      {
        schema: {
          type: 'number'
        }
      },
      true
    );

    const input = container.querySelector('input')!;
    focusNode(input);

    expect(onFocus).toHaveBeenCalledOnce();
    expect(onFocus).lastCalledWith('');
  });

  it('should fill field with value', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'number'
      },
      value: 2
    });

    expect(container.querySelector('input')!.value).eql('2');
  });

  it('should normalize values beginning with a decimal point', async () => {
    const { container: container } = createFormComponent({
      schema: {
        type: 'number'
      }
    });

    const $input = container.querySelector('input')!;

    await changeValue($input, '.00');

    expect(container.querySelector('input')!.value).eql('.00');
  });

  it('should update input value correctly when prop changes', () => {
    const schema = {
      type: 'number'
    };

    const { component, container, rerender, debug } = createFormComponent({
      schema,
      value: 2.03
    });

    expect(container.querySelector('input')!.value).eql('2.03');

    rerender({
      schema,
      value: 203
    });

    expect(container.querySelector('input')!.value).eql('203');
  });

  it('should render the widget with the expected id', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'number'
      }
    });

    expect(container.querySelector('input')!.id).eql('input');
  });

  it('should render with trailing zeroes', async () => {
    const { container } = createFormComponent({
      schema: {
        type: 'number'
      }
    });

    const node = container.querySelector('input')!;

    await changeValue(node, '2.0');
    expect(node.value).eql('2.0');

    await changeValue(node, '2.00');
    expect(node.value).eql('2.00');
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
    expect(container.querySelector('input')!.value).eql('0');
  });
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
  beforeEach(() => {
    cleanup();
  });

  it('should render a number field', () => {
    const { container, debug } = createFormComponent({
      schema: {
        type: 'number',
        enum: [1, 2]
      }
    });
    expect(container.querySelectorAll('select')).toHaveLength(1);
  });

  it('should set required', () => {
    const { container, rerender } = createFormComponent({
      schema: {
        title: 'foo',
        type: 'number',
        enum: [1, 2]
      }
    });
    expect(container.querySelector('label')!.textContent).eq('foo*');
    expect(container.querySelector('select')!.required).to.equal(true);

    rerender({
      schema: {
        title: 'foo',
        type: ['number', 'null'],
        enum: [1, 2]
      }
    });
    expect(container.querySelector('label')!.textContent).eq('foo');
    expect(container.querySelector('select')!.required).to.equal(false);
  });

  it('should infer the value from an enum on change', async () => {
    let value;
    const { container } = createFormComponent({
      type: 'number',
      schema: {
        enum: [1, 2]
      },
      value
    });

    expect(container.querySelectorAll('select')).toHaveLength(1);
    expect(value).to.eql(undefined);

    await fireEvent.change(container.querySelector('select')!, {
      target: { value: 2 }
    });
    expect(container.querySelector('select')!.value).to.eq('2');
  });

  it('should render a string field with a label', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'number',
        enum: [1, 2],
        title: 'foo'
      }
    });

    expect(container.querySelector('label')!.textContent).eql('foo*');
  });

  it('should assign a default value', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'number',
        enum: [1, 2],
        default: 1
      }
    });
    expect(container.querySelector('select')!.value).to.eql('1');
  });

  it('should fill field with data', async () => {
    const { container: container, onSubmit } = createFormComponent(
      {
        schema: {
          type: 'number',
          enum: [1, 2]
        },
        value: 2
      },
      true
    );
    await submitForm(container.querySelector('form')!);
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('should render a select element with a blank option, when not required.', () => {
    const schema = {
      type: 'object',
      properties: {
        foo: {
          type: 'number',
          enum: [0]
        }
      },
      required: []
    };

    const { container } = createFormComponent({
      schema
    });

    const selects = container.querySelectorAll('select');
    expect(selects[0].value).eql('null');

    const options = container.querySelectorAll('option');
    expect(options.length).eql(2);
    expect(options[0].innerHTML).eql('');
  });

  it('should render a select element with a blank option, when no required attribute is present', () => {
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
    expect(selects[0].value).eql('null');

    const options = container.querySelectorAll('option');
    expect(options.length).eql(2);
    expect(options[0].innerHTML).eql('');
  });

  it('should render a select element with an unselectable blank option even if required.', async () => {
    const schema = {
      type: 'object',
      properties: {
        foo: {
          type: 'number',
          enum: [2],
          default: 2
        }
      },
      required: ['foo']
    };

    const { container, debug } = await createFormComponent({
      schema
    });

    const selects = container.querySelectorAll('select');
    expect(selects).toHaveLength(1);
    const options = container.querySelectorAll('option');
    expect(options.length).eql(2);
    expect(options[0]).to.have.property('disabled', true);
  });
});
