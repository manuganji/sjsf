import type { Load } from '@sveltejs/kit';
import sections from './_sections';

export const load: Load = async () => {
  return {
    keys: Object.keys(sections)
  };
};
