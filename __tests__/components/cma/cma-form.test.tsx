"use client"

import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { CMAForm } from "@/components/cma/cma-form"
import jest from "jest"

const mockOnSubmit = jest.fn()

describe("CMAForm", () => {
  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  it("renders property address field", () => {
    render(<CMAForm onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/property address/i)).toBeInTheDocument()
  })

  it("validates property address is required", async () => {
    const user = userEvent.setup()
    render(<CMAForm onSubmit={mockOnSubmit} />)

    const submitButton = screen.getByRole("button", { name: /generate cma/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/property address is required/i)).toBeInTheDocument()
    })
  })

  it("submits form with valid address", async () => {
    const user = userEvent.setup()
    render(<CMAForm onSubmit={mockOnSubmit} />)

    await user.type(screen.getByLabelText(/property address/i), "123 Main St, Toronto, ON")

    const submitButton = screen.getByRole("button", { name: /generate cma/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          propertyAddress: "123 Main St, Toronto, ON",
        }),
      )
    })
  })
})
