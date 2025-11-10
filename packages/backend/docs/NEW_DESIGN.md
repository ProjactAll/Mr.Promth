# Mr.Prompt - New Design Specification

**เป้าหมาย:** ออกแบบให้เหมือน Manus.im แต่ดีกว่า  
**Target Users:** คนทุกวัย ไม่ต้องมีพื้นฐาน ใช้งานง่าย  
**จุดขาย:** Chat ธรรมดา + โหมด Agent พิเศษ + Terminal Access

---

## 🎨 Color Scheme (สีสว่าง)

### Light Theme (Primary)
```css
--background: #FFFFFF
--foreground: #0A0A0A
--card: #F9FAFB
--card-foreground: #0A0A0A
--popover: #FFFFFF
--popover-foreground: #0A0A0A
--primary: #2563EB (Blue)
--primary-foreground: #FFFFFF
--secondary: #F3F4F6
--secondary-foreground: #0A0A0A
--muted: #F3F4F6
--muted-foreground: #6B7280
--accent: #F3F4F6
--accent-foreground: #0A0A0A
--destructive: #EF4444
--destructive-foreground: #FFFFFF
--border: #E5E7EB
--input: #E5E7EB
--ring: #2563EB
--radius: 0.5rem
```

### Terminal Colors
```css
--terminal-bg: #1E1E1E
--terminal-fg: #D4D4D4
--terminal-green: #4EC9B0
--terminal-blue: #569CD6
--terminal-yellow: #DCDCAA
--terminal-red: #F48771
```

---

## 📐 Layout Structure

### 3-Column Layout
```
┌─────────────────────────────────────────────────────────┐
│  Header (Logo + User Menu)                              │
├──────────┬──────────────────────────┬───────────────────┤
│          │                          │                   │
│ Sidebar  │   Chat Interface         │  Terminal Window  │
│ (250px)  │   (Flex-grow)            │  (400px)          │
│          │                          │  (Collapsible)    │
│          │                          │                   │
│ - New    │  ┌────────────────────┐  │  ┌─────────────┐ │
│   task   │  │ AI: สวัสดี...     │  │  │ Executing   │ │
│          │  └────────────────────┘  │  │ command     │ │
│ - Search │                          │  │             │ │
│          │  ┌────────────────────┐  │  │ cd /home... │ │
│ - Library│  │ User: สร้างเว็บ... │  │  │             │ │
│          │  └────────────────────┘  │  │ npm build   │ │
│ - Tasks  │                          │  │             │ │
│          │  [Input field]           │  └─────────────┘ │
│          │                          │                   │
└──────────┴──────────────────────────┴───────────────────┘
```

---

## 🧩 Components

### 1. Sidebar Component
**File:** `components/sidebar.tsx`

**Features:**
- New task button (สร้างแชทใหม่)
- Search (ค้นหาแชทเก่า)
- Library (แชทที่บันทึกไว้)
- All tasks (รายการแชททั้งหมด)
- User avatar + settings

**UI:**
```tsx
<Sidebar>
  <SidebarHeader>
    <Logo />
    <NewTaskButton />
  </SidebarHeader>
  
  <SidebarContent>
    <SearchInput />
    <SidebarNav>
      <NavItem icon={Library}>Library</NavItem>
      <NavItem icon={Tasks}>All tasks</NavItem>
    </SidebarNav>
    
    <TaskList>
      {tasks.map(task => (
        <TaskItem key={task.id} {...task} />
      ))}
    </TaskList>
  </SidebarContent>
  
  <SidebarFooter>
    <UserMenu />
  </SidebarFooter>
</Sidebar>
```

---

### 2. Chat Interface Component
**File:** `components/chat-interface-simple.tsx`

**Features:**
- แสดงข้อความแบบธรรมดา (ไม่ใช่ terminal)
- รองรับ markdown
- แสดง avatar (AI + User)
- แสดง timestamp
- แสดง typing indicator

**UI:**
```tsx
<ChatInterface>
  <ChatMessages>
    {messages.map(msg => (
      <Message key={msg.id} role={msg.role}>
        <Avatar src={msg.role === 'ai' ? '/ai-avatar.png' : user.avatar} />
        <MessageContent>
          <MessageHeader>
            <Name>{msg.role === 'ai' ? 'Mr.Prompt' : user.name}</Name>
            <Timestamp>{msg.timestamp}</Timestamp>
          </MessageHeader>
          <MessageBody>{msg.content}</MessageBody>
        </MessageContent>
      </Message>
    ))}
  </ChatMessages>
  
  <ChatInput>
    <Textarea placeholder="พิมพ์ข้อความ..." />
    <SendButton />
  </ChatInput>
</ChatInterface>
```

---

### 3. Terminal Window Component
**File:** `components/terminal-window.tsx`

**Features:**
- แสดงเฉพาะเมื่อ AI ทำงาน
- มีปุ่มเปิด/ปิด (Collapse/Expand)
- แสดง real-time commands
- แสดง progress (Executing, Viewing, Browsing)
- มี "Jump to live" button

