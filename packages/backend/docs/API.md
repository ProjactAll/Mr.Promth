# API Documentation

This document provides an overview of the Mr.Prompt API endpoints.

## Base URL

All API endpoints are relative to the base URL of your deployment (e.g., `http://localhost:3000/api`).

## Authentication

Most API endpoints require authentication. The user ID should be passed in the `X-User-ID` header.

## Rate Limiting

All API endpoints are rate-limited to prevent abuse. The default rate limit is 30 requests per minute. See `lib/middleware/rate-limit.ts` for more details.

## Workflow API

### `POST /api/workflow`

Creates and starts a new project generation workflow.

**Request Body:**

```json
{
  "projectName": "my-awesome-project",
  "prompt": "Create a blog with user authentication and comments",
  "userId": "user-123",
  "options": {
    "skipTesting": false,
    "skipDeployment": false
  }
}
```

**Response:**

```json
{
  "workflowId": "workflow-abc-123"
}
```

### `GET /api/workflow/[id]`

Retrieves the status of a specific workflow.

**Response:**

```json
{
  "workflow": {
    "id": "workflow-abc-123",
    "projectName": "my-awesome-project",
    "status": "in-progress",
    "currentStep": 3,
    "totalSteps": 7,
    "progress": 42,
    "results": {},
    "errors": [],
    "createdAt": "2025-11-08T10:00:00.000Z",
    "updatedAt": "2025-11-08T10:05:00.000Z"
  }
}
```

### `GET /api/workflow/[id]/stream`

Streams real-time workflow updates via Server-Sent Events (SSE).

**Event Stream:**

```
event: progress
data: {"step":3,"totalSteps":7,"status":"generating-backend","message":"Generating API routes...","progress":42}

event: status
data: {"status":"generating-backend","message":"Generating API routes..."}

event: complete
data: {"success":true,"results":{...},"duration":300000}
```

### `DELETE /api/workflow/[id]`

Cancels a running workflow.

## Agent API

### `POST /api/agents/[id]/execute`

Executes a specific task for an agent. This is used internally by the workflow orchestrator.

## File API

### `POST /api/files`

Uploads files. This is used internally for project packaging.

## GitHub API

### `POST /api/github`

Connects to a GitHub account. This is used for auto-deployment.

## Health Check API

### `GET /api/health`

Returns the health status of the application.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-11-08T10:10:00.000Z"
}
```
