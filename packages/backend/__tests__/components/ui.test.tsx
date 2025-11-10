/**
 * UI Components Tests
 * Tests for all UI components
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LoadingOverlay, LoadingSpinner, Skeleton } from '@/components/ui/loading-overlay'
import { ToastProvider, useToastContext } from '@/components/ui/toast'
import { Tooltip, InfoTooltip } from '@/components/ui/tooltip'
import { ResponsiveGrid, ResponsiveContainer } from '@/components/ui/responsive-grid'

describe('Loading Components', () => {
  describe('LoadingOverlay', () => {
    it('should render children when not loading', () => {
      render(
        <LoadingOverlay isLoading={false}>
          <div>Content</div>
        </LoadingOverlay>
      )
      
      expect(screen.getByText('Content')).toBeInTheDocument()
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    it('should show loading overlay when loading', () => {
      render(
        <LoadingOverlay isLoading={true} message="Please wait">
          <div>Content</div>
        </LoadingOverlay>
      )
      
      expect(screen.getByText('Please wait')).toBeInTheDocument()
    })

    it('should show progress when provided', () => {
      render(
        <LoadingOverlay isLoading={true} progress={50}>
          <div>Content</div>
        </LoadingOverlay>
      )
      
      expect(screen.getByText('50%')).toBeInTheDocument()
    })
  })

  describe('LoadingSpinner', () => {
    it('should render with default size', () => {
      const { container } = render(<LoadingSpinner />)
      const spinner = container.querySelector('.animate-spin')
      
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('w-8', 'h-8')
    })

    it('should render with custom size', () => {
      const { container } = render(<LoadingSpinner size="lg" />)
      const spinner = container.querySelector('.animate-spin')
      
      expect(spinner).toHaveClass('w-12', 'h-12')
    })
  })

  describe('Skeleton', () => {
    it('should render single skeleton', () => {
      const { container } = render(<Skeleton />)
      const skeletons = container.querySelectorAll('.animate-pulse')
      
      expect(skeletons).toHaveLength(1)
    })

    it('should render multiple skeletons', () => {
      const { container } = render(<Skeleton count={3} />)
      const skeletons = container.querySelectorAll('.animate-pulse')
      
      expect(skeletons).toHaveLength(3)
    })
  })
})

describe('Toast Components', () => {
  function TestToastComponent() {
    const toast = useToastContext()

    return (
      <div>
        <button onClick={() => toast.success('Success message')}>
          Show Success
        </button>
        <button onClick={() => toast.error('Error message')}>
          Show Error
        </button>
        <button onClick={() => toast.warning('Warning message')}>
          Show Warning
        </button>
        <button onClick={() => toast.info('Info message')}>
          Show Info
        </button>
      </div>
    )
  }

  it('should show success toast', async () => {
    render(
      <ToastProvider>
        <TestToastComponent />
      </ToastProvider>
    )

    fireEvent.click(screen.getByText('Show Success'))
    
    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument()
    })
  })

  it('should show error toast', async () => {
    render(
      <ToastProvider>
        <TestToastComponent />
      </ToastProvider>
    )

    fireEvent.click(screen.getByText('Show Error'))
    
    await waitFor(() => {
      expect(screen.getByText('Error message')).toBeInTheDocument()
    })
  })

  it('should close toast when clicking close button', async () => {
    render(
      <ToastProvider>
        <TestToastComponent />
      </ToastProvider>
    )

    fireEvent.click(screen.getByText('Show Success'))
    
    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument()
    })

    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)

    await waitFor(() => {
      expect(screen.queryByText('Success message')).not.toBeInTheDocument()
    })
  })
})

describe('Tooltip Components', () => {
  it('should show tooltip on hover', async () => {
    render(
      <Tooltip content="Tooltip content">
        <button>Hover me</button>
      </Tooltip>
    )

    const button = screen.getByText('Hover me')
    fireEvent.mouseEnter(button)

    await waitFor(() => {
      expect(screen.getByText('Tooltip content')).toBeInTheDocument()
    })
  })

  it('should hide tooltip on mouse leave', async () => {
    render(
      <Tooltip content="Tooltip content">
        <button>Hover me</button>
      </Tooltip>
    )

    const button = screen.getByText('Hover me')
    fireEvent.mouseEnter(button)

    await waitFor(() => {
      expect(screen.getByText('Tooltip content')).toBeInTheDocument()
    })

    fireEvent.mouseLeave(button)

    await waitFor(() => {
      expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument()
    })
  })

  it('should render InfoTooltip with help icon', () => {
    const { container } = render(
      <InfoTooltip content="Help text" />
    )

    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })
})

describe('Responsive Components', () => {
  describe('ResponsiveGrid', () => {
    it('should render children in grid', () => {
      render(
        <ResponsiveGrid>
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </ResponsiveGrid>
      )

      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getByText('Item 3')).toBeInTheDocument()
    })

    it('should apply custom columns', () => {
      const { container } = render(
        <ResponsiveGrid cols={{ default: 2, md: 3, lg: 4 }}>
          <div>Item</div>
        </ResponsiveGrid>
      )

      const grid = container.firstChild
      expect(grid).toHaveClass('grid')
    })
  })

  describe('ResponsiveContainer', () => {
    it('should render children with max width', () => {
      render(
        <ResponsiveContainer maxWidth="lg">
          <div>Content</div>
        </ResponsiveContainer>
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('should apply padding when enabled', () => {
      const { container } = render(
        <ResponsiveContainer padding={true}>
          <div>Content</div>
        </ResponsiveContainer>
      )

      const wrapper = container.firstChild
      expect(wrapper).toHaveClass('px-4')
    })
  })
})

describe('Error Boundary', () => {
  it('should catch errors and display fallback UI', () => {
    const ThrowError = () => {
      throw new Error('Test error')
    }

    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Reload Page')).toBeInTheDocument()

    consoleSpy.mockRestore()
  })

  it('should render children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Normal content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Normal content')).toBeInTheDocument()
  })
})
