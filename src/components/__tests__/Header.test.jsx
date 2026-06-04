/**
 * Header Component Tests
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Header from '../Header'

vi.mock('../../context/AppContext', () => ({
  useAppData: () => ({
    currentUser: {
      name: 'Test User',
      photoUrl: '',
    },
  }),
}))

describe('Header Component', () => {
  it('should render header actions', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>,
    )

    expect(screen.getByLabelText('Duyurular')).toBeInTheDocument()
    expect(screen.getByLabelText('Profil')).toBeInTheDocument()
  })

  it('should render logo', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>,
    )

    expect(screen.getByText('68')).toBeInTheDocument()
    expect(screen.getByText('RIDERS')).toBeInTheDocument()
  })
})
