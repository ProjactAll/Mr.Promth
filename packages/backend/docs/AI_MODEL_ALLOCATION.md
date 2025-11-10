# AI Model Allocation Strategy

**Date:** November 8, 2025  
**Project:** Mr.Prompt  
**Total Models:** 19 Vanchin AI Models  
**Total Tokens:** 20M free tokens

---

## Executive Summary

Mr.Prompt uses 19 Vanchin AI models with intelligent allocation across 7 specialized agents. This document defines the model allocation strategy for optimal performance, load balancing, and failover capabilities.

---

## Available Models

### Model Inventory
- **Total Models:** 19 (model_1 to model_19)
- **API Type:** OpenAI-compatible
- **Base URL:** https://vanchin.streamlake.ai/api/gateway/v1/endpoints
- **Token Pool:** 20M free tokens shared across all models
- **Load Balancing:** Round-robin and random selection available

### Model Characteristics
- **Model 1-3:** Primary models with descriptions (General, Alternative, Specialized)
- **Model 4-19:** Additional models for load distribution

---

## Agent-to-Model Allocation

### 1. Project Planner Agent
**Purpose:** Analyze requirements, create project structure, define architecture

**Allocated Models:**
- Primary: `model_1` (General purpose)
- Backup: `model_2` (Alternative)
- Tertiary: `model_3` (Specialized)

**Rationale:** Planning requires general understanding and flexibility. Uses top 3 models with descriptions.

**Usage Pattern:**
- Initial project analysis
- Architecture design
- Technology stack selection
- Project timeline estimation

---

### 2. Frontend Developer Agent
**Purpose:** Create React/Next.js components, UI implementation, client-side logic

**Allocated Models:**
- Primary: `model_4`, `model_5`, `model_6`
- Backup: `model_7`, `model_8`

**Rationale:** Frontend work is frequent and requires multiple concurrent requests. Allocated 5 models for load distribution.

**Usage Pattern:**
- Component generation
- Page creation
- UI/UX implementation
- Client-side state management

---

### 3. Backend Developer Agent
**Purpose:** API routes, server logic, database operations, authentication

**Allocated Models:**
- Primary: `model_9`, `model_10`, `model_11`
- Backup: `model_12`, `model_13`

**Rationale:** Backend operations are critical and require dedicated models. 5 models ensure high availability.

**Usage Pattern:**
- API endpoint creation
- Server-side logic
- Database queries
- Authentication flows

---

### 4. Database Designer Agent
**Purpose:** Schema design, migrations, query optimization, data modeling

**Allocated Models:**
- Primary: `model_14`, `model_15`
- Backup: `model_16`

**Rationale:** Database operations are less frequent but critical. 3 models provide adequate coverage.

**Usage Pattern:**
- Schema design
- Migration scripts
- Query optimization
- Data relationship modeling

---

### 5. UI/UX Designer Agent
**Purpose:** Design system, styling, responsive design, accessibility

**Allocated Models:**
- Primary: `model_17`, `model_18`
- Backup: `model_19`

**Rationale:** Design work requires creative models. 3 models allow for design variations.

**Usage Pattern:**
- Design system creation
- Styling implementation
- Responsive design
- Accessibility features

---

### 6. Code Reviewer Agent
**Purpose:** Code quality, best practices, security, performance optimization

**Allocated Models:**
- Primary: `model_3` (Specialized)
- Backup: `model_1` (General purpose)
- Tertiary: `model_2` (Alternative)

**Rationale:** Code review requires specialized understanding. Shares models with Project Planner for efficiency.

**Usage Pattern:**
- Code quality checks
- Security audits
- Performance analysis
- Best practice validation

---

### 7. Deployment Agent
**Purpose:** Build configuration, deployment scripts, CI/CD, production optimization

**Allocated Models:**
- Primary: `model_19`
- Backup: `model_18`
- Tertiary: `model_17`

**Rationale:** Deployment is infrequent but critical. Shares models with UI/UX Designer.

**Usage Pattern:**
- Build configuration
- Deployment scripts
- Environment setup
- Production optimization

---

## Load Balancing Strategy

### Round-Robin (Default)
```typescript
// Automatically rotates through models
const { client, endpoint, modelKey } = getNextModel()
```

**Use Cases:**
- General chat interactions
- Sequential operations
- Even load distribution

### Random Selection
```typescript
// Randomly selects a model
const { client, endpoint, modelKey } = getRandomModel()
```

**Use Cases:**
- Parallel operations
- High concurrency
- Unpredictable load patterns

### Specific Model Selection
```typescript
// Use specific model for specialized tasks
const client = createVanchinClient('model_3')
const endpoint = getModelEndpoint('model_3')
```

**Use Cases:**
- Specialized tasks
- Testing specific models
- Debugging

---

## Failover Strategy

### Automatic Failover
When a model fails or times out, the system automatically falls back to backup models:

