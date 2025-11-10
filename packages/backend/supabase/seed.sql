-- Seed data for Mr.Prompt database
-- This file contains sample data for testing the application

-- Insert sample profiles
-- Note: These UUIDs should match the auth.users table for testing
INSERT INTO profiles (id, display_name, avatar_url, role)
VALUES
    ('12345678-1234-1234-1234-123456789012', 'John Doe', 'https://api.dicebear.com/7.x/avataaars/svg?seed=john', 'user'),
    ('23456789-2345-2345-2345-234567890123', 'Jane Smith', 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane', 'user'),
    ('34567890-3456-3456-3456-345678901234', 'Admin User', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', 'admin');

-- Insert sample API credentials
INSERT INTO api_credentials (user_id, provider, encrypted_key)
VALUES
    ('12345678-1234-1234-1234-123456789012', 'streamlake.ai', 'encrypted_key_123'),
    ('23456789-2345-2345-2345-234567890123', 'openai', 'encrypted_key_456');

-- Insert sample chat sessions
INSERT INTO chat_sessions (user_id, title, metadata)
VALUES
    ('12345678-1234-1234-1234-123456789012', 'First Chat Session', '{"model": "gpt-4", "temperature": 0.7}'),
    ('12345678-1234-1234-1234-123456789012', 'Code Review Session', '{"model": "gpt-3.5-turbo", "temperature": 0.3}'),
    ('23456789-2345-2345-2345-234567890123', 'Creative Writing', '{"model": "gpt-4", "temperature": 0.9}');

-- Insert sample messages
INSERT INTO messages (session_id, sender, content, provider_message_id)
VALUES
    -- First chat session messages
    ((SELECT id FROM chat_sessions WHERE title = 'First Chat Session' AND user_id = '12345678-1234-1234-1234-123456789012'), 'user', 'Hello, how are you?', 'msg_1_user'),
    ((SELECT id FROM chat_sessions WHERE title = 'First Chat Session' AND user_id = '12345678-1234-1234-1234-123456789012'), 'assistant', 'I am fine, thank you! How can I help you today?', 'msg_1_assistant'),
    ((SELECT id FROM chat_sessions WHERE title = 'First Chat Session' AND user_id = '12345678-1234-1234-1234-123456789012'), 'user', 'Can you help me write a function to calculate fibonacci numbers?', 'msg_2_user'),
    ((SELECT id FROM chat_sessions WHERE title = 'First Chat Session' AND user_id = '12345678-1234-1234-1234-123456789012'), 'assistant', 'Sure! Here is a simple recursive implementation in Python...', 'msg_2_assistant'),

    -- Code Review Session messages
    ((SELECT id FROM chat_sessions WHERE title = 'Code Review Session' AND user_id = '12345678-1234-1234-1234-123456789012'), 'user', 'Please review this code for potential improvements:', 'msg_3_user'),
    ((SELECT id FROM chat_sessions WHERE title = 'Code Review Session' AND user_id = '12345678-1234-1234-1234-123456789012'), 'assistant', 'I''ve reviewed your code and found several areas for improvement...', 'msg_3_assistant'),

    -- Creative Writing session messages
    ((SELECT id FROM chat_sessions WHERE title = 'Creative Writing' AND user_id = '23456789-2345-2345-2345-234567890123'), 'user', 'Help me write a story about a time-traveling cat', 'msg_4_user'),
    ((SELECT id FROM chat_sessions WHERE title = 'Creative Writing' AND user_id = '23456789-2345-2345-2345-234567890123'), 'assistant', 'Once upon a time, in a quiet little town, there lived a curious cat named Whiskers...', 'msg_4_assistant');

-- Insert sample prompts
INSERT INTO prompts (user_id, title, description, content, tags, is_public)
VALUES
    ('12345678-1234-1234-1234-123456789012', 'Code Review Prompt', 'Template for reviewing code', 'Please review the following code and provide feedback on:\n\n1. Code quality and readability\n2. Potential bugs or issues\n3. Performance optimizations\n4. Security concerns\n5. Best practices\n\nCode to review:\n```{{code}}```\n\nPlease provide specific, actionable feedback.', ARRAY['code', 'review', 'development'], FALSE),

    ('12345678-1234-1234-1234-123456789012', 'Blog Post Writer', 'Template for writing blog posts', 'Write a comprehensive blog post about {{topic}}. Include:\n\n1. An engaging introduction\n2. Main body with key points\n3. Examples and case studies\n4. Conclusion with actionable takeaways\n\nTarget audience: {{audience}}\nTone: {{tone}}', ARRAY['writing', 'blog', 'content'], TRUE),

    ('23456789-2345-2345-2345-234567890123', 'Creative Story Generator', 'Template for generating creative stories', 'Generate a creative story based on the following elements:\n\nSetting: {{setting}}\nCharacters: {{characters}}\nConflict: {{conflict}}\nTheme: {{theme}}\n\nMake the story engaging and include vivid descriptions.', ARRAY['creative', 'writing', 'story'], FALSE),

    ('23456789-2345-2345-2345-234567890123', 'Email Composer', 'Template for writing professional emails', 'Write a professional email with the following details:\n\nTo: {{recipient}}\nSubject: {{subject}}\nPurpose: {{purpose}}\n\nKey points to include:\n{{key_points}}\n\nTone: {{tone}}\n\nPlease ensure the email is clear, concise, and professional.', ARRAY['email', 'professional', 'communication'], FALSE),

    ('34567890-3456-3456-3456-345678901234', 'Technical Documentation', 'Template for technical documentation', 'Create comprehensive technical documentation for {{product}}.\n\nInclude:\n1. Overview and purpose\n2. Installation/Setup instructions\n3. Usage examples\n4. API reference (if applicable)\n5. Troubleshooting guide\n\nTarget audience: {{audience}}\nComplexity level: {{complexity}}', ARRAY['documentation', 'technical', 'api'], TRUE);

-- Insert sample prompt versions
INSERT INTO prompt_versions (prompt_id, version, content)
VALUES
    -- Version 1 and 2 for Code Review Prompt
    ((SELECT id FROM prompts WHERE title = 'Code Review Prompt' AND user_id = '12345678-1234-1234-1234-123456789012'), 1, 'Please review the following code and provide feedback on code quality, potential bugs, and performance. Code: {{code}}'),
    ((SELECT id FROM prompts WHERE title = 'Code Review Prompt' AND user_id = '12345678-1234-1234-1234-123456789012'), 2, 'Please review the following code and provide feedback on:\n\n1. Code quality and readability\n2. Potential bugs or issues\n3. Performance optimizations\n4. Security concerns\n5. Best practices\n\nCode to review:\n```{{code}}```\n\nPlease provide specific, actionable feedback.'),

    -- Version 1 and 2 for Blog Post Writer
    ((SELECT id FROM prompts WHERE title = 'Blog Post Writer' AND user_id = '12345678-1234-1234-1234-123456789012'), 1, 'Write a blog post about {{topic}} for {{audience}} in a {{tone}} tone.'),
    ((SELECT id FROM prompts WHERE title = 'Blog Post Writer' AND user_id = '12345678-1234-1234-1234-123456789012'), 2, 'Write a comprehensive blog post about {{topic}}. Include:\n\n1. An engaging introduction\n2. Main body with key points\n3. Examples and case studies\n4. Conclusion with actionable takeaways\n\nTarget audience: {{audience}}\nTone: {{tone}}'),

    -- Version 1 for Creative Story Generator
    ((SELECT id FROM prompts WHERE title = 'Creative Story Generator' AND user_id = '23456789-2345-2345-2345-234567890123'), 1, 'Generate a creative story based on the following elements:\n\nSetting: {{setting}}\nCharacters: {{characters}}\nConflict: {{conflict}}\nTheme: {{theme}}\n\nMake the story engaging and include vivid descriptions.'),

    -- Version 1 for Email Composer
    ((SELECT id FROM prompts WHERE title = 'Email Composer' AND user_id = '23456789-2345-2345-2345-234567890123'), 1, 'Write a professional email with the following details:\n\nTo: {{recipient}}\nSubject: {{subject}}\nPurpose: {{purpose}}\n\nKey points to include:\n{{key_points}}\n\nTone: {{tone}}\n\nPlease ensure the email is clear, concise, and professional.'),

    -- Version 1 for Technical Documentation
    ((SELECT id FROM prompts WHERE title = 'Technical Documentation' AND user_id = '34567890-3456-3456-3456-345678901234'), 1, 'Create comprehensive technical documentation for {{product}}.\n\nInclude:\n1. Overview and purpose\n2. Installation/Setup instructions\n3. Usage examples\n4. API reference (if applicable)\n5. Troubleshooting guide\n\nTarget audience: {{audience}}\nComplexity level: {{complexity}}');

-- Insert sample prompt usage logs
INSERT INTO prompt_usage_logs (prompt_id, session_id, provider, latency_ms, token_count)
VALUES
    -- Logs for Code Review Prompt usage
    ((SELECT id FROM prompts WHERE title = 'Code Review Prompt' AND user_id = '12345678-1234-1234-1234-123456789012'),
     (SELECT id FROM chat_sessions WHERE title = 'Code Review Session' AND user_id = '12345678-1234-1234-1234-123456789012'),
     'streamlake.ai', 1500, 250),

    -- Logs for Blog Post Writer usage
    ((SELECT id FROM prompts WHERE title = 'Blog Post Writer' AND user_id = '12345678-1234-1234-1234-123456789012'),
     (SELECT id FROM chat_sessions WHERE title = 'First Chat Session' AND user_id = '12345678-1234-1234-1234-123456789012'),
     'streamlake.ai', 2000, 400),

    -- Logs for Creative Story Generator usage
    ((SELECT id FROM prompts WHERE title = 'Creative Story Generator' AND user_id = '23456789-2345-2345-2345-234567890123'),
     (SELECT id FROM chat_sessions WHERE title = 'Creative Writing' AND user_id = '23456789-2345-2345-2345-234567890123'),
     'openai', 1800, 350),

    -- Additional logs for public prompts
    ((SELECT id FROM prompts WHERE title = 'Blog Post Writer' AND user_id = '12345678-1234-1234-1234-123456789012'),
     (SELECT id FROM chat_sessions WHERE title = 'Creative Writing' AND user_id = '23456789-2345-2345-2345-234567890123'),
     'openai', 2200, 450),

    ((SELECT id FROM prompts WHERE title = 'Technical Documentation' AND user_id = '34567890-3456-3456-3456-345678901234'),
     (SELECT id FROM chat_sessions WHERE title = 'Code Review Session' AND user_id = '12345678-1234-1234-1234-123456789012'),
     'streamlake.ai', 2500, 500);

-- Add some more recent usage logs
INSERT INTO prompt_usage_logs (prompt_id, session_id, provider, latency_ms, token_count)
VALUES
    -- Recent usage of Code Review Prompt
    ((SELECT id FROM prompts WHERE title = 'Code Review Prompt' AND user_id = '12345678-1234-1234-1234-123456789012'),
     (SELECT id FROM chat_sessions WHERE title = 'Code Review Session' AND user_id = '12345678-1234-1234-1234-123456789012'),
     'streamlake.ai', 1300, 200),

    -- Recent usage of Blog Post Writer
    ((SELECT id FROM prompts WHERE title = 'Blog Post Writer' AND user_id = '12345678-1234-1234-1234-123456789012'),
     (SELECT id FROM chat_sessions WHERE title = 'First Chat Session' AND user_id = '12345678-1234-1234-1234-123456789012'),
     'streamlake.ai', 1900, 380);