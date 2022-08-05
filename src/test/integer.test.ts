import { afterAll, beforeAll, describe, test } from 'vitest';
import { preview } from 'vite';
import type { PreviewServer } from 'vite';
import { chromium } from '@playwright/test';
import type { Browser, Page } from '@playwright/test';
import { expect } from '@playwright/test';

describe.skip('basic', async () => {
  let server: PreviewServer;
  let browser: Browser;
  let page: Page;
  let address: ReturnType<PreviewServer['httpServer']['address']>;

  beforeAll(async () => {
    server = await preview({ preview: { port: 3000 } });
    browser = await chromium.launch();
    page = await browser.newPage();
    address = server.httpServer.address();
  });

  afterAll(async () => {
    await browser.close();
    await new Promise<void>((resolve, reject) => {
      server.httpServer.close((error) => (error ? reject(error) : resolve()));
    });
  });
  // integer
  test('integer', async () => {
    await page.goto(`${address.address}:${address.port}/examples/integer/`);
    await page.fill('input[type="integer"]', '123');
    expect(await page.textContent('#value')).toBe('123');
  });
});
