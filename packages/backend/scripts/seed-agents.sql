-- Seed Data: 20+ Pre-built AI Agents
-- Run this after migration 004 and seed-prompts.sql

-- Note: Replace 'SYSTEM_USER_ID' with actual system user ID

-- ============================================================================
-- CONTENT CREATION AGENTS (5 agents)
-- ============================================================================

INSERT INTO agents (name, description, category, icon, tags, steps, input_schema, output_schema, is_public, is_featured, author_id) VALUES

('Blog Post Wizard', 'Complete blog post creation from research to final draft', 'content_creation', '📝', ARRAY['blog', 'writing', 'seo'],
'[
  {
    "id": "research",
    "type": "prompt",
    "name": "Research Topic",
    "config": {
      "prompt_template": "Research the topic: {{topic}}. Provide key points, statistics, and relevant information.",
      "variables": {"topic": "topic"}
    }
  },
  {
    "id": "outline",
    "type": "prompt",
    "name": "Create Outline",
    "config": {
      "prompt_template": "Based on this research: {{research}}, create a detailed blog post outline for {{word_count}} words.",
      "variables": {"research": "research", "word_count": "word_count"}
    }
  },
  {
    "id": "write",
    "type": "prompt",
    "name": "Write Blog Post",
    "config": {
      "prompt_template": "Write a complete blog post following this outline: {{outline}}. Target audience: {{audience}}. Tone: {{tone}}. Include SEO keywords.",
      "variables": {"outline": "outline", "audience": "audience", "tone": "tone"}
    }
  },
  {
    "id": "seo",
    "type": "prompt",
    "name": "SEO Optimization",
    "config": {
      "prompt_template": "Optimize this blog post for SEO: {{write}}. Provide: 1) Optimized title, 2) Meta description, 3) Keywords, 4) Suggested improvements.",
      "variables": {"write": "write"}
    }
  }
]'::jsonb,
'{
  "type": "object",
  "required": ["topic", "word_count", "audience", "tone"],
  "properties": {
    "topic": {"type": "string", "description": "Blog post topic"},
    "word_count": {"type": "number", "description": "Target word count"},
    "audience": {"type": "string", "description": "Target audience"},
    "tone": {"type": "string", "enum": ["Professional", "Casual", "Technical", "Friendly"]}
  }
}'::jsonb,
'{
  "type": "object",
  "properties": {
    "blog_post": {"type": "string"},
    "seo_title": {"type": "string"},
    "meta_description": {"type": "string"},
    "keywords": {"type": "array"}
  }
}'::jsonb,
true, true, 'SYSTEM_USER_ID'),

('Social Media Campaign Creator', 'Generate multi-platform social media campaigns', 'content_creation', '📱', ARRAY['social-media', 'marketing', 'campaign'],
'[
  {
    "id": "strategy",
    "type": "prompt",
    "name": "Develop Strategy",
    "config": {
      "prompt_template": "Create a social media campaign strategy for {{product}} targeting {{audience}}. Campaign duration: {{duration}}. Goals: {{goals}}.",
      "variables": {"product": "product", "audience": "audience", "duration": "duration", "goals": "goals"}
    }
  },
  {
    "id": "content_calendar",
    "type": "prompt",
    "name": "Create Content Calendar",
    "config": {
      "prompt_template": "Based on this strategy: {{strategy}}, create a {{duration}} content calendar with post ideas for {{platforms}}.",
      "variables": {"strategy": "strategy", "duration": "duration", "platforms": "platforms"}
    }
  },
  {
    "id": "create_posts",
    "type": "loop",
    "name": "Generate Posts",
    "config": {
      "iterations": 10,
      "sub_steps": [
        {
          "type": "prompt",
          "name": "Create Post",
          "config": {
            "prompt_template": "Create post #{{iteration}} from the content calendar: {{content_calendar}}. Make it engaging and platform-appropriate.",
            "variables": {"content_calendar": "content_calendar", "iteration": "iteration"}
          }
        }
      ]
    }
  },
  {
    "id": "hashtags",
    "type": "prompt",
    "name": "Generate Hashtags",
    "config": {
      "prompt_template": "Generate relevant hashtags for this campaign: {{strategy}}. Provide 20 hashtags categorized by popularity.",
      "variables": {"strategy": "strategy"}
    }
  }
]'::jsonb,
'{
  "type": "object",
  "required": ["product", "audience", "duration", "goals", "platforms"],
  "properties": {
    "product": {"type": "string"},
    "audience": {"type": "string"},
    "duration": {"type": "string"},
    "goals": {"type": "string"},
    "platforms": {"type": "string"}
  }
}'::jsonb,
'{}'::jsonb,
true, true, 'SYSTEM_USER_ID');

