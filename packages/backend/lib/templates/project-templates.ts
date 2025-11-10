/**
 * Project Templates
 * Pre-built templates for common project types
 */

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: 'web' | 'dashboard' | 'ecommerce' | 'blog' | 'api' | 'saas';
  icon: string;
  features: string[];
  techStack: string[];
  prompt: string;
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const projectTemplates: ProjectTemplate[] = [
  {
    id: 'blog-nextjs',
    name: 'Blog with CMS',
    description: 'Modern blog with content management system, markdown support, and SEO optimization',
    category: 'blog',
    icon: '',
    features: [
      'Markdown blog posts',
      'Category & tag system',
      'Search functionality',
      'SEO optimization',
      'RSS feed',
      'Comments system',
    ],
    techStack: ['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Supabase', 'MDX'],
    prompt: 'Create a modern blog website with Next.js 14. Include a content management system for creating and editing blog posts using markdown. Add categories, tags, search functionality, and SEO optimization. Include an RSS feed and comments system using Supabase.',
    estimatedTime: '3-5 minutes',
    difficulty: 'beginner',
  },
  {
    id: 'ecommerce-store',
    name: 'E-Commerce Store',
    description: 'Full-featured online store with product catalog, cart, and checkout',
    category: 'ecommerce',
    icon: '',
    features: [
      'Product catalog',
      'Shopping cart',
      'Checkout process',
      'Payment integration',
      'Order management',
      'User authentication',
      'Admin dashboard',
    ],
    techStack: ['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Stripe'],
    prompt: 'Create a full-featured e-commerce store with Next.js 14. Include product catalog with categories and filters, shopping cart, checkout process with Stripe payment integration, order management, user authentication, and an admin dashboard for managing products and orders.',
    estimatedTime: '5-7 minutes',
    difficulty: 'advanced',
  },
  {
    id: 'dashboard-analytics',
    name: 'Analytics Dashboard',
    description: 'Data visualization dashboard with charts, metrics, and real-time updates',
    category: 'dashboard',
    icon: '',
    features: [
      'Interactive charts',
      'Real-time data',
      'Custom metrics',
      'Data export',
      'User management',
      'API integration',
    ],
    techStack: ['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Chart.js', 'Supabase'],
    prompt: 'Create an analytics dashboard with Next.js 14. Include interactive charts using Chart.js, real-time data updates, custom metrics, data export functionality, user management, and API integration for fetching data from external sources.',
    estimatedTime: '4-6 minutes',
    difficulty: 'intermediate',
  },
  {
    id: 'saas-starter',
    name: 'SaaS Starter Kit',
    description: 'Complete SaaS application with authentication, billing, and multi-tenancy',
    category: 'saas',
    icon: '',
    features: [
      'User authentication',
      'Subscription billing',
      'Multi-tenancy',
      'Team management',
      'API endpoints',
      'Admin panel',
      'Email notifications',
    ],
    techStack: ['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Stripe'],
    prompt: 'Create a SaaS starter kit with Next.js 14. Include user authentication with Supabase, subscription billing with Stripe, multi-tenancy support, team management, RESTful API endpoints, admin panel, and email notifications for important events.',
    estimatedTime: '6-8 minutes',
    difficulty: 'advanced',
  },
  {
    id: 'portfolio-website',
    name: 'Portfolio Website',
    description: 'Personal portfolio with projects showcase, blog, and contact form',
    category: 'web',
    icon: '',
    features: [
      'Project showcase',
      'About page',
      'Blog section',
      'Contact form',
      'Resume/CV page',
      'Dark mode',
    ],
    techStack: ['Next.js 14', 'TypeScript', 'Tailwind CSS', 'MDX'],
    prompt: 'Create a personal portfolio website with Next.js 14. Include a project showcase with images and descriptions, about page, blog section using MDX, contact form, resume/CV page, and dark mode toggle.',
    estimatedTime: '2-4 minutes',
    difficulty: 'beginner',
  },
  {
    id: 'rest-api',
    name: 'RESTful API',
    description: 'Backend API with authentication, CRUD operations, and documentation',
    category: 'api',
    icon: '',
    features: [
      'RESTful endpoints',
      'JWT authentication',
      'CRUD operations',
      'API documentation',
      'Rate limiting',
      'Error handling',
    ],
    techStack: ['Next.js 14 API Routes', 'TypeScript', 'Supabase', 'Swagger'],
    prompt: 'Create a RESTful API using Next.js 14 API routes. Include JWT authentication, CRUD operations for resources, API documentation with Swagger, rate limiting, comprehensive error handling, and input validation.',
    estimatedTime: '3-5 minutes',
    difficulty: 'intermediate',
  },
  {
    id: 'todo-app',
    name: 'Todo Application',
    description: 'Task management app with categories, priorities, and due dates',
    category: 'web',
    icon: '',
    features: [
      'Create/edit tasks',
      'Categories',
      'Priority levels',
      'Due dates',
      'Search & filter',
      'User authentication',
    ],
    techStack: ['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Supabase'],
    prompt: 'Create a todo application with Next.js 14. Include creating and editing tasks, categories, priority levels, due dates, search and filter functionality, and user authentication with Supabase.',
    estimatedTime: '2-3 minutes',
    difficulty: 'beginner',
  },
  {
    id: 'social-media',
    name: 'Social Media Platform',
    description: 'Social network with posts, comments, likes, and user profiles',
    category: 'web',
    icon: '',
    features: [
      'User profiles',
      'Posts & comments',
      'Likes & shares',
      'Follow system',
      'News feed',
      'Notifications',
      'Image uploads',
    ],
    techStack: ['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Supabase', 'S3'],
    prompt: 'Create a social media platform with Next.js 14. Include user profiles, creating posts with images, comments, likes and shares, follow system, personalized news feed, real-time notifications, and image uploads to S3.',
    estimatedTime: '7-10 minutes',
    difficulty: 'advanced',
  },
];

/**
 * Get template by ID
 */
export function getTemplateById(id: string): ProjectTemplate | undefined {
  return projectTemplates.find(t => t.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: ProjectTemplate['category']): ProjectTemplate[] {
  return projectTemplates.filter(t => t.category === category);
}

/**
 * Get templates by difficulty
 */
export function getTemplatesByDifficulty(difficulty: ProjectTemplate['difficulty']): ProjectTemplate[] {
  return projectTemplates.filter(t => t.difficulty === difficulty);
}
