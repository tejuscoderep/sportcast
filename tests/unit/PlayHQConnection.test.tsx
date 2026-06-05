import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { PlayHQConnection } from "@/features/playhq/playhq-connection"
import { TooltipProvider } from "@/components/ui/tooltip"

function renderWithProviders(ui: React.ReactElement) {
  return render(<TooltipProvider>{ui}</TooltipProvider>)
}

describe("PlayHQConnection", () => {
  const mockOnConnect = vi.fn()

  beforeEach(() => {
    mockOnConnect.mockReset()
  })

  it("renders all form fields", () => {
    renderWithProviders(
      <PlayHQConnection onConnect={mockOnConnect} />
    )
    expect(screen.getByText("Tenant")).toBeDefined()
    expect(screen.getByLabelText("Client ID")).toBeDefined()
    expect(screen.getByLabelText("Client Secret")).toBeDefined()
    expect(screen.getByText(/Club.*Organisation ID/i)).toBeDefined()
  })

  it("renders Connect and Cancel buttons", () => {
    renderWithProviders(
      <PlayHQConnection onConnect={mockOnConnect} onCancel={() => {}} />
    )
    expect(screen.getByRole("button", { name: /Connect/i })).toBeDefined()
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeDefined()
  })

  it("shows validation errors when submitting empty form", async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <PlayHQConnection onConnect={mockOnConnect} />
    )

    await user.click(screen.getByRole("button", { name: /Connect/i }))

    await waitFor(() => {
      expect(screen.getByText("Tenant is required")).toBeDefined()
    })
    expect(screen.getByText("Client ID is required")).toBeDefined()
    expect(screen.getByText("Client Secret is required")).toBeDefined()
    expect(screen.getByText("Club / Organisation ID is required")).toBeDefined()
  })

  it("calls onConnect with valid data", async () => {
    mockOnConnect.mockResolvedValue({ success: true })
    const user = userEvent.setup()
    renderWithProviders(
      <PlayHQConnection onConnect={mockOnConnect} />
    )

    // Select tenant
    await user.click(screen.getByRole("combobox"))
    await user.click(screen.getByText("Cricket Queensland"))

    // Fill text fields
    await user.type(screen.getByLabelText("Client ID"), "test-client-id")
    await user.type(screen.getByLabelText("Client Secret"), "test-secret")
    await user.type(screen.getByLabelText(/Club.*Organisation ID/i), "CQ12345")

    await user.click(screen.getByRole("button", { name: /Connect/i }))

    await waitFor(() => {
      expect(mockOnConnect).toHaveBeenCalledTimes(1)
    })

    const callArgs = mockOnConnect.mock.calls[0][0]
    expect(callArgs.tenant).toBe("Cricket Queensland")
    expect(callArgs.clientId).toBe("test-client-id")
    expect(callArgs.clientSecret).toBe("test-secret")
    expect(callArgs.organisationId).toBe("CQ12345")
  })

  it("shows loading state during connection", async () => {
    let resolveConnect: (value: unknown) => void
    mockOnConnect.mockImplementation(
      () => new Promise((resolve) => { resolveConnect = resolve })
    )

    const user = userEvent.setup()
    renderWithProviders(
      <PlayHQConnection onConnect={mockOnConnect} />
    )

    // Fill form
    await user.click(screen.getByRole("combobox"))
    await user.click(screen.getByText("Cricket Queensland"))
    await user.type(screen.getByLabelText("Client ID"), "id")
    await user.type(screen.getByLabelText("Client Secret"), "secret")
    await user.type(screen.getByLabelText(/Club.*Organisation ID/i), "org1")

    await user.click(screen.getByRole("button", { name: /Connect/i }))

    await waitFor(() => {
      expect(screen.getByText("Establishing connection...")).toBeDefined()
    })
    expect(screen.getByText("Connecting...")).toBeDefined()

    // Resolve the connection
    resolveConnect!({ success: true })
  })

  it("shows error when connection fails", async () => {
    mockOnConnect.mockResolvedValue({
      success: false,
      error: "Connection failed",
    })

    const user = userEvent.setup()
    renderWithProviders(
      <PlayHQConnection onConnect={mockOnConnect} />
    )

    // Fill form
    await user.click(screen.getByRole("combobox"))
    await user.click(screen.getByText("Cricket Queensland"))
    await user.type(screen.getByLabelText("Client ID"), "id")
    await user.type(screen.getByLabelText("Client Secret"), "secret")
    await user.type(screen.getByLabelText(/Club.*Organisation ID/i), "org1")

    await user.click(screen.getByRole("button", { name: /Connect/i }))

    await waitFor(() => {
      expect(screen.getByText("Connection failed")).toBeDefined()
    })
  })

  it("toggles password visibility", async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <PlayHQConnection onConnect={mockOnConnect} />
    )

    const secretInput = screen.getByLabelText("Client Secret") as HTMLInputElement
    expect(secretInput.type).toBe("password")

    const toggleBtn = screen.getByRole("button", { name: /Show client secret/i })
    await user.click(toggleBtn)

    await waitFor(() => {
      expect(secretInput.type).toBe("text")
    })
  })

  it("calls onCancel when Cancel is clicked", async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(
      <PlayHQConnection onConnect={mockOnConnect} onCancel={onCancel} />
    )

    await user.click(screen.getByRole("button", { name: /Cancel/i }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})