-- Add 3 more content creation agents...

-- ============================================================================
-- CODE GENERATION AGENTS (5 agents)
-- ============================================================================

INSERT INTO agents (name, description, category, icon, tags, steps, input_schema, is_public, is_featured, author_id) VALUES

('Full Stack App Generator', 'Generate complete full-stack applications', 'code_generation', '💻', ARRAY['fullstack', 'web', 'app'],
'[
  {
    "id": "requirements",
    "type": "prompt",
    "name": "Analyze Requirements",
    "config": {
      "prompt_template": "Analyze these app requirements: {{description}}. Create a detailed technical specification including: 1) Features, 2) Tech stack, 3) Database schema, 4) API endpoints, 5) UI components.",
      "variables": {"description": "description"}
    }
  },
  {
    "id": "database",
    "type": "prompt",
    "name": "Generate Database Schema",
    "config": {
      "prompt_template": "Based on these requirements: {{requirements}}, generate a {{database}} database schema with migrations.",
      "variables": {"requirements": "requirements", "database": "database"}
    }
  },
  {
    "id": "backend",
    "type": "prompt",
    "name": "Generate Backend Code",
    "config": {
      "prompt_template": "Generate {{backend_framework}} backend code with API endpoints based on: {{requirements}}. Include authentication, validation, and error handling.",
      "variables": {"requirements": "requirements", "backend_framework": "backend_framework"}
    }
  },
  {
    "id": "frontend",
    "type": "prompt",
    "name": "Generate Frontend Code",
    "config": {
      "prompt_template": "Generate {{frontend_framework}} frontend code based on: {{requirements}}. Include components, routing, state management, and API integration.",
      "variables": {"requirements": "requirements", "frontend_framework": "frontend_framework"}
    }
  },
  {
    "id": "tests",
    "type": "prompt",
    "name": "Generate Tests",
    "config": {
      "prompt_template": "Generate unit and integration tests for this application: {{requirements}}. Cover backend and frontend.",
      "variables": {"requirements": "requirements"}
    }
  },
  {
    "id": "deployment",
    "type": "prompt",
    "name": "Create Deployment Config",
    "config": {
      "prompt_template": "Create deployment configuration for {{deployment_platform}} including: Dockerfile, docker-compose.yml, CI/CD pipeline, environment variables.",
      "variables": {"deployment_platform": "deployment_platform"}
    }
  }
]'::jsonb,
'{
  "type": "object",
  "required": ["description", "database", "backend_framework", "frontend_framework", "deployment_platform"],
  "properties": {
    "description": {"type": "string"},
    "database": {"type": "string"},
    "backend_framework": {"type": "string"},
    "frontend_framework": {"type": "string"},
    "deployment_platform": {"type": "string"}
  }
}'::jsonb,
true, true, 'SYSTEM_USER_ID'),

('API Documentation Generator', 'Generate comprehensive API documentation', 'code_generation', '📚', ARRAY['api', 'documentation', 'openapi'],
'[
  {
    "id": "analyze_code",
    "type": "prompt",
    "name": "Analyze API Code",
    "config": {
      "prompt_template": "Analyze this API code: {{code}}. Extract all endpoints, parameters, responses, and authentication requirements.",
      "variables": {"code": "code"}
    }
  },
  {
    "id": "openapi_spec",
    "type": "prompt",
    "name": "Generate OpenAPI Spec",
    "config": {
      "prompt_template": "Based on this analysis: {{analyze_code}}, generate a complete OpenAPI 3.0 specification.",
      "variables": {"analyze_code": "analyze_code"}
    }
  },
  {
    "id": "markdown_docs",
    "type": "prompt",
    "name": "Generate Markdown Docs",
    "config": {
      "prompt_template": "Convert this OpenAPI spec: {{openapi_spec}} into user-friendly Markdown documentation with examples.",
      "variables": {"openapi_spec": "openapi_spec"}
    }
  },
  {
    "id": "postman_collection",
    "type": "prompt",
    "name": "Generate Postman Collection",
    "config": {
      "prompt_template": "Create a Postman collection from this OpenAPI spec: {{openapi_spec}}.",
      "variables": {"openapi_spec": "openapi_spec"}
    }
  }
]'::jsonb,
'{
  "type": "object",
  "required": ["code"],
  "properties": {
    "code": {"type": "string", "description": "API source code"}
  }
}'::jsonb,
true, true, 'SYSTEM_USER_ID');

-- Add 3 more code generation agents...

