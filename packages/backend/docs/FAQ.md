# Frequently Asked Questions (FAQ)

Common questions and answers about Mr.Prompt.

---

## General Questions

### What is Mr.Prompt?

Mr.Prompt is an AI-powered platform that generates full-stack web applications from natural language prompts. Simply describe what you want to build, and our AI will create a complete, production-ready project for you.

### How does it work?

Mr.Prompt uses advanced AI models to understand your requirements, plan the architecture, generate code, and create a complete project structure. The process involves analyzing your prompt, planning the project architecture, generating components and pages, creating API routes and database schemas, setting up authentication if needed, and generating documentation.

### What can I build with Mr.Prompt?

You can build various types of web applications including landing pages, web applications, dashboards and admin panels, e-commerce sites, blogs and content sites, portfolios, SaaS applications, and internal tools.

### Is the generated code production-ready?

The generated code follows best practices and is well-structured, but you should always review and test the code before deploying to production. We recommend conducting security audits, performance testing, adding custom business logic, and implementing proper error handling.

---

## Technical Questions

### What frameworks are supported?

We currently support Next.js (recommended), React, Vue.js, Svelte, and more frameworks coming soon.

### What styling options are available?

You can choose from Tailwind CSS (recommended), Material-UI, Chakra UI, Styled Components, and CSS Modules.

### Can I use TypeScript?

Yes! TypeScript is fully supported and recommended for all projects. All generated code can use TypeScript with proper type definitions.

### What databases are supported?

We support Supabase (PostgreSQL), MongoDB, MySQL, SQLite, and Prisma ORM with any database.

### Can I add authentication?

Yes, we support multiple authentication providers including Supabase Auth, NextAuth.js, Auth0, Firebase Auth, and custom authentication solutions.

### Can I integrate third-party APIs?

Absolutely! You can integrate any third-party API including payment gateways (Stripe, PayPal), email services (SendGrid, Mailgun), cloud storage (AWS S3, Cloudinary), analytics (Google Analytics, Mixpanel), and more.

---

## Project Generation

### How long does it take to generate a project?

Most projects take two to five minutes to generate, depending on complexity. Simple projects (landing pages) take one to two minutes, medium projects (web apps) take three to five minutes, and complex projects (full-stack apps) take five to ten minutes.

### What makes a good prompt?

A good prompt should be specific about features, mention the target audience, include technical requirements, specify design preferences, and break down complex requirements.

**Good prompt example:**
> Create a modern task management app with Next.js and TypeScript. Include user authentication with Supabase, a dashboard to view all tasks, ability to create, edit, and delete tasks, task categories and priorities, due dates and reminders, and a clean, minimalist design.

**Bad prompt example:**
> Make a todo app

### Can I regenerate parts of a project?

Yes, you can regenerate specific components or features without regenerating the entire project. Simply select the component you want to regenerate and provide updated requirements.

### What if generation fails?

If generation fails, check your prompt for clarity, ensure you have sufficient credits, try simplifying complex requirements, and contact support if the issue persists. You can also view error logs for specific failure reasons.

---

## Deployment

### Do I need a GitHub account?

Yes, a GitHub account is required for code hosting and version control. We use GitHub to store your project code, enable version control, facilitate collaboration, and integrate with Vercel for deployment.

### Is Vercel required?

No, Vercel is optional but recommended. You can deploy to any hosting platform including Vercel (recommended), Netlify, AWS, Google Cloud, or your own server.

### How do I deploy my project?

The deployment process is simple. Click the "Deploy" button, enter your GitHub token, choose a repository name, optionally enter your Vercel token, and click "Deploy Now". The system will automatically create a GitHub repository, push your code, create a Vercel project if enabled, and deploy your application.

### Can I use a custom domain?

Yes, you can configure custom domains in Vercel after deployment. Navigate to your Vercel project settings, go to the Domains section, add your custom domain, configure DNS records as instructed, and wait for DNS propagation.

### How do I update my deployed project?

Updates are automatic with continuous deployment. Simply push changes to your GitHub repository, and Vercel will automatically redeploy. You can also manually trigger deployments from the Vercel dashboard or use the Vercel CLI for local deployments.

---

## Editing and Customization

### Can I edit the generated code?

Yes, you can edit code in several ways. Use the built-in code editor in the browser, download the project and edit locally, clone the GitHub repository, or use any code editor or IDE.

### How do I add new features?

You can add new features by editing the code directly, regenerating with an updated prompt, using the component generator for specific features, or manually coding new features.

### Can I change the design?

Yes, you can customize the design by modifying Tailwind classes, updating the theme configuration, changing colors and fonts, or adding custom CSS.

