import { SiteHeader } from '@/components/site-header';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
          <div className="container-modern section-spacing-sm">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 animate-fade-in">Privacy Policy</h1>
              <p className="text-muted-foreground">อัพเดทล่าสุด: พฤศจิกายน 2024</p>
            </div>
          </div>
        </section>
        <section className="container-narrow py-16">
          <div className="prose prose-lg max-w-none space-y-8">
            <div className="card-modern">
              <h2 className="text-2xl font-bold mb-4">1. ข้อมูลที่เราเก็บรวบรวม</h2>
              <p className="text-muted-foreground">เราเก็บรวบรวมข้อมูลต่อไปนี้:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
                <li>ข้อมูลส่วนบุคคล (ชื่อ, อีเมล)</li>
                <li>ข้อมูลการใช้งาน (โปรเจกต์ที่สร้าง, คำสั่ง AI)</li>
                <li>ข้อมูลทางเทคนิค (IP Address, Browser Type)</li>
              </ul>
            </div>
            <div className="card-modern">
              <h2 className="text-2xl font-bold mb-4">2. การใช้ข้อมูล</h2>
              <p className="text-muted-foreground">เราใช้ข้อมูลของคุณเพื่อ:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
                <li>ให้บริการและปรับปรุงแพลตฟอร์ม</li>
                <li>ส่งการแจ้งเตือนและอัพเดท</li>
                <li>วิเคราะห์และปรับปรุงประสบการณ์ผู้ใช้</li>
              </ul>
            </div>
            <div className="card-modern">
              <h2 className="text-2xl font-bold mb-4">3. การแชร์ข้อมูล</h2>
              <p className="text-muted-foreground">เราไม่ขายหรือแชร์ข้อมูลส่วนบุคคลของคุณกับบุคคลที่สาม ยกเว้นกรณีที่จำเป็นตามกฎหมาย</p>
            </div>
            <div className="card-modern">
              <h2 className="text-2xl font-bold mb-4">4. ความปลอดภัย</h2>
              <p className="text-muted-foreground">เราใช้มาตรการรักษาความปลอดภัยที่เหมาะสมเพื่อปกป้องข้อมูลของคุณ</p>
            </div>
            <div className="card-modern">
              <h2 className="text-2xl font-bold mb-4">5. สิทธิของคุณ</h2>
              <p className="text-muted-foreground">คุณมีสิทธิ์:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
                <li>เข้าถึงและขอสำเนาข้อมูลส่วนบุคคล</li>
                <li>แก้ไขข้อมูลที่ไม่ถูกต้อง</li>
                <li>ลบข้อมูลส่วนบุคคล</li>
                <li>คัดค้านการประมวลผลข้อมูล</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-muted/30">
        <div className="container-modern py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">© 2024 Mr.Prompt. All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              <Link href="/terms" className="text-muted-foreground hover:text-primary transition-smooth">Terms of Service</Link>
              <Link href="/contact" className="text-muted-foreground hover:text-primary transition-smooth">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
