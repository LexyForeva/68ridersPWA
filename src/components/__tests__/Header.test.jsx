/**
 * Header Component Tests
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Header from '../Header'

const mockUseAuth = {
  profile: {
    member_no: '68123',
    full_name: 'Test User',
  },
}

// Mock auth context
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth,
}))

describe('Header Component', () => {
  it('should render header with user info', () => {
    render(
      <BrowserRouter>
        <Header title="Test Title" />
      </BrowserRouter>
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('68123')).toBeInTheDocument()
  })

  it('should render logo', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    )

    const logo = screen.getByRole('link', { name: /68 riders/i })
    expect(logo).toBeInTheDocument()
  })
})
