import { expect, test } from '@playwright/test';

// integer
test('integer', async ({ page }) => {
	await page.goto('/examples/integer/');
	await page.fill('input[type="integer"]', '123');
	expect(await page.textContent('#value')).toBe('123');
});
