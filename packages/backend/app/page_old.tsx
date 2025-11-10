export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="text-center space-y-6 animate-fade-in">
        <div className="flex justify-center mb-4 animate-scale-in">
          <img
            src="/logo-thai-light.png"
            alt="มิสเตอร์พรอมท์"
            className="h-32 dark:hidden"
          />
          <img
            src="/logo-thai-dark.png"
            alt="มิสเตอร์พรอมท์"
            className="h-32 hidden dark:block"
          />
        </div>
        <h1 className="text-5xl font-bold animate-slide-up thai-text">
          Mr.Prompt
        </h1>
        <p className="text-muted-foreground max-w-md text-lg thai-text animate-slide-up" style={{ animationDelay: '0.1s' }}>
          พรอมท์เดียว สร้างเว็บไซต์สำเร็จรูปพร้อมใช้งาน
        </p>
        <div className="flex gap-4 justify-center animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <a
            href="/app/dashboard"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium btn-hover"
          >
            เริ่มต้นใช้งาน
          </a>
          <a
            href="/login"
            className="px-6 py-3 border border-border rounded-lg font-medium btn-hover"
          >
            เข้าสู่ระบบ
          </a>
        </div>
      </div>
    </main>
  );
}
