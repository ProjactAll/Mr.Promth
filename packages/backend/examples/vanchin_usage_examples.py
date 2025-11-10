#!/usr/bin/env python3
"""
ตัวอย่างการใช้งาน VanchinAI API
แสดงวิธีการเรียกใช้ VanchinAI ในรูปแบบต่างๆ
"""

import os
import json
from openai import OpenAI


# ============================================================================
# ตัวอย่างที่ 1: การใช้งานพื้นฐาน (Basic Usage)
# ============================================================================

def example_basic_usage():
    """ตัวอย่างการใช้งานพื้นฐาน"""
    print("\n" + "=" * 70)
    print("ตัวอย่างที่ 1: การใช้งานพื้นฐาน")
    print("=" * 70)
    
    client = OpenAI(
        base_url="https://vanchin.streamlake.ai/api/gateway/v1/endpoints",
        api_key="WW8GMBSTec_uPhRJQFe5y9OCsYrUKzslQx-LXWKLT9g"
    )
    
    completion = client.chat.completions.create(
        model="ep-lpvcnv-1761467347624133479",
        messages=[
            {"role": "system", "content": "You are a helpful AI assistant."},
            {"role": "user", "content": "สวัสดีครับ แนะนำตัวเองหน่อย"}
        ],
    )
    
    print(f"\n💬 คำตอบ: {completion.choices[0].message.content}")


# ============================================================================
# ตัวอย่างที่ 2: การใช้งานแบบ Streaming
# ============================================================================

def example_streaming():
    """ตัวอย่างการใช้งานแบบ streaming"""
    print("\n" + "=" * 70)
    print("ตัวอย่างที่ 2: การใช้งานแบบ Streaming")
    print("=" * 70)
    
    client = OpenAI(
        base_url="https://vanchin.streamlake.ai/api/gateway/v1/endpoints",
        api_key="WW8GMBSTec_uPhRJQFe5y9OCsYrUKzslQx-LXWKLT9g"
    )
    
    stream = client.chat.completions.create(
        model="ep-lpvcnv-1761467347624133479",
        messages=[
            {"role": "user", "content": "เล่าเรื่องสั้นๆ ให้ฟังหน่อย"}
        ],
        stream=True,
    )
    
    print("\n💬 คำตอบ (streaming): ", end="", flush=True)
    for chunk in stream:
        if chunk.choices[0].delta.content is not None:
            print(chunk.choices[0].delta.content, end="", flush=True)
    print()


# ============================================================================
# ตัวอย่างที่ 3: การใช้งานกับ Parameters ต่างๆ
# ============================================================================

def example_with_parameters():
    """ตัวอย่างการใช้งานกับ parameters ต่างๆ"""
    print("\n" + "=" * 70)
    print("ตัวอย่างที่ 3: การใช้งานกับ Parameters")
    print("=" * 70)
    
    client = OpenAI(
        base_url="https://vanchin.streamlake.ai/api/gateway/v1/endpoints",
        api_key="WW8GMBSTec_uPhRJQFe5y9OCsYrUKzslQx-LXWKLT9g"
    )
    
    completion = client.chat.completions.create(
        model="ep-lpvcnv-1761467347624133479",
        messages=[
            {"role": "user", "content": "สร้างชื่อบริษัทสตาร์ทอัพ 5 ชื่อ"}
        ],
        temperature=0.9,      # ความสร้างสรรค์สูง
        max_tokens=500,       # จำกัดความยาว
        top_p=0.95,          # nucleus sampling
    )
    
    print(f"\n💬 คำตอบ:\n{completion.choices[0].message.content}")
    print(f"\n📊 Tokens used: {completion.usage.total_tokens}")


# ============================================================================
# ตัวอย่างที่ 4: การใช้งานกับหลาย Agents
# ============================================================================

def example_multiple_agents():
    """ตัวอย่างการใช้งานกับหลาย agents"""
    print("\n" + "=" * 70)
    print("ตัวอย่างที่ 4: การใช้งานกับหลาย Agents")
    print("=" * 70)
    
    # โหลดข้อมูล agents
    with open('../vanchin_keys.json', 'r', encoding='utf-8') as f:
        config = json.load(f)
    
    # ทดสอบ 3 agents แรก
    question = "อธิบายความหมายของ AI ในประโยคเดียว"
    
    for i, agent in enumerate(config['agents'][:3], 1):
        print(f"\n🤖 Agent {i}: {agent['name']}")
        print(f"   Endpoint: {agent['endpoint_id']}")
        
        client = OpenAI(
            base_url=config['base_url'],
            api_key=agent['api_key']
        )
        
        completion = client.chat.completions.create(
            model=agent['endpoint_id'],
            messages=[{"role": "user", "content": question}],
            max_tokens=100,
        )
        
        print(f"   💬 คำตอบ: {completion.choices[0].message.content}")


# ============================================================================
# ตัวอย่างที่ 5: การใช้งานแบบ Multi-turn Conversation
# ============================================================================