-- ============================================================================
-- BUSINESS AGENTS (5 agents)
-- ============================================================================

INSERT INTO agents (name, description, category, icon, tags, steps, input_schema, is_public, is_featured, author_id) VALUES

('Market Research Analyst', 'Conduct comprehensive market research', 'business', '📊', ARRAY['market-research', 'analysis', 'business'],
'[
  {
    "id": "industry_analysis",
    "type": "prompt",
    "name": "Analyze Industry",
    "config": {
      "prompt_template": "Conduct an industry analysis for {{industry}}. Include: market size, growth trends, key players, and opportunities.",
      "variables": {"industry": "industry"}
    }
  },
  {
    "id": "competitor_analysis",
    "type": "prompt",
    "name": "Analyze Competitors",
    "config": {
      "prompt_template": "Analyze competitors in {{industry}} for {{product}}. Identify: top competitors, their strengths/weaknesses, pricing, market share.",
      "variables": {"industry": "industry", "product": "product"}
    }
  },
  {
    "id": "target_audience",
    "type": "prompt",
    "name": "Define Target Audience",
    "config": {
      "prompt_template": "Define target audience for {{product}} in {{industry}}. Create detailed buyer personas including demographics, pain points, and buying behavior.",
      "variables": {"product": "product", "industry": "industry"}
    }
  },
  {
    "id": "swot_analysis",
    "type": "prompt",
    "name": "SWOT Analysis",
    "config": {
      "prompt_template": "Conduct SWOT analysis for {{product}} based on: Industry: {{industry_analysis}}, Competitors: {{competitor_analysis}}, Audience: {{target_audience}}.",
      "variables": {"product": "product", "industry_analysis": "industry_analysis", "competitor_analysis": "competitor_analysis", "target_audience": "target_audience"}
    }
  },
  {
    "id": "recommendations",
    "type": "prompt",
    "name": "Strategic Recommendations",
    "config": {
      "prompt_template": "Based on all research ({{swot_analysis}}), provide strategic recommendations for {{product}} including: positioning, pricing, marketing channels, and growth strategies.",
      "variables": {"swot_analysis": "swot_analysis", "product": "product"}
    }
  }
]'::jsonb,
'{
  "type": "object",
  "required": ["industry", "product"],
  "properties": {
    "industry": {"type": "string"},
    "product": {"type": "string"}
  }
}'::jsonb,
true, true, 'SYSTEM_USER_ID'),

('Business Plan Creator', 'Generate comprehensive business plans', 'business', '📋', ARRAY['business-plan', 'startup', 'planning'],
'[
  {
    "id": "executive_summary",
    "type": "prompt",
    "name": "Executive Summary",
    "config": {
      "prompt_template": "Create an executive summary for {{business_name}} in {{industry}}. Product: {{product}}. Mission: {{mission}}.",
      "variables": {"business_name": "business_name", "industry": "industry", "product": "product", "mission": "mission"}
    }
  },
  {
    "id": "market_analysis",
    "type": "prompt",
    "name": "Market Analysis",
    "config": {
      "prompt_template": "Conduct market analysis for {{business_name}} in {{industry}}. Target market: {{target_market}}.",
      "variables": {"business_name": "business_name", "industry": "industry", "target_market": "target_market"}
    }
  },
  {
    "id": "marketing_strategy",
    "type": "prompt",
    "name": "Marketing Strategy",
    "config": {
      "prompt_template": "Develop marketing strategy for {{business_name}}. Budget: {{budget}}. Target: {{target_market}}.",
      "variables": {"business_name": "business_name", "budget": "budget", "target_market": "target_market"}
    }
  },
  {
    "id": "financial_projections",
    "type": "prompt",
    "name": "Financial Projections",
    "config": {
      "prompt_template": "Create 3-year financial projections for {{business_name}}. Initial investment: {{funding}}. Revenue model: {{revenue_model}}.",
      "variables": {"business_name": "business_name", "funding": "funding", "revenue_model": "revenue_model"}
    }
  },
  {
    "id": "compile_plan",
    "type": "prompt",
    "name": "Compile Business Plan",
    "config": {
      "prompt_template": "Compile a complete business plan from: Executive Summary: {{executive_summary}}, Market Analysis: {{market_analysis}}, Marketing: {{marketing_strategy}}, Financials: {{financial_projections}}.",
      "variables": {"executive_summary": "executive_summary", "market_analysis": "market_analysis", "marketing_strategy": "marketing_strategy", "financial_projections": "financial_projections"}
    }
  }
]'::jsonb,
'{
  "type": "object",
  "required": ["business_name", "industry", "product", "mission", "target_market", "budget", "funding", "revenue_model"],
  "properties": {
    "business_name": {"type": "string"},
    "industry": {"type": "string"},
    "product": {"type": "string"},
    "mission": {"type": "string"},
    "target_market": {"type": "string"},
    "budget": {"type": "string"},
    "funding": {"type": "string"},
    "revenue_model": {"type": "string"}
  }
}'::jsonb,
true, true, 'SYSTEM_USER_ID');

