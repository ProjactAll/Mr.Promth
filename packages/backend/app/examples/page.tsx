import { SiteHeader } from '@/components/site-header';
import Link from 'next/link';
import { Bot, Zap, Code, BarChart3, Globe, FileCode, Shield, Cpu, Users, Target, Eye } from 'lucide-react';

export default function ExamplesPage() {
  const examples = [
    {
      title: 'AI Chat - Brainstorming',
      description: 'ระดมสมองหาไอเดียสำหรับแคมเปญการตลาดใหม่',
      icon: Bot,
      link: '/chat?prompt=Brainstorm+ideas+for+a+new+marketing+campaign'
    },
    {
      title: 'Website Builder - Portfolio',
      description: 'สร้างเว็บไซต์ Portfolio ส่วนตัวพร้อม Gallery',
      icon: Globe,
      link: '/generate?prompt=Create+a+personal+portfolio+website+with+a+gallery'
    },
    {
      title: 'API Development - User API',
      description: 'สร้าง API สำหรับจัดการข้อมูลผู้ใช้ (CRUD)',
      icon: FileCode,
      link: '/generate?prompt=Create+a+REST+API+for+user+management'
    },
    {
      title: 'Code Assistant - Refactor',
      description: 'ช่วย Refactor โค้ด Python ให้มีประสิทธิภาพมากขึ้น',
      icon: Code,
      link: '/editor?prompt=Refactor+this+Python+code+to+be+more+efficient'
    },
    {
      title: 'Data Analysis - Sales Data',
      description: 'วิเคราะห์ข้อมูลยอดขายและสร้างกราฟแสดงแนวโน้ม',
      icon: BarChart3,
      link: '/app/data-analysis?prompt=Analyze+sales+data+and+show+trends'
    },
    {
      title: 'File Processing - PDF Extraction',
      description: 'ดึงข้อมูลจากไฟล์ PDF และสรุปเป็น Bullet points',
      icon: Shield,
      link: '/chat?prompt=Extract+key+points+from+this+PDF'
    }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
          <div className="container-modern section-spacing">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 animate-fade-in">Examples</h1>
              <p className="text-lg text-muted-foreground">ดูตัวอย่างการใช้งาน Mr.Prompt ในสถานการณ์ต่างๆ</p>
            </div>
          </div>
        </section>

        <section className="container-modern py-16">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {examples.map((example, index) => (
              <Link href={example.link} key={index}>
                <div className="card-modern h-full transform hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <example.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">{example.title}</h2>
                  </div>
                  <p className="text-muted-foreground">{example.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t bg-muted/30">
        <div className="container-modern py-8">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">© 2024 Mr.Prompt. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