### How do I add environment variables?

For local development, create a `.env.local` file in the project root and add your variables. For production deployment, add environment variables in Vercel project settings under the Environment Variables section.

---

## Billing and Pricing

### Is there a free tier?

Yes, we offer a free tier with limited projects per month. The free tier includes five projects per month, basic features, community support, and GitHub deployment.

### How does pricing work?

Pricing is based on the number of projects generated. We offer monthly and annual subscription plans with different project limits, features, and support levels.

### What payment methods do you accept?

We accept credit cards (Visa, Mastercard, Amex), PayPal, and other major payment methods.

### Can I cancel my subscription?

Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period, and you can re-subscribe at any time. There are no cancellation fees.

### Do you offer refunds?

We offer refunds within fourteen days of purchase if you're not satisfied with the service. Contact support to request a refund.

---

## Security and Privacy

### Is my code private?

Yes, your code is private by default. We never share your code with third parties, you own all generated code, and you can make GitHub repositories private.

### How do you handle my data?

We take data privacy seriously. We only store necessary project metadata, never store sensitive information like API keys, use encryption for data in transit and at rest, and comply with GDPR and other privacy regulations.

### Are API keys secure?

Yes, API keys are handled securely. They are never stored on our servers, transmitted over encrypted connections, only used during deployment, and immediately discarded after use.

### What about authentication in generated projects?

Generated projects use secure authentication practices including password hashing with bcrypt, secure session management, JWT tokens with proper expiration, protection against common attacks (XSS, CSRF), and regular security updates.

---

## Support and Community

### How do I get help?

You can get help through our documentation at https://docs.mrprompt.ai, Discord community at https://discord.gg/mrprompt, email support at support@mrprompt.ai, or GitHub issues for bug reports.

### What are your support hours?

Email support is available twenty-four hours a day, seven days a week with typical response time within twenty-four hours. Priority support is available for paid plans with response time within four hours. Community support on Discord is available anytime.

### Can I request features?

Yes! We welcome feature requests. Submit them through our feedback form, describe the use case and benefits, vote on existing requests, and participate in community discussions.

### How do I report bugs?

Report bugs through GitHub issues, email support, or Discord. Include your project ID, description of the problem, steps to reproduce, screenshots if applicable, and browser and OS information.

---

## Advanced Topics

### Can I use my own AI models?

Currently, we use our optimized AI models. Custom model support is coming soon for enterprise plans.

### Is there an API?

Yes, we offer a REST API for programmatic access. See our API documentation for details. API access is available on paid plans.

### Can I integrate with CI/CD?

Yes, you can integrate with various CI/CD platforms including GitHub Actions, GitLab CI, CircleCI, and Jenkins. We provide example workflows and configurations.

### What about testing?

Generated projects include basic test setup with Vitest for unit tests, React Testing Library for component tests, and Playwright for E2E tests. You should add comprehensive tests for your specific use cases.

### How do I scale my application?

For scaling, use Vercel's automatic scaling, implement caching strategies, optimize database queries, use CDN for static assets, and consider serverless functions for heavy operations.

---

## Troubleshooting

### Generation failed with an error

Common solutions include checking your prompt for clarity and completeness, ensuring you have sufficient credits, trying to simplify complex requirements, checking service status at status.mrprompt.ai, and contacting support with error details.

### Deployment failed

For deployment failures, verify your GitHub token has repo scope, check if the repository name is available, ensure Vercel token is valid, review deployment logs for specific errors, and check GitHub and Vercel service status.

### Build errors after download

To fix build errors, ensure you have the correct Node.js version (16+), install dependencies with `pnpm install`, set up `.env.local` with required variables, check for missing dependencies, and review build logs for specific errors.

### Application not working as expected

If your application isn't working properly, check browser console for errors, review generated code for issues, ensure all environment variables are set, test API endpoints separately, and check database connections.

---

## Best Practices

### Writing Effective Prompts

Be specific about features and functionality, mention your target audience, specify technical requirements, include design preferences, and break complex projects into iterations.

### Code Quality

Review generated code before deployment, add comprehensive tests, implement proper error handling, follow security best practices, and keep dependencies updated.

### Performance

Optimize images and assets, implement caching strategies, use code splitting, monitor performance metrics, and optimize database queries.

### Security

Never commit API keys or secrets, use environment variables, keep dependencies updated, implement rate limiting, and regularly review security advisories.

---

## Still Have Questions?

If your question isn't answered here, please reach out to us through our documentation, Discord community, email support, or GitHub discussions. We're here to help! 🚀