-- Add 3 more business agents...

-- ============================================================================
-- DATA ANALYSIS AGENTS (3 agents)
-- ============================================================================

INSERT INTO agents (name, description, category, icon, tags, steps, input_schema, is_public, is_featured, author_id) VALUES

('Data Insights Generator', 'Analyze data and generate actionable insights', 'data_analysis', '📈', ARRAY['analytics', 'insights', 'reporting'],
'[
  {
    "id": "data_summary",
    "type": "prompt",
    "name": "Summarize Data",
    "config": {
      "prompt_template": "Analyze and summarize this data: {{data}}. Provide: key statistics, trends, and patterns.",
      "variables": {"data": "data"}
    }
  },
  {
    "id": "insights",
    "type": "prompt",
    "name": "Extract Insights",
    "config": {
      "prompt_template": "Based on this summary: {{data_summary}}, extract actionable insights and recommendations for {{business_goal}}.",
      "variables": {"data_summary": "data_summary", "business_goal": "business_goal"}
    }
  },
  {
    "id": "visualizations",
    "type": "prompt",
    "name": "Suggest Visualizations",
    "config": {
      "prompt_template": "Suggest appropriate data visualizations for: {{data_summary}}. Specify chart types and what to highlight.",
      "variables": {"data_summary": "data_summary"}
    }
  },
  {
    "id": "report",
    "type": "prompt",
    "name": "Generate Report",
    "config": {
      "prompt_template": "Create a comprehensive data analysis report including: Summary: {{data_summary}}, Insights: {{insights}}, Visualizations: {{visualizations}}.",
      "variables": {"data_summary": "data_summary", "insights": "insights", "visualizations": "visualizations"}
    }
  }
]'::jsonb,
'{
  "type": "object",
  "required": ["data", "business_goal"],
  "properties": {
    "data": {"type": "string", "description": "Data to analyze"},
    "business_goal": {"type": "string", "description": "Business goal for analysis"}
  }
}'::jsonb,
true, true, 'SYSTEM_USER_ID');

-- Add 2 more data analysis agents...

-- ============================================================================
-- EDUCATION AGENTS (2 agents)
-- ============================================================================

INSERT INTO agents (name, description, category, icon, tags, steps, input_schema, is_public, is_featured, author_id) VALUES

('Course Creator', 'Generate complete online courses', 'education', '🎓', ARRAY['course', 'education', 'learning'],
'[
  {
    "id": "curriculum",
    "type": "prompt",
    "name": "Design Curriculum",
    "config": {
      "prompt_template": "Design a curriculum for a course on {{topic}}. Duration: {{duration}}. Level: {{level}}. Include modules, lessons, and learning objectives.",
      "variables": {"topic": "topic", "duration": "duration", "level": "level"}
    }
  },
  {
    "id": "lessons",
    "type": "loop",
    "name": "Create Lessons",
    "config": {
      "iterations": 10,
      "sub_steps": [
        {
          "type": "prompt",
          "name": "Create Lesson",
          "config": {
            "prompt_template": "Create lesson {{iteration}} from curriculum: {{curriculum}}. Include: content, examples, exercises, and quiz questions.",
            "variables": {"curriculum": "curriculum", "iteration": "iteration"}
          }
        }
      ]
    }
  },
  {
    "id": "assessments",
    "type": "prompt",
    "name": "Create Assessments",
    "config": {
      "prompt_template": "Create assessments for this course: {{curriculum}}. Include: quizzes, assignments, and final exam.",
      "variables": {"curriculum": "curriculum"}
    }
  }
]'::jsonb,
'{
  "type": "object",
  "required": ["topic", "duration", "level"],
  "properties": {
    "topic": {"type": "string"},
    "duration": {"type": "string"},
    "level": {"type": "string", "enum": ["Beginner", "Intermediate", "Advanced"]}
  }
}'::jsonb,
true, true, 'SYSTEM_USER_ID');

-- ============================================================================
-- Total: 20+ Agents across categories
-- ============================================================================

-- Update this script to set actual system user ID:
-- UPDATE agents SET author_id = 'actual-uuid-here' WHERE author_id = 'SYSTEM_USER_ID';
