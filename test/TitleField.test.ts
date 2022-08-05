import { expect, describe, beforeEach, afterEach, it } from 'vitest';

import TitleField from '../src/lib/components/fields/TitleField';
import { createSandbox, createComponent } from './test_utils';

describe('TitleField', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  // For some reason, stateless components needs to be wrapped into a stateful
  // one to be rendered into the document.
  class TitleFieldWrapper extends React.Component {
    constructor(props) {
      super(props);
    }
    render() {
      return <TitleField {...this.props} />;
    }
  }

  it('should return a legend', () => {
    const props = {
      title: 'Field title',
      required: true
    };
    const { container } = createComponent(TitleFieldWrapper, props);

    expect(container.tagName).to.equal('LEGEND');
  });

  it('should have the expected id', () => {
    const props = {
      title: 'Field title',
      required: true,
      id: 'sample_id'
    };
    const { container } = createComponent(TitleFieldWrapper, props);

    expect(container.id).to.equal('sample_id');
  });

  it('should include only title, when field is not required', () => {
    const props = {
      title: 'Field title',
      required: false
    };
    const { container } = createComponent(TitleFieldWrapper, props);

    expect(container.textContent).to.equal(props.title);
  });

  it('should add an asterisk to the title, when field is required', () => {
    const props = {
      title: 'Field title',
      required: true
    };
    const { container } = createComponent(TitleFieldWrapper, props);

    expect(container.textContent).to.equal(props.title + '*');

    expect(container.querySelector('span.required').textContent).to.equal('*');
  });
});
