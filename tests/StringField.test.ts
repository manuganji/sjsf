import { expect, describe, beforeEach, afterEach, it, vi } from 'vitest';

// import { parseDateString, toDateString, utcToLocal } from '../src/utils';
import { blurNode, changeValue, createFormComponent, focusNode, submitForm } from './test_utils';
import { act, cleanup, fireEvent } from '@testing-library/svelte';

describe('TextWidget', () => {
  beforeEach(() => {
    cleanup();
  });
  it('should render a string field', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string'
      }
    });

    expect(container.querySelectorAll('input[type=text]')).toHaveLength(1);
  });

  it('should render a string field with a label', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        title: 'foo'
      }
    });

    expect(container.querySelector('label')!.textContent).eql('foo*');
  });

  it('should render a string field with a description', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        description: 'bar'
      }
    });

    expect(container.querySelector('.description')!.textContent).eql('bar');
  });

  it('should assign a default value', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        default: 'plop'
      }
    });

    expect(container.querySelector('input')!.value).eql('plop');
    expect(container.querySelectorAll('datalist > option')).toHaveLength(0);
  });

  it('should render a string field with examples', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        examples: ['Firefox', 'Chrome', 'Vivaldi']
      }
    });

    expect(container.querySelectorAll('datalist > option')).toHaveLength(3);
    const datalistId = container.querySelector('datalist')?.id;
    expect(container.querySelector('input')?.getAttribute('list')).eql(datalistId);
  });

  it('should render a string with examples that includes the default value', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        default: 'Firefox',
        examples: ['Chrome', 'Vivaldi']
      }
    });
    expect(container.querySelectorAll('datalist > option')).toHaveLength(3);
    const datalistId = container.querySelector('datalist')?.id;
    expect(container.querySelector('input')?.getAttribute('list')).eql(datalistId);
  });

  it('should render a string with examples that overlaps with the default value', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        default: 'Firefox',
        examples: ['Firefox', 'Chrome', 'Vivaldi']
      }
    });
    expect(container.querySelectorAll('datalist > option')).toHaveLength(3);
    const datalistId = container.querySelector('datalist')?.id;
    expect(container.querySelector('input')?.getAttribute('list')).eql(datalistId);
  });

  it('should default submit value to undefined', async () => {
    const { container, onSubmit } = createFormComponent(
      {
        schema: { type: ['string', 'null'] }
      },
      true
    );
    await submitForm(container.querySelector('form')!);

    expect(onSubmit).toHaveBeenCalledOnce();
    const fd = new FormData(container.querySelector('form')!);
    expect(fd.values().next().value).toBeUndefined();
  });

  it('should handle a change event', async () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string'
      }
    });

    await changeValue(container.querySelector('input')!, 'yo');

    expect(container.querySelector('input')!.value).toEqual('yo');
  });

  it('should handle a blur event', async () => {
    const { container, onBlur } = createFormComponent(
      {
        schema: {
          type: 'string'
        }
      },
      true
    );
    const input = container.querySelector('input')!;
    await blurNode(input);
    expect(onBlur).toHaveBeenCalledWith('');
  });

  it('should handle a focus event', async () => {
    const { container, onFocus } = createFormComponent(
      {
        schema: {
          type: 'string'
        }
      },
      true
    );
    const input = container.querySelector('input')!;
    await focusNode(input);
    expect(onFocus).toHaveBeenCalledWith('');
  });

  it('should handle an empty string change event with defaults set', async () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        default: 'a'
      }
    });

    await changeValue(container.querySelector('input')!, '');
    expect(container.querySelector('input')!.value).toEqual('');
  });

  it('should fill field with data', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string'
      },
      value: 'plip'
    });

    expect(container.querySelector('input')?.value).eql('plip');
  });

  it('should render customized TextWidget', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string'
      },
      widgets: {
        TextWidget: CustomWidget
      }
    });

    expect(container.querySelector('#custom')).to.exist;
  });

  it('should set placeholder if present', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        ctx: {
          placeholder: 'foo'
        }
      }
    });

    expect(container.querySelector('input')?.getAttribute('placeholder')).eql('foo');
  });
  it('should create and set autocomplete attribute', () => {
    const { container } = createFormComponent({
      schema: { type: 'string', ctx: { autocomplete: 'family-name' } }
    });

    expect(container.querySelector('input')!.getAttribute('autocomplete')).eql('family-name');
  });
});

