/**
 * Deployment Monitoring
 * Track and monitor deployment status across GitHub and Vercel
 */

import { createVercelClient } from '@/lib/integrations/vercel-client'

export interface DeploymentStatus {
  id: string
  projectId: string
  status: 'pending' | 'building' | 'ready' | 'error' | 'canceled'
  githubUrl?: string
  vercelUrl?: string
  deploymentUrl?: string
  error?: string
  startedAt: Date
  completedAt?: Date
  duration?: number
  buildLogs?: string[]
}

export interface DeploymentMetrics {
  totalDeployments: number
  successfulDeployments: number
  failedDeployments: number
  averageDuration: number
  lastDeployment?: DeploymentStatus
}

export class DeploymentMonitor {
  private deployments: Map<string, DeploymentStatus> = new Map()
  
  /**
   * Start monitoring a deployment
   */
  startMonitoring(deploymentId: string, projectId: string): DeploymentStatus {
    const status: DeploymentStatus = {
      id: deploymentId,
      projectId,
      status: 'pending',
      startedAt: new Date()
    }
    
    this.deployments.set(deploymentId, status)
    return status
  }
  
  /**
   * Update deployment status
   */
  updateStatus(
    deploymentId: string,
    updates: Partial<DeploymentStatus>
  ): DeploymentStatus | null {
    const deployment = this.deployments.get(deploymentId)
    if (!deployment) {
      return null
    }
    
    const updated = {
      ...deployment,
      ...updates
    }
    
    // Calculate duration if completed
    if (updates.status && ['ready', 'error', 'canceled'].includes(updates.status)) {
      updated.completedAt = new Date()
      updated.duration = updated.completedAt.getTime() - deployment.startedAt.getTime()
    }
    
    this.deployments.set(deploymentId, updated)
    return updated
  }
  
  /**
   * Get deployment status
   */
  getStatus(deploymentId: string): DeploymentStatus | null {
    return this.deployments.get(deploymentId) || null
  }
  
  /**
   * Poll Vercel deployment status
   */
  async pollVercelStatus(
    deploymentId: string,
    vercelDeploymentId: string,
    vercelToken: string,
    maxAttempts = 60,
    intervalMs = 5000
  ): Promise<DeploymentStatus> {
    const vercelClient = createVercelClient(vercelToken)
    let attempts = 0
    
    while (attempts < maxAttempts) {
      try {
        const result = await vercelClient.getDeployment(vercelDeploymentId)
        
        if (result.success) {
          const vercelStatus = result.status
          
          // Map Vercel status to our status
          let status: DeploymentStatus['status'] = 'building'
          
          if (vercelStatus === 'READY') {
            status = 'ready'
          } else if (vercelStatus === 'ERROR') {
            status = 'error'
          } else if (vercelStatus === 'CANCELED') {
            status = 'canceled'
          }
          
          this.updateStatus(deploymentId, {
            status,
            deploymentUrl: result.url
          })
          
          // If deployment is complete, return
          if (['ready', 'error', 'canceled'].includes(status)) {
            return this.getStatus(deploymentId)!
          }
        }
      } catch (error) {
        console.error('[DeploymentMonitor] Error polling Vercel:', error)
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, intervalMs))
      attempts++
    }
    
    // Timeout
    this.updateStatus(deploymentId, {
      status: 'error',
      error: 'Deployment timeout - exceeded maximum polling attempts'
    })
    
    return this.getStatus(deploymentId)!
  }
  
  /**
   * Get deployment metrics for a project
   */
  getMetrics(projectId: string): DeploymentMetrics {
    const projectDeployments = Array.from(this.deployments.values())
      .filter(d => d.projectId === projectId)
    
    const total = projectDeployments.length
    const successful = projectDeployments.filter(d => d.status === 'ready').length
    const failed = projectDeployments.filter(d => d.status === 'error').length
    
    const durations = projectDeployments
      .filter(d => d.duration !== undefined)
      .map(d => d.duration!)
    
    const averageDuration = durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0
    
    const lastDeployment = projectDeployments
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())[0]
    
    return {
      totalDeployments: total,
      successfulDeployments: successful,
      failedDeployments: failed,
      averageDuration,
      lastDeployment
    }
  }
  
  /**
   * Get all deployments for a project
   */
  getProjectDeployments(projectId: string): DeploymentStatus[] {
    return Array.from(this.deployments.values())
      .filter(d => d.projectId === projectId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
  }
  
  /**
   * Clear old deployments (keep last N per project)
   */
  cleanup(keepPerProject = 10) {
    const projectGroups = new Map<string, DeploymentStatus[]>()
    
    // Group by project
    for (const deployment of this.deployments.values()) {
      const group = projectGroups.get(deployment.projectId) || []
      group.push(deployment)
      projectGroups.set(deployment.projectId, group)
    }
    
    // Keep only last N deployments per project
    for (const [projectId, deployments] of projectGroups.entries()) {
      const sorted = deployments.sort((a, b) => 
        b.startedAt.getTime() - a.startedAt.getTime()
      )
      
      const toKeep = sorted.slice(0, keepPerProject)
      const toRemove = sorted.slice(keepPerProject)
      
      for (const deployment of toRemove) {
        this.deployments.delete(deployment.id)
      }
    }
  }
  
  /**
   * Export deployment history
   */
  exportHistory(): DeploymentStatus[] {
    return Array.from(this.deployments.values())
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
  }
}

// Global deployment monitor instance
export const deploymentMonitor = new DeploymentMonitor()

/**
 * Helper function to format duration
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}

/**
 * Helper function to get status color
 */
export function getStatusColor(status: DeploymentStatus['status']): string {
  switch (status) {
    case 'ready':
      return 'green'
    case 'building':
      return 'blue'
    case 'error':
      return 'red'
    case 'canceled':
      return 'gray'
    default:
      return 'yellow'
  }
}

/**
 * Helper function to get status icon
 */
export function getStatusIcon(status: DeploymentStatus['status']): string {
  switch (status) {
    case 'ready':
      return '✅'
    case 'building':
      return '🔨'
    case 'error':
      return '❌'
    case 'canceled':
      return '⚠️'
    default:
      return '⏳'
  }
}
