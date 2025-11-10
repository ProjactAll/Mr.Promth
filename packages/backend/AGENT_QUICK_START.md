# 🚀 Agent Quick Start Guide

คู่มือเริ่มต้นใช้งาน Agent 3 และ Agent 4 สำหรับ Mr. Prompt

---

## 📋 ข้อกำหนดเบื้องต้น

### 1. ติดตั้ง Dependencies

```bash
cd /home/ubuntu/mrphomth
pnpm install openai
```

### 2. ตั้งค่า Environment Variables

สร้างหรือแก้ไขไฟล์ `.env.local`:

```bash
# OpenAI API Key (required for AI code generation)
OPENAI_API_KEY=your_openai_api_key_here

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://xcwkwdoxrbzzpwmlqswr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🤖 Agent 3: Backend Code Generator

### ความสามารถ

Agent 3 สามารถสร้างโค้ด backend ได้ 4 ประเภท:

1. **API Routes** - Next.js API endpoints
2. **Database Migrations** - Supabase SQL migrations
3. **Utility Functions** - Helper functions
4. **Integrations** - Third-party API integrations

### ตัวอย่างการใช้งาน

#### 1. สร้าง API Route

```typescript
import { agent3GenerateBackend } from '@/lib/agents/agent3-code-generator'

const result = await agent3GenerateBackend({
  projectId: 'my-blog',
  projectPath: '/home/ubuntu/my-blog',
  task: {
    type: 'api',
    description: 'Create a blog post API with CRUD operations',
    specifications: {
      endpoints: ['posts', 'posts/[id]', 'posts/[id]/comments'],
      authentication: true,
      rateLimit: true
    }
  }
})

console.log('✅ Files generated:', result.filesGenerated.length)
console.log('📦 Dependencies:', result.dependencies)
console.log('➡️  Next steps:', result.nextSteps)
```

**ผลลัพธ์:**
```
Files generated:
- app/api/posts/route.ts
- app/api/posts/[id]/route.ts
- app/api/posts/[id]/comments/route.ts

Each file includes:
✅ GET, POST, PUT, DELETE methods
✅ Supabase integration
✅ Authentication check
✅ Rate limiting
✅ Error handling
✅ TypeScript types
```

#### 2. สร้าง Database Migration

```typescript
const result = await agent3GenerateBackend({
  projectId: 'my-blog',
  projectPath: '/home/ubuntu/my-blog',
  task: {
    type: 'migration',
    description: 'Create tables for blog posts and comments',
    specifications: {
      database: {
        tables: ['posts', 'comments', 'post_tags'],
        relationships: [
          'comments.post_id -> posts.id',
          'post_tags.post_id -> posts.id'
        ]
      }
    }
  }
})
```

**ผลลัพธ์:**
```
File generated:
- supabase/migrations/1699123456_create_blog_tables.sql

Includes:
✅ CREATE TABLE statements
✅ Foreign key relationships
✅ Indexes for performance
✅ RLS policies
✅ Comments for documentation
```

#### 3. สร้าง Utility Function

```typescript
const result = await agent3GenerateBackend({
  projectId: 'my-blog',
  projectPath: '/home/ubuntu/my-blog',
  task: {
    type: 'function',
    description: 'Create a function to generate blog post slugs from titles'
  }
})
```

**ผลลัพธ์:**
```
Files generated:
- lib/utils/generateSlug.ts
- lib/utils/generateSlug.test.ts

Includes:
✅ TypeScript types
✅ JSDoc comments
✅ Error handling
✅ Unit tests
```

#### 4. สร้าง Integration

```typescript
const result = await agent3GenerateBackend({
  projectId: 'my-blog',
  projectPath: '/home/ubuntu/my-blog',
  task: {
    type: 'integration',
    description: 'Create Stripe payment integration for premium subscriptions'
  }
})
```

**ผลลัพธ์:**
```
File generated:
- lib/integrations/stripe.ts

Includes:
✅ API client setup
✅ Authentication
✅ Main methods (createCheckout, handleWebhook, etc.)
✅ Error handling
```

---

## 🎨 Agent 4: Frontend Component Generator

### ความสามารถ

Agent 4 สามารถสร้างโค้ด frontend ได้ 5 ประเภท:

1. **Pages** - Next.js pages
2. **Components** - Reusable React components
3. **Forms** - Forms with validation
4. **Dashboards** - Data visualization dashboards
5. **Layouts** - Page layouts

### ตัวอย่างการใช้งาน

#### 1. สร้าง Page

```typescript
import { agent4GenerateFrontend } from '@/lib/agents/agent4-frontend-generator'

