
/* Utils for tests. */

import { type SpyInstance, vi, describe, type ArgumentsType } from 'vitest';
import { fireEvent, render, act } from '@testing-library/svelte';
import type { RenderResult } from '@testing-library/svelte';
import type { SvelteComponent, SvelteComponentTyped } from 'svelte/types/runtime';
import Form from '$lib/components/Form.svelte';

export function createComponent(
  Component: SvelteComponentTyped,
  props: any,
  child?: SvelteComponentConstructor
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
  }: RenderResult = render(Component, { onSubmit, onError, onChange, slot: child ? new child() : null, ...props }, {
    container: null
  });

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

export function createFormComponent<T, U=any>(props: object, slot?: SvelteComponentConstructor) {
  return createComponent(Form, props, slot);
}

// export function setProps(comp: SvelteComponent, newProps) {
//   const node = findDOMNode(comp);
//   render(React.createElement(comp.constructor, newProps), node.parentNode);
// }

/* Run a group of tests with different combinations of omitExtraData and liveOmit as form props.
 */
export function describeRepeated(title:string, fn:Function) {
  
  for (let formExtraProps of formExtraPropsList) {
    const createFormComponentFn = (props: object) => createFormComponent({ ...props, ...formExtraProps });
    
  }
}

export function submitForm(node) {
  act(() => {
    fireEvent.submit(node);
  });
}
