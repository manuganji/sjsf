import type { LayoutServerLoad } from './$types';
import sections from './_sections';

export const load: LayoutServerLoad = async (): Promise<{
  keys: Array<keyof typeof sections>;
}> => {
  return {
    keys: Object.keys(sections)
  };
};
