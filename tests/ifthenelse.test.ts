import { expect, describe, beforeEach, afterEach, it } from 'vitest';

import { createFormComponent, createSandbox } from './test_utils';

describe('conditional items', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  const schema = {
    type: 'object',
    properties: {
      street_address: {
        type: 'string'
      },
      country: {
        enum: ['United States of America', 'Canada']
      }
    },
    if: {
      properties: { country: { const: 'United States of America' } }
    },
    then: {
      properties: { zipcode: { type: 'string' } }
    },
    else: {
      properties: { postal_code: { type: 'string' } }
    }
  };

  const schemaWithRef = {
    type: 'object',
    properties: {
      country: {
        enum: ['United States of America', 'Canada']
      }
    },
    if: {
      properties: {
        country: {
          const: 'United States of America'
        }
      }
    },
    then: {
      $ref: '#/definitions/us'
    },
    else: {
      $ref: '#/definitions/other'
    },
    definitions: {
      us: {
        properties: {
          zip_code: {
            type: 'string'
          }
        }
      },
      other: {
        properties: {
          postal_code: {
            type: 'string'
          }
        }
      }
    }
  };

  it('should render then when condition is true', () => {
    const formData = {
      country: 'United States of America'
    };

    const { container } = createFormComponent({
      schema,
      formData
    });

    expect(container.querySelector('input[label=zipcode]')).not.eql(null);
    expect(container.querySelector('input[label=postal_code]')).to.eql(null);
  });

  it('should render else when condition is false', () => {
    const formData = {
      country: 'France'
    };

    const { container } = createFormComponent({
      schema,
      formData
    });

    expect(container.querySelector('input[label=zipcode]')).to.eql(null);
    expect(container.querySelector('input[label=postal_code]')).not.eql(null);
  });

  it('should render control when data has not been filled in', () => {
    const formData = {};

    const { container } = createFormComponent({
      schema,
      formData
    });

    // An empty formData will make the conditional evaluate to true because no properties are required in the if statement
    // Please see https://github.com/epoberezkin/ajv/issues/913
    expect(container.querySelector('input[label=zipcode]')).not.eql(null);
    expect(container.querySelector('input[label=postal_code]')).to.eql(null);
  });

  it('should render then when condition is true with reference', () => {
    const formData = {
      country: 'United States of America'
    };

    const { container } = createFormComponent({
      schema: schemaWithRef,
      formData
    });

    expect(container.querySelector('input[label=zip_code]')).not.eql(null);
    expect(container.querySelector('input[label=postal_code]')).to.eql(null);
  });

  it('should render else when condition is false with reference', () => {
    const formData = {
      country: 'France'
    };

    const { container } = createFormComponent({
      schema: schemaWithRef,
      formData
    });

    expect(container.querySelector('input[label=zip_code]')).to.eql(null);
    expect(container.querySelector('input[label=postal_code]')).not.eql(null);
  });

  describe('allOf if then else', () => {
    const schemaWithAllOf = {
      type: 'object',
      properties: {
        street_address: {
          type: 'string'
        },
        country: {
          enum: ['United States of America', 'Canada', 'United Kingdom', 'France']
        }
      },
      allOf: [
        {
          if: {
            properties: { country: { const: 'United States of America' } }
          },
          then: {
            properties: { zipcode: { type: 'string' } }
          }
        },
        {
          if: {
            properties: { country: { const: 'United Kingdom' } }
          },
          then: {
            properties: { postcode: { type: 'string' } }
          }
        },
        {
          if: {
            properties: { country: { const: 'France' } }
          },
          then: {
            properties: { telephone: { type: 'string' } }
          }
        }
      ]
    };

    it('should render correctly when condition is true in allOf (1)', () => {
      const formData = {
        country: 'United States of America'
      };

      const { container } = createFormComponent({
        schema: schemaWithAllOf,
        formData
      });

      expect(container.querySelector('input[label=zipcode]')).not.eql(null);
    });

    it('should render correctly when condition is false in allOf (1)', () => {
      const formData = {
        country: ''
      };

      const { container } = createFormComponent({
        schema: schemaWithAllOf,
        formData
      });

      expect(container.querySelector('input[label=zipcode]')).to.eql(null);
    });

    it('should render correctly when condition is true in allof (2)', () => {
      const formData = {
        country: 'United Kingdom'
      };

      const { container } = createFormComponent({
        schema: schemaWithAllOf,
        formData
      });

      expect(container.querySelector('input[label=postcode]')).not.eql(null);
      expect(container.querySelector('input[label=zipcode]')).to.eql(null);
      expect(container.querySelector('input[label=telephone]')).to.eql(null);
    });

    it('should render correctly when condition is true in allof (3)', () => {
      const formData = {
        country: 'France'
      };

      const { container } = createFormComponent({
        schema: schemaWithAllOf,
        formData
      });

      expect(container.querySelector('input[label=postcode]')).to.eql(null);
      expect(container.querySelector('input[label=zipcode]')).to.eql(null);
      expect(container.querySelector('input[label=telephone]')).not.eql(null);
    });

    const schemaWithAllOfRef = {
      type: 'object',
      properties: {
        street_address: {
          type: 'string'
        },
        country: {
          enum: ['United States of America', 'Canada', 'United Kingdom', 'France']
        }
      },
      definitions: {
        unitedkingdom: {
          properties: { postcode: { type: 'string' } }
        }
      },
      allOf: [
        {
          if: {
            properties: { country: { const: 'United Kingdom' } }
          },
          then: {
            $ref: '#/definitions/unitedkingdom'
          }
        }
      ]
    };

    it('should render correctly when condition is true when then contains a reference', () => {
      const formData = {
        country: 'United Kingdom'
      };

      const { container } = createFormComponent({
        schema: schemaWithAllOfRef,
        formData
      });

      expect(container.querySelector('input[label=postcode]')).not.eql(null);
    });
  });

  it('handles additionalProperties with if then else', () => {
    /**
     * Ensures that fields defined in "then" or "else" (e.g. zipcode) are handled
     * with regular form fields, not as additional properties
     */

    const formData = {
      country: 'United States of America',
      zipcode: '12345',
      otherKey: 'otherValue'
    };
    const { container } = createFormComponent({
      schema: {
        ...schema,
        additionalProperties: true
      },
      formData
    });

    // The zipcode field exists, but not as an additional property
    expect(container.querySelector('input[label=zipcode]')).not.eql(null);
    expect(container.querySelector('div.form-additional input[label=zipcode]')).to.eql(null);

    // The "otherKey" field exists as an additional property
    expect(container.querySelector('div.form-additional input[label=otherKey]')).not.eql(null);
  });
});
