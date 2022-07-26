import { expect, describe, beforeEach, afterEach, it, vi } from 'vitest';
import { createFormComponent, createSandbox, submitForm } from './test_utils';

describe('NullField', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('No widget', () => {
    it('should render a null field', () => {
      const { container } = createFormComponent({
        schema: {
          type: 'null'
        }
      });

      expect(container.querySelectorAll('.field')).to.have.length.of(1);
    });

    it('should render a null field with a label', () => {
      const { container } = createFormComponent({
        schema: {
          type: 'null',
          title: 'foo'
        }
      });

      expect(container.querySelector('.field label').textContent).eql('foo');
    });

    it('should assign a default value', () => {
      const { onChange } = createFormComponent({
        schema: {
          type: 'null',
          default: null
        }
      });

      sinon.assert.calledWithMatch(onChange.lastCall, { formData: null });
    });

    it('should not overwrite existing data', () => {
      const { container, onSubmit } = createFormComponent({
        schema: {
          type: 'null'
        },
        formData: 3,
        noValidate: true
      });

      submitForm(container);
      sinon.assert.calledWithMatch(onSubmit.lastCall, { formData: 3 });
    });
  });
});
