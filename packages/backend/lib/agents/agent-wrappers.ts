/**
 * Agent Wrappers
 * แปลง output จาก Agent 1-3 เป็น input สำหรับ Agent 4-7
 */

import { createLogger } from '../utils/logger'
import type { Agent1Output, Agent2Output } from './types'
import type { Agent3Output } from './agent3'
import type { Agent4Request, Agent4Result } from './agent4-frontend-generator'
import type { Agent5Request, Agent5Result } from './agent5-testing-qa'
import type { Agent6Request, Agent6Result } from './agent6-deployment'
import type { Agent7Request, Agent7Result } from './agent7-monitoring'

import { agent4GenerateFrontend } from './agent4-frontend-generator'
import { agent5TestingQA } from './agent5-testing-qa'
import { agent6Deploy } from './agent6-deployment'
import { agent7Monitor } from './agent7-monitoring'

/**
 * Wrapper for Agent 4: Frontend Generator
 * แปลง Agent 1-3 outputs เป็น Agent4Request
 */
export async function executeAgent4Wrapper(
  agent1Output: Agent1Output,
  agent2Output: Agent2Output,
  agent3Output: Agent3Output,
  projectId: string
): Promise<Agent4Result> {
  const logger = createLogger({ component: 'Agent4Wrapper', projectId });
  logger.info('Preparing frontend generation');
  
  // สร้าง project path (ในระบบจริงควรใช้ workspace manager)
  const projectPath = `/tmp/projects/${projectId}`
  
  // แปลง pages จาก Agent 1 เป็น tasks
  const pages = agent1Output.pages || []
  
  // สร้าง request สำหรับ Agent 4
  const request: Agent4Request = {
    projectId,
    projectPath,
    task: {
      type: 'page',
      description: `Generate frontend pages based on: ${agent1Output.expanded_prompt}
      
Pages to create: ${pages.join(', ')}
Tech stack: ${agent1Output.tech_stack.frontend}
Styling: ${agent1Output.tech_stack.styling}
Design style: ${agent1Output.design_style}`,
      specifications: {
        components: agent2Output.folder_structure.components || [],
        styling: agent1Output.tech_stack.styling === 'Tailwind CSS' ? 'tailwind' : 'css-modules',
        responsive: true,
        accessibility: true,
        dataSource: {
          type: 'supabase',
        }
      }
    }
  }
  
  return agent4GenerateFrontend(request)
}

/**
 * Wrapper for Agent 5: Testing & QA
 */
export async function executeAgent5Wrapper(
  agent1Output: Agent1Output,
  agent2Output: Agent2Output,
  agent3Output: Agent3Output,
  agent4Output: Agent4Result,
  projectId: string
): Promise<Agent5Result> {
  const logger = createLogger({ component: 'Agent5Wrapper', projectId });
  logger.info('Preparing testing & QA');
  
  const projectPath = `/tmp/projects/${projectId}`
  
  const request: Agent5Request = {
    projectId,
    projectPath,
    task: {
      type: 'full-qa',
      targetFiles: agent4Output.filesGenerated.map(f => f.path) || [],
      testFramework: 'vitest',
      coverageThreshold: 80
    }
  }
  
  return agent5TestingQA(request)
}

/**
 * Wrapper for Agent 6: Deployment
 */
export async function executeAgent6Wrapper(
  agent1Output: Agent1Output,
  agent2Output: Agent2Output,
  agent3Output: Agent3Output,
  agent4Output: Agent4Result,
  agent5Output: Agent5Result,
  projectId: string
): Promise<Agent6Result> {
  const logger = createLogger({ component: 'Agent6Wrapper', projectId });
  logger.info('Preparing deployment');
  
  const projectPath = `/tmp/projects/${projectId}`
  
  const request: Agent6Request = {
    projectId,
    projectPath,
    task: {
      type: 'full-deployment',
      platform: 'vercel',
      environment: 'production',
      envVars: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      }
    }
  }
  
  return agent6Deploy(request)
}

/**
 * Wrapper for Agent 7: Monitoring
 */
export async function executeAgent7Wrapper(
  agent1Output: Agent1Output,
  agent2Output: Agent2Output,
  agent3Output: Agent3Output,
  agent4Output: Agent4Result,
  agent5Output: Agent5Result,
  agent6Output: Agent6Result,
  projectId: string
): Promise<Agent7Result> {
  const logger = createLogger({ component: 'Agent7Wrapper', projectId });
  logger.info('Setting up monitoring');
  
  const projectPath = `/tmp/projects/${projectId}`
  
  const request: Agent7Request = {
    projectId,
    task: {
      type: 'health-check',
      data: {
        deploymentUrl: agent6Output.deploymentUrl,
        projectName: agent1Output.project_type
      }
    }
  }
  
  return agent7Monitor(request)
}
