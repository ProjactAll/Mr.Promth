import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center px-4">
        <h1 className="text-9xl font-bold text-blue-600 mb-4">404</h1>
        <h2 className="text-3xl font-semibold mt-4 mb-2">ไม่พบหน้าที่คุณต้องการ</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          ขออภัย หน้าที่คุณกำลังมองหาอาจถูกย้าย ลบ หรือไม่มีอยู่จริง
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            กลับสู่หน้าหลัก
          </Link>
          <Link 
            href="/contact"
            className="inline-block bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition"
          >
            ติดต่อเรา
          </Link>
        </div>
        <div className="mt-12">
          <p className="text-gray-500 mb-4">หน้าที่คุณอาจสนใจ:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/docs" className="text-blue-600 hover:underline">
              Documentation
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/about" className="text-blue-600 hover:underline">
              About
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/app/dashboard" className="text-blue-600 hover:underline">
              Dashboard
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/examples" className="text-blue-600 hover:underline">
              Examples
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
