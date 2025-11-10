import { SiteHeader } from '@/components/site-header';
import Link from 'next/link';
import { Book, Rocket, Code, Database, Shield, Zap, CheckCircle2 } from 'lucide-react';

export default function DocsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
          <div className="container-modern section-spacing-sm">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 animate-fade-in">
                Documentation
              </h1>
              <p className="text-lg text-muted-foreground">
                เรียนรู้วิธีใช้งาน Mr.Prompt และสร้างเว็บไซต์ด้วย AI Agent
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="container-narrow py-16">
          <div className="space-y-12">
            {/* Getting Started */}
            <div className="card-modern">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Rocket className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-3xl font-bold">Getting Started</h2>
              </div>
              <p className="text-muted-foreground mb-6">
                Mr.Prompt เป็นแพลตฟอร์ม AI Agent ที่ช่วยสร้างเว็บไซต์ Full-Stack จากคำสั่งภาษาธรรมชาติ ภายในไม่กี่นาที
              </p>
            </div>

            {/* How to Use */}
            <div className="card-modern">
              <h2 className="text-2xl font-bold mb-6">How to Use</h2>
              <div className="space-y-4">
                {[
                  'สมัครสมาชิกและเข้าสู่ระบบ',
                  'ไปที่หน้า Dashboard',
                  'กรอกคำอธิบายโปรเจกต์ที่ต้องการสร้าง',
                  'กดปุ่ม "สร้างเว็บไซต์"',
                  'รอให้ AI Agents สร้างโปรเจกต์ให้',
                  'Download หรือ Deploy โปรเจกต์ของคุณ',
                ].map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {index + 1}
                    </div>
                    <p className="pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="card-modern">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <Zap className="h-6 w-6 text-secondary" />
                </div>
                <h2 className="text-2xl font-bold">Features</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  'AI-Powered Code Generation',
                  '7 Specialized AI Agents',
                  'Full-Stack Projects (Next.js + TypeScript)',
                  'Auto Deploy to Vercel',
                  'GitHub Integration',
                  'Real-time Progress Tracking',
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Agents */}
            <div className="card-modern">
              <h2 className="text-2xl font-bold mb-6">AI Agents</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {[
                  {
                    number: 1,
                    title: 'Prompt Expander & Analyzer',
                    description: 'วิเคราะห์และขยายความ prompt ให้ครบถ้วน',
                    icon: Book,
                  },
                  {
                    number: 2,
                    title: 'Architecture Designer',
                    description: 'ออกแบบสถาปัตยกรรมของระบบ',
                    icon: Code,
                  },
                  {
                    number: 3,
                    title: 'Database & Backend Developer',
                    description: 'สร้าง API Routes และ Server Logic',
                    icon: Database,
                  },
                  {
                    number: 4,
                    title: 'Frontend Component Developer',
                    description: 'สร้าง UI Components และ Pages',
                    icon: Code,
                  },
                  {
                    number: 5,
                    title: 'Integration & Logic Developer',
                    description: 'เชื่อมต่อ Frontend-Backend',
                    icon: Zap,
                  },
                  {
                    number: 6,
                    title: 'Testing & QA',
                    description: 'สร้าง Test Cases และ Quality Assurance',
                    icon: Shield,
                  },
                  {
                    number: 7,
                    title: 'Optimization & Deployment',
                    description: 'จัดการ Deployment และ Configuration',
                    icon: Rocket,
                  },
                ].map((agent) => {
                  const Icon = agent.icon;
                  return (
                    <div key={agent.number} className="p-4 rounded-lg border border-border hover:shadow-md transition-smooth">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">
                            Agent {agent.number}: {agent.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">{agent.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Troubleshooting */}
            <div className="card-modern">
              <h2 className="text-2xl font-bold mb-6">Troubleshooting</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Q: ทำไม AI ไม่ตอบกลับ?</h3>
                  <p className="text-muted-foreground">
                    A: ตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและลองใหม่อีกครั้ง หากยังไม่ได้ กรุณาติดต่อทีมสนับสนุน
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Q: สามารถแก้ไขโค้ดที่ AI สร้างได้หรือไม่?</h3>
                  <p className="text-muted-foreground">
                    A: ได้ คุณสามารถแก้ไขโค้ดใน Code Editor ได้ตามต้องการ
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Q: Deploy ไปที่ไหนได้บ้าง?</h3>
                  <p className="text-muted-foreground">
                    A: ปัจจุบันรองรับ Vercel และคุณสามารถ Download เป็น ZIP ไป Deploy เองได้
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container-modern py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 Mr.Prompt. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-smooth">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-primary transition-smooth">
                Terms of Service
              </Link>
              <Link href="/about" className="text-muted-foreground hover:text-primary transition-smooth">
                About
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-primary transition-smooth">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
