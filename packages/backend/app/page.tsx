'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Shield, 
  Code, 
  Bot, 
  Rocket,
  CheckCircle2,
  Github,
  Globe,
  Database,
  Cpu,
  Layers,
  Terminal
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Modern Header with Gradient */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container-modern flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-primary rounded-lg blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-gradient-primary p-2 rounded-lg">
                  <Bot className="h-5 w-5 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold text-gradient-primary">MR.Promth</span>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-smooth">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:text-primary transition-smooth">
              How it Works
            </Link>
            <Link href="#capabilities" className="text-sm font-medium hover:text-primary transition-smooth">
              Capabilities
            </Link>
            <Link href="/docs" className="text-sm font-medium hover:text-primary transition-smooth">
              Docs
            </Link>
          </nav>
          
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="transition-smooth hover:scale-105">
                เข้าสู่ระบบ
              </Button>
            </Link>
            <Link href="/chat">
              <Button size="sm" className="btn-primary gap-2">
                💬 เริ่มใช้งาน
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Modern Design */}
      <section className="relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
        
        <div className="relative container-modern section-spacing">
          <div className="mx-auto max-w-5xl text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Powered by 19 AI Models</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-slide-up">
              AI Assistant ที่ทำได้{' '}
              <span className="text-gradient">ทุกอย่าง</span>
              <br />
              สำหรับคุณ
            </h1>
            
            {/* Subheading */}
            <p className="mx-auto mb-12 max-w-3xl text-lg md:text-xl text-muted-foreground leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
              แชท วิเคราะห์ข้อมูล สร้างเว็บไซต์ พัฒนา API เขียนโค้ด และอื่นๆ อีกมากมาย
              <br />
              <span className="font-semibold text-foreground">ระบบ AI ที่ทรงพลังที่สุด ขับเคลื่อนด้วย 19 AI Models</span>
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link href="/generate">
                <Button size="lg" className="btn-primary text-lg px-8 py-6 gap-2 w-full sm:w-auto">
                  <Rocket className="h-5 w-5" />
                  เริ่มสร้างฟรี
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 w-full sm:w-auto transition-smooth hover:scale-105">
                  ดูวิธีการทำงาน
                </Button>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8 border-t animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div>
                <div className="text-3xl font-bold text-gradient-primary">19</div>
                <div className="text-sm text-muted-foreground">AI Models</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gradient-primary">7</div>
                <div className="text-sm text-muted-foreground">AI Agents</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gradient-primary">100%</div>
                <div className="text-sm text-muted-foreground">Automated</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative bg-muted/30">
        <div className="container-modern section-spacing">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              ทำไมต้อง <span className="text-gradient">MR.Promth</span>?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              AI Platform ที่ทรงพลังที่สุด รองรับทุกการทำงาน แชท สร้าง วิเคราะห์ และอื่นๆ
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="card-modern group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary mb-4 group-hover:scale-110 transition-smooth">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">แชท AI อัจฉริยะ</h3>
              <p className="text-muted-foreground">
                สนทนากับ AI ได้แบบธรรมชาติ ตอบคำถาม ขอคำแนะนำ และทำงานต่างๆ ได้
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card-modern group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-primary mb-4 group-hover:scale-110 transition-smooth">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">สร้างเว็บไซต์ & API</h3>
              <p className="text-muted-foreground">
                สร้างเว็บไซต์ Full-Stack และ API ได้ภายในไม่กี่นาที พร้อม Deploy
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card-modern group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-accent mb-4 group-hover:scale-110 transition-smooth">
                <Code className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">วิเคราะห์ข้อมูล</h3>
              <p className="text-muted-foreground">
                วิเคราะห์ข้อมูล สร้างกราฟ และรายงาน จากข้อมูลของคุณ
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card-modern group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-success to-primary mb-4 group-hover:scale-110 transition-smooth">
                <Layers className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">เขียนโค้ด</h3>
              <p className="text-muted-foreground">
                ช่วยเขียนโค้ดทุกภาษา อธิบาย Debug และปรับปรุงโค้ดของคุณ
              </p>
            </div>

            {/* Feature 5 */}
            <div className="card-modern group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-warning to-secondary mb-4 group-hover:scale-110 transition-smooth">
                <Github className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">รองรับหลายไฟล์</h3>
              <p className="text-muted-foreground">
                อัพโหลด แปลง และวิเคราะห์ไฟล์ต่างๆ (PDF, Images, CSV, และอื่นๆ)
              </p>
            </div>

            {/* Feature 6 */}
            <div className="card-modern group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-destructive to-warning mb-4 group-hover:scale-110 transition-smooth">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">ปลอดภัยและมั่นคง</h3>
              <p className="text-muted-foreground">
                มี Security Best Practices, Authentication, และ Rate Limiting
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative">
        <div className="container-modern section-spacing">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              วิธีการทำงาน
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              เพียง 3 ขั้นตอนง่ายๆ คุณก็จะได้เว็บไซต์ที่พร้อมใช้งาน
            </p>
          </div>
          
          <div className="grid gap-12 md:grid-cols-3 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="relative text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-2xl font-bold text-white shadow-glow">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">บอก AI ว่าต้องการอะไร</h3>
              <p className="text-muted-foreground">
                เขียนบรรยายว่าคุณต้องการเว็บไซต์แบบไหน ยิ่งละเอียดยิ่งดี
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-accent text-2xl font-bold text-white shadow-glow">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Agents สร้างให้อัตโนมัติ</h3>
              <p className="text-muted-foreground">
                7 AI Agents จะทำงานร่วมกันสร้าง Frontend, Backend, Database ให้คุณ
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary text-2xl font-bold text-white shadow-glow">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Deploy และใช้งานได้เลย</h3>
              <p className="text-muted-foreground">
                เว็บไซต์ของคุณจะถูก Deploy ขึ้น Vercel พร้อมใช้งานทันที
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Agents Section */}
      <section id="agents" className="relative bg-muted/30">
        <div className="container-modern section-spacing">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              ทีม <span className="text-gradient">AI Agents</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              7 AI Agents ที่เชี่ยวชาญเฉพาะด้าน ทำงานร่วมกันสร้างเว็บไซต์ให้คุณ
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            {[
              { name: 'Agent 1', role: 'Prompt Analyzer', icon: Terminal, color: 'from-blue-500 to-cyan-500' },
              { name: 'Agent 2', role: 'Requirements Expander', icon: Layers, color: 'from-purple-500 to-pink-500' },
              { name: 'Agent 3', role: 'Backend Generator', icon: Database, color: 'from-green-500 to-emerald-500' },
              { name: 'Agent 4', role: 'Frontend Generator', icon: Code, color: 'from-orange-500 to-red-500' },
              { name: 'Agent 5', role: 'Testing & QA', icon: CheckCircle2, color: 'from-yellow-500 to-orange-500' },
              { name: 'Agent 6', role: 'Deployment', icon: Rocket, color: 'from-indigo-500 to-purple-500' },
              { name: 'Agent 7', role: 'Monitoring', icon: Cpu, color: 'from-pink-500 to-rose-500' },
            ].map((agent, index) => (
              <div key={index} className="card-modern text-center group">
                <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${agent.color} group-hover:scale-110 transition-smooth shadow-lg`}>
                  <agent.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-1">{agent.name}</h3>
                <p className="text-sm text-muted-foreground">{agent.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-5"></div>
        <div className="relative container-modern section-spacing-sm">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              พร้อมสร้างเว็บไซต์แล้วหรือยัง?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              เริ่มต้นใช้งานฟรี ไม่ต้องใช้บัตรเครดิต สร้างเว็บไซต์ได้ทันที
            </p>
            <Link href="/generate">
              <Button size="lg" className="btn-primary text-lg px-10 py-6 gap-2">
                <Sparkles className="h-5 w-5" />
                เริ่มสร้างเว็บไซต์ฟรี
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container-modern py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-gradient-primary p-2 rounded-lg">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gradient-primary">MR.Promth</span>
              </div>
              <p className="text-muted-foreground mb-4">
                แพลตฟอร์ม AI Agent ที่ช่วยสร้างเว็บไซต์ Full-Stack ให้คุณอัตโนมัติ
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="#how-it-works" className="hover:text-primary transition-colors">How it Works</Link></li>
                <li><Link href="#agents" className="hover:text-primary transition-colors">AI Agents</Link></li>
                <li><Link href="/docs" className="hover:text-primary transition-colors">Documentation</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2025 MR.Promth. All rights reserved. Built with ❤️ by AI Agents.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
