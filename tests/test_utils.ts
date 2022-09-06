/* Utils for tests. */

import { type SpyInstance, vi, describe, type ArgumentsType } from 'vitest';
import { fireEvent, render, act } from '@testing-library/svelte';
import type { RenderResult } from '@testing-library/svelte';
import type { SvelteComponent, SvelteComponentTyped } from 'svelte/types/runtime';
import Form from '$lib/components/Form.svelte';

export function createComponent(
  Component: typeof SvelteComponentTyped,
  props: any,
  child?: SvelteComponentTyped
): Pick<
  RenderResult<SvelteComponentTyped>,
  'component' | 'container' | 'rerender' | 'unmount' | 'debug'
> & {
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
    debug,
    rerender // @ts-ignore
  }: RenderResult = render(Component, {
    onSubmit,
    onError,
    onChange,
    slot: child ? child : null,
    ...props
  });

  return {
    component: component,
    container: container,
    onChange,
    onError,
    onSubmit,
    rerender,
    unmount,
    debug
  };
}

export function createFormComponent<T, U = any>(props: object, slot?: SvelteComponentTyped) {
  return createComponent(Form, props, slot);
}

// export function setProps(comp: SvelteComponent, newProps) {
//   const node = findDOMNode(comp);
//   render(React.createElement(comp.constructor, newProps), node.parentNode);
// }

export function submitForm(node: Element) {
  act(() => {
    fireEvent.submit(node);
  });
}
