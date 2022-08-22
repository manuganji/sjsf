import { expect, describe, beforeEach, afterEach, it, vi } from 'vitest';

import { withTheme } from '../src';
import { createComponent, createSandbox } from './test_utils';

const WrapperClassComponent = (...args) => {
  return class extends Component {
    render() {
      const Cmp = withTheme(...args);
      return <Cmp {...this.props} />;
    }
  };
};

describe('withTheme', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('With fields', () => {
    it('should use the withTheme field', () => {
      const fields = {
        StringField() {
          return <div className="string-field" />;
        }
      };
      const schema = {
        type: 'object',
        properties: {
          fieldA: {
            type: 'string'
          },
          fieldB: {
            type: 'string'
          }
        }
      };
      const uiSchema = {};
      let { container } = createComponent(WrapperClassComponent({ fields }), {
        schema,
        uiSchema
      });
      expect(container.querySelectorAll('.string-field')).toHaveLength((2));
    });

    it('should use withTheme field and the user defined field', () => {
      const themeFields = {
        StringField() {
          return <div className="string-field" />;
        }
      };
      const userFields = {
        NumberField() {
          return <div className="number-field" />;
        }
      };
      const schema = {
        type: 'object',
        properties: {
          fieldA: {
            type: 'string'
          },
          fieldB: {
            type: 'number'
          }
        }
      };
      const uiSchema = {};
      let { container } = createComponent(WrapperClassComponent({ fields: themeFields }), {
        schema,
        uiSchema,
        fields: userFields
      });
      expect(container.querySelectorAll('.string-field')).toHaveLength((1));
      expect(container.querySelectorAll('.number-field')).toHaveLength((1));
    });

    it('should use only the user defined field', () => {
      const themeFields = {
        StringField() {
          return <div className="string-field" />;
        }
      };
      const userFields = {
        StringField() {
          return <div className="form-control" />;
        }
      };
      const schema = {
        type: 'object',
        properties: {
          fieldA: {
            type: 'string'
          },
          fieldB: {
            type: 'string'
          }
        }
      };
      const uiSchema = {};
      let { container } = createComponent(WrapperClassComponent({ fields: themeFields }), {
        schema,
        uiSchema,
        fields: userFields
      });
      expect(container.querySelectorAll('.string-field')).toHaveLength((0));
      expect(container.querySelectorAll('.form-control')).toHaveLength((2));
    });
  });

  describe('With widgets', () => {
    it('should use the withTheme widget', () => {
      const widgets = {
        TextWidget: () => <div id="test" />
      };
      const schema = {
        type: 'string'
      };
      const uiSchema = {};
      let { container } = createComponent(WrapperClassComponent({ widgets }), {
        schema,
        uiSchema
      });
      expect(container.querySelectorAll('#test')).toHaveLength((1));
    });

    it('should use the withTheme widget as well as user defined widget', () => {
      const themeWidgets = {
        TextWidget: () => <div id="test-theme-widget" />
      };
      const userWidgets = {
        DateWidget: () => <div id="test-user-widget" />
      };
      const schema = {
        type: 'object',
        properties: {
          fieldA: {
            type: 'string'
          },
          fieldB: {
            format: 'date',
            type: 'string'
          }
        }
      };
      const uiSchema = {};
      let { container } = createComponent(WrapperClassComponent({ widgets: themeWidgets }), {
        schema,
        uiSchema,
        widgets: userWidgets
      });
      expect(container.querySelectorAll('#test-theme-widget')).toHaveLength((1));
      expect(container.querySelectorAll('#test-user-widget')).toHaveLength((1));
    });

    it('should use only the user defined widget', () => {
      const themeWidgets = {
        TextWidget: () => <div id="test-theme-widget" />
      };
      const userWidgets = {
        TextWidget: () => <div id="test-user-widget" />
      };
      const schema = {
        type: 'object',
        properties: {
          fieldA: {
            type: 'string'
          }
        }
      };
      const uiSchema = {};
      let { container } = createComponent(WrapperClassComponent({ widgets: themeWidgets }), {
        schema,
        uiSchema,
        widgets: userWidgets
      });
      expect(container.querySelectorAll('#test-theme-widget')).toHaveLength((0));
      expect(container.querySelectorAll('#test-user-widget')).toHaveLength((1));
    });
  });

  describe('With templates', () => {
    it('should use the withTheme template', () => {
      const themeTemplates = {
        FieldTemplate() {
          return <div className="with-theme-field-template" />;
        }
      };
      const schema = {
        type: 'object',
        properties: {
          fieldA: {
            type: 'string'
          },
          fieldB: {
            type: 'string'
          }
        }
      };
      const uiSchema = {};
      let { container } = createComponent(WrapperClassComponent({ ...themeTemplates }), {
        schema,
        uiSchema
      });
      expect(container.querySelectorAll('.with-theme-field-template')).toHaveLength((1));
    });

    it('should use only the user defined template', () => {
      const themeTemplates = {
        FieldTemplate() {
          return <div className="with-theme-field-template" />;
        }
      };
      const userTemplates = {
        FieldTemplate() {
          return <div className="user-field-template" />;
        }
      };

      const schema = {
        type: 'object',
        properties: { foo: { type: 'string' }, bar: { type: 'string' } }
      };
      let { container } = createComponent(WrapperClassComponent({ ...themeTemplates }), {
        schema,
        ...userTemplates
      });
      expect(container.querySelectorAll('.with-theme-field-template')).toHaveLength((0));
      expect(container.querySelectorAll('.user-field-template')).toHaveLength((1));
    });

    it('should forward the ref', () => {
      const ref = createRef();
      const schema = {};
      const uiSchema = {};

      createComponent(withTheme({}), {
        schema,
        uiSchema,
        ref
      });

      expect(ref.current.submit).not.eql(undefined);
    });
  });
});
