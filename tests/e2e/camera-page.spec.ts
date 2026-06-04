import { test, expect } from "@playwright/test"

/**
 * Mobile camera page tests (/camera).
 * Camera hardware is not available in CI so getUserMedia is mocked;
 * we verify the UI state machine and form controls rather than actual streams.
 */

test.describe("Camera page – layout", () => {
  test.beforeEach(async ({ page }) => {
    // Mock getUserMedia to avoid hardware dependency in CI
    await page.addInitScript(() => {
      const fakeStream = {
        getTracks: () => [{ stop: () => {}, kind: "video" }],
        getVideoTracks: () => [{ stop: () => {}, kind: "video" }],
        getAudioTracks: () => [{ stop: () => {}, kind: "audio" }],
      }
      Object.defineProperty(navigator, "mediaDevices", {
        writable: true,
        value: {
          getUserMedia: () => Promise.resolve(fakeStream as unknown as MediaStream),
          enumerateDevices: () => Promise.resolve([]),
        },
      })
    })
    await page.goto("/camera")
  })

  test("shows SportCast Camera header", async ({ page }) => {
    await expect(page.getByText(/SportCast Camera/i)).toBeVisible()
  })

  test("shows camera name input field", async ({ page }) => {
    await expect(page.getByPlaceholder(/Camera.*Boundary|Camera Name/i).or(page.getByLabel(/Camera Name/i))).toBeVisible()
  })

  test("shows room name input field", async ({ page }) => {
    await expect(page.getByPlaceholder(/sportcast-main|Room Name/i).or(page.getByLabel(/Room Name/i))).toBeVisible()
  })

  test("shows Connect button initially", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Connect/i })).toBeVisible()
  })

  test("Connect button is disabled when camera name is empty", async ({ page }) => {
    const connectBtn = page.getByRole("button", { name: /^Connect$/i })
    await expect(connectBtn).toBeDisabled()
  })

  test("shows camera flip button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Switch to Front|Switch to Rear|Flip|RotateCcw/i })).toBeVisible()
  })

  test("shows video element for preview", async ({ page }) => {
    await expect(page.locator("video")).toBeVisible()
  })

  test("shows connection status as Offline initially", async ({ page }) => {
    await expect(page.getByText(/Offline/i)).toBeVisible()
  })
})

test.describe("Camera page – form interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const fakeStream = {
        getTracks: () => [{ stop: () => {}, kind: "video" }],
        getVideoTracks: () => [{ stop: () => {}, kind: "video" }],
        getAudioTracks: () => [{ stop: () => {}, kind: "audio" }],
      }
      Object.defineProperty(navigator, "mediaDevices", {
        writable: true,
        value: {
          getUserMedia: () => Promise.resolve(fakeStream as unknown as MediaStream),
          enumerateDevices: () => Promise.resolve([]),
        },
      })
    })
    await page.goto("/camera")
  })

  test("Connect button enables after typing camera name", async ({ page }) => {
    const input = page.getByPlaceholder(/Camera|Boundary/i).first()
    await input.fill("Test Camera")
    await expect(page.getByRole("button", { name: /^Connect$/i })).toBeEnabled()
  })

  test("room name input has default value", async ({ page }) => {
    const roomInput = page.getByPlaceholder(/sportcast-main/i).or(page.locator("input").nth(1))
    const value = await roomInput.inputValue()
    expect(value.length).toBeGreaterThan(0)
  })

  test("can change room name", async ({ page }) => {
    const roomInput = page.getByPlaceholder(/sportcast-main/i).or(page.locator("input").nth(1))
    await roomInput.fill("my-custom-room")
    await expect(roomInput).toHaveValue("my-custom-room")
  })

  test("clicking flip camera toggles button label", async ({ page }) => {
    const flipBtn = page.getByRole("button", { name: /Switch to Front|Switch to Rear/i })
    const initialText = await flipBtn.innerText()
    await flipBtn.click()
    await page.waitForTimeout(200)
    const newText = await flipBtn.innerText()
    expect(newText).not.toBe(initialText)
  })
})

test.describe("Camera page – connection flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const fakeStream = {
        getTracks: () => [{ stop: () => {}, kind: "video" }],
        getVideoTracks: () => [{ stop: () => {}, kind: "video" }],
        getAudioTracks: () => [{ stop: () => {}, kind: "audio" }],
      }
      Object.defineProperty(navigator, "mediaDevices", {
        writable: true,
        value: {
          getUserMedia: () => Promise.resolve(fakeStream as unknown as MediaStream),
          enumerateDevices: () => Promise.resolve([]),
        },
      })
    })
    await page.goto("/camera")
  })

  test("shows Connecting state while connecting", async ({ page }) => {
    await page.getByPlaceholder(/Camera|Boundary/i).first().fill("Pitch Cam")
    await page.getByRole("button", { name: /^Connect$/i }).click()
    // Should show connecting state briefly
    await expect(
      page.getByText(/Connecting/i).or(page.getByRole("button", { name: /Connecting/i }))
    ).toBeVisible({ timeout: 2000 })
  })

  test("transitions to Connected after successful connect", async ({ page }) => {
    await page.getByPlaceholder(/Camera|Boundary/i).first().fill("Pitch Cam")
    await page.getByRole("button", { name: /^Connect$/i }).click()
    // Mock connect takes ~1.5s
    await page.waitForTimeout(2500)
    await expect(page.getByText(/Connected/i)).toBeVisible()
  })

  test("shows Disconnect button after connecting", async ({ page }) => {
    await page.getByPlaceholder(/Camera|Boundary/i).first().fill("Pitch Cam")
    await page.getByRole("button", { name: /^Connect$/i }).click()
    await page.waitForTimeout(2500)
    await expect(page.getByRole("button", { name: /Disconnect/i })).toBeVisible()
  })

  test("clicking Disconnect returns to Offline state", async ({ page }) => {
    await page.getByPlaceholder(/Camera|Boundary/i).first().fill("Pitch Cam")
    await page.getByRole("button", { name: /^Connect$/i }).click()
    await page.waitForTimeout(2500)
    await page.getByRole("button", { name: /Disconnect/i }).click()
    await page.waitForTimeout(300)
    await expect(page.getByText(/Offline/i)).toBeVisible()
  })

  test("inputs are disabled while connected", async ({ page }) => {
    const nameInput = page.getByPlaceholder(/Camera|Boundary/i).first()
    await nameInput.fill("Pitch Cam")
    await page.getByRole("button", { name: /^Connect$/i }).click()
    await page.waitForTimeout(2500)
    await expect(nameInput).toBeDisabled()
  })
})
