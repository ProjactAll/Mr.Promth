"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DeploymentDialog } from './DeploymentDialog'
import { Rocket } from 'lucide-react'

interface DeploymentButtonProps {
  projectId: string
  projectName: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export function DeploymentButton({ 
  projectId, 
  projectName,
  variant = 'default',
  size = 'default',
  className = ''
}: DeploymentButtonProps) {
  const [showDialog, setShowDialog] = useState(false)

  return (
    <>
      <Button
        onClick={() => setShowDialog(true)}
        variant={variant}
        size={size}
        className={`gap-2 ${className}`}
      >
        <Rocket className="w-4 h-4" />
        Deploy
      </Button>

      {showDialog && (
        <DeploymentDialog
          projectId={projectId}
          projectName={projectName}
          onClose={() => setShowDialog(false)}
        />
      )}
    </>
  )
}
