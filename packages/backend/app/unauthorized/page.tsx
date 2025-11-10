import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center px-6">
        <div className="mb-6">
          <span className="text-8xl">🚫</span>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          403 - ไม่มีสิทธิ์เข้าถึง
        </h1>
        
        <p className="text-lg text-gray-600 mb-2">
          คุณไม่มีสิทธิ์เข้าถึงหน้านี้
        </p>
        
        <p className="text-sm text-gray-500 mb-8">
          หากคุณคิดว่านี่เป็นข้อผิดพลาด กรุณาติดต่อผู้ดูแลระบบ
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link
            href="/app/dashboard"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            กลับไปหน้าหลัก
          </Link>
          
          <Link
            href="/login"
            className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Login ใหม่
          </Link>
        </div>
      </div>
    </div>
  )
}
