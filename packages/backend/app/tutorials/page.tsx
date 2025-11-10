import { SiteHeader } from '@/components/site-header';
import Link from 'next/link';
import { BookOpen, Bot, Globe, FileCode, BarChart3, Code } from 'lucide-react';

export default function TutorialsPage() {
  const tutorials = [
    { title: 'Getting Started', description: 'เริ่มต้นใช้งาน Mr.Prompt ใน 5 นาที', icon: BookOpen, slug: 'getting-started', duration: '5 min' },
    { title: 'Chat Basics', description: 'เรียนรู้การใช้งาน AI Chat', icon: Bot, slug: 'chat-basics', duration: '10 min' },
    { title: 'Building Websites', description: 'สร้างเว็บไซต์แรกของคุณ', icon: Globe, slug: 'building-websites', duration: '15 min' },
    { title: 'Creating APIs', description: 'พัฒนา API ด้วย AI', icon: FileCode, slug: 'creating-apis', duration: '15 min' },
    { title: 'Data Analysis', description: 'วิเคราะห์ข้อมูลเบื้องต้น', icon: BarChart3, slug: 'data-analysis', duration: '10 min' },
    { title: 'Code Assistant', description: 'เคล็ดลับการใช้ Code Assistant', icon: Code, slug: 'code-assistant', duration: '10 min' },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
          <div className="container-modern section-spacing">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 animate-fade-in">Tutorials</h1>
              <p className="text-lg text-muted-foreground">เรียนรู้วิธีใช้งาน Mr.Prompt แบบ Step-by-step</p>
            </div>
          </div>
        </section>

        <section className="container-modern py-16">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {tutorials.map((tutorial, index) => (
              <Link href={`/tutorials/${tutorial.slug}`} key={index}>
                <div className="card-modern h-full transform hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <tutorial.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{tutorial.title}</h2>
                      <p className="text-sm text-muted-foreground">{tutorial.duration}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{tutorial.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t bg-muted/30">
        <div className="container-modern py-8">
          <p className="text-sm text-muted-foreground text-center">© 2024 Mr.Prompt. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
