/* Utils for tests. */

import { type SpyInstance, vi } from 'vitest';
import { fireEvent, render, act } from '@testing-library/svelte';
import type { RenderResult } from '@testing-library/svelte';
import type { SvelteComponent } from 'svelte/types/runtime';
import Form from '$lib/components/Form.svelte';


export function createComponent(
  Component: typeof SvelteComponent,
  props: any,
  target?: HTMLElement,
  child?: typeof SvelteComponent
): Pick<
  RenderResult<SvelteComponent>,
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
    target: target || document.body,
    props: {
      onSubmit,
      onError,
      onChange,
      slot: child ? child : null,
      ...props
    }
  });

  return {
    component,
    container,
    onChange,
    onError,
    onSubmit,
    rerender,
    unmount,
    debug
  };
}

export function createFormComponent<T, U = any>(
  props: object,
  target?: HTMLElement,
  slot?: typeof SvelteComponent
) {
  return createComponent(Form, props, target, slot);
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
