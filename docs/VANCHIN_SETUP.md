# 🤖 Vanchin AI Setup Guide

**Version**: 1.0.0  
**Date**: November 10, 2025

---

## 🎯 Overview

Mr.Promth Production uses **Vanchin AI** instead of OpenAI for all AI operations. This guide explains how the Vanchin integration works and how to use it.

---

## ✅ What's Already Configured

### 1. **39 API Key + Endpoint Pairs**

The project is configured with 39 Vanchin AI models in `.env.local`:

```env
VANCHIN_BASE_URL=https://vanchin.streamlake.ai/api/gateway/v1/endpoints

VANCHIN_API_KEY_1=...
VANCHIN_ENDPOINT_1=ep-xxx-...

VANCHIN_API_KEY_2=...
VANCHIN_ENDPOINT_2=ep-xxx-...

# ... up to 39 pairs
```

### 2. **Automatic Load Balancing**

The `VanchinClient` automatically distributes requests across all 39 models using round-robin load balancing. This means:
- Better performance (parallel processing)
- Higher rate limits (39x more capacity)
- Automatic failover

### 3. **OpenAI-Compatible Interface**

The Vanchin client provides an OpenAI-compatible interface, so existing code works with minimal changes.

---

## 📖 How to Use

### Method 1: OpenAI-Compatible Client (Recommended)

```typescript
import { getVanchinClient } from '@/lib/ai/vanchin-client'

// Get client (automatically load-balanced)
const client = getVanchinClient()

// Use like OpenAI
const response = await client.chat.completions.create({
  model: 'gpt-4', // ignored, uses Vanchin endpoint
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello!' }
  ],
  temperature: 0.7,
})

console.log(response.choices[0].message.content)
```

### Method 2: Direct Chat Completion

```typescript
import { vanchinChatCompletion } from '@/lib/ai/vanchin-client'

const response = await vanchinChatCompletion(
  [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello!' }
  ],
  {
    temperature: 0.7,
    max_tokens: 1000,
  }
)

console.log(response.choices[0].message.content)
```

### Method 3: Specific Model Index

```typescript
import { getVanchinClientByIndex } from '@/lib/ai/vanchin-client'

// Use specific model (1-39)
const client = getVanchinClientByIndex(1)

const response = await client.chat.completions.create({
  model: 'gpt-4',
  messages: [...],
})
```

---

## 🔧 API Format

Vanchin AI uses a specific format:

### Request

```bash
curl 'https://vanchin.streamlake.ai/api/gateway/v1/endpoints/chat/completions' \
  -H "Authorization: Bearer $VANCHIN_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "ep-xxx-123456789",  # endpoint_id goes here
    "messages": [
      {
        "role": "system",
        "content": "You are an AI assistant."
      },
      {
        "role": "user",
        "content": "Hello!"
      }
    ],
    "temperature": 0.7,
    "max_tokens": 1000
  }'
```

### Key Points

1. **URL**: `https://vanchin.streamlake.ai/api/gateway/v1/endpoints/chat/completions`
   - NOT `.../{endpoint_id}/chat/completions`

2. **Authorization**: `Bearer {API_KEY}`
   - Each API key is paired with a specific endpoint

3. **Model Field**: `{ENDPOINT_ID}`
   - The endpoint_id (e.g., `ep-xxx-123`) goes in the `model` field
   - NOT in the URL

---

## ⚙️ Configuration

### Environment Variables

All Vanchin configuration is in `.env.local`:

```env
# Base URL (same for all requests)
VANCHIN_BASE_URL=https://vanchin.streamlake.ai/api/gateway/v1/endpoints

# Pair 1
VANCHIN_API_KEY_1=your_api_key_1
VANCHIN_ENDPOINT_1=ep-xxx-1

# Pair 2
VANCHIN_API_KEY_2=your_api_key_2
VANCHIN_ENDPOINT_2=ep-xxx-2

# ... up to 39 pairs
```

### Load Balancing

The client automatically cycles through all available models:

```
Request 1 → Model 1
Request 2 → Model 2
Request 3 → Model 3
...
Request 39 → Model 39
Request 40 → Model 1 (cycles back)
```

---

## 🚀 Usage in Agents

All 7 AI agents use Vanchin automatically:

```typescript
// In any agent file
import { getVanchinClient } from '@/lib/ai/vanchin-client'

export async function executeAgent(input: string) {
  const client = getVanchinClient() // Auto load-balanced
  
  const response = await client.chat.completions.create({
    model: 'gpt-4', // ignored
    messages: [
      { role: 'system', content: 'You are a planning agent.' },
      { role: 'user', content: input }
    ],
  })
  
  return response.choices[0].message.content
}
```

---

## 📊 Monitoring

### Check Available Models

```typescript
import { vanchinClient } from '@/lib/ai/vanchin-client'

console.log(`Total models: ${vanchinClient.getModelCount()}`)
console.log(`Available: ${vanchinClient.getAvailableModels().join(', ')}`)
```

### Logs

The client logs on startup:

```
✅ Loaded 39 Vanchin AI models
```

Or if no models are configured:

```
⚠️  No Vanchin models loaded from environment variables
Please set VANCHIN_API_KEY_N and VANCHIN_ENDPOINT_N in .env.local
```

---

## 🔒 Security

**IMPORTANT**: 
- `.env.local` is in `.gitignore` and will NOT be committed
- API keys are loaded from environment variables only
- Never hardcode API keys in source code

---

## 🆘 Troubleshooting

### Error: "No Vanchin models available"

**Solution**: Check that `.env.local` has at least one pair:

```env
VANCHIN_API_KEY_1=...
VANCHIN_ENDPOINT_1=ep-xxx-...
```

### Error: "Vanchin API error (401)"

**Solution**: Check that the API key matches the endpoint:

```env
# CORRECT: Paired key and endpoint
VANCHIN_API_KEY_1=key_for_endpoint_1
VANCHIN_ENDPOINT_1=ep-xxx-1

# WRONG: Mismatched pair
VANCHIN_API_KEY_1=key_for_endpoint_2  # ❌
VANCHIN_ENDPOINT_1=ep-xxx-1
```

### Error: "Model X not found"

**Solution**: Check that the model index exists (1-39):

```typescript
// ✅ Correct
getVanchinClientByIndex(1)  // Model 1 exists

// ❌ Wrong
getVanchinClientByIndex(40) // No model 40
```

---

## 🎯 Best Practices

1. **Use Auto Load Balancing**: Let the client distribute requests
   ```typescript
   const client = getVanchinClient() // ✅ Recommended
   ```

2. **Don't Specify Model Index**: Unless you have a specific reason
   ```typescript
   const client = getVanchinClientByIndex(1) // ⚠️ Only if needed
   ```

3. **Handle Errors**: Vanchin API can fail like any API
   ```typescript
   try {
     const response = await client.chat.completions.create(...)
   } catch (error) {
     console.error('Vanchin API failed:', error)
     // Handle error
   }
   ```

4. **Monitor Usage**: Keep track of which models are being used
   ```typescript
   console.log(`Using model ${vanchinClient.getModelCount()}`)
   ```

---

**Ready to use Vanchin AI! 🚀**
