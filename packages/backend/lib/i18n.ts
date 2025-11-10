/**
 * Internationalization (i18n) System
 * รองรับภาษาไทยและอังกฤษ
 */

export type Locale = 'th' | 'en';

export const translations = {
  th: {
    // Navigation
    'nav.dashboard': 'แดชบอร์ด',
    'nav.chat': 'แชท',
    'nav.prompts': 'พรอมท์',
    'nav.settings': 'ตั้งค่า',
    'nav.admin': 'ผู้ดูแลระบบ',
    
    // Landing Page
    'landing.hero.title': 'สร้างเว็บไซต์ด้วย AI',
    'landing.hero.subtitle': 'บอก AI ว่าคุณต้องการเว็บไซต์แบบไหน แล้ว AI จะสร้างให้คุณ',
    'landing.cta.start': 'เริ่มต้นใช้งาน',
    'landing.cta.learn': 'เรียนรู้เพิ่มเติม',
    
    // Auth
    'auth.login': 'เข้าสู่ระบบ',
    'auth.signup': 'สมัครสมาชิก',
    'auth.logout': 'ออกจากระบบ',
    'auth.email': 'อีเมล',
    'auth.password': 'รหัสผ่าน',
    'auth.confirmPassword': 'ยืนยันรหัสผ่าน',
    'auth.forgotPassword': 'ลืมรหัสผ่าน?',
    'auth.noAccount': 'ยังไม่มีบัญชี?',
    'auth.haveAccount': 'มีบัญชีอยู่แล้ว?',
    
    // Dashboard
    'dashboard.title': 'สร้างเว็บไซต์ด้วย AI',
    'dashboard.subtitle': 'บอก AI ว่าคุณต้องการเว็บไซต์แบบไหน แล้ว AI จะสร้างให้คุณ',
    'dashboard.prompt.label': 'บอก AI ว่าคุณต้องการอะไร',
    'dashboard.prompt.placeholder': 'ตัวอย่าง: สร้างเว็บสำหรับเวิร์คช็อปสอนทำขนม มีระบบจองรอบและเก็บอีเมลลูกค้า',
    'dashboard.mode.auto': 'Auto Mode',
    'dashboard.mode.agent': 'Agent Mode',
    'dashboard.mode.chat': 'Chat Mode',
    'dashboard.button.attach': 'แนบไฟล์',
    'dashboard.button.github': 'GitHub',
    'dashboard.button.create': 'สร้างเว็บไซต์',
    'dashboard.button.creating': 'กำลังสร้าง...',
    
    // Projects
    'projects.title': 'โปรเจกต์ของฉัน',
    'projects.empty': 'ยังไม่มีโปรเจกต์',
    'projects.create': 'สร้างโปรเจกต์ใหม่',
    'projects.delete': 'ลบโปรเจกต์',
    'projects.status.pending': 'รอดำเนินการ',
    'projects.status.building': 'กำลังสร้าง',
    'projects.status.completed': 'เสร็จสิ้น',
    'projects.status.failed': 'ล้มเหลว',
    
    // Settings
    'settings.title': 'การตั้งค่า',
    'settings.profile': 'โปรไฟล์',
    'settings.password': 'รหัสผ่าน',
    'settings.preferences': 'การตั้งค่า',
    'settings.apiKeys': 'API Keys',
    'settings.displayName': 'ชื่อ',
    'settings.language': 'ภาษา',
    'settings.theme': 'ธีม',
    'settings.save': 'บันทึก',
    'settings.saving': 'กำลังบันทึก...',
    
    // Admin
    'admin.title': 'Admin Panel',
    'admin.users': 'Users',
    'admin.apiKeys': 'API Keys',
    'admin.logs': 'Logs',
    'admin.status': 'Status',
    'admin.settings': 'Settings',
    
    // Common
    'common.loading': 'กำลังโหลด...',
    'common.error': 'เกิดข้อผิดพลาด',
    'common.success': 'สำเร็จ',
    'common.cancel': 'ยกเลิก',
    'common.confirm': 'ยืนยัน',
    'common.delete': 'ลบ',
    'common.edit': 'แก้ไข',
    'common.save': 'บันทึก',
    'common.close': 'ปิด',
  },
  
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.chat': 'Chat',
    'nav.prompts': 'Prompts',
    'nav.settings': 'Settings',
    'nav.admin': 'Admin',
    
    // Landing Page
    'landing.hero.title': 'Build Websites with AI',
    'landing.hero.subtitle': 'Tell AI what website you want, and it will build it for you',
    'landing.cta.start': 'Get Started',
    'landing.cta.learn': 'Learn More',
    
    // Auth
    'auth.login': 'Login',
    'auth.signup': 'Sign Up',
    'auth.logout': 'Logout',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.noAccount': "Don't have an account?",
    'auth.haveAccount': 'Already have an account?',
    
    // Dashboard
    'dashboard.title': 'Build Websites with AI',
    'dashboard.subtitle': 'Tell AI what website you want, and it will build it for you',
    'dashboard.prompt.label': 'Tell AI what you want',
    'dashboard.prompt.placeholder': 'Example: Create a website for a baking workshop with booking system and email collection',
    'dashboard.mode.auto': 'Auto Mode',
    'dashboard.mode.agent': 'Agent Mode',
    'dashboard.mode.chat': 'Chat Mode',
    'dashboard.button.attach': 'Attach File',
    'dashboard.button.github': 'GitHub',
    'dashboard.button.create': 'Create Website',
    'dashboard.button.creating': 'Creating...',
    
    // Projects
    'projects.title': 'My Projects',
    'projects.empty': 'No projects yet',
    'projects.create': 'Create New Project',
    'projects.delete': 'Delete Project',
    'projects.status.pending': 'Pending',
    'projects.status.building': 'Building',
    'projects.status.completed': 'Completed',
    'projects.status.failed': 'Failed',
    
    // Settings
    'settings.title': 'Settings',
    'settings.profile': 'Profile',
    'settings.password': 'Password',
    'settings.preferences': 'Preferences',
    'settings.apiKeys': 'API Keys',
    'settings.displayName': 'Display Name',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.save': 'Save',
    'settings.saving': 'Saving...',
    
    // Admin
    'admin.title': 'Admin Panel',
    'admin.users': 'Users',
    'admin.apiKeys': 'API Keys',
    'admin.logs': 'Logs',
    'admin.status': 'Status',
    'admin.settings': 'Settings',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.save': 'Save',
    'common.close': 'Close',
  }
};

export type TranslationKey = keyof typeof translations.th;

/**
 * Get translation for a key
 */
export function t(key: TranslationKey, locale: Locale = 'th'): string {
  return translations[locale][key] || key;
}

/**
 * Get current locale from browser or localStorage
 */
export function getCurrentLocale(): Locale {
  if (typeof window === 'undefined') return 'th';
  
  const saved = localStorage.getItem('locale');
  if (saved === 'th' || saved === 'en') return saved;
  
  // Detect from browser
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('th')) return 'th';
  
  return 'en';
}

/**
 * Set current locale
 */
export function setLocale(locale: Locale): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('locale', locale);
}
