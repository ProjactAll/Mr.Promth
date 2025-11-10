"use client"

interface ResponsiveGridProps {
  children: React.ReactNode
  cols?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: number
  className?: string
}

export function ResponsiveGrid({ 
  children, 
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = 4,
  className = ''
}: ResponsiveGridProps) {
  const colClasses = []
  
  if (cols.default) colClasses.push(`grid-cols-${cols.default}`)
  if (cols.sm) colClasses.push(`sm:grid-cols-${cols.sm}`)
  if (cols.md) colClasses.push(`md:grid-cols-${cols.md}`)
  if (cols.lg) colClasses.push(`lg:grid-cols-${cols.lg}`)
  if (cols.xl) colClasses.push(`xl:grid-cols-${cols.xl}`)
  
  return (
    <div className={`grid ${colClasses.join(' ')} gap-${gap} ${className}`}>
      {children}
    </div>
  )
}

interface ResponsiveContainerProps {
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: boolean
  className?: string
}

export function ResponsiveContainer({ 
  children, 
  maxWidth = 'xl',
  padding = true,
  className = ''
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full'
  }
  
  return (
    <div className={`
      ${maxWidthClasses[maxWidth]} 
      mx-auto 
      ${padding ? 'px-4 sm:px-6 lg:px-8' : ''}
      ${className}
    `}>
      {children}
    </div>
  )
}

interface ResponsiveStackProps {
  children: React.ReactNode
  direction?: 'vertical' | 'horizontal' | 'responsive'
  gap?: number
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
  className?: string
}

export function ResponsiveStack({ 
  children, 
  direction = 'vertical',
  gap = 4,
  align = 'stretch',
  justify = 'start',
  className = ''
}: ResponsiveStackProps) {
  const directionClasses = {
    vertical: 'flex-col',
    horizontal: 'flex-row',
    responsive: 'flex-col sm:flex-row'
  }
  
  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  }
  
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around'
  }
  
  return (
    <div className={`
      flex 
      ${directionClasses[direction]} 
      ${alignClasses[align]} 
      ${justifyClasses[justify]} 
      gap-${gap}
      ${className}
    `}>
      {children}
    </div>
  )
}

interface ResponsiveCardProps {
  children: React.ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  className?: string
}

export function ResponsiveCard({ 
  children, 
  padding = 'md',
  hover = false,
  className = ''
}: ResponsiveCardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  }
  
  return (
    <div className={`
      bg-gray-800 
      border border-gray-700 
      rounded-lg 
      ${paddingClasses[padding]}
      ${hover ? 'hover:border-gray-600 hover:shadow-lg transition-all' : ''}
      ${className}
    `}>
      {children}
    </div>
  )
}

interface HideOnMobileProps {
  children: React.ReactNode
  breakpoint?: 'sm' | 'md' | 'lg'
}

export function HideOnMobile({ children, breakpoint = 'md' }: HideOnMobileProps) {
  const breakpointClasses = {
    sm: 'hidden sm:block',
    md: 'hidden md:block',
    lg: 'hidden lg:block'
  }
  
  return (
    <div className={breakpointClasses[breakpoint]}>
      {children}
    </div>
  )
}

interface ShowOnMobileProps {
  children: React.ReactNode
  breakpoint?: 'sm' | 'md' | 'lg'
}

export function ShowOnMobile({ children, breakpoint = 'md' }: ShowOnMobileProps) {
  const breakpointClasses = {
    sm: 'block sm:hidden',
    md: 'block md:hidden',
    lg: 'block lg:hidden'
  }
  
  return (
    <div className={breakpointClasses[breakpoint]}>
      {children}
    </div>
  )
}
