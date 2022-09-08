/* Utils for tests. */

import { type SpyInstance, vi } from 'vitest';
import { fireEvent, render, act } from '@testing-library/svelte';
import type { RenderResult } from '@testing-library/svelte';
import type { SvelteComponent } from 'svelte/types/runtime';
import Form from '$lib/components/Form.svelte';
import { pick } from 'lodash-es';

export function createComponent(
  Component: typeof SvelteComponent,
  props: any,
  spies: boolean,
  child?: typeof SvelteComponent
): Pick<
  RenderResult<SvelteComponent>,
  'component' | 'container' | 'rerender' | 'unmount' | 'debug'
> & {
  onSubmit?: SpyInstance | ((arg0: SubmitEvent) => void);
  onError?: SpyInstance;
  onBlur?: SpyInstance;
  onFocus?: SpyInstance;
} {
  const composedProps = {
    ...(spies ? { onSubmit: vi.fn(), onError: vi.fn(), onBlur: vi.fn(), onFocus: vi.fn() } : {}),
    slot: child ? child : null,
    ...props
  };
  const {
    component,
    container,
    unmount,
    debug,
    rerender // @ts-ignore
  }: RenderResult = render(Component, composedProps);

  return {
    component,
    container,
    ...pick(composedProps, ['onSubmit', 'onError', 'onBlur', 'onFocus']),
    rerender,
    unmount,
    debug
  };
}

export function createFormComponent<T, U = any>(
  props: object,
  spies: boolean = false,
  slot?: typeof SvelteComponent
) {
  return createComponent(Form, props, spies, slot);
}

// export function setProps(comp: SvelteComponent, newProps) {
//   const node = findDOMNode(comp);
//   render(React.createElement(comp.constructor, newProps), node.parentNode);
// }

export async function submitForm(node: Element) {
  return await act(() => {
    fireEvent.submit(node);
  });
}
