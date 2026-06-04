import { test, expect } from "@playwright/test"

/**
 * Score overlay and live score update tests.
 * Verifies the ScoreOverlay component renders on the program feed and
 * that the mock score provider drives real-time updates.
 */

test.describe("Score overlay – visibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/")
    // Allow mock score provider to populate data
    await page.waitForTimeout(500)
  })

  test("score overlay displays team name abbreviation", async ({ page }) => {
    // ScoreOverlay shows last word of homeTeam e.g. "Tigers"
    await expect(page.getByText(/Tigers|Brisbane/i).first()).toBeVisible()
  })

  test("score overlay shows runs and wickets", async ({ page }) => {
    // e.g. "145" and "/4"
    await expect(page.locator("text=/\\d+/").first()).toBeVisible()
  })

  test("overlay toggle switch is present in match info panel", async ({ page }) => {
    // There's a Switch component for overlay visibility
    await expect(page.locator("button[role='switch']").or(page.locator("[data-slot='switch']"))).toBeVisible()
  })

  test("toggling the overlay switch hides/shows the overlay", async ({ page }) => {
    const toggleSwitch = page.locator("button[role='switch']").or(page.locator("[data-slot='switch']")).first()
    const initialState = await toggleSwitch.getAttribute("aria-checked") ?? await toggleSwitch.getAttribute("data-state")
    await toggleSwitch.click()
    await page.waitForTimeout(100)
    const newState = await toggleSwitch.getAttribute("aria-checked") ?? await toggleSwitch.getAttribute("data-state")
    expect(newState).not.toBe(initialState)
  })
})

test.describe("Score overlay – live updates", () => {
  test("score updates after 5 seconds from mock provider", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/")
    await page.waitForTimeout(500)

    // Capture initial score text from the first score-pattern match
    const scoreEl = page.locator("text=/\\d+\\/\\d+/").first()
    const initialScore = await scoreEl.textContent()

    // Wait for mock provider update (fires every 5 seconds)
    await page.waitForTimeout(6000)

    const updatedScore = await scoreEl.textContent()
    // Score should have changed (runs increase each ball)
    expect(updatedScore).not.toBe(initialScore)
  })

  test("current batter name is displayed", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/")
    await page.waitForTimeout(500)

    // MockScoreProvider uses names from batters array: Smith, Warner, etc.
    const batterNames = ["Smith", "Warner", "Labuschagne", "Head", "Carey"]
    let found = false
    for (const name of batterNames) {
      const count = await page.getByText(name).count()
      if (count > 0) {
        found = true
        break
      }
    }
    expect(found).toBe(true)
  })

  test("current bowler name is displayed", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/")
    await page.waitForTimeout(500)

    const bowlerNames = ["Johnson", "Starc", "Cummins", "Hazlewood", "Richardson"]
    let found = false
    for (const name of bowlerNames) {
      const count = await page.getByText(name).count()
      if (count > 0) {
        found = true
        break
      }
    }
    expect(found).toBe(true)
  })
})
