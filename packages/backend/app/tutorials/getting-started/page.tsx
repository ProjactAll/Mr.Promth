import { SiteHeader } from '@/components/site-header';

export default function TutorialPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="container-narrow py-16">
        <h1 className="text-4xl font-bold mb-8">Getting Started with Mr.Prompt</h1>
        <div className="prose dark:prose-invert max-w-none">
          <p>Welcome to Mr.Prompt! This tutorial will guide you through the basics of using our platform.</p>
          
          <h2>Step 1: Sign Up</h2>
          <p>First, you need to create an account. Click on the "Sign Up" button on the top right corner and fill in your details.</p>
          
          <h2>Step 2: Explore the Dashboard</h2>
          <p>Once you log in, you will be taken to your dashboard. Here you can see your recent projects, create new ones, and manage your account.</p>
          
          <h2>Step 3: Start a Chat</h2>
          <p>Click on the "Chat" button to start a conversation with our AI. You can ask questions, brainstorm ideas, or ask it to perform tasks.</p>
          
          <h2>Step 4: Create a Project</h2>
          <p>To create a website or an API, go to the "Generate" page. Describe what you want to build, and our AI will do the rest.</p>
          
          <h2>Step 5: Next Steps</h2>
          <p>Now you are ready to explore more advanced features. Check out our other tutorials to learn more.</p>
        </div>
      </main>
    </div>
  );
}
