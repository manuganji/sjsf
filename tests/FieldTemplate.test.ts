import { expect, describe, beforeEach, afterEach, it } from 'vitest';
import { createFormComponent, createSandbox } from './test_utils';

describe('FieldTemplate', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('FieldTemplate should only have one child', () => {
    function FieldTemplate(props) {
      if (React.Children.count(props.children) !== 1) {
        throw 'Got wrong number of children';
      }
      return null;
    }
    createFormComponent({
      schema: { type: 'string' },
      uiSchema: { 'ui:disabled': true },
      FieldTemplate
    });
  });

  describe('Custom FieldTemplate for disabled property', () => {
    function FieldTemplate(props) {
      return <div className={props.disabled ? 'disabled' : 'foo'} />;
    }

    describe('with template globally configured', () => {
      it('should render with disabled when ui:disabled is truthy', () => {
        const { container } = createFormComponent({
          schema: { type: 'string' },
          uiSchema: { 'ui:disabled': true },
          FieldTemplate
        });
        expect(container.querySelectorAll('.disabled')).to.have.length.of(1);
      });

      it('should render with disabled when ui:disabled is falsey', () => {
        const { container } = createFormComponent({
          schema: { type: 'string' },
          uiSchema: { 'ui:disabled': false },
          FieldTemplate
        });
        expect(container.querySelectorAll('.disabled')).to.have.length.of(0);
      });
    });
    describe('with template configured in ui:FieldTemplate', () => {
      it('should render with disabled when ui:disabled is truthy', () => {
        const { container } = createFormComponent({
          schema: { type: 'string' },
          uiSchema: { 'ui:disabled': true, 'ui:FieldTemplate': FieldTemplate }
        });
        expect(container.querySelectorAll('.disabled')).to.have.length.of(1);
      });

      it('should render with disabled when ui:disabled is falsey', () => {
        const { container } = createFormComponent({
          schema: { type: 'string' },
          uiSchema: { 'ui:disabled': false, 'ui:FieldTemplate': FieldTemplate }
        });
        expect(container.querySelectorAll('.disabled')).to.have.length.of(0);
      });
    });
    describe('with template configured globally being overriden in ui:FieldTemplate', () => {
      it('should render with disabled when ui:disabled is truthy', () => {
        const { container } = createFormComponent({
          schema: { type: 'string' },
          uiSchema: { 'ui:disabled': true, 'ui:FieldTemplate': FieldTemplate },
          // Empty field template to prove that overides work
          FieldTemplate: () => <div />
        });
        expect(container.querySelectorAll('.disabled')).to.have.length.of(1);
      });

      it('should render with disabled when ui:disabled is falsey', () => {
        const { container } = createFormComponent({
          schema: { type: 'string' },
          uiSchema: { 'ui:disabled': false, 'ui:FieldTemplate': FieldTemplate },
          // Empty field template to prove that overides work
          FieldTemplate: () => <div />
        });
        expect(container.querySelectorAll('.disabled')).to.have.length.of(0);
      });
    });
  });

  describe('Custom FieldTemplate should have registry', () => {
    function FieldTemplate(props) {
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
        FieldTemplate
      });

      expect(container.querySelectorAll('#root-schema')).to.have.length.of(1);
      expect(container.querySelectorAll('#root-schema')[0].innerHTML).to.equal(JSON.stringify(schema));
    });
  });
});
