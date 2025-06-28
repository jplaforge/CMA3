# Testing Guide

This project uses Jest and React Testing Library for testing.

## Running Tests

\`\`\`bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:coverage

# Run tests for CI (no watch mode)
yarn test:ci
\`\`\`

## Test Structure

- `__tests__/components/` - Component tests
- `__tests__/lib/` - Utility function tests
- `__tests__/api/` - API route tests

## Writing Tests

### Component Tests
\`\`\`typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MyComponent from '@/components/MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })
})
\`\`\`

### API Tests
\`\`\`typescript
import { POST } from '@/app/api/my-route/route'
import { NextRequest } from 'next/server'

describe('/api/my-route', () => {
  it('handles POST requests', async () => {
    const request = new NextRequest('http://localhost:3000/api/my-route', {
      method: 'POST',
      body: JSON.stringify({ data: 'test' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(200)
  })
})
\`\`\`

## Coverage Goals

- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## Mocking

Common mocks are set up in `jest.setup.js`:
- Next.js router and navigation
- Environment variables
- Google Maps API
- IntersectionObserver and ResizeObserver
