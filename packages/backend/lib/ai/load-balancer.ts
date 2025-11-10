/**
 * Load Balancer for Vanchin AI API Endpoints
 * Distributes requests across 39 available endpoints using least-used strategy
 */

import { createLogger } from '../utils/logger';

const logger = createLogger({ component: 'LoadBalancer' });

interface EndpointInfo {
  index: number;
  apiKey: string;
  endpoint: string;
  usage: number;
  lastUsed: number;
  errors: number;
  isHealthy: boolean;
}

class VanchinLoadBalancer {
  private endpoints: Map<number, EndpointInfo> = new Map();
  private readonly maxEndpoints = 39;
  private readonly errorThreshold = 5;
  private readonly healthCheckInterval = 60000; // 1 minute

  constructor() {
    this.initializeEndpoints();
    this.startHealthCheck();
  }

  /**
   * Initialize all available endpoints from environment variables
   */
  private initializeEndpoints() {
    for (let i = 1; i <= this.maxEndpoints; i++) {
      const apiKey = process.env[`VANCHIN_API_KEY_${i}`];
      const endpoint = process.env[`VANCHIN_ENDPOINT_${i}`];

      if (apiKey && endpoint) {
        this.endpoints.set(i, {
          index: i,
          apiKey,
          endpoint,
          usage: 0,
          lastUsed: 0,
          errors: 0,
          isHealthy: true
        });
      }
    }

    logger.info(`Initialized ${this.endpoints.size} Vanchin AI endpoints`);
  }

  /**
   * Get the least-used healthy endpoint
   */
  public getEndpoint(): EndpointInfo | null {
    const healthyEndpoints = Array.from(this.endpoints.values())
      .filter(ep => ep.isHealthy);

    if (healthyEndpoints.length === 0) {
      logger.error('No healthy endpoints available');
      return null;
    }

    // Sort by usage (least used first), then by last used time
    healthyEndpoints.sort((a, b) => {
      if (a.usage !== b.usage) {
        return a.usage - b.usage;
      }
      return a.lastUsed - b.lastUsed;
    });

    const selected = healthyEndpoints[0];
    
    // Update usage stats
    selected.usage++;
    selected.lastUsed = Date.now();

    logger.info(`Selected endpoint ${selected.index}`, {
      usage: selected.usage,
      totalHealthy: healthyEndpoints.length
    });

    return selected;
  }

  /**
   * Get a specific endpoint by index
   */
  public getEndpointByIndex(index: number): EndpointInfo | null {
    return this.endpoints.get(index) || null;
  }

  /**
   * Report successful request
   */
  public reportSuccess(index: number) {
    const endpoint = this.endpoints.get(index);
    if (endpoint) {
      endpoint.errors = 0;
      endpoint.isHealthy = true;
    }
  }

  /**
   * Report failed request
   */
  public reportError(index: number, error: Error) {
    const endpoint = this.endpoints.get(index);
    if (endpoint) {
      endpoint.errors++;
      
      if (endpoint.errors >= this.errorThreshold) {
        endpoint.isHealthy = false;
        logger.warn(`Endpoint ${index} marked as unhealthy`, {
          errors: endpoint.errors,
          error: error.message
        });
      }
    }
  }

  /**
   * Get load balancer statistics
   */
  public getStats() {
    const endpoints = Array.from(this.endpoints.values());
    
    return {
      total: endpoints.length,
      healthy: endpoints.filter(ep => ep.isHealthy).length,
      unhealthy: endpoints.filter(ep => !ep.isHealthy).length,
      totalUsage: endpoints.reduce((sum, ep) => sum + ep.usage, 0),
      endpoints: endpoints.map(ep => ({
        index: ep.index,
        usage: ep.usage,
        errors: ep.errors,
        isHealthy: ep.isHealthy,
        lastUsed: ep.lastUsed
      }))
    };
  }

  /**
   * Reset usage statistics
   */
  public resetStats() {
    for (const endpoint of this.endpoints.values()) {
      endpoint.usage = 0;
      endpoint.lastUsed = 0;
    }
    logger.info('Load balancer stats reset');
  }

  /**
   * Periodic health check to recover unhealthy endpoints
   */
  private startHealthCheck() {
    setInterval(() => {
      const unhealthyEndpoints = Array.from(this.endpoints.values())
        .filter(ep => !ep.isHealthy);

      if (unhealthyEndpoints.length > 0) {
        logger.info(`Attempting to recover ${unhealthyEndpoints.length} unhealthy endpoints`);
        
        for (const endpoint of unhealthyEndpoints) {
          // Reset error count after health check interval
          endpoint.errors = Math.max(0, endpoint.errors - 1);
          
          if (endpoint.errors === 0) {
            endpoint.isHealthy = true;
            logger.info(`Endpoint ${endpoint.index} recovered`);
          }
        }
      }
    }, this.healthCheckInterval);
  }

  /**
   * Get endpoint for specific agent (backward compatibility)
   */
  public getAgentEndpoint(agentId: string): EndpointInfo | null {
    // Map agent IDs to preferred endpoint indices
    const agentMapping: Record<string, number> = {
      agent1: 1,
      agent2: 2,
      agent3: 3,
      agent4: 4,
      agent5: 5,
      agent6: 6,
      agent7: 7
    };

    const preferredIndex = agentMapping[agentId];
    
    if (preferredIndex) {
      const preferred = this.getEndpointByIndex(preferredIndex);
      if (preferred && preferred.isHealthy) {
        preferred.usage++;
        preferred.lastUsed = Date.now();
        return preferred;
      }
    }

    // Fallback to least-used endpoint
    return this.getEndpoint();
  }
}

// Singleton instance
let loadBalancerInstance: VanchinLoadBalancer | null = null;

export function getLoadBalancer(): VanchinLoadBalancer {
  if (!loadBalancerInstance) {
    loadBalancerInstance = new VanchinLoadBalancer();
  }
  return loadBalancerInstance;
}

export type { EndpointInfo };