def example_conversation():
    """ตัวอย่างการสนทนาแบบหลายรอบ"""
    print("\n" + "=" * 70)
    print("ตัวอย่างที่ 5: การสนทนาแบบหลายรอบ")
    print("=" * 70)
    
    client = OpenAI(
        base_url="https://vanchin.streamlake.ai/api/gateway/v1/endpoints",
        api_key="WW8GMBSTec_uPhRJQFe5y9OCsYrUKzslQx-LXWKLT9g"
    )
    
    # ประวัติการสนทนา
    messages = [
        {"role": "system", "content": "You are a helpful math tutor."},
    ]
    
    # รอบที่ 1
    messages.append({"role": "user", "content": "2 + 2 เท่ากับเท่าไหร่?"})
    
    completion = client.chat.completions.create(
        model="ep-lpvcnv-1761467347624133479",
        messages=messages,
    )
    
    assistant_reply = completion.choices[0].message.content
    messages.append({"role": "assistant", "content": assistant_reply})
    
    print(f"\n👤 User: 2 + 2 เท่ากับเท่าไหร่?")
    print(f"🤖 AI: {assistant_reply}")
    
    # รอบที่ 2
    messages.append({"role": "user", "content": "แล้วถ้าคูณ 3 ล่ะ?"})
    
    completion = client.chat.completions.create(
        model="ep-lpvcnv-1761467347624133479",
        messages=messages,
    )
    
    assistant_reply = completion.choices[0].message.content
    
    print(f"\n👤 User: แล้วถ้าคูณ 3 ล่ะ?")
    print(f"🤖 AI: {assistant_reply}")


# ============================================================================
# ตัวอย่างที่ 6: Error Handling
# ============================================================================

def example_error_handling():
    """ตัวอย่างการจัดการ errors"""
    print("\n" + "=" * 70)
    print("ตัวอย่างที่ 6: Error Handling")
    print("=" * 70)
    
    client = OpenAI(
        base_url="https://vanchin.streamlake.ai/api/gateway/v1/endpoints",
        api_key="invalid-api-key"  # API key ผิด
    )
    
    try:
        completion = client.chat.completions.create(
            model="ep-lpvcnv-1761467347624133479",
            messages=[{"role": "user", "content": "Hello"}],
        )
        print(completion.choices[0].message.content)
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        print(f"   Type: {type(e).__name__}")
        print("\n💡 Tip: ตรวจสอบ API key และ endpoint ID")


# ============================================================================
# ตัวอย่างที่ 7: การใช้งานผ่าน Environment Variables
# ============================================================================

def example_with_env_vars():
    """ตัวอย่างการใช้งานผ่าน environment variables"""
    print("\n" + "=" * 70)
    print("ตัวอย่างที่ 7: การใช้งานผ่าน Environment Variables")
    print("=" * 70)
    
    # ตั้งค่า environment variables
    os.environ["VANCHIN_API_KEY"] = "WW8GMBSTec_uPhRJQFe5y9OCsYrUKzslQx-LXWKLT9g"
    os.environ["VANCHIN_ENDPOINT"] = "ep-lpvcnv-1761467347624133479"
    
    client = OpenAI(
        base_url="https://vanchin.streamlake.ai/api/gateway/v1/endpoints",
        api_key=os.environ.get("VANCHIN_API_KEY")
    )
    
    completion = client.chat.completions.create(
        model=os.environ.get("VANCHIN_ENDPOINT"),
        messages=[
            {"role": "user", "content": "ทดสอบการใช้งานผ่าน env vars"}
        ],
    )
    
    print(f"\n💬 คำตอบ: {completion.choices[0].message.content}")
    print("\n✅ การใช้งานผ่าน environment variables ทำงานได้!")


# ============================================================================
# Main Function
# ============================================================================

def main():
    """รันตัวอย่างทั้งหมด"""
    print("\n" + "=" * 70)
    print("🚀 VanchinAI Usage Examples")
    print("=" * 70)
    
    examples = [
        ("1", "Basic Usage", example_basic_usage),
        ("2", "Streaming", example_streaming),
        ("3", "With Parameters", example_with_parameters),
        ("4", "Multiple Agents", example_multiple_agents),
        ("5", "Conversation", example_conversation),
        ("6", "Error Handling", example_error_handling),
        ("7", "Environment Variables", example_with_env_vars),
    ]
    
    print("\nเลือกตัวอย่างที่ต้องการรัน:")
    for num, name, _ in examples:
        print(f"  {num}. {name}")
    print("  0. รันทั้งหมด")
    print("  q. ออก")
    
    choice = input("\nเลือก (0-7 หรือ q): ").strip()
    
    if choice == "q":
        print("\n👋 Goodbye!")
        return
    
    if choice == "0":
        for _, _, func in examples:
            try:
                func()
            except Exception as e:
                print(f"\n❌ Error in example: {e}")
    else:
        for num, _, func in examples:
            if choice == num:
                try:
                    func()
                except Exception as e:
                    print(f"\n❌ Error: {e}")
                break
    
    print("\n" + "=" * 70)
    print("✨ Done!")
    print("=" * 70)


if __name__ == "__main__":
    main()
