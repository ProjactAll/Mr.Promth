'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AgentChainProgress, AgentStep, AgentStepStatus } from '@/components/AgentChainProgress';
import { PromptInput } from '@/components/PromptInput';
import { ProjectOutput } from '@/components/ProjectOutput';
import { BuildMonitor } from '@/components/build-monitor';
import { ControlPanel } from '@/components/control-panel';
import { TerminalAccess } from '@/components/terminal-access';
import type {
  Agent1Output,
  Agent2Output,
  AgentChainResultPayload,
  AgentLogRecord,
  ProjectRecord,
} from '@/lib/agents/types';

const TOTAL_AGENTS = 7;

type AgentTemplate = Pick<AgentStep, 'id' | 'title' | 'description'>;

const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    id: 1,
    title: 'Prompt Expander & Analyzer',
    description: 'แปลง prompt เริ่มต้นให้เป็นสเปคโปรเจกต์ที่ละเอียด ครอบคลุมทุกความต้องการ',
  },
  {
    id: 2,
    title: 'Architecture Designer',
    description: 'วางสถาปัตยกรรมระบบ โครงสร้าง database และ dependency ทั้งหมด',
  },
  {
    id: 3,
    title: 'Database & Backend Developer',
    description: 'สร้างสคริปต์ migration และ API routes ตามสเปค',
  },
  {
    id: 4,
    title: 'Frontend Component Developer',
    description: 'ประกอบ UI components และหน้าเว็บให้ตรงตามดีไซน์',
  },
  {
    id: 5,
    title: 'Integration & Logic Developer',
    description: 'เชื่อมต่อ frontend-backend จัดการ state validation และ business logic',
  },
  {
    id: 6,
    title: 'Testing & Quality Assurance',
    description: 'สร้างชุดทดสอบ ตรวจสอบคุณภาพและความเสถียรของระบบ',
  },
  {
    id: 7,
    title: 'Optimization & Deployment',
    description: 'ปรับประสิทธิภาพและเตรียม configuration สำหรับ deploy ขึ้น Vercel',
  },
];

function summarizeLog(agentNumber: number, output: unknown): string | undefined {
  if (!output || typeof output !== 'object') {
    return undefined;
  }

  if (agentNumber === 1) {
    const spec = output as Partial<Agent1Output>;
    const featureCount = Array.isArray(spec.features) ? spec.features.length : 0;
    const pageCount = Array.isArray(spec.pages) ? spec.pages.length : 0;
    const projectType = spec.project_type ?? 'Unknown';
    return `Project: ${projectType} · Features: ${featureCount} · Pages: ${pageCount}`;
  }

  if (agentNumber === 2) {
    const architecture = output as Partial<Agent2Output>;
    const tableCount = architecture.database_schema?.tables?.length ?? 0;
    const endpointCount = architecture.api_endpoints?.length ?? 0;
    return `Tables: ${tableCount} · APIs: ${endpointCount}`;
  }

  return undefined;
}

function buildSteps(
  templates: AgentTemplate[],
  project: ProjectRecord | null,
  logs: AgentLogRecord[],
): AgentStep[] {
  return templates.map((template) => {
    const log = logs.find((entry) => entry.agent_number === template.id) ?? null;
    let status: AgentStepStatus = 'idle';

    if (log) {
      if (log.status === 'completed') status = 'completed';
      else if (log.status === 'error') status = 'error';
    } else if (project) {
      if (project.status === 'error' && project.current_agent === template.id) {
        status = 'error';
      } else if (project.status === 'running' && project.current_agent === template.id) {
        status = 'running';
      } else if (project.status === 'pending' && template.id === 1) {
        status = 'running';
      }
    }

    return {
      ...template,
      status,
      outputPreview: summarizeLog(template.id, log?.output ?? undefined),
    } satisfies AgentStep;
  });
}

function formatSpecSection(output: Agent1Output): string {
  const lines = [
    `Project Type: ${output.project_type}`,
    `Design Style: ${output.design_style}`,
    '',
  ];

  if (output.features?.length) {
    lines.push('Key Features:', ...output.features.map((feature) => `• ${feature}`), '');
  }

  if (output.pages?.length) {
    lines.push('Core Pages:', ...output.pages.map((page) => `• ${page}`), '');
  }

  lines.push('Expanded Specification:', output.expanded_prompt);
  return lines.join('\n');
}

function formatArchitectureSection(output: Agent2Output): string {
  const dependencyEntries = Object.entries(output.dependencies ?? {});
  const tableLines = output.database_schema?.tables?.map(
    (table) => `• ${table.name}: ${table.columns.join(', ')}`,
  ) ?? [];

  const lines = ['Folder Structure:', ...output.folder_structure.app.map((item) => `• app/${item}`), ''];

  if (output.folder_structure.components?.length) {
    lines.push('Components:', ...output.folder_structure.components.map((item) => `• ${item}`), '');
  }

  if (output.api_endpoints?.length) {
    lines.push('API Endpoints:', ...output.api_endpoints.map((endpoint) => `• ${endpoint}`), '');
  }

  if (tableLines.length) {
    lines.push('Database Tables:', ...tableLines, '');
  }

  if (dependencyEntries.length) {
    lines.push(
      'Dependencies:',
      ...dependencyEntries.map(([name, version]) => `• ${name}@${version}`),
      '',
    );
  }

  return lines.join('\n');
}

