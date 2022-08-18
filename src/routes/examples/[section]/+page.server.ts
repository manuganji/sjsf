import { redirect } from '@sveltejs/kit';
import sections from './_sections';
import type { PageServerLoad } from '../../../../.svelte-kit/types/src/routes/examples/[section]/$types';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
  if (!Object.hasOwn(sections, params.section)) {
    throw redirect(303, `/examples/string`);
  } else {
    setHeaders({
      // cache response but revalidate
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
      'Cache-Control': 'no-cache'
    })
    return {
      examples: sections[params.section]
    };
  }
};
