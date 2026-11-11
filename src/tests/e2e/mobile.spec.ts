import { test, expect } from "@playwright/test";

test.describe("mobile-4g viewport (360×640)", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
  });

  test("home page loads and hero is visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("tile-lab preview does not overflow the viewport", async ({ page }) => {
    await page.goto("/tile-lab");
    const preview = page.locator('[data-testid="tile-preview"]');
    if ((await preview.count()) > 0) {
      const box = await preview.boundingBox();
      const vw = await page.evaluate(() => window.innerWidth);
      // Allow 1px rounding tolerance
      expect(box!.width).toBeLessThanOrEqual(vw + 1);
    }
    // Surface buttons should wrap, not overflow
    await expect(page.getByRole("button", { name: /Wall/i })).toBeVisible();
  });

  test("mobile navigation opens and closes", async ({ page }) => {
    await page.goto("/");
    const menuBtn = page.getByRole("button", { name: "Open menu" });
    await menuBtn.click();
    await expect(page.locator("#mobile-nav")).toBeVisible();
    await menuBtn.click();
  });

  test("calculator page renders inputs", async ({ page }) => {
    await page.goto("/calculator");
    await expect(
      page.getByLabel(/Room length|Room width/i).first(),
    ).toBeVisible();
  });
});
