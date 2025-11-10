import Link from 'next/link'

export default function AccountDisabledPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center px-6">
        <div className="mb-6">
          <span className="text-8xl">⛔</span>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          บัญชีถูกระงับ
        </h1>
        
        <p className="text-lg text-gray-600 mb-2">
          บัญชีของคุณถูกระงับการใช้งาน
        </p>
        
        <p className="text-sm text-gray-500 mb-8">
          หากคุณคิดว่านี่เป็นข้อผิดพลาด กรุณาติดต่อผู้ดูแลระบบ
        </p>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 text-left max-w-md mx-auto">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>เหตุผลที่เป็นไปได้:</strong>
              </p>
              <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                <li>การละเมิดเงื่อนไขการใช้งาน</li>
                <li>กิจกรรมที่น่าสงสัย</li>
                <li>การร้องขอจากผู้ใช้</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            กลับหน้าแรก
          </Link>
          
          <a
            href="mailto:support@mrprompt.com"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            ติดต่อฝ่ายสนับสนุน
          </a>
        </div>
      </div>
    </div>
  )
}
