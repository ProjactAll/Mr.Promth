import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            AI Agent Execution Platform
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            ไม่ต้องเขียน Prompt เอง - เลือก Agent สำเร็จรูป กรอกข้อมูล คลิกเดียวเสร็จ
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 py-6">
                เริ่มใช้งานฟรี
              </Button>
            </Link>
            <Link href="/library">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                ดู Agents ทั้งหมด
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">
             ใช้ฟรี 100 executions/เดือน • ไม่ต้องใส่บัตรเครดิต
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          ทำไมต้อง Mr.Prompt?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon=""
            title="One-Click Execution"
            description="ไม่ต้องเขียน Prompt เอง - เลือก Template กรอกตัวแปร คลิกเดียวเสร็จ"
          />
          <FeatureCard
            icon="🤖"
            title="50+ Pre-built Prompts"
            description="Prompts สำเร็จรูปครบทุกหมวด: Content, Code, Business, Data Analysis"
          />
          <FeatureCard
            icon=""
            title="20+ AI Agents"
            description="Multi-step Agents ที่ทำงานซับซ้อนได้อัตโนมัติ - Blog Writer, Code Generator, Market Analyst"
          />
          <FeatureCard
            icon=""
            title="Advanced Tools"
            description="PDF Reader, CSV Parser, Image Analysis - ทำงานกับไฟล์ได้จริง"
          />
          <FeatureCard
            icon=""
            title="รองรับภาษาไทย"
            description="ใช้งานภาษาไทยได้เต็มรูปแบบ - Prompts และ Results เป็นภาษาไทย"
          />
          <FeatureCard
            icon=""
            title="ราคาถูก"
            description="เริ่มต้นฟรี 100 executions - Pro แค่ ฿299/เดือน ไม่จำกัด"
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
