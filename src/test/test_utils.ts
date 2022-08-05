
/* Utils for tests. */

import { type SpyInstance, vi, describe, type ArgumentsType } from 'vitest';
import { fireEvent, render, act } from '@testing-library/svelte';
import type { RenderResult } from '@testing-library/svelte';
import type { SvelteComponentTyped } from 'svelte/types/runtime';
import Form from '$lib/components/Form.svelte';

export function createComponent(
  Component: SvelteComponentTyped,
  props: any
): Pick<RenderResult, 'component' | 'container' | 'rerender' | 'unmount'> & {
  onChange: SpyInstance;
  onSubmit: SpyInstance;
  onError: SpyInstance;
} {
  const onChange = vi.fn();
  const onError = vi.fn();
  const onSubmit = vi.fn();

  const {
    component,
    container,
    unmount,
    rerender // @ts-ignore
  }: RenderResult = render(Component, { onSubmit, onError, onChange, ...props });

  return {
    component: component,
    container: container,
    onChange,
    onError,
    onSubmit,
    rerender,
    unmount
  };
}

export function createFormComponent(props: object) {
  return createComponent(Form, props);
}

// export function setProps(comp: SvelteComponent, newProps) {
//   const node = findDOMNode(comp);
//   render(React.createElement(comp.constructor, newProps), node.parentNode);
// }

/* Run a group of tests with different combinations of omitExtraData and liveOmit as form props.
 */
export function describeRepeated(title:string, fn:Function) {
  const formExtraPropsList = [
    { omitExtraData: false },
    { omitExtraData: true },
    { omitExtraData: true, liveOmit: true }
  ];
  for (let formExtraProps of formExtraPropsList) {
    const createFormComponentFn = (props: object) => createFormComponent({ ...props, ...formExtraProps });
    describe(title + ' ' + JSON.stringify(formExtraProps), () => fn(createFormComponentFn));
  }
}

export function submitForm(node) {
  act(() => {
    fireEvent.submit(node);
  });
}
