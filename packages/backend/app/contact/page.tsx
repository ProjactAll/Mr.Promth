'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { Mail, MapPin, Clock, Github, Twitter, Linkedin } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
          <div className="container-modern section-spacing-sm">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 animate-fade-in">
                Contact Us
              </h1>
              <p className="text-lg text-muted-foreground animate-fade-in">
                มีคำถามหรือต้องการแนะนำ? เราอยากฟังจากคุณ กรุณากรอกแบบฟอร์มด้านล่างหรือติดต่อเราผ่านช่องทางด้านล่าง
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form and Info */}
        <section className="container-modern py-16">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
                <p className="text-muted-foreground">
                  มีคำถามหรือต้องการแนะนำ? เราอยากฟังจากคุณ กรุณากรอกแบบฟอร์มด้านล่างหรือติดต่อเราผ่านช่องทางด้านล่าง
                </p>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Contact Information</h3>
                
                <div className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border hover:shadow-md transition-smooth">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Email</h4>
                    <a href="mailto:support@mrprompt.com" className="text-muted-foreground hover:text-primary">
                      support@mrprompt.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border hover:shadow-md transition-smooth">
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <MapPin className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Address</h4>
                    <p className="text-muted-foreground">Bangkok, Thailand</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border hover:shadow-md transition-smooth">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Clock className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Business Hours</h4>
                    <p className="text-muted-foreground">จันทร์ - ศุกร์: 9:00 - 18:00</p>
                    <p className="text-muted-foreground">เสาร์ - อาทิตย์: ปิดทำการ</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Follow Us</h3>
                <div className="flex gap-3">
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-lg bg-card border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-smooth"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-lg bg-card border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-smooth"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-lg bg-card border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-smooth"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="card-modern">
              <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
              
              {isSubmitted ? (
                <div className="status-success rounded-lg p-6 text-center">
                  <h3 className="font-semibold mb-2">ส่งข้อความสำเร็จ!</h3>
                  <p>เราจะติดต่อกลับโดยเร็วที่สุด</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      ชื่อ *
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-input bg-background focus-ring transition-smooth"
                      placeholder="กรอกชื่อของคุณ"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      อีเมล *
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-input bg-background focus-ring transition-smooth"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2">
                      หัวข้อ *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-input bg-background focus-ring transition-smooth"
                      placeholder="เรื่องที่ต้องการติดต่อ"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      ข้อความ *
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-input bg-background focus-ring transition-smooth resize-none"
                      placeholder="รายละเอียดที่ต้องการแจ้ง..."
                    />
                  </div>

                  <Button type="submit" className="w-full btn-primary">
                    ส่งข้อความ
                  </Button>
                </form>
              )}
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
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
