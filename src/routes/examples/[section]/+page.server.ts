import { redirect } from '@sveltejs/kit';
import sections from './_sections';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  if (!Object.hasOwn(sections, params.section)) {
    throw redirect(303, `/examples/string`);
  } else {
    return {
      examples: sections[params.section],
    }
  }
};
