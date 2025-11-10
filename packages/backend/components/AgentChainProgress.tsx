'use client';

import { AlertCircle, CheckCircle2, Circle, Loader2 } from 'lucide-react';

export type AgentStepStatus = 'idle' | 'running' | 'completed' | 'error';

export interface AgentStep {
  id: number;
  title: string;
  description: string;
  status: AgentStepStatus;
  outputPreview?: string;
}

interface AgentChainProgressProps {
  steps: AgentStep[];
  isVisible?: boolean;
}

export function AgentChainProgress({ steps, isVisible = true }: AgentChainProgressProps) {
  if (!isVisible) {
    return null;
  }

  const renderIcon = (status: AgentStepStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-accent" aria-hidden />;
      case 'running':
        return <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" aria-hidden />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground/60" aria-hidden />;
    }
  };

  return (
    <section className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Agent Chain Progress</h2>
          <p className="text-sm text-muted-foreground">
            ติดตามความคืบหน้าของเอเจนต์ทั้ง 7 ขั้นตอนแบบเรียลไทม์
          </p>
        </div>
        <span className="rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          7 Agents
        </span>
      </header>
      <div className="mt-6 space-y-4">
        {steps.map((step) => (
          <article
            key={step.id}
            className="flex items-start gap-4 rounded-2xl border border-transparent bg-background/40 px-4 py-3 transition hover:border-primary/30 hover:bg-background/70"
          >
            <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-muted/50">
              {renderIcon(step.status)}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
              <p className="text-xs text-muted-foreground/90">{step.description}</p>
              {step.outputPreview ? (
                <p className="mt-2 rounded-xl bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                  {step.outputPreview}
                </p>
              ) : null}
            </div>
            <div className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {step.status === 'running' && 'กำลังทำงาน'}
              {step.status === 'completed' && 'สำเร็จ'}
              {step.status === 'error' && 'มีข้อผิดพลาด'}
              {step.status === 'idle' && 'รอคิว'}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
