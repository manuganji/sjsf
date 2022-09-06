import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';
import mm from 'micromatch';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: preprocess(),
  package: {
    // not packaging test components
    files: mm.matcher('!test/**')
  },
  kit: {
    adapter: adapter()
  }
};

export default config;