export default function DashboardPage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [logs, setLogs] = useState<AgentLogRecord[]>([]);
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pollerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollerRef.current) {
      clearInterval(pollerRef.current);
      pollerRef.current = null;
    }
  }, []);

  const fetchProject = useCallback(async () => {
    if (!projectId) return;

    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) {
        if (response.status === 404) {
          stopPolling();
          setErrorMessage('ไม่พบโปรเจกต์ที่ระบุ');
        } else if (response.status === 401) {
          stopPolling();
          setErrorMessage('กรุณาเข้าสู่ระบบอีกครั้ง');
        }
        return;
      }

      const data: { project: ProjectRecord; logs: AgentLogRecord[] } = await response.json();
      setProject(data.project);
      setLogs(data.logs ?? []);

      if (data.project.status === 'completed' || data.project.status === 'error') {
        stopPolling();
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      // Don't stop polling on network errors, just log them
    }

  }, [projectId, stopPolling]);

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  useEffect(() => {
    if (!projectId) return;

    fetchProject().catch((error) => {
      console.error(error);
      setErrorMessage('ไม่สามารถดึงสถานะโปรเจกต์ได้ กรุณาลองใหม่');
    });

    if (!pollerRef.current) {
      pollerRef.current = setInterval(() => {
        fetchProject().catch((error) => {
          console.error(error);
        });
      }, 3000);
    }
  }, [projectId, fetchProject]);

  const handleGenerate = useCallback(
    async (prompt: string) => {
      setErrorMessage(null);
      setIsSubmitting(true);
      setActivePrompt(prompt);
      setProject(null);
      setLogs([]);
      stopPolling();

      try {
        const response = await fetch('/api/agent-chain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
          const data = await response.json();
          if (response.status === 401) {
            throw new Error('กรุณาเข้าสู่ระบบก่อนสร้างโปรเจกต์');
          }
          if (response.status === 403) {
            throw new Error('คุณไม่มีสิทธิ์ในการสร้างโปรเจกต์');
          }
          if (response.status === 429) {
            throw new Error('คุณสร้างโปรเจกต์บ่อยเกินไป กรุณารอสักครู่');
          }
          throw new Error(data.error || 'เกิดข้อผิดพลาดในการสร้างโปรเจกต์ กรุณาลองใหม่อีกครั้ง');
        }

        const data = await response.json();

        setProjectId(data.project_id as string);
      } catch (error) {
        console.error(error);
        if (error instanceof TypeError && error.message.includes('fetch')) {
          setErrorMessage('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
        } else {
          setErrorMessage(error instanceof Error ? error.message : 'ไม่สามารถเริ่มกระบวนการได้ กรุณาลองใหม่อีกครั้ง');
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [stopPolling],
  );

  const derivedSteps = useMemo(() => buildSteps(AGENT_TEMPLATES, project, logs), [project, logs]);

  const chainOutput = useMemo<Partial<AgentChainResultPayload> | null>(() => {
    if (!project) return null;
    if (project.final_output) return project.final_output;
    if (project.agent_outputs && typeof project.agent_outputs === 'object') {
      return project.agent_outputs as Partial<AgentChainResultPayload>;
    }
    return null;
  }, [project]);

  const projectSections = useMemo(() => {
    if (!chainOutput) return undefined;
    const sections: { title: string; content: string; icon?: 'spec' | 'architecture' | 'code' }[] = [];

    if (chainOutput.agent1_output) {
      sections.push({
        title: 'Expanded Specification',
        icon: 'spec',
        content: formatSpecSection(chainOutput.agent1_output),
      });
    }

    if (chainOutput.agent2_output) {
      sections.push({
        title: 'Architecture Blueprint',
        icon: 'architecture',
        content: formatArchitectureSection(chainOutput.agent2_output),
      });
    }

    return sections.length > 0 ? sections : undefined;
  }, [chainOutput]);

  const stats = useMemo(
    () => [
      { label: 'Agents', value: TOTAL_AGENTS.toString() },
      { label: 'Status', value: project?.status ? project.status.toUpperCase() : 'IDLE' },
      { label: 'Deploy Ready', value: 'Vercel' },
    ],
    [project?.status],
  );

  const isGenerating = isSubmitting || (project?.status === 'running' || project?.status === 'pending');

  return (
    <div className="flex flex-1 flex-col gap-10 pb-12">
      <section className="rounded-4xl border border-border/60 bg-card/95 p-10 shadow-xl shadow-primary/10">

        {errorMessage ? (
          <div className="mt-6 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : null}

        <PromptInput onGenerate={handleGenerate} isLoading={isGenerating} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <AgentChainProgress steps={derivedSteps} />
        <ProjectOutput
          prompt={activePrompt}
          isLoading={isGenerating}
          sections={projectSections}
          errorMessage={project?.error_message ?? null}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BuildMonitor projectId={projectId ?? undefined} />
        <ControlPanel
          isRunning={isGenerating}
          isPaused={false}
          onStart={() => console.log('Start')}
          onPause={() => console.log('Pause')}
          onStop={() => console.log('Stop')}
          onContinue={() => console.log('Continue')}
          onReset={() => {
            setProject(null);
            setLogs([]);
            setProjectId(null);
            setActivePrompt(null);
          }}
        />
      </div>

      {/* Terminal Access - Floating */}
      <TerminalAccess
        projectId={projectId ?? undefined}
        isActive={isGenerating}
        onStop={() => console.log('Stop terminal')}
      />
    </div>
  );
}
