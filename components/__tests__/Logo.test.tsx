import { render, screen } from '@testing-library/react'
import { Logo } from '@/components/Logo'

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('Logo', () => {
  it('renders the logo with correct link', () => {
    render(<Logo />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/')
    expect(link).toBeInTheDocument()
  })

  it('has accessible alt text for the logo image', () => {
    render(<Logo />)

    const logoImage = screen.getByAltText('NightStudio Logo')
    expect(logoImage).toBeInTheDocument()
  })
})