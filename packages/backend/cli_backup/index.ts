#!/usr/bin/env node

/**
 * Mr.Prompt CLI Tool
 * คำสั่ง: mrpromth create "เว็บขายกาแฟ"
 */

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const program = new Command();

const CONFIG_DIR = path.join(os.homedir(), '.mrpromth');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const API_BASE_URL = process.env.MRPROMTH_API_URL || 'http://localhost:3000';

interface Config {
  apiKey?: string;
  apiUrl?: string;
}

// โหลด config
function loadConfig(): Config {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    // Ignore
  }
  return {};
}

// บันทึก config
function saveConfig(config: Config) {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error(' ไม่สามารถบันทึก config:', error);
  }
}

program
  .name('mrpromth')
  .description('Mr.Prompt CLI - สร้างเว็บไซต์จาก prompt เดียว')
  .version('1.0.0');

program
  .command('create <prompt>')
  .description('สร้างเว็บไซต์ใหม่จาก prompt')
  .option('-o, --output <path>', 'โฟลเดอร์สำหรับเก็บโปรเจกต์', './output')
  .option('-n, --name <name>', 'ชื่อโปรเจกต์')
  .action(async (prompt: string, options: { output: string; name?: string }) => {
    console.log(' Mr.Prompt CLI');
    console.log('');
    console.log(` Prompt: ${prompt}`);
    console.log(` Output: ${options.output}`);
    if (options.name) {
      console.log(`  Name: ${options.name}`);
    }
    console.log('');
    console.log('');

    const config = loadConfig();
    if (!config.apiKey) {
      console.error(' คุณยังไม่ได้ login');
      console.log(' ใช้คำสั่ง "mrpromth login" เพื่อเข้าสู่ระบบ');
      process.exit(1);
    }

    console.log('⏳ กำลังสร้างโปรเจกต์...');

    try {
      const apiUrl = config.apiUrl || API_BASE_URL;
      const response = await fetch(`${apiUrl}/api/cli`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          apiKey: config.apiKey,
          options: {
            name: options.name,
            output: options.output,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(' เกิดข้อผิดพลาด:', data.error);
        if (data.details) {
          console.error('   รายละเอียด:', data.details);
        }
        process.exit(1);
      }

      console.log(' สร้างโปรเจกต์สำเร็จ!');
      console.log(` Project ID: ${data.project.id}`);
      console.log(` Name: ${data.project.name}`);
      console.log(` Status: ${data.project.status}`);
      console.log('');
      console.log(' ขั้นตอนถัดไป:');
      console.log(`   mrpromth status ${data.project.id}`);
      console.log('');
      console.log(' โปรเจกต์กำลังถูกสร้างโดย AI agents');
      console.log('   ใช้คำสั่ง status เพื่อติดตามความคืบหน้า');
    } catch (error) {
      console.error(' เกิดข้อผิดพลาดในการเชื่อมต่อ:', error);
      console.log(' ตรวจสอบว่า Mr.Prompt server กำลังทำงานอยู่');
      process.exit(1);
    }
  });

program
  .command('status <project-id>')
  .description('ตรวจสอบสถานะโปรเจกต์')
  .action(async (projectId: string) => {
    const config = loadConfig();
    if (!config.apiKey) {
      console.error(' คุณยังไม่ได้ login');
      console.log(' ใช้คำสั่ง "mrpromth login" เพื่อเข้าสู่ระบบ');
      process.exit(1);
    }

    console.log(` กำลังตรวจสอบสถานะโปรเจกต์: ${projectId}`);
    console.log('');

    try {
      const apiUrl = config.apiUrl || API_BASE_URL;
      const response = await fetch(
        `${apiUrl}/api/cli?action=status&project_id=${projectId}&api_key=${config.apiKey}`
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(' เกิดข้อผิดพลาด:', data.error);
        process.exit(1);
      }

      console.log(' โปรเจกต์:', data.project.name);
      console.log(' สถานะ:', data.project.status);
      console.log(' ความคืบหน้า:', `${data.progress}%`);
      if (data.project.current_agent) {
        console.log('🤖 Agent ปัจจุบัน:', `Agent ${data.project.current_agent}/7`);
      }
      if (data.project.error_message) {
        console.log(' Error:', data.project.error_message);
      }
      console.log('');

      if (data.logs && data.logs.length > 0) {
        console.log(' Logs (ล่าสุด 5 รายการ):');
        data.logs.slice(-5).forEach((log: any) => {
          const status = log.status === 'completed' ? '' : log.status === 'error' ? '' : '⏳';
          console.log(`   ${status} Agent ${log.agent_number}: ${log.agent_name}`);
          if (log.execution_time_ms) {
            console.log(`      เวลา: ${log.execution_time_ms}ms`);
          }
        });
      }
    } catch (error) {
      console.error(' เกิดข้อผิดพลาด:', error);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('แสดงรายการโปรเจกต์ทั้งหมด')
  .action(async () => {
    const config = loadConfig();
    if (!config.apiKey) {
      console.error(' คุณยังไม่ได้ login');
      console.log(' ใช้คำสั่ง "mrpromth login" เพื่อเข้าสู่ระบบ');
      process.exit(1);
    }

    console.log(' รายการโปรเจกต์ของคุณ:');
    console.log('');

    try {
      const apiUrl = config.apiUrl || API_BASE_URL;
      const response = await fetch(
        `${apiUrl}/api/cli?action=list&api_key=${config.apiKey}`
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(' เกิดข้อผิดพลาด:', data.error);
        process.exit(1);
      }

      if (data.projects.length === 0) {
        console.log('   ยังไม่มีโปรเจกต์');
        console.log('   ใช้ "mrpromth create <prompt>" เพื่อสร้างโปรเจกต์แรก');
        return;
      }

      data.projects.forEach((project: any, index: number) => {
        const statusIcon = project.status === 'completed' ? '' : 
                          project.status === 'error' ? '' : 
                          project.status === 'running' ? '⏳' : '⏸';
        console.log(`${index + 1}. ${project.name}`);
        console.log(`   ID: ${project.id}`);
        console.log(`   Status: ${statusIcon} ${project.status}`);
        console.log(`   Created: ${new Date(project.created_at).toLocaleString('th-TH')}`);
        console.log('');
      });

      console.log(`Total: ${data.total} โปรเจกต์`);
    } catch (error) {
      console.error(' เกิดข้อผิดพลาด:', error);
      process.exit(1);
    }
  });

program
  .command('login')
  .description('เข้าสู่ระบบด้วย API key')
  .option('-k, --key <api-key>', 'API key')
  .option('-u, --url <api-url>', 'API URL (default: http://localhost:3000)')
  .action(async (options: { key?: string; url?: string }) => {
    console.log(' กำลังเข้าสู่ระบบ...');
    console.log('');

    let apiKey = options.key;
    
    if (!apiKey) {
      console.log(' ไปที่ https://mrpromth.com/app/settings เพื่อสร้าง API key');
      console.log('   แล้วใช้คำสั่ง: mrpromth login --key YOUR_API_KEY');
      process.exit(1);
    }

    try {
      const config: Config = {
        apiKey,
        apiUrl: options.url || API_BASE_URL,
      };

      saveConfig(config);

      console.log(' เข้าสู่ระบบสำเร็จ!');
      console.log(` API Key: ${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`);
      console.log(` API URL: ${config.apiUrl}`);
      console.log('');
      console.log(' ลองสร้างโปรเจกต์แรกของคุณ:');
      console.log('   mrpromth create "เว็บขายกาแฟ"');
    } catch (error) {
      console.error(' เกิดข้อผิดพลาด:', error);
      process.exit(1);
    }
  });

program.parse(process.argv);
