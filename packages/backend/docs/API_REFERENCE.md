# API Reference

Complete API documentation for Mr.Prompt backend services.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Projects](#projects)
3. [Workflows](#workflows)
4. [Deployments](#deployments)
5. [Users](#users)
6. [Rate Limits](#rate-limits)
7. [Error Codes](#error-codes)

---

## Authentication

All API requests require authentication using either session cookies or API keys.

### Authentication Methods

**Session-based (Web)**
```http
Cookie: session=<session-token>
```

**API Key (Programmatic)**
```http
Authorization: Bearer <api-key>
```

### Get Current User

Retrieve information about the authenticated user.

**Endpoint**: `GET /api/auth/me`

**Response**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "https://...",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

---

## Projects

Manage AI-generated projects.

### List Projects

Get all projects for the authenticated user.

**Endpoint**: `GET /api/projects`

**Query Parameters**:
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20, max: 100)
- `sort` (string, optional): Sort field (default: "createdAt")
- `order` (string, optional): Sort order ("asc" or "desc", default: "desc")

**Response**:
```json
{
  "projects": [
    {
      "id": "uuid",
      "name": "my-project",
      "description": "Project description",
      "status": "completed",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

### Get Project

Get a specific project by ID.

**Endpoint**: `GET /api/projects/:id`

**Response**:
```json
{
  "id": "uuid",
  "name": "my-project",
  "description": "Project description",
  "status": "completed",
  "files": [
    {
      "path": "src/index.ts",
      "content": "console.log('Hello');"
    }
  ],
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

### Create Project

Create a new project from a prompt.

**Endpoint**: `POST /api/projects`

**Request Body**:
```json
{
  "name": "my-project",
  "prompt": "Create a todo app with React and TypeScript",
  "framework": "nextjs",
  "features": ["auth", "database"]
}
```

**Response**:
```json
{
  "id": "uuid",
  "name": "my-project",
  "status": "pending",
  "workflowId": "uuid"
}
```

### Update Project

Update an existing project.

**Endpoint**: `PUT /api/projects/:id`

**Request Body**:
```json
{
  "name": "updated-name",
  "description": "Updated description"
}
```

**Response**:
```json
{
  "id": "uuid",
  "name": "updated-name",
  "description": "Updated description",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

### Delete Project

Delete a project.

**Endpoint**: `DELETE /api/projects/:id`

**Response**:
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

---

## Workflows

Manage AI workflow executions.

### Get Workflow Status

Get the status of a workflow execution.

**Endpoint**: `GET /api/workflows/:id`

**Response**:
```json
{
  "id": "uuid",
  "projectId": "uuid",
  "status": "running",
  "progress": 45,
  "currentStep": "Generating components",
  "steps": [
    {
      "id": "step-1",
      "name": "Analyzing prompt",
      "status": "completed",
      "duration": 1234
    },
    {
      "id": "step-2",
      "name": "Generating components",
      "status": "running",
      "progress": 45
    }
  ],
  "startedAt": "2025-01-01T00:00:00Z"
}
```

### Cancel Workflow

Cancel a running workflow.

**Endpoint**: `POST /api/workflows/:id/cancel`

**Response**:
```json
{
  "success": true,
  "message": "Workflow cancelled"
}
```

---

## Deployments

Deploy projects to GitHub and Vercel.

### Deploy Project

Deploy a project to GitHub and optionally to Vercel.

**Endpoint**: `POST /api/projects/:id/deploy`

**Request Body**:
```json
{
  "githubToken": "ghp_...",
  "vercelToken": "vercel_...",
  "repoName": "my-project",
  "repoPrivate": true,
  "deployToVercel": true
}
```

**Response**:
```json
{
  "success": true,
  "github": {
    "url": "https://github.com/user/my-project",
    "commitUrl": "https://github.com/user/my-project/commit/abc123",
    "commitSha": "abc123"
  },
  "vercel": {
    "url": "https://vercel.com/user/my-project",
    "deploymentUrl": "https://my-project.vercel.app",
    "deploymentId": "dpl_..."
  }
}
```

### Get Deployment Status

Get the status of a deployment.

**Endpoint**: `GET /api/deployments/:id`

**Response**:
```json
{
  "id": "uuid",
  "projectId": "uuid",
  "status": "ready",
  "githubUrl": "https://github.com/user/my-project",
  "vercelUrl": "https://my-project.vercel.app",
  "createdAt": "2025-01-01T00:00:00Z",
  "completedAt": "2025-01-01T00:05:00Z"
}
```

---

## Users

Manage user accounts and settings.

### Update User Profile

Update user profile information.

**Endpoint**: `PUT /api/users/me`

**Request Body**:
```json
{
  "name": "John Doe",
  "avatar": "https://..."
}
```

**Response**:
```json
{
  "id": "uuid",
  "name": "John Doe",
  "avatar": "https://...",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

### Get User Settings

Get user settings and preferences.

**Endpoint**: `GET /api/users/me/settings`

**Response**:
```json
{
  "theme": "dark",
  "language": "en",
  "notifications": {
    "email": true,
    "push": false
  }
}
```

### Update User Settings

Update user settings.

**Endpoint**: `PUT /api/users/me/settings`

**Request Body**:
```json
{
  "theme": "dark",
  "language": "en"
}
```

**Response**:
```json
{
  "theme": "dark",
  "language": "en",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

---

## Rate Limits

All API endpoints are rate limited to prevent abuse.

### Rate Limit Headers

Every API response includes rate limit information in headers:

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1704067200
```

### Rate Limit Tiers

| Tier | Requests | Window | Endpoints |
|------|----------|--------|-----------|
| **API** | 60 | 1 minute | Most endpoints |
| **Auth** | 5 | 1 minute | `/api/auth/*` |
| **AI** | 10 | 1 minute | `/api/workflows/*` |
| **Admin** | 100 | 1 minute | `/api/admin/*` |

### Rate Limit Exceeded

When rate limit is exceeded, you'll receive:

**Status**: `429 Too Many Requests`

**Response**:
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 60
}
```

---

## Error Codes

Standard HTTP status codes and error responses.

### Success Codes

| Code | Meaning |
|------|---------|
| `200` | OK - Request successful |
| `201` | Created - Resource created successfully |
| `204` | No Content - Request successful, no content to return |

### Client Error Codes

| Code | Meaning | Description |
|------|---------|-------------|
| `400` | Bad Request | Invalid request parameters |
| `401` | Unauthorized | Authentication required |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource not found |
| `409` | Conflict | Resource already exists |
| `422` | Unprocessable Entity | Validation failed |
| `429` | Too Many Requests | Rate limit exceeded |

### Server Error Codes

| Code | Meaning | Description |
|------|---------|-------------|
| `500` | Internal Server Error | Unexpected server error |
| `502` | Bad Gateway | Upstream service error |
| `503` | Service Unavailable | Service temporarily unavailable |
| `504` | Gateway Timeout | Upstream service timeout |

### Error Response Format

All errors follow this format:

```json
{
  "error": "Error type",
  "message": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error details"
  },
  "timestamp": "2025-01-01T00:00:00Z"
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `INVALID_INPUT` | Request validation failed |
| `UNAUTHORIZED` | Authentication failed |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `CONFLICT` | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Internal server error |
| `SERVICE_UNAVAILABLE` | Service temporarily unavailable |

---

## Pagination

List endpoints support pagination using query parameters.

### Parameters

- `page` (number): Page number (1-indexed)
- `limit` (number): Items per page (max: 100)

### Response Format

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Filtering and Sorting

List endpoints support filtering and sorting.

### Filtering

Use query parameters to filter results:

```http
GET /api/projects?status=completed&framework=nextjs
```

### Sorting

Use `sort` and `order` parameters:

```http
GET /api/projects?sort=createdAt&order=desc
```

**Supported sort fields**:
- `createdAt`
- `updatedAt`
- `name`

**Sort order**:
- `asc` - Ascending
- `desc` - Descending (default)

---

## Webhooks

Subscribe to events via webhooks.

### Webhook Events

| Event | Description |
|-------|-------------|
| `project.created` | New project created |
| `project.updated` | Project updated |
| `project.deleted` | Project deleted |
| `workflow.started` | Workflow execution started |
| `workflow.completed` | Workflow execution completed |
| `workflow.failed` | Workflow execution failed |
| `deployment.started` | Deployment started |
| `deployment.completed` | Deployment completed |
| `deployment.failed` | Deployment failed |

### Webhook Payload

```json
{
  "event": "project.created",
  "timestamp": "2025-01-01T00:00:00Z",
  "data": {
    "id": "uuid",
    "name": "my-project",
    ...
  }
}
```

---

## SDK and Examples

### JavaScript/TypeScript

```typescript
import { MrPromptClient } from '@mrprompt/sdk'

const client = new MrPromptClient({
  apiKey: 'your-api-key'
})

// Create project
const project = await client.projects.create({
  name: 'my-project',
  prompt: 'Create a todo app'
})

// Deploy project
const deployment = await client.projects.deploy(project.id, {
  githubToken: 'ghp_...',
  vercelToken: 'vercel_...'
})
```

### Python

```python
from mrprompt import Client

client = Client(api_key='your-api-key')

# Create project
project = client.projects.create(
    name='my-project',
    prompt='Create a todo app'
)

# Deploy project
deployment = client.projects.deploy(
    project.id,
    github_token='ghp_...',
    vercel_token='vercel_...'
)
```

---

## Support

For API support and questions:

- Documentation: https://docs.mrprompt.ai
- Email: support@mrprompt.ai
- Discord: https://discord.gg/mrprompt
