/**
 * Intent Detector
 * ตรวจจับว่า user message ต้องการสร้างโปรเจกต์หรือไม่
 */

export interface Intent {
  type: 'create_project' | 'modify_project' | 'chat' | 'code_review';
  confidence: number;
  projectName?: string;
  prompt?: string;
  modifications?: string[];
}

/**
 * ตรวจจับ intent จาก user message
 */
export function detectIntent(message: string): Intent {
  const lowerMessage = message.toLowerCase();
  
  // Keywords สำหรับการสร้างโปรเจกต์
  const createKeywords = [
    'สร้าง', 'create', 'build', 'make', 'generate', 
    'ทำ', 'เริ่ม', 'start', 'new project', 'โปรเจกต์ใหม่'
  ];
  
  // Keywords สำหรับการแก้ไข
  const modifyKeywords = [
    'แก้', 'edit', 'modify', 'change', 'update', 
    'เพิ่ม', 'add', 'remove', 'ลบ', 'fix'
  ];
  
  // Keywords สำหรับ code review
  const reviewKeywords = [
    'review', 'check', 'ตรวจ', 'ดู', 'analyze', 'วิเคราะห์'
  ];
  
  // ตรวจสอบว่าเป็นการสร้างโปรเจกต์หรือไม่
  const hasCreateKeyword = createKeywords.some(keyword => 
    lowerMessage.includes(keyword)
  );
  
  // ตรวจสอบว่ามี project type keywords หรือไม่
  const projectTypes = [
    'website', 'เว็บ', 'blog', 'บล็อก', 'e-commerce', 'ร้านค้า',
    'dashboard', 'แดชบอร์ด', 'app', 'แอป', 'api', 'todo', 'chat'
  ];
  
  const hasProjectType = projectTypes.some(type => 
    lowerMessage.includes(type)
  );
  
  // ถ้ามี create keyword + project type = สร้างโปรเจกต์
  if (hasCreateKeyword && hasProjectType) {
    return {
      type: 'create_project',
      confidence: 0.9,
      prompt: message,
      projectName: extractProjectName(message)
    };
  }
  
  // ตรวจสอบว่าเป็นการแก้ไขหรือไม่
  const hasModifyKeyword = modifyKeywords.some(keyword => 
    lowerMessage.includes(keyword)
  );
  
  if (hasModifyKeyword) {
    return {
      type: 'modify_project',
      confidence: 0.8,
      modifications: [message]
    };
  }
  
  // ตรวจสอบว่าเป็น code review หรือไม่
  const hasReviewKeyword = reviewKeywords.some(keyword => 
    lowerMessage.includes(keyword)
  );
  
  if (hasReviewKeyword && (lowerMessage.includes('code') || lowerMessage.includes('โค้ด'))) {
    return {
      type: 'code_review',
      confidence: 0.85
    };
  }
  
  // Default: chat ธรรมดา
  return {
    type: 'chat',
    confidence: 1.0
  };
}

/**
 * แยกชื่อโปรเจกต์จาก message
 */
function extractProjectName(message: string): string {
  // ลองหาคำว่า "ชื่อ" หรือ "name"
  const nameMatch = message.match(/(?:ชื่อ|name|called?)\s+["']?([a-z0-9-]+)["']?/i);
  if (nameMatch) {
    return nameMatch[1].toLowerCase().replace(/[^a-z0-9-]/g, '-');
  }
  
  // ถ้าไม่เจอ ให้ใช้ timestamp
  return `project-${Date.now()}`;
}

/**
 * สร้าง response message สำหรับ intent ที่ตรวจจับได้
 */
export function createIntentResponse(intent: Intent): string {
  switch (intent.type) {
    case 'create_project':
      return `🚀 ตรวจพบว่าคุณต้องการสร้างโปรเจกต์! กำลังเริ่มสร้างโปรเจกต์ให้คุณ...

**Project Name**: ${intent.projectName}
**Description**: ${intent.prompt}

กรุณารอสักครู่ ระบบกำลังสร้างโปรเจกต์ให้คุณ...`;
      
    case 'modify_project':
      return `✏️ ตรวจพบว่าคุณต้องการแก้ไขโปรเจกต์! 

**Modifications**: ${intent.modifications?.join(', ')}

กำลังดำเนินการแก้ไข...`;
      
    case 'code_review':
      return `🔍 ตรวจพบว่าคุณต้องการ review โค้ด! กำลังวิเคราะห์...`;
      
    default:
      return '';
  }
}
