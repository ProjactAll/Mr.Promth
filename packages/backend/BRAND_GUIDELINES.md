# 🎨 Mr.Promth - Brand Guidelines

**วันที่:** 7 พฤศจิกายน 2025  
**เวอร์ชัน:** 1.0

---

## 📋 สารบัญ

1. [Brand Identity](#brand-identity)
2. [Logo Design](#logo-design)
3. [Color Palette](#color-palette)
4. [Typography](#typography)
5. [Visual Style](#visual-style)
6. [UI Components](#ui-components)
7. [Usage Guidelines](#usage-guidelines)

---

## 🎯 Brand Identity

### Brand Name
**Mr.Promth**

### Tagline
**"From Prompt to Production"**

### Brand Personality
- **Modern** - ทันสมัย ใช้เทคโนโลยีล่าสุด
- **Efficient** - รวดเร็ว มีประสิทธิภาพ
- **Intelligent** - ฉลาด ใช้ AI อย่างชาญฉลาด
- **Reliable** - เชื่อถือได้ สร้างโค้ดคุณภาพสูง
- **Accessible** - เข้าถึงง่าย ใช้งานง่าย

### Brand Promise
**"แปลงความคิดเป็นเว็บไซต์ใน 50 วินาที"**

### Target Audience
- Entrepreneurs ที่ต้องการ MVP เร็ว
- Agencies ที่ต้องการเพิ่ม productivity
- Students ที่ต้องการเรียนรู้
- Startups ที่ต้องการ iterate เร็ว

---

## 🎨 Logo Design

### Logo Concept

โลโก้ Mr.Promth ออกแบบจากแนวคิด:
- **"M" + "P"** - ตัวอักษรย่อของ Mr.Promth
- **Speech Bubble** - สัญลักษณ์ของ prompt/conversation
- **Geometric & Modern** - รูปทรงเรขาคณิต ดูทันสมัย
- **Gradient** - สื่อถึงความเป็น AI และเทคโนโลยี

### Logo Variations

#### 1. **Icon Only** (logo.png)
- ใช้สำหรับ: Favicon, App icon, Social media avatar
- ขนาด: Square (1:1)
- สี: Blue to Purple gradient
- พื้นหลัง: White

#### 2. **Logo with Text** (logo-with-text.png)
- ใช้สำหรับ: Website header, Marketing materials
- ขนาด: Landscape (16:9)
- สี: Gradient icon + Dark gray text
- พื้นหลัง: White

#### 3. **Dark Mode** (logo-dark.png)
- ใช้สำหรับ: Dark theme UI, Night mode
- ขนาด: Square (1:1)
- สี: Cyan to Purple gradient with glow
- พื้นหลัง: Dark (#0F172A)

### Logo Files

```
public/
├── logo.png              # Icon only (square)
├── logo-with-text.png    # Logo + text (landscape)
└── logo-dark.png         # Dark mode version (square)
```

---

## 🎨 Color Palette

### Primary Colors

#### **Blue** (#3B82F6)
- **Usage:** Primary actions, links, highlights
- **RGB:** rgb(59, 130, 246)
- **HSL:** hsl(217, 91%, 60%)
- **Meaning:** Trust, technology, intelligence

#### **Purple** (#8B5CF6)
- **Usage:** Secondary actions, accents, gradients
- **RGB:** rgb(139, 92, 246)
- **HSL:** hsl(258, 90%, 66%)
- **Meaning:** Creativity, innovation, AI

### Gradient

#### **Primary Gradient**
```css
background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
```

- **Usage:** Logo, buttons, headers, highlights
- **Direction:** 135deg (diagonal)

### Neutral Colors

#### **Dark Gray** (#1F2937)
- **Usage:** Text, headings
- **RGB:** rgb(31, 41, 55)

#### **Medium Gray** (#6B7280)
- **Usage:** Secondary text, descriptions
- **RGB:** rgb(107, 114, 128)

#### **Light Gray** (#F3F4F6)
- **Usage:** Backgrounds, borders
- **RGB:** rgb(243, 244, 246)

#### **White** (#FFFFFF)
- **Usage:** Backgrounds, cards
- **RGB:** rgb(255, 255, 255)

### Semantic Colors

#### **Success** (#10B981)
- **Usage:** Success messages, completed states
- **RGB:** rgb(16, 185, 129)

#### **Error** (#EF4444)
- **Usage:** Error messages, warnings
- **RGB:** rgb(239, 68, 68)

#### **Warning** (#F59E0B)
- **Usage:** Warning messages, alerts
- **RGB:** rgb(245, 158, 11)

#### **Info** (#3B82F6)
- **Usage:** Info messages, tips
- **RGB:** rgb(59, 130, 246)

### Dark Mode Colors

#### **Background** (#0F172A)
- **Usage:** Main background
- **RGB:** rgb(15, 23, 42)

#### **Card** (#1E293B)
- **Usage:** Card backgrounds
- **RGB:** rgb(30, 41, 59)

#### **Border** (#334155)
- **Usage:** Borders, dividers
- **RGB:** rgb(51, 65, 85)

#### **Text** (#F1F5F9)
- **Usage:** Primary text
- **RGB:** rgb(241, 245, 249)

---

## ✍️ Typography

### Font Family

#### **Primary Font: Inter**
- **Type:** Sans-serif
- **Usage:** All text (headings, body, UI)
- **Source:** Google Fonts
- **Weights:** 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body {
  font-family: 'Inter', sans-serif;
}
```

### Font Sizes

#### **Headings**
```css
h1 { font-size: 3rem;    /* 48px */ font-weight: 700; }
h2 { font-size: 2.25rem; /* 36px */ font-weight: 700; }
h3 { font-size: 1.875rem;/* 30px */ font-weight: 600; }
h4 { font-size: 1.5rem;  /* 24px */ font-weight: 600; }
h5 { font-size: 1.25rem; /* 20px */ font-weight: 600; }
h6 { font-size: 1rem;    /* 16px */ font-weight: 600; }
```

#### **Body Text**
```css
body { font-size: 1rem;      /* 16px */ font-weight: 400; }
.text-lg { font-size: 1.125rem; /* 18px */ }
.text-sm { font-size: 0.875rem; /* 14px */ }
.text-xs { font-size: 0.75rem;  /* 12px */ }
```

### Line Height
```css
body { line-height: 1.5; }
h1, h2, h3, h4, h5, h6 { line-height: 1.2; }
```

---

## 🎨 Visual Style

### Design Principles

#### 1. **Minimalism**
- Clean layouts with plenty of white space
- Remove unnecessary elements
- Focus on content and functionality

#### 2. **Clarity**
- Clear hierarchy
- Easy to scan
- Obvious actions

#### 3. **Consistency**
- Consistent spacing (8px grid)
- Consistent colors
- Consistent components

#### 4. **Responsiveness**
- Mobile-first design
- Fluid layouts
- Touch-friendly

### Spacing System

**8px Grid System**
```css
/* Tailwind CSS spacing */
.space-1 { margin: 0.25rem; /* 4px  */ }
.space-2 { margin: 0.5rem;  /* 8px  */ }
.space-3 { margin: 0.75rem; /* 12px */ }
.space-4 { margin: 1rem;    /* 16px */ }
.space-6 { margin: 1.5rem;  /* 24px */ }
.space-8 { margin: 2rem;    /* 32px */ }
.space-12 { margin: 3rem;   /* 48px */ }
```

### Border Radius
```css
.rounded-sm { border-radius: 0.125rem; /* 2px  */ }
.rounded    { border-radius: 0.25rem;  /* 4px  */ }
.rounded-md { border-radius: 0.375rem; /* 6px  */ }
.rounded-lg { border-radius: 0.5rem;   /* 8px  */ }
.rounded-xl { border-radius: 0.75rem;  /* 12px */ }
.rounded-2xl { border-radius: 1rem;    /* 16px */ }
```

### Shadows
```css
.shadow-sm { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
.shadow    { box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1); }
.shadow-md { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
.shadow-lg { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); }
```

---

## 🧩 UI Components

### Buttons

#### **Primary Button**
```css
.btn-primary {
  background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgb(59 130 246 / 0.3);
}
```

#### **Secondary Button**
```css
.btn-secondary {
  background: white;
  color: #3B82F6;
  border: 2px solid #3B82F6;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
}
```

### Cards
```css
.card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  transition: all 0.2s;
}

.card:hover {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}
```

### Input Fields
```css
.input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #E5E7EB;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;
}

.input:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
}
```

### Progress Bar
```css
.progress-bar {
  width: 100%;
  height: 0.5rem;
  background: #E5E7EB;
  border-radius: 9999px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%);
  transition: width 0.3s ease;
}
```

---

## 📏 Usage Guidelines

### Logo Usage

#### ✅ **DO:**
- Use official logo files
- Maintain aspect ratio
- Provide clear space (minimum 20px around logo)
- Use on appropriate backgrounds (white or dark)
- Scale proportionally

#### ❌ **DON'T:**
- Stretch or distort logo
- Change colors
- Add effects (drop shadow, glow, etc.)
- Rotate logo
- Place on busy backgrounds

### Clear Space

**Minimum clear space:** 20px on all sides

```
┌─────────────────────────┐
│                         │
│    ┌─────────────┐     │
│    │             │     │
│    │    LOGO     │     │
│    │             │     │
│    └─────────────┘     │
│                         │
└─────────────────────────┘
     20px margin
```

### Minimum Size

- **Digital:** 32px × 32px (icon only)
- **Digital:** 120px × 40px (logo with text)
- **Print:** 1 inch × 1 inch (icon only)

### Background Colors

#### **Approved Backgrounds:**
- ✅ White (#FFFFFF)
- ✅ Light Gray (#F3F4F6)
- ✅ Dark (#0F172A) - use dark mode logo

#### **Not Recommended:**
- ❌ Bright colors
- ❌ Patterns
- ❌ Images
- ❌ Gradients

---

## 🎯 Brand Applications

### Website

- **Header:** Logo with text (left aligned)
- **Favicon:** Icon only
- **Footer:** Logo with text (centered)

### Social Media

- **Profile Picture:** Icon only (square)
- **Cover Photo:** Logo with text + tagline
- **Posts:** Use brand colors and typography

### Marketing Materials

- **Business Cards:** Logo with text
- **Brochures:** Logo with text (top left)
- **Presentations:** Logo with text (title slide)

### Product UI

- **Loading Screen:** Icon only (animated)
- **Dashboard:** Logo with text (header)
- **Mobile App:** Icon only (app icon)

---

## 📄 File Formats

### Logo Files Available

| Format | Usage | Location |
|--------|-------|----------|
| **PNG** | Web, digital | `public/logo.png` |
| **PNG** | Web, digital | `public/logo-with-text.png` |
| **PNG** | Dark mode | `public/logo-dark.png` |

### Recommended Exports

- **Web:** PNG (transparent background)
- **Print:** PDF or SVG (vector)
- **Social Media:** PNG (RGB color mode)

---

## 🎨 Color Codes Reference

### Quick Reference

```css
/* Primary Colors */
--blue: #3B82F6;
--purple: #8B5CF6;
--gradient: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);

/* Neutral Colors */
--dark: #1F2937;
--gray: #6B7280;
--light: #F3F4F6;
--white: #FFFFFF;

/* Semantic Colors */
--success: #10B981;
--error: #EF4444;
--warning: #F59E0B;
--info: #3B82F6;

/* Dark Mode */
--dark-bg: #0F172A;
--dark-card: #1E293B;
--dark-border: #334155;
--dark-text: #F1F5F9;
```

---

## 📞 Contact

สำหรับคำถามเกี่ยวกับ Brand Guidelines:
- **Repository:** https://github.com/donlasahachat11-lgtm/mrphomth
- **Documentation:** See `BRAND_GUIDELINES.md`

---

**Mr.Promth Brand Guidelines Version 1.0**  
**Last Updated:** 7 พฤศจิกายน 2025
