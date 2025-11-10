# User Guide

Welcome to Mr.Prompt! This guide will walk you through the process of generating your first project.

## 1. Creating a New Project

1.  **Navigate to the Generate Page**: From the main dashboard, click on the "Generate" button in the sidebar.
2.  **Enter a Project Name**: Choose a unique name for your project. Use lowercase letters, numbers, and hyphens only.
3.  **Write a Detailed Prompt**: This is the most important step. The more detailed your prompt, the better the AI will understand your requirements. 

    **Good Prompt Example:**
    > Create a full-stack e-commerce platform for selling digital art. It should have user authentication (login, register, forgot password), product listings with search and filtering, a shopping cart, and Stripe integration for payments. The frontend should be built with Next.js and Tailwind CSS, and the backend should use Supabase for the database.

    **Bad Prompt Example:**
    > Make a website.

4.  **Click "Generate Project"**: Once you are happy with your prompt, click the "Generate Project" button to start the workflow.

## 2. Monitoring the Workflow

After starting the workflow, you will be redirected to the real-time progress page. Here you can:

-   **Track Overall Progress**: See the overall progress of the project generation.
-   **View Current Step**: See which agent is currently working and what it is doing.
-   **See Live Logs**: View the live logs from the AI agents.
-   **Cancel the Workflow**: If you want to stop the workflow, you can click the "Cancel Workflow" button.

## 3. Downloading Your Project

Once the workflow is complete, you will be able to download your project as a ZIP file. Click the "Download Project" button to download the ZIP file to your computer.

## 4. Deploying Your Project

If you have configured Vercel integration, your project will be automatically deployed to Vercel. You can view the deployment URL on the workflow completion page.

## 5. Running Your Project Locally

1.  **Unzip the project file.**
2.  **Open a terminal and navigate to the project directory.**
3.  **Install dependencies:**
    ```bash
    pnpm install
    ```
4.  **Set up your `.env.local` file** with your Supabase and other API keys.
5.  **Run the development server:**
    ```bash
    pnpm dev
    ```
6.  **Open your browser** and navigate to `http://localhost:3000`.

## Troubleshooting

-   **Workflow Failed**: If the workflow fails, check the error messages on the progress page. This is often due to an ambiguous prompt or an issue with one of the integrated services.
-   **Build Errors**: If you encounter build errors after downloading the project, make sure you have the correct versions of Node.js and pnpm installed.

If you continue to have issues, please open an issue on our [GitHub repository](https://github.com/donlasahachat11-lgtm/mrphomth/issues).