describe('SelectWidget', () => {
  beforeEach(() => {
    cleanup();
  });
  it('should render a string field', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        enum: ['foo', 'bar']
      }
    });

    expect(container.querySelectorAll('select')).toHaveLength(1);
  });

  it('should render a string field for an enum without a type', () => {
    const { container } = createFormComponent({
      schema: {
        enum: ['foo', 'bar']
      }
    });

    expect(container.querySelectorAll('select')).toHaveLength(1);
  });

  it('should render a string field with a label', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        enum: ['foo', 'bar'],
        title: 'foo'
      }
    });

    expect(container.querySelector('label')?.textContent).eql('foo*');
  });

  it('should render an unselectable placeholder', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        enum: ['foo', 'bar'],
        ctx: {
          placeholder: 'Test'
        }
      }
    });

    expect(container.querySelectorAll('option')).toHaveLength(3);
    expect(container.querySelector('option')).to.have.property('hidden', true);
  });

  it("shouldn't render empty option", () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        enum: ['foo', 'bar']
      }
    });

    expect(container.querySelectorAll('option')).toHaveLength(2);
  });

  it('should render empty option', () => {
    const { container } = createFormComponent({
      schema: {
        type: ['string', 'null'],
        enum: ['foo', 'bar']
      }
    });

    expect(container.querySelectorAll('option')[0].value).to.eq('null');
    expect(container.querySelectorAll('option')).toHaveLength(3);
  });

  it('should render empty option with placeholder text', () => {
    const { container } = createFormComponent({
      schema: {
        type: ['string', 'null'],
        enum: ['foo', 'bar'],
        ctx: {
          placeholder: 'Test'
        }
      }
    });

    expect(container.querySelectorAll('option')[0].textContent).eql('Test');
  });

  it('should assign a default value', async () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        enum: ['foo', 'bar'],
        default: 'bar'
      }
    });
    expect(container.querySelector('select')?.value).to.eq('bar');
  });

  it('should reflect the change in the change event', async () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        enum: ['foo', 'bar'],
        default: 'foo'
      }
    });

    await changeValue(container.querySelector('select')!, 'bar');
    expect(container.querySelector('select')?.value).to.eq('bar');
  });

  it('should reflect null in change event if empty option selected', async () => {
    const { container } = createFormComponent({
      schema: {
        type: ['string', 'null'],
        enum: ['foo', 'bar']
      }
    });

    await act(function () {
      fireEvent.click(container.querySelectorAll('option')[0]!);
    });
    expect(container.querySelector('select')?.value).to.eq('null');
  });

  it('should fill field with data', () => {
    const { container, onSubmit } = createFormComponent({
      schema: {
        type: 'string',
        enum: ['foo', 'bar']
      },
      formData: 'bar'
    });
    submitForm(container);

    expect(onSubmit.mock.lastCall).toEqual({
      formData: 'bar'
    });
  });

  it('should render the widget with the expected id', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        enum: ['a', 'b']
      }
    });

    expect(container.querySelector('select')!.id).eql('root');
  });

  it('should render customized SelectWidget', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        enum: []
      },
      widgets: {
        SelectWidget: CustomWidget
      }
    });

    expect(container.querySelector('#custom')).to.exist;
  });

  it("should render a select element with first option 'false' if the default value is false", () => {
    const schema = {
      type: 'object',
      properties: {
        foo: {
          type: 'string',
          enum: [false, true],
          default: false
        }
      }
    };

    const { container } = createFormComponent({
      schema
    });

    const options = container.querySelectorAll('option');
    expect(options[0].innerHTML).eql('false');
    expect(options.length).eql(2);
  });

  it("should render a select element and the option's length is equal the enum's length, if set the enum and the default value is empty.", () => {
    const schema = {
      type: 'object',
      properties: {
        foo: {
          type: 'string',
          enum: ['', '1'],
          default: ''
        }
      }
    };

    const { container } = createFormComponent({
      schema
    });

    const options = container.querySelectorAll('option');
    expect(options[0].innerHTML).eql('');
    expect(options.length).eql(2);
  });

  it('should render only one empty option when the default value is empty.', () => {
    const schema = {
      type: 'object',
      properties: {
        foo: {
          type: 'string',
          enum: [''],
          default: ''
        }
      }
    };

    const { container } = createFormComponent({
      schema
    });

    const options = container.querySelectorAll('option');
    expect(options[0].innerHTML).eql('');
    expect(options.length).eql(1);
  });
});

describe('TextareaWidget', () => {
  beforeEach(() => {
    cleanup();
  });
  it('should handle an empty string change event', async () => {
    const { container } = createFormComponent({
      schema: { type: 'string', default: 'x', widget: 'textarea' }
    });

    expect(container.querySelectorAll('textarea')).toHaveLength(1);
    expect(container.querySelector('textarea')?.value).to.eql('x');
    changeValue(container.querySelector('textarea')!, '');
    expect(container.querySelector('textarea')?.value).to.eql('');
  });

  it('should render a textarea field with rows', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        widget: 'textarea',
        ctx: {
          rows: 20
        }
      },
      value: 'x'
    });

    expect(container.querySelector('textarea')).to.have.property('rows', 20);
  });
});