const result = await agent4GenerateFrontend({
  projectId: 'my-blog',
  projectPath: '/home/ubuntu/my-blog',
  task: {
    type: 'page',
    description: 'Create a blog post listing page with pagination',
    specifications: {
      route: 'blog',
      responsive: true,
      accessibility: true,
      dataSource: {
        type: 'api',
        endpoint: '/api/posts'
      }
    }
  }
})
```

**ผลลัพธ์:**
```
File generated:
- app/blog/page.tsx

Includes:
✅ Data fetching from API
✅ Responsive grid layout
✅ Pagination
✅ Loading states
✅ Error handling
✅ ARIA labels
✅ Tailwind CSS styling
```

#### 2. สร้าง Component

```typescript
const result = await agent4GenerateFrontend({
  projectId: 'my-blog',
  projectPath: '/home/ubuntu/my-blog',
  task: {
    type: 'component',
    description: 'Create a blog post card component with image, title, excerpt, and read more button',
    specifications: {
      responsive: true,
      styling: 'tailwind'
    }
  }
})
```

**ผลลัพธ์:**
```
File generated:
- components/BlogPostCard.tsx

Includes:
✅ TypeScript interfaces
✅ Props validation
✅ Responsive design
✅ Hover effects
✅ Image optimization
```

#### 3. สร้าง Form

```typescript
const result = await agent4GenerateFrontend({
  projectId: 'my-blog',
  projectPath: '/home/ubuntu/my-blog',
  task: {
    type: 'form',
    description: 'Create a blog post submission form with title, content, tags, and featured image',
    specifications: {
      responsive: true,
      dataSource: {
        type: 'api',
        endpoint: '/api/posts'
      }
    }
  }
})
```

**ผลลัพธ์:**
```
File generated:
- components/forms/BlogPostForm.tsx

Includes:
✅ React Hook Form integration
✅ Zod validation schema
✅ Error messages
✅ Loading states
✅ Success/error notifications
✅ File upload
```

**Dependencies added:**
```
react-hook-form
zod
@hookform/resolvers
```

#### 4. สร้าง Dashboard

```typescript
const result = await agent4GenerateFrontend({
  projectId: 'my-blog',
  projectPath: '/home/ubuntu/my-blog',
  task: {
    type: 'dashboard',
    description: 'Create an analytics dashboard showing post views, comments, and user engagement',
    specifications: {
      route: 'dashboard/analytics',
      responsive: true,
      dataSource: {
        type: 'api',
        endpoint: '/api/analytics'
      }
    }
  }
})
```

**ผลลัพธ์:**
```
File generated:
- app/dashboard/analytics/page.tsx

Includes:
✅ Summary cards
✅ Charts (line, bar, pie)
✅ Data tables
✅ Responsive grid layout
✅ Real-time updates
```

**Dependencies added:**
```
recharts
```

#### 5. สร้าง Layout

```typescript
const result = await agent4GenerateFrontend({
  projectId: 'my-blog',
  projectPath: '/home/ubuntu/my-blog',
  task: {
    type: 'layout',
    description: 'Create a blog layout with header, navigation, sidebar, and footer',
    specifications: {
      route: 'blog',
      responsive: true
    }
  }
})
```

**ผลลัพธ์:**
```
File generated:
- app/blog/layout.tsx

Includes:
✅ Header with navigation
✅ Sidebar
✅ Footer
✅ Mobile menu
✅ Responsive layout
```

---

## 🔄 Workflow แบบเต็มรูปแบบ

### สถานการณ์: สร้างระบบ Blog แบบครบวงจร

#### Step 1: สร้าง Database Schema

```typescript
// Agent 3: Create migration
await agent3GenerateBackend({
  projectId: 'my-blog',
  projectPath: process.cwd(),
  task: {
    type: 'migration',
    description: 'Create blog database schema',
    specifications: {
      database: {
        tables: ['posts', 'comments', 'categories'],
        relationships: [
          'posts.category_id -> categories.id',
          'comments.post_id -> posts.id'
        ]
      }
    }
  }
})

// Run migration
// $ cd supabase && supabase db push
```

#### Step 2: สร้าง API Endpoints

```typescript
// Agent 3: Create API routes
await agent3GenerateBackend({
  projectId: 'my-blog',
  projectPath: process.cwd(),
  task: {
    type: 'api',
    description: 'Blog post CRUD API',
    specifications: {
      endpoints: ['posts', 'posts/[id]'],
      authentication: true,
      rateLimit: true
    }
  }
})
```

#### Step 3: สร้าง Frontend Pages

```typescript
// Agent 4: Create blog listing page
await agent4GenerateFrontend({
  projectId: 'my-blog',
  projectPath: process.cwd(),
  task: {
    type: 'page',
    description: 'Blog post listing page',
    specifications: {
      route: 'blog',
      responsive: true,
      dataSource: {
        type: 'api',
        endpoint: '/api/posts'
      }
    }
  }
})

