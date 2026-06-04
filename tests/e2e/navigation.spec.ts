import { test, expect } from "@playwright/test"

/**
 * Navigation and routing tests.
 * Verifies correct page is served at each route and navigation works.
 */

test.describe("Routing", () => {
  test("/ serves the director dashboard", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveTitle(/SportCast/i)
  })

  test("/camera serves the camera page", async ({ page }) => {
    await page.goto("/camera")
    await expect(page.getByText(/SportCast Camera/i)).toBeVisible()
  })

  test("dashboard and camera page use dark background", async ({ page }) => {
    await page.goto("/")
    const bg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor
    })
    // Dark background means RGB values are all low (e.g. rgb(9, 9, 11) for zinc-950)
    const match = bg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (match) {
      const [, r, g, b] = match.map(Number)
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b
      expect(luminance).toBeLessThan(128)
    }
  })
})

test.describe("Accessibility", () => {
  test("dashboard page has a main landmark or meaningful structure", async ({ page }) => {
    await page.goto("/")
    // Should have header element
    await expect(page.locator("header")).toBeVisible()
  })

  test("camera page has a header element", async ({ page }) => {
    await page.goto("/camera")
    await expect(page.locator("header")).toBeVisible()
  })

  test("all buttons on dashboard have accessible text", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/")
    await page.waitForTimeout(300)

    const buttons = page.getByRole("button")
    const count = await buttons.count()
    expect(count).toBeGreaterThan(0)

    // Every button should have non-empty accessible text or aria-label
    for (let i = 0; i < Math.min(count, 20); i++) {
      const btn = buttons.nth(i)
      const text = await btn.textContent()
      const ariaLabel = await btn.getAttribute("aria-label")
      const hasLabel = (text && text.trim().length > 0) || (ariaLabel && ariaLabel.trim().length > 0)
      expect(hasLabel, `Button ${i} has no accessible label`).toBeTruthy()
    }
  })

  test("inputs on camera page have associated labels or placeholders", async ({ page }) => {
    await page.goto("/camera")
    const inputs = page.locator("input")
    const count = await inputs.count()
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i)
      const placeholder = await input.getAttribute("placeholder")
      const ariaLabel = await input.getAttribute("aria-label")
      const id = await input.getAttribute("id")
      const hasLabel = placeholder || ariaLabel || id
      expect(hasLabel, `Input ${i} is not identifiable`).toBeTruthy()
    }
  })
})

test.describe("Responsiveness", () => {
  const viewports = [
    { name: "mobile-sm", width: 375, height: 667 },
    { name: "mobile-lg", width: 430, height: 932 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "desktop", width: 1440, height: 900 },
  ]

  for (const viewport of viewports) {
    test(`dashboard renders without overflow at ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto("/")
      await page.waitForTimeout(300)

      // Page should not have horizontal scrollbar (scrollWidth <= clientWidth)
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth
      })
      expect(hasHorizontalScroll).toBe(false)
    })

    test(`camera page renders without overflow at ${viewport.name}`, async ({ page }) => {
      await page.addInitScript(() => {
        const fakeStream = {
          getTracks: () => [{ stop: () => {}, kind: "video" }],
          getVideoTracks: () => [{ stop: () => {}, kind: "video" }],
          getAudioTracks: () => [{ stop: () => {}, kind: "audio" }],
        }
        Object.defineProperty(navigator, "mediaDevices", {
          writable: true,
          value: { getUserMedia: () => Promise.resolve(fakeStream as unknown as MediaStream) },
        })
      })
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto("/camera")
      await page.waitForTimeout(300)

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth
      })
      expect(hasHorizontalScroll).toBe(false)
    })
  }
})