describe('DateTimeWidget', () => {
  beforeEach(() => {
    cleanup();
  });
  it('should render an datetime-local field', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        format: 'date-time'
      }
    });

    expect(container.querySelectorAll('[type=datetime-local]')).toHaveLength(1);
  });

  it('should assign a default value', () => {
    const datetime = new Date().toJSON();
    const { container, onSubmit } = createFormComponent({
      schema: {
        type: 'string',
        format: 'date-time',
        default: datetime
      }
    });
    submitForm(container);
    expect(onSubmit.mock.lastCall).toEqual({
      formData: datetime
    });
  });

  it('should reflect the change into the dom', async () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        format: 'date-time'
      }
    });

    const newDatetime = new Date().toJSON();
    await changeValue(container.querySelector('[type=datetime-local]')!, newDatetime);
    expect(container.querySelector('[type=datetime-local]')?.value).eql(utcToLocal(newDatetime));
  });

  it('should fill field with data', () => {
    const datetime = new Date().toJSON();
    const { container, onSubmit } = createFormComponent({
      schema: {
        type: 'string',
        format: 'date-time'
      },
      formData: datetime
    });
    submitForm(container);
    expect(onSubmit.mock.lastCall).toEqual({
      formData: datetime
    });
  });

  it('should reject an invalid entered datetime', async () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        format: 'date-time'
      },
      liveValidate: true
    });

    changeValue(container.querySelector('[type=datetime-local]')!, 'invalid');

    expect(onChange.mock.lastCall).toEqual({
      errorSchema: { __errors: ['should be string'] },
      errors: [
        {
          message: 'should be string',
          name: 'type',
          params: { type: 'string' },
          property: '',
          schemaPath: '#/type',
          stack: 'should be string'
        }
      ]
    });
  });

  it('should render customized DateTimeWidget', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        format: 'date-time'
      },
      widgets: {
        DateTimeWidget: CustomWidget
      }
    });

    expect(container.querySelector('#custom')).to.exist;
  });

  it('should allow overriding of BaseInput', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        format: 'date-time'
      },
      widgets: {
        BaseInput: CustomWidget
      }
    });

    expect(container.querySelector('#custom')).to.exist;
  });
});

describe('DateWidget', () => {
  beforeEach(() => {
    cleanup();
  });

  it('should render a date field', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        format: 'date'
      }
    });

    expect(container.querySelectorAll('[type=date]')).toHaveLength(1);
  });

  it('should assign a default value', async () => {
    const datetime = new Date().toJSON();
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        format: 'date',
        default: datetime
      }
    });
    const fd = new FormData(container.querySelector('form')!);
    expect(fd.values().next()).toEqual(datetime);
  });

  it('should reflect the change into the dom', async () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        format: 'date'
      }
    });

    const newDatetime = '2012-12-12';

    await changeValue(container.querySelector('[type=date]')!, newDatetime);

    expect(container.querySelector('[type=date]').value)
      // XXX import and use conversion helper
      .eql(newDatetime.slice(0, 10));
  });

  it('should fill field with data', () => {
    const datetime = new Date().toJSON();
    const { container, onSubmit } = createFormComponent({
      schema: {
        type: 'string',
        format: 'date'
      },
      formData: datetime,
      noValidate: true
    });
    submitForm(container);
    expect(onSubmit.mock.lastCall).toEqual({
      formData: datetime
    });
  });

  it('should accept a valid entered date', async () => {
    const { container, onError } = createFormComponent({
      schema: {
        type: 'string',
        format: 'date'
      }
    }, true);

    await changeValue(container.querySelector('[type=date]')!, '2012-12-12');
    expect(onError).not.toHaveBeenCalled();
    expect(container.querySelector<HTMLInputElement>('[type=date]')!.value).to.eq('2012-12-12');
  });

  it('should reject an invalid entered date', async () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        format: 'date'
      },
    });

    await changeValue(container.querySelector('[type=date]')!, 'invalid');

    expect(onChange.mock.lastCall).toEqual({
      errorSchema: { __errors: ['should match format "date"'] },
      errors: [
        {
          message: 'should match format "date"',
          name: 'format',
          params: { format: 'date' },
          property: '',
          schemaPath: '#/format',
          stack: 'should match format "date"'
        }
      ]
    });
  });

  it('should render customized DateWidget', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        format: 'date'
      },
      widgets: {
        DateWidget: CustomWidget
      }
    });

    expect(container.querySelector('#custom')).to.exist;
  });

  it('should allow overriding of BaseInput', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        format: 'date'
      },
      widgets: {
        BaseInput: CustomWidget
      }
    });

    expect(container.querySelector('#custom')).to.exist;
  });
});

