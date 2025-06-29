"use client"

import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import BuyerCriteriaForm from "@/components/buyer-report/buyer-criteria-form"
import { jest } from "@jest/globals"

// Mock the form submission
const mockOnSubmit = jest.fn()

describe("BuyerCriteriaForm", () => {
  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  it("renders all form fields", () => {
    render(<BuyerCriteriaForm onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/client name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/budget range/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/preferred location/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/property type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/bedrooms/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/bathrooms/i)).toBeInTheDocument()
  })

  it("validates required fields", async () => {
    const user = userEvent.setup()
    render(<BuyerCriteriaForm onSubmit={mockOnSubmit} />)

    const submitButton = screen.getByRole("button", { name: /generate report/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/client name is required/i)).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it("submits form with valid data", async () => {
    const user = userEvent.setup()
    render(<BuyerCriteriaForm onSubmit={mockOnSubmit} />)

    await user.type(screen.getByLabelText(/client name/i), "John Doe")
    await user.type(screen.getByLabelText(/budget range/i), "$500,000 - $700,000")
    await user.type(screen.getByLabelText(/preferred location/i), "Downtown Toronto")

    const submitButton = screen.getByRole("button", { name: /generate report/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          clientName: "John Doe",
          budgetRange: "$500,000 - $700,000",
          preferredLocation: "Downtown Toronto",
        }),
      )
    })
  })

  it("handles role selection", async () => {
    const user = userEvent.setup()
    render(<BuyerCriteriaForm onSubmit={mockOnSubmit} />)

    const roleSelect = screen.getByRole("combobox")
    await user.click(roleSelect)

    const sellerOption = screen.getByText("Seller")
    await user.click(sellerOption)

    expect(screen.getByDisplayValue("Seller")).toBeInTheDocument()
  })
})