**UI:**
```tsx
<TerminalWindow isOpen={isTerminalOpen}>
  <TerminalHeader>
    <Title>Manus's Computer</Title>
    <CollapseButton onClick={toggleTerminal} />
  </TerminalHeader>
  
  <TerminalContent>
    <ProgressIndicator>
      <Status>Executing command</Status>
      <Command>cd /home/ubuntu/mrphomth && npm run build</Command>
    </ProgressIndicator>
    
    <TerminalOutput>
      {output.map(line => (
        <OutputLine key={line.id}>{line.text}</OutputLine>
      ))}
    </TerminalOutput>
  </TerminalContent>
  
  <TerminalFooter>
    <ProgressBar value={progress} />
    <JumpToLiveButton />
  </TerminalFooter>
</TerminalWindow>
```

---

### 4. Progress Display Component
**File:** `components/progress-display.tsx`

**Features:**
- แสดงสถานะการทำงาน
- Collapsible sections (เหมือน Manus)
- แสดง sub-tasks

**UI:**
```tsx
<ProgressDisplay>
  <ProgressSection title="ทดสอบระบบทั้งหมดและ Deploy" isExpanded={true}>
    <ProgressItem status="done">
      <Icon>✓</Icon>
      <Text>Checked if the Thai logo files are in the public directory</Text>
    </ProgressItem>
    
    <ProgressItem status="running">
      <Icon>⟳</Icon>
      <Text>Executing command: npm run build</Text>
    </ProgressItem>
    
    <ProgressItem status="pending">
      <Icon>○</Icon>
      <Text>Viewing terminal</Text>
    </ProgressItem>
  </ProgressSection>
</ProgressDisplay>
```

---

## 🗂️ Workspace System

### Folder Structure
```
/workspaces/
  ├── user_abc123/
  │   ├── project_1/
  │   │   ├── app/
  │   │   ├── components/
  │   │   └── package.json
  │   ├── project_2/
  │   └── .workspace_config.json
  ├── user_def456/
  │   └── project_1/
  └── .gitignore
```

### Workspace Config
```json
{
  "user_id": "abc123",
  "created_at": "2025-11-07T00:00:00Z",
  "projects": [
    {
      "id": "project_1",
      "name": "เว็บขายกาแฟ",
      "created_at": "2025-11-07T00:00:00Z",
      "status": "completed"
    }
  ]
}
```

---

## 🎯 User Flow

### Flow 1: Chat ธรรมดา (80%)
```
User: "React คืออะไร"
  ↓
AI: "React เป็น JavaScript library..."
  ↓
Terminal: ไม่แสดง (ไม่จำเป็น)
```

### Flow 2: สร้างเว็บ (20%)
```
User: "สร้างเว็บขายกาแฟ"
  ↓
AI: "กำลังสร้างเว็บขายกาแฟให้คุณ..."
  ↓
Terminal: แสดง (Executing command, Viewing terminal, Browsing)
  ↓
Progress: แสดง (Agent 1 → Agent 7)
  ↓
AI: "เว็บของคุณพร้อมแล้ว! [ดูตัวอย่าง]"
```

---

## 📱 Responsive Design

### Desktop (> 1024px)
- แสดง 3 columns (Sidebar + Chat + Terminal)
- Terminal ขนาด 400px

### Tablet (768px - 1024px)
- แสดง 2 columns (Sidebar + Chat)
- Terminal เป็น overlay (เปิด/ปิดได้)

### Mobile (< 768px)
- แสดง 1 column (Chat only)
- Sidebar เป็น drawer (เปิด/ปิดได้)
- Terminal เป็น full-screen overlay

---

## 🚀 Implementation Plan

### Phase 1: ออกแบบ UI/UX ✓
- [x] Color scheme
- [x] Layout structure
- [x] Component specifications

### Phase 2: สร้าง Components
- [ ] Sidebar component
- [ ] Chat interface (simple)
- [ ] Terminal window
- [ ] Progress display

### Phase 3: Workspace System
- [ ] Create workspace folders
- [ ] Workspace config management
- [ ] Project isolation

### Phase 4: Integration
- [ ] Connect chat to agents
- [ ] Real-time terminal updates
- [ ] Progress tracking

### Phase 5: Testing & Deploy
- [ ] Test all flows
- [ ] Build production
- [ ] Deploy to Vercel

---

## 💡 Key Differences from Current Design

| Feature | Current | New |
|---------|---------|-----|
| Layout | Single page | 3-column layout |
| Chat | Terminal-style | Normal chat |
| Terminal | Always visible | Collapsible |
| Agents | Visible (7 cards) | Hidden (background) |
| Colors | Dark theme | Light theme |
| Sidebar | None | Full sidebar |
| Workspace | Shared | Per-user folders |
| Progress | Basic | Detailed (Manus-style) |

---

## 🎨 Design References

- **Manus.im**: Layout, Terminal, Progress display
- **ChatGPT**: Chat interface, Message bubbles
- **Claude**: Sidebar, Task management
- **Vercel**: Color scheme, Typography

---

**Status:** Ready to implement  
**Next:** Start building components