// Agent 4: Create blog post detail page
await agent4GenerateFrontend({
  projectId: 'my-blog',
  projectPath: process.cwd(),
  task: {
    type: 'page',
    description: 'Blog post detail page with comments',
    specifications: {
      route: 'blog/[slug]',
      responsive: true,
      dataSource: {
        type: 'api',
        endpoint: '/api/posts/[id]'
      }
    }
  }
})
```

#### Step 4: สร้าง Admin Interface

```typescript
// Agent 4: Create post submission form
await agent4GenerateFrontend({
  projectId: 'my-blog',
  projectPath: process.cwd(),
  task: {
    type: 'form',
    description: 'Blog post creation/edit form',
    specifications: {
      dataSource: {
        type: 'api',
        endpoint: '/api/posts'
      }
    }
  }
})

// Agent 4: Create dashboard
await agent4GenerateFrontend({
  projectId: 'my-blog',
  projectPath: process.cwd(),
  task: {
    type: 'dashboard',
    description: 'Blog analytics dashboard',
    specifications: {
      route: 'admin/analytics',
      dataSource: {
        type: 'api',
        endpoint: '/api/analytics'
      }
    }
  }
})
```

#### Step 5: ทดสอบและ Deploy

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Test in browser
# http://localhost:3000/blog
# http://localhost:3000/admin/analytics

# Deploy to Vercel
git push origin main
```

---

## 🛠️ Advanced Usage

### Custom AI Model Configuration

```typescript
// In lib/code-generator/ai-generator.ts
const completion = await openai.chat.completions.create({
  model: 'gpt-4.1-mini', // or 'gpt-4.1-nano', 'gemini-2.5-flash'
  temperature: 0.7, // Lower = more deterministic
  max_tokens: 2000 // Adjust based on needs
})
```

### Generate with Tests

```typescript
import { generateRelatedFiles } from '@/lib/code-generator/ai-generator'

const files = await generateRelatedFiles({
  type: 'function',
  description: 'Email validation function',
  constraints: { typescript: true }
})

// Returns:
// [
//   { filename: 'validateEmail.ts', code: '...' },
//   { filename: 'validateEmail.test.ts', code: '...' }
// ]
```

### Batch Generation

```typescript
const tasks = [
  { type: 'api', description: 'User API' },
  { type: 'api', description: 'Post API' },
  { type: 'api', description: 'Comment API' }
]

for (const task of tasks) {
  await agent3GenerateBackend({
    projectId: 'my-project',
    projectPath: process.cwd(),
    task: {
      ...task,
      specifications: {
        authentication: true,
        rateLimit: true
      }
    }
  })
}
```

---

## 🐛 Troubleshooting

### ปัญหา: OpenAI API Error

```
Error: Failed to generate code: 401 Unauthorized
```

**แก้ไข:**
1. ตรวจสอบ `OPENAI_API_KEY` ใน `.env.local`
2. ตรวจสอบว่า API key ยังใช้งานได้
3. ตรวจสอบ credit balance ใน OpenAI account

### ปัญหา: File Permission Error

```
Error: EACCES: permission denied
```

**แก้ไข:**
```bash
chmod -R 755 /home/ubuntu/my-project
```

### ปัญหา: TypeScript Error

```
Error: Cannot find module '@/lib/agents/agent3-code-generator'
```

**แก้ไข:**
1. ตรวจสอบว่าไฟล์อยู่ใน path ที่ถูกต้อง
2. Restart TypeScript server
3. ตรวจสอบ `tsconfig.json` paths

---

## 📚 Resources

### Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)

### Examples

- `/home/ubuntu/mrphomth/lib/agents/` - Agent implementations
- `/home/ubuntu/mrphomth/lib/code-generator/` - AI generator
- `/home/ubuntu/mrphomth/app/admin/` - Admin pages

### Support

- GitHub Issues: https://github.com/donlasahachat11-lgtm/mrphomth/issues
- Documentation: Check README.md

---

## ✅ Next Steps

1. ✅ ติดตั้ง dependencies
2. ✅ ตั้งค่า environment variables
3. ✅ ทดสอบ Agent 3 สร้าง API
4. ✅ ทดสอบ Agent 4 สร้าง component
5. ⏳ สร้างโปรเจกต์จริง
6. ⏳ Deploy to production

---

**Happy Coding! 🚀**
