import { sveltekit } from '@sveltejs/kit/vite';
import Unocss from 'unocss/vite';
import presetWind from '@unocss/preset-wind';

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [
    sveltekit(),
    Unocss({
      presets: [presetWind()]
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    clearMocks: true
  }
};

export default config;
