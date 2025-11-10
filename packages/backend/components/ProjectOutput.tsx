'use client';

import { FileCode2, Network, Sparkles } from 'lucide-react';

interface OutputSection {
  title: string;
  content: string;
  icon?: 'spec' | 'architecture' | 'code';
}

interface ProjectOutputProps {
  prompt: string | null;
  isLoading?: boolean;
  sections?: OutputSection[];
  errorMessage?: string | null;
}

const ICONS: Record<NonNullable<OutputSection['icon']>, JSX.Element> = {
  spec: <Sparkles className="h-4 w-4" aria-hidden />,
  architecture: <Network className="h-4 w-4" aria-hidden />,
  code: <FileCode2 className="h-4 w-4" aria-hidden />,
};

export function ProjectOutput({ prompt, isLoading = false, sections, errorMessage }: ProjectOutputProps) {
  const hasSections = Array.isArray(sections) && sections.length > 0;

  return (
    <section className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Final Output</h2>
          <p className="text-sm text-muted-foreground">
            เมื่อการประมวลผลเสร็จสมบูรณ์ คุณจะเห็นสรุปโครงสร้างและโค้ดที่สร้างโดยแต่ละเอเจนต์
          </p>
        </div>
        <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
          Preview
        </span>
      </header>

      <div className="mt-6 space-y-4">
        {!prompt && !hasSections ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
            เริ่มต้นด้วยการป้อน prompt เพื่อให้ Mr.Promth สร้างเว็บไซต์ให้คุณ ระบบจะแสดงความคืบหน้าและผลลัพธ์ที่นี่
          </div>
        ) : null}

        {prompt ? (
          <article className="rounded-2xl border border-border/60 bg-background/60 px-4 py-3 text-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Current Prompt</h3>
            <p className="mt-2 text-foreground/90">{prompt}</p>
          </article>
        ) : null}

        {errorMessage ? (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : null}

        {isLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-3 w-2/3 rounded-full bg-muted/50" />
            <div className="h-3 rounded-full bg-muted/40" />
            <div className="h-3 w-5/6 rounded-full bg-muted/40" />
          </div>
        ) : null}

        {!isLoading && hasSections
          ? sections!.map((section) => (
              <article
                key={section.title}
                className="space-y-2 rounded-2xl border border-border/60 bg-background/70 px-4 py-4"
              >
                <header className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  {section.icon ? (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {ICONS[section.icon]}
                    </span>
                  ) : null}
                  {section.title}
                </header>
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {section.content}
                </p>
              </article>
            ))
          : null}
      </div>
    </section>
  );
}
