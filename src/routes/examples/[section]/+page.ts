import type { Load } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import sections from './_sections';

export const load: Load = async ({ params }) => {
  if (!Object.hasOwn(sections, params.section)) {
    throw redirect(303, `/examples/string`);
  }
};
