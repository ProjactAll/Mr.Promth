import { SiteHeader } from '@/components/site-header';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
          <div className="container-modern section-spacing-sm">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 animate-fade-in">Terms of Service</h1>
              <p className="text-muted-foreground">อัพเดทล่าสุด: พฤศจิกายน 2024</p>
            </div>
          </div>
        </section>
        <section className="container-narrow py-16">
          <div className="prose prose-lg max-w-none space-y-8">
            <div className="card-modern">
              <h2 className="text-2xl font-bold mb-4">1. การยอมรับข้อกำหนด</h2>
              <p className="text-muted-foreground">
                การใช้งาน Mr.Prompt ถือว่าคุณยอมรับข้อกำหนดและเงื่อนไขการใช้บริการทั้งหมด
              </p>
            </div>
            <div className="card-modern">
              <h2 className="text-2xl font-bold mb-4">2. การใช้บริการ</h2>
              <p className="text-muted-foreground">คุณตกลงที่จะ:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
                <li>ใช้บริการอย่างถูกต้องตามกฎหมาย</li>
                <li>ไม่ละเมิดทรัพย์สินทางปัญญาของผู้อื่น</li>
                <li>ไม่ใช้บริการเพื่อวัตถุประสงค์ที่ผิดกฎหมาย</li>
                <li>รักษาความปลอดภัยของบัญชีผู้ใช้</li>
              </ul>
            </div>
            <div className="card-modern">
              <h2 className="text-2xl font-bold mb-4">3. ทรัพย์สินทางปัญญา</h2>
              <p className="text-muted-foreground">
                โค้ดที่ AI สร้างให้คุณเป็นของคุณ แต่คุณต้องรับผิดชอบในการใช้งานและไม่ละเมิดลิขสิทธิ์ของผู้อื่น
              </p>
            </div>
            <div className="card-modern">
              <h2 className="text-2xl font-bold mb-4">4. ข้อจำกัดความรับผิด</h2>
              <p className="text-muted-foreground">
                เราไม่รับประกันว่าบริการจะไม่มีข้อผิดพลาด และไม่รับผิดชอบต่อความเสียหายที่เกิดจากการใช้บริการ
              </p>
            </div>
            <div className="card-modern">
              <h2 className="text-2xl font-bold mb-4">5. การยกเลิกบริการ</h2>
              <p className="text-muted-foreground">
                เราขอสงวนสิทธิ์ในการระงับหรือยกเลิกบัญชีที่ละเมิดข้อกำหนดโดยไม่ต้องแจ้งล่วงหน้า
              </p>
            </div>
            <div className="card-modern">
              <h2 className="text-2xl font-bold mb-4">6. การเปลี่ยนแปลงข้อกำหนด</h2>
              <p className="text-muted-foreground">
                เราอาจเปลี่ยนแปลงข้อกำหนดเหล่านี้ได้ตลอดเวลา การใช้บริการต่อไปถือว่าคุณยอมรับการเปลี่ยนแปลง
              </p>
            </div>
            <div className="card-modern">
              <h2 className="text-2xl font-bold mb-4">7. กฎหมายที่ใช้บังคับ</h2>
              <p className="text-muted-foreground">
                ข้อกำหนดเหล่านี้อยู่ภายใต้กฎหมายของประเทศไทย
              </p>
            </div>
            <div className="card-modern">
              <h2 className="text-2xl font-bold mb-4">8. ติดต่อเรา</h2>
              <p className="text-muted-foreground">
                หากมีคำถามเกี่ยวกับข้อกำหนดเหล่านี้ กรุณาติดต่อเราที่{' '}
                <Link href="/contact" className="text-primary hover:underline">
                  หน้าติดต่อ
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-muted/30">
        <div className="container-modern py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">© 2024 Mr.Prompt. All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-smooth">Privacy Policy</Link>
              <Link href="/contact" className="text-muted-foreground hover:text-primary transition-smooth">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
