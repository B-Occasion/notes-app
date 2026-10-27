import { test, expect } from "@playwright/test";

// Helper: menambah satu catatan lewat UI
async function addNote(page, title, body) {
  await page.getByRole("button", { name: "Tambah catatan" }).click();
  await page.getByLabel("Judul").fill(title);
  await page.getByLabel("Isi").fill(body);
  await page.getByRole("button", { name: "Simpan" }).click();
}

// WO-4: offline
test("tetap bisa dibuka saat offline", async ({ page, context }) => {
  await page.goto("/");
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Catatan", exact: true })).toBeVisible();
});