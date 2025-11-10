# 🤖 Mr.Promth Agent Chain System - Design Document

## 📋 ภาพรวมระบบ

**Mr.Promth** เป็นระบบ AI-powered web development platform ที่ใช้ **Agent Chain Architecture** โดยแต่ละ Agent จะทำงานต่อเนื่องกันเพื่อแปลง user prompt เป็นเว็บไซต์ที่สมบูรณ์

### Core Concept:
```
User Prompt → Agent 1 → Agent 2 → Agent 3 → ... → Agent N → Complete Website
```

---

## 🎯 Agent Chain Architecture

### Agent Roles และหน้าที่:

#### **Agent 1: Prompt Expander & Analyzer**
**หน้าที่:** รับ prompt จาก user และขยายให้เป็นรายละเอียดที่ครบถ้วน

**Input:**
- User prompt (สั้นๆ เช่น "สร้างเว็บ e-commerce")

**Process:**
1. วิเคราะห์ความต้องการของ user
2. ขยาย prompt ให้มีรายละเอียด:
   - ประเภทเว็บไซต์
   - ฟีเจอร์ที่ต้องการ
   - หน้าที่ต้องมี
   - สไตล์และธีม
   - เทคโนโลยีที่เหมาะสม

**Output:**
```json
{
  "project_type": "e-commerce",
  "features": ["product_catalog", "shopping_cart", "payment", "user_auth"],
  "pages": ["home", "products", "product_detail", "cart", "checkout", "profile"],
  "tech_stack": {
    "frontend": "Next.js 14",
    "styling": "Tailwind CSS",
    "database": "Supabase",
    "payment": "Stripe"
  },
  "design_style": "modern, clean, minimalist",
  "expanded_prompt": "สร้างเว็บไซต์ e-commerce ที่มี..."
}
```

---

#### **Agent 2: Architecture Designer**
**หน้าที่:** ออกแบบสถาปัตยกรรมและโครงสร้างโปรเจกต์

**Input:** Output จาก Agent 1

**Process:**
1. ออกแบบ database schema
2. กำหนดโครงสร้าง folder
3. วางแผน API endpoints
4. กำหนด component hierarchy
5. เลือก libraries และ dependencies

**Output:**
```json
{
  "database_schema": {
    "tables": [
      {
        "name": "products",
        "columns": ["id", "name", "price", "description", "image_url", "stock"]
      },
      {
        "name": "orders",
        "columns": ["id", "user_id", "total", "status", "created_at"]
      }
    ]
  },
  "folder_structure": {
    "app": ["api", "products", "cart", "checkout"],
    "components": ["ProductCard", "CartItem", "Header", "Footer"],
    "lib": ["database", "auth", "stripe"]
  },
  "api_endpoints": [
    "GET /api/products",
    "POST /api/cart/add",
    "POST /api/checkout"
  ],
  "dependencies": {
    "next": "14.x",
    "@supabase/supabase-js": "latest",
    "stripe": "latest"
  }
}
```

---

#### **Agent 3: Database & Backend Developer**
**หน้าที่:** สร้าง database schema และ backend logic

**Input:** Output จาก Agent 2

**Process:**
1. สร้าง SQL migrations
2. สร้าง API routes
3. เขียน database queries
4. ตั้งค่า authentication
5. สร้าง middleware

**Output:**
```typescript
// database/migrations/001_initial_schema.sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  image_url TEXT,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

// app/api/products/route.ts
export async function GET() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  
  return NextResponse.json(data);
}
```

---

#### **Agent 4: Frontend Component Developer**
**หน้าที่:** สร้าง UI components และ pages

**Input:** Output จาก Agent 3

**Process:**
1. สร้าง reusable components
2. สร้างหน้าต่างๆ
3. Implement responsive design
4. เพิ่ม animations และ transitions
5. Integrate กับ API

**Output:**
```typescript
// components/ProductCard.tsx
export function ProductCard({ product }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img src={product.image_url} alt={product.name} />
      <div className="p-4">
        <h3 className="font-semibold">{product.name}</h3>
        <p className="text-gray-600">{product.price} บาท</p>
        <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
          เพิ่มลงตะกร้า
        </button>
      </div>
    </div>
  );
}

// app/products/page.tsx
export default async function ProductsPage() {
  const products = await fetchProducts();
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">สินค้าทั้งหมด</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

---

#### **Agent 5: Integration & Logic Developer**
**หน้าที่:** เชื่อมต่อทุกส่วนและเพิ่ม business logic

**Input:** Output จาก Agent 4

**Process:**
1. เชื่อม frontend กับ backend
2. เพิ่ม state management
3. Implement form validation
4. เพิ่ม error handling
5. เพิ่ม loading states
6. Integrate third-party services (Stripe, etc.)

**Output:**
```typescript
// lib/cart.ts
export function useCart() {
  const [items, setItems] = useState([]);
  
  const addToCart = async (product) => {
    setItems(prev => [...prev, product]);
    await saveCartToDatabase(items);
  };
  
  const removeFromCart = (productId) => {
    setItems(prev => prev.filter(item => item.id !== productId));
  };
  
  const checkout = async () => {
    const session = await createStripeSession(items);
    window.location.href = session.url;
  };
  
  return { items, addToCart, removeFromCart, checkout };
}

// app/checkout/page.tsx
export default function CheckoutPage() {
  const { items, checkout } = useCart();
  const [loading, setLoading] = useState(false);
  
  const handleCheckout = async () => {
    setLoading(true);
    try {
      await checkout();
    } catch (error) {
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      {/* Checkout UI */}
    </div>
  );
}
```

---

#### **Agent 6: Testing & Quality Assurance**
**หน้าที่:** ทดสอบและตรวจสอบคุณภาพโค้ด

**Input:** Output จาก Agent 5

**Process:**
1. เขียน unit tests
2. เขียน integration tests
3. ทดสอบ user flows
4. ตรวจสอบ accessibility
5. ตรวจสอบ performance
6. แก้ไข bugs

**Output:**
```typescript
// __tests__/cart.test.ts
describe('Cart functionality', () => {
  it('should add product to cart', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.addToCart(mockProduct);
    });
    
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toEqual(mockProduct);
  });
  
  it('should calculate total correctly', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.addToCart({ price: 100 });
      result.current.addToCart({ price: 200 });
    });
    
    expect(result.current.total).toBe(300);
  });
});

// Test report
{
  "tests_passed": 45,
  "tests_failed": 0,
  "coverage": "87%",
  "issues_found": [
    "Missing error handling in checkout flow",
    "Accessibility: Missing alt text on product images"
  ],
  "fixes_applied": [
    "Added try-catch in checkout",
    "Added alt attributes to all images"
  ]
}
```

---

#### **Agent 7: Optimization & Deployment**
**หน้าที่:** Optimize โค้ดและเตรียม deployment

**Input:** Output จาก Agent 6

**Process:**
1. Code optimization
2. Image optimization
3. Bundle size optimization
4. SEO optimization
5. สร้าง deployment config
6. Setup CI/CD
7. Deploy to production

**Output:**
```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['your-cdn.com'],
    formats: ['image/avif', 'image/webp'],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
};

// Deployment report
{
  "optimizations": [
    "Reduced bundle size by 35%",
    "Optimized images (WebP format)",
    "Added lazy loading for images",
    "Implemented code splitting"
  ],
  "performance_score": {
    "lighthouse": 95,
    "first_contentful_paint": "1.2s",
    "time_to_interactive": "2.1s"
  },
  "deployment": {
    "platform": "Vercel",
    "url": "https://your-site.vercel.app",
    "status": "deployed",
    "build_time": "2m 15s"
  }
}
```

---

## 🔄 Agent Chain Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Input                               │
│  "สร้างเว็บ e-commerce ขายเสื้อผ้า มี cart และ payment"        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Agent 1: Prompt Expander                                        │
│  ✓ วิเคราะห์ความต้องการ                                        │
│  ✓ ขยาย prompt เป็นรายละเอียด                                   │
│  ✓ กำหนดฟีเจอร์และหน้าที่ต้องมี                                │
└────────────────────────┬────────────────────────────────────────┘
                         │ Expanded Requirements
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Agent 2: Architecture Designer                                  │
│  ✓ ออกแบบ database schema                                       │
│  ✓ กำหนดโครงสร้างโปรเจกต์                                      │
│  ✓ วางแผน API endpoints                                         │
└────────────────────────┬────────────────────────────────────────┘
                         │ Architecture Plan
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Agent 3: Database & Backend Developer                           │
│  ✓ สร้าง database migrations                                    │
│  ✓ สร้าง API routes                                             │
│  ✓ ตั้งค่า authentication                                       │
└────────────────────────┬────────────────────────────────────────┘
                         │ Backend Code
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Agent 4: Frontend Component Developer                           │
│  ✓ สร้าง UI components                                          │
│  ✓ สร้างหน้าต่างๆ                                               │
│  ✓ Implement responsive design                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │ Frontend Code
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Agent 5: Integration & Logic Developer                          │
│  ✓ เชื่อมต่อ frontend-backend                                   │
│  ✓ เพิ่ม business logic                                         │
│  ✓ Integrate third-party services                                │
└────────────────────────┬────────────────────────────────────────┘
                         │ Integrated System
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Agent 6: Testing & QA                                           │
│  ✓ เขียน tests                                                  │
│  ✓ ทดสอบ user flows                                             │
│  ✓ แก้ไข bugs                                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │ Tested Code
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Agent 7: Optimization & Deployment                              │
│  ✓ Optimize performance                                          │
│  ✓ Setup deployment                                              │
│  ✓ Deploy to production                                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Complete Website                              │
│              https://your-site.vercel.app                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Technical Implementation

### Agent Communication Protocol:

```typescript
interface AgentInput {
  agent_id: number;
  previous_output: any;
  user_context: {
    original_prompt: string;
    user_id: string;
    project_id: string;
  };
}

interface AgentOutput {
  agent_id: number;
  status: 'success' | 'error' | 'needs_clarification';
  output: any;
  next_agent_id: number | null;
  metadata: {
    execution_time: number;
    tokens_used: number;
    confidence_score: number;
  };
}

// Agent Chain Orchestrator
class AgentChainOrchestrator {
  private agents: Agent[] = [];
  
  async executeChain(userPrompt: string): Promise<ProjectOutput> {
    let currentInput: AgentInput = {
      agent_id: 1,
      previous_output: null,
      user_context: {
        original_prompt: userPrompt,
        user_id: getCurrentUserId(),
        project_id: generateProjectId(),
      }
    };
    
    const results: AgentOutput[] = [];
    
    for (const agent of this.agents) {
      console.log(`Executing Agent ${agent.id}: ${agent.name}`);
      
      const output = await agent.execute(currentInput);
      results.push(output);
      
      if (output.status === 'error') {
        throw new Error(`Agent ${agent.id} failed: ${output.error}`);
      }
      
      if (output.status === 'needs_clarification') {
        // Ask user for clarification
        const clarification = await askUserForClarification(output.question);
        currentInput.user_context.clarification = clarification;
        continue;
      }
      
      // Prepare input for next agent
      currentInput = {
        agent_id: output.next_agent_id,
        previous_output: output.output,
        user_context: currentInput.user_context,
      };
      
      // Save progress
      await saveProgress(currentInput.user_context.project_id, results);
    }
    
    return this.compileResults(results);
  }
  
  private compileResults(results: AgentOutput[]): ProjectOutput {
    // Combine all agent outputs into final project
    return {
      code: extractCode(results),
      database: extractDatabase(results),
      deployment: extractDeployment(results),
      documentation: generateDocumentation(results),
    };
  }
}
```

---

## 🎨 Mr.Promth Branding

### Brand Identity:
- **Name:** Mr.Promth
- **Tagline:** "From Prompt to Production"
- **Colors:**
  - Primary: #3B82F6 (Blue)
  - Secondary: #8B5CF6 (Purple)
  - Accent: #10B981 (Green)
- **Logo:** (ต้องออกแบบ)
- **Font:** Inter (sans-serif)

### UI Style Guide:
- **Design:** Clean, modern, minimalist
- **Layout:** Spacious, well-organized
- **Components:** Rounded corners, subtle shadows
- **Animations:** Smooth, purposeful
- **Accessibility:** WCAG 2.1 AA compliant

---

## 📊 System Requirements

### Frontend:
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- TypeScript
- Framer Motion (animations)

### Backend:
- Next.js API Routes
- Supabase (Database + Auth)
- VanchinAI (AI Provider)

### Infrastructure:
- Vercel (Hosting)
- Supabase (Database)
- GitHub (Version Control)

---

## 🚀 Development Phases

### Phase 1: Core System (Week 1-2)
- [ ] Agent Chain Orchestrator
- [ ] Agent 1-3 Implementation
- [ ] Basic UI
- [ ] Database setup

### Phase 2: Full Features (Week 3-4)
- [ ] Agent 4-7 Implementation
- [ ] Complete UI
- [ ] Integration testing
- [ ] Documentation

### Phase 3: Polish & Deploy (Week 5-6)
- [ ] Optimization
- [ ] Testing
- [ ] Deployment
- [ ] Launch

---

## 📝 Success Metrics

- **Code Quality:** 90%+ test coverage
- **Performance:** Lighthouse score 90+
- **User Experience:** < 3 seconds to first interaction
- **Reliability:** 99.9% uptime
- **Agent Accuracy:** 95%+ successful completions

---

**Document Version:** 1.0  
**Last Updated:** 7 พฤศจิกายน 2025
