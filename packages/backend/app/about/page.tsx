import { SiteHeader } from '@/components/site-header';
import Link from 'next/link';
import { Bot, Zap, Code, BarChart3, Globe, FileCode, Shield, Cpu, Users, Target, Eye } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
          <div className="container-modern section-spacing">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 animate-fade-in">About Mr.Prompt</h1>
              <p className="text-lg text-muted-foreground">AI Platform ที่จะเปลี่ยนวิธีการทำงานของคุณไปตลอดกาล</p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="container-narrow py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="card-modern">
              <div className="flex items-center gap-3 mb-4">
                <Target className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold">Our Mission</h2>
              </div>
              <p className="text-lg text-muted-foreground">Democratize AI for everyone. เรามุ่งมั่นที่จะทำให้ทุกคนสามารถเข้าถึงและใช้งาน AI ที่ทรงพลังได้อย่างง่ายดาย เพื่อปลดล็อกศักยภาพและสร้างสรรค์สิ่งใหม่ๆ</p>
            </div>
            <div className="card-modern">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold">Our Vision</h2>
              </div>
              <p className="text-lg text-muted-foreground">An AI Assistant for every task. เราจินตนาการถึงอนาคตที่ AI เป็นผู้ช่วยส่วนตัวในทุกๆ งาน ตั้งแต่เรื่องเล็กๆ ไปจนถึงโปรเจกต์ที่ซับซ้อน</p>
            </div>
          </div>
        </section>

        {/* Core Capabilities */}
        <section className="bg-muted/30 py-16">
          <div className="container-modern">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold">6 Core Capabilities</h2>
              <p className="text-muted-foreground">ความสามารถหลักที่ทำให้ Mr.Prompt เป็น AI Platform ที่สมบูรณ์แบบ</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Bot, title: 'AI Chat', description: 'สนทนากับ AI ได้แบบธรรมชาติ' },
                { icon: Globe, title: 'Website Builder', description: 'สร้างเว็บไซต์ Full-Stack' },
                { icon: FileCode, title: 'API Development', description: 'พัฒนา REST API และ GraphQL API' },
                { icon: Code, title: 'Code Assistant', description: 'เขียน Debug และปรับปรุงโค้ด' },
                { icon: BarChart3, title: 'Data Analysis', description: 'วิเคราะห์ข้อมูล สร้างกราฟ' },
                { icon: Shield, title: 'File Processing', description: 'ประมวลผล PDF, Images, CSV' },
              ].map((item, index) => (
                <div key={index} className="card-modern text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 rounded-full bg-primary/10">
                      <item.icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="py-16">
          <div className="container-modern">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold">Technology Stack</h2>
              <p className="text-muted-foreground">ขับเคลื่อนด้วยเทคโนโลยีที่ทันสมัยที่สุด</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="card-modern">
                <h3 className="text-2xl font-bold mb-4">AI Models</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>✅ 19 AI Models (GPT-4, Claude, Gemini)</li>
                  <li>✅ 7 Specialized Agents</li>
                  <li>✅ Vanchin AI Integration</li>
                </ul>
              </div>
              <div className="card-modern">
                <h3 className="text-2xl font-bold mb-4">Frontend</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>✅ Next.js 14</li>
                  <li>✅ TypeScript</li>
                  <li>✅ Tailwind CSS</li>
                  <li>✅ shadcn/ui</li>
                </ul>
              </div>
              <div className="card-modern">
                <h3 className="text-2xl font-bold mb-4">Backend</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>✅ Next.js API Routes</li>
                  <li>✅ Supabase (Database + Auth)</li>
                  <li>✅ Vercel Deployment</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-primary/10 py-16">
          <div className="container-modern text-center">
            <h2 className="text-3xl font-bold mb-4">พร้อมที่จะเปลี่ยนวิธีการทำงานของคุณแล้วหรือยัง?</h2>
            <p className="text-muted-foreground mb-8">เริ่มต้นใช้งาน Mr.Prompt วันนี้</p>
            <Link href="/chat">
              <button className="btn-primary px-8 py-3 rounded-lg">เริ่มใช้งานฟรี</button>
            </Link>
          </div>
        </section>
      </main>
      <footer className="border-t bg-muted/30">
        <div className="container-modern py-8">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">© 2024 Mr.Prompt. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">Privacy</Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