describe('EmailWidget', () => {
  beforeEach(() => {
    cleanup();
  });
  it('should render an email field', () => {
    const { container, debug } = createFormComponent({
      schema: {
        type: 'string',
        format: 'email'
      }
    });
    debug();
    expect(container.querySelector('input')).to.have.property('type', 'email');
  });

  it('should render a string field with a label', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        format: 'email',
        title: 'foo'
      }
    });

    expect(container.querySelector('label')?.textContent).eql('foo*');
  });

  it('should render a select field with a description', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        format: 'email',
        description: 'baz'
      }
    });

    expect(container.querySelector('.description')?.textContent).eql('baz');
  });

  it('should assign a default value', () => {
    const email = 'foo@bar.baz';
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        format: 'email',
        default: email
      }
    });

    const fd = new FormData(container.querySelector('form')!);

    expect(fd.values().next().value).to.eq(email);
  });

  it('should reject an invalid entered email', async () => {
    let errors;
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        format: 'email'
      },
      errors
    });

    changeValue(container.querySelector('input')!, 'invalid');

    expect(errors).toEqual({
      errorSchema: { __errors: ['should match format "email"'] },
      errors: [
        {
          message: 'should match format "email"',
          name: 'format',
          params: { format: 'email' },
          property: '',
          schemaPath: '#/format',
          stack: 'should match format "email"'
        }
      ]
    });
  });

  it('should render customized EmailWidget', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        format: 'email'
      },
      widgets: {
        EmailWidget: CustomWidget
      }
    });

    expect(container.querySelector('#custom')).to.exist;
  });
});

describe('URLWidget', () => {
  beforeEach(() => {
    cleanup();
  });
  it('should render an url field', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        format: 'uri'
      }
    });

    expect(container.querySelectorAll('[type=url]')).toHaveLength(1);
  });

  it('should render a string field with a label', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        format: 'uri',
        title: 'foo'
      }
    });

    expect(container.querySelector('label')?.textContent).eql('foo*');
  });

  it('should render a select field with a placeholder', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        format: 'uri',
        description: 'baz'
      }
    });

    expect(container.querySelector('description')?.textContent).eql('baz');
  });

  it('should assign a default value', () => {
    const url = 'http://foo.bar/baz';
    const { container, onSubmit } = createFormComponent({
      schema: {
        type: 'string',
        format: 'uri',
        default: url
      }
    });

    submitForm(container);

    expect(onSubmit.mock.lastCall).toEqual({
      formData: url
    });
  });

  it('should fill field with data', () => {
    const url = 'http://foo.bar/baz';
    const { container, onSubmit } = createFormComponent({
      schema: {
        type: 'string',
        format: 'uri'
      },
      formData: url
    });

    submitForm(container);

    expect(onSubmit.mock.lastCall).toEqual({
      formData: url
    });
  });

  it('should render the widget with the expected id', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        format: 'uri'
      }
    });

    expect(container.querySelector('[type=url]').id).eql('root');
  });

  it('should reject an invalid entered url', async () => {
    const { container, onChange } = createFormComponent({
      schema: {
        type: 'string',
        format: 'uri'
      },
      liveValidate: true
    });
    await changeValue(container.querySelector('[type=url]')!, 'invalid');

    expect(onChange.mock.lastCall).toEqual({
      errorSchema: { __errors: ['should match format "uri"'] },
      errors: [
        {
          message: 'should match format "uri"',
          name: 'format',
          params: { format: 'uri' },
          property: '',
          schemaPath: '#/format',
          stack: 'should match format "uri"'
        }
      ]
    });
  });

  it('should render customized URLWidget', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        format: 'uri'
      },
      widgets: {
        URLWidget: CustomWidget
      }
    });

    expect(container.querySelector('#custom')).to.exist;
  });
});

