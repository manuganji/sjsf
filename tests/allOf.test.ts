import { expect, describe, beforeEach, afterEach, it } from 'vitest';

import { createFormComponent, createSandbox } from './test_utils';

describe('allOf', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should render a regular input element with a single type, when multiple types specified', () => {
    const schema = {
      type: 'object',
      properties: {
        foo: {
          allOf: [{ type: ['string', 'number', 'null'] }, { type: 'string' }]
        }
      }
    };

    const { container } = createFormComponent({
      schema
    });

    expect(container.querySelectorAll('input')).to.have.length.of(1);
  });

  it('should be able to handle incompatible types and not crash', () => {
    const schema = {
      type: 'object',
      properties: {
        foo: {
          allOf: [{ type: 'string' }, { type: 'boolean' }]
        }
      }
    };

    const { container } = createFormComponent({
      schema
    });

    expect(container.querySelectorAll('input')).to.have.length.of(0);
  });
});