1. **Primary Model Fails** → Try Backup Model
2. **Backup Model Fails** → Try Tertiary Model
3. **All Models Fail** → Return error with retry suggestion

### Implementation
```typescript
async function executeWithFailover(
  agent: string,
  primaryModel: string,
  backupModels: string[],
  task: Function
) {
  const models = [primaryModel, ...backupModels]
  
  for (const modelKey of models) {
    try {
      const client = createVanchinClient(modelKey as any)
      const endpoint = getModelEndpoint(modelKey as any)
      return await task(client, endpoint)
    } catch (error) {
      console.error(`Model ${modelKey} failed, trying next...`)
      continue
    }
  }
  
  throw new Error('All models failed')
}
```

---

## Performance Optimization

### Token Management
- **Monitor Usage:** Track token consumption per model
- **Rate Limiting:** Implement per-model rate limits
- **Quota Alerts:** Alert when approaching 20M token limit

### Caching Strategy
- **Response Caching:** Cache common responses (e.g., boilerplate code)
- **Model Result Caching:** Cache model outputs for identical inputs
- **TTL:** 1 hour for dynamic content, 24 hours for static content

### Concurrent Requests
- **Max Concurrent:** 5 requests per model
- **Queue System:** Queue additional requests
- **Timeout:** 30 seconds per request

---

## Monitoring & Analytics

### Metrics to Track
1. **Model Usage:**
   - Requests per model
   - Token consumption per model
   - Average response time per model

2. **Agent Performance:**
   - Requests per agent
   - Success rate per agent
   - Average task completion time

3. **System Health:**
   - Total requests per hour
   - Error rate
   - Failover frequency

### Logging
```typescript
interface ModelLog {
  timestamp: Date
  agent: string
  modelKey: string
  taskType: string
  tokensUsed: number
  responseTime: number
  success: boolean
  error?: string
}
```

---

## Configuration File

### `/lib/ai/model-config.ts`
```typescript
export const AGENT_MODEL_ALLOCATION = {
  'project-planner': {
    primary: ['model_1'],
    backup: ['model_2', 'model_3']
  },
  'frontend-developer': {
    primary: ['model_4', 'model_5', 'model_6'],
    backup: ['model_7', 'model_8']
  },
  'backend-developer': {
    primary: ['model_9', 'model_10', 'model_11'],
    backup: ['model_12', 'model_13']
  },
  'database-designer': {
    primary: ['model_14', 'model_15'],
    backup: ['model_16']
  },
  'ui-ux-designer': {
    primary: ['model_17', 'model_18'],
    backup: ['model_19']
  },
  'code-reviewer': {
    primary: ['model_3'],
    backup: ['model_1', 'model_2']
  },
  'deployment-agent': {
    primary: ['model_19'],
    backup: ['model_18', 'model_17']
  }
}
```

---

## Best Practices

### 1. Model Selection
- ✅ Use primary models for critical tasks
- ✅ Use backup models for failover
- ✅ Use random selection for parallel tasks
- ❌ Don't hardcode model keys in application code

### 2. Error Handling
- ✅ Implement retry logic with exponential backoff
- ✅ Log all model failures
- ✅ Provide meaningful error messages to users
- ❌ Don't fail silently

### 3. Token Management
- ✅ Monitor token usage regularly
- ✅ Implement token budgets per feature
- ✅ Cache responses when possible
- ❌ Don't waste tokens on redundant requests

### 4. Testing
- ✅ Test failover scenarios
- ✅ Load test with concurrent requests
- ✅ Monitor response times
- ❌ Don't test in production without monitoring

---

## Future Enhancements

### Phase 1 (Current)
- ✅ Basic model allocation
- ✅ Round-robin load balancing
- ✅ Manual failover

### Phase 2 (Next)
- ⏳ Automatic failover implementation
- ⏳ Token usage tracking
- ⏳ Performance monitoring dashboard

### Phase 3 (Future)
- 🔮 AI-powered model selection
- 🔮 Predictive token management
- 🔮 Auto-scaling based on load
- 🔮 Cost optimization algorithms

---

## Troubleshooting

### Model Not Responding
1. Check API key validity
2. Verify endpoint ID
3. Check network connectivity
4. Try backup model

### High Token Consumption
1. Review request patterns
2. Implement caching
3. Optimize prompts
4. Reduce max_tokens parameter

### Slow Response Times
1. Check model load
2. Use load balancing
3. Implement timeout handling
4. Consider parallel requests

---

## Contact & Support

**Documentation:** `/docs/AI_MODEL_ALLOCATION.md`  
**Configuration:** `/lib/ai/vanchin-client.ts`  
**Model Config:** `/lib/ai/model-config.ts`

**For Issues:**
1. Check logs in `/logs/model-usage.log`
2. Review monitoring dashboard
3. Contact system administrator

---

**Last Updated:** November 8, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