describe('ColorWidget', () => {
  beforeEach(() => {
    cleanup();
  });
  const color = '#123456';

  it('should render a color field', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        format: 'color'
      }
    });

    expect(container.querySelectorAll('[type=color]')).toHaveLength(1);
  });

  it('should assign a default value', () => {
    const { container, onSubmit } = createFormComponent({
      schema: {
        type: 'string',
        format: 'color',
        default: color
      }
    });
    submitForm(container);
    expect(container.querySelector<HTMLInputElement>('[type=color]')?.value).to.eq(color);
  });

  it('should reflect the change into the dom', async () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        format: 'color'
      }
    });

    const newColor = '#654321';

    await changeValue(container.querySelector('[type=color]')!, newColor);

    expect(container.querySelector<HTMLInputElement>('[type=color]')?.value).eql(newColor);
  });

  it('should fill field with data', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        format: 'color'
      },
      value: color
    });
    submitForm(container);

    expect(container.querySelector<HTMLInputElement>('[type=color]')?.value).to.eq(color);
  });

  it('should reject an invalid entered color', async () => {
    const { container, onChange } = createFormComponent({
      schema: {
        type: 'string',
        format: 'color'
      }
    });

    await changeValue(container.querySelector('[type=color]')!, 'invalid');

    expect(onChange.mock.lastCall).toEqual({
      errorSchema: { __errors: ['should match format "color"'] },
      errors: [
        {
          message: 'should match format "color"',
          name: 'format',
          params: { format: 'color' },
          property: '',
          schemaPath: '#/format',
          stack: 'should match format "color"'
        }
      ]
    });
  });

  it('should render customized ColorWidget', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        format: 'color'
      },
      widgets: {
        ColorWidget: CustomWidget
      }
    });

    expect(container.querySelector('#custom')).to.exist;
  });
});

describe('FileWidget', () => {
  beforeEach(() => {
    cleanup();
  });
  const initialValue = 'data:text/plain;name=file1.txt;base64,dGVzdDE=';

  it('should render a file field', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        format: 'data-url'
      }
    });

    expect(container.querySelectorAll('[type=file]')).toHaveLength(1);
  });

  it('should assign a default value', () => {
    const { container, onSubmit } = createFormComponent({
      schema: {
        type: 'string',
        format: 'data-url',
        default: initialValue
      }
    });
    submitForm(container);

    expect(onSubmit.mock.lastCall).toEqual({
      formData: initialValue
    });
  });

  it('should reflect the change into the dom', async () => {
    sandbox.stub(window, 'FileReader').returns({
      set onload(fn) {
        fn({ target: { result: 'data:text/plain;base64,x=' } });
      },
      readAsDataUrl() {}
    });

    const { container, onChange } = createFormComponent({
      schema: {
        type: 'string',
        format: 'data-url'
      }
    });

    fireEvent.change(container.querySelector('[type=file]')!, {
      target: {
        files: [{ name: 'file1.txt', size: 1, type: 'type' }]
      }
    });

    await new Promise(setImmediate);

    expect(onChange.mock.lastCall).toEqual({
      formData: 'data:text/plain;name=file1.txt;base64,x='
    });
  });

  it('should encode file name with encodeURIComponent', async () => {
    const nonUriEncodedValue = 'fileáéí óú1.txt';
    const uriEncodedValue = 'file%C3%A1%C3%A9%C3%AD%20%C3%B3%C3%BA1.txt';

    sandbox.stub(window, 'FileReader').returns({
      set onload(fn) {
        fn({ target: { result: 'data:text/plain;base64,x=' } });
      },
      readAsDataUrl() {}
    });

    const { container, onChange } = createFormComponent({
      schema: {
        type: 'string',
        format: 'data-url'
      }
    });

    fireEvent.change(container.querySelector('[type=file]')!, {
      target: {
        files: [{ name: nonUriEncodedValue, size: 1, type: 'type' }]
      }
    });

    await new Promise(setImmediate);

    expect(onChange.mock.lastCall).toEqual({
      formData: 'data:text/plain;name=' + uriEncodedValue + ';base64,x='
    });
  });

  it('should render the widget with the expected id', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        format: 'data-url'
      },
      uiSchema: {
        'ui:options': { accept: '.pdf' }
      }
    });

    expect(container.querySelector('[type=file]').accept).eql('.pdf');
  });

  it('should render the file widget with accept attribute', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        format: 'data-url'
      }
    });

    expect(container.querySelector('[type=file]').id).eql('root');
  });

  it('should render customized FileWidget', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'string',
        format: 'data-url'
      },
      widgets: {
        FileWidget: CustomWidget
      }
    });

    expect(container.querySelector('#custom')).to.exist;
  });
});

describe('UpDownWidget', () => {
  beforeEach(() => {
    cleanup();
  });
  it('should allow overriding of BaseInput', () => {
    const { container } = createFormComponent({
      schema: {
        type: 'number',
        format: 'updown'
      },
      widgets: {
        BaseInput: CustomWidget
      }
    });

    expect(container.querySelector('#custom')).to.exist;
  });
});
