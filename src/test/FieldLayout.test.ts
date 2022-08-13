import { expect, describe, beforeEach, afterEach, it } from 'vitest';
import { createFormComponent, createSandbox } from './test_utils';

describe('FieldLayout', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('FieldLayout should only have one child', () => {
    function FieldLayout(props) {
      if (React.Children.count(props.children) !== 1) {
        throw 'Got wrong number of children';
      }
      return null;
    }
    createFormComponent({
      schema: { type: 'string' },
      uiSchema: { 'ui:disabled': true },
      FieldLayout
    });
  });

  describe('Custom FieldLayout for disabled property', () => {
    function FieldLayout(props) {
      return <div className={props.disabled ? 'disabled' : 'foo'} />;
    }

    describe('with template globally configured', () => {
      it('should render with disabled when ui:disabled is truthy', () => {
        const { container } = createFormComponent({
          schema: { type: 'string' },
          uiSchema: { 'ui:disabled': true },
          FieldLayout
        });
        expect(container.querySelectorAll('.disabled')).toHaveLength((1));
      });

      it('should render with disabled when ui:disabled is falsey', () => {
        const { container } = createFormComponent({
          schema: { type: 'string' },
          uiSchema: { 'ui:disabled': false },
          FieldLayout
        });
        expect(container.querySelectorAll('.disabled')).toHaveLength((0));
      });
    });
    describe('with template configured in ui:FieldLayout', () => {
      it('should render with disabled when ui:disabled is truthy', () => {
        const { container } = createFormComponent({
          schema: { type: 'string' },
          uiSchema: { 'ui:disabled': true, 'ui:FieldLayout': FieldLayout }
        });
        expect(container.querySelectorAll('.disabled')).toHaveLength((1));
      });

      it('should render with disabled when ui:disabled is falsey', () => {
        const { container } = createFormComponent({
          schema: { type: 'string' },
          uiSchema: { 'ui:disabled': false, 'ui:FieldLayout': FieldLayout }
        });
        expect(container.querySelectorAll('.disabled')).toHaveLength((0));
      });
    });
    describe('with template configured globally being overriden in ui:FieldLayout', () => {
      it('should render with disabled when ui:disabled is truthy', () => {
        const { container } = createFormComponent({
          schema: { type: 'string' },
          uiSchema: { 'ui:disabled': true, 'ui:FieldLayout': FieldLayout },
          // Empty field template to prove that overides work
          FieldLayout: () => <div />
        });
        expect(container.querySelectorAll('.disabled')).toHaveLength((1));
      });

      it('should render with disabled when ui:disabled is falsey', () => {
        const { container } = createFormComponent({
          schema: { type: 'string' },
          uiSchema: { 'ui:disabled': false, 'ui:FieldLayout': FieldLayout },
          // Empty field template to prove that overides work
          FieldLayout: () => <div />
        });
        expect(container.querySelectorAll('.disabled')).toHaveLength((0));
      });
    });
  });

  describe('Custom FieldLayout should have registry', () => {
    function FieldLayout(props) {
      return (
        <div>
          Root Schema: <span id="root-schema">{JSON.stringify(props.registry.rootSchema)}</span>
        </div>
      );
    }

    it('should allow access to root schema from registry', () => {
      const schema = {
        type: 'object',
        properties: { fooBarBaz: { type: 'string' } }
      };

      const { container } = createFormComponent({
        schema,
        FieldLayout
      });

      expect(container.querySelectorAll('#root-schema')).toHaveLength((1));
      expect(container.querySelectorAll('#root-schema')[0].innerHTML).to.equal(JSON.stringify(schema));
    });
  });
});
