# Vercel Production Deployment Guide

This guide outlines the command and prerequisites for deploying a Next.js application to Vercel for production.

## 1. Deployment Command

The command to deploy your project to production on Vercel is:

```bash
vercel --prod
```

## 2. Prerequisites

Before running the deployment command, ensure the following prerequisites are met:

*   **Vercel CLI Installation and Authentication:**
    *   The Vercel CLI must be installed on your local machine. If not, install it using npm or yarn:
        ```bash
        npm install -g vercel
        # or
        yarn global add vercel
        ```
    *   You must be logged into your Vercel account through the CLI. If not, run:
        ```bash
        vercel login
        ```
        And follow the prompts.

*   **Project Linkage to Vercel:**
    *   Your local project directory must be linked to a Vercel project. If this is the first time deploying from this local directory, or if it's not linked, Vercel CLI will typically prompt you to link it. You can also manually link it using:
        ```bash
        vercel link
        ```
        Follow the prompts to connect to an existing Vercel project or create a new one.

*   **Environment Variables:**
    *   All required environment variables for the production environment must be securely set in the Vercel project's settings via the Vercel dashboard. These variables are typically listed in your project's `.env.example` file. For this project, ensure the following are configured in Vercel:
        *   `CES_AZURE_POSTGRES_URL`
        *   `AZURE_OPENAI_API_KEY`
        *   `NEXTAUTH_SECRET` (This should be a strong, randomly generated secret)
        *   `NEXTAUTH_URL` (Set to the production URL, e.g., `https://your-production-domain.com`)
    *   **Do not commit your production `.env` file or any `.env*.local` files to your repository.** These should be listed in your `.gitignore` file.

*   **`.gitignore` File:**
    *   Ensure your `.gitignore` file is correctly configured to prevent committing sensitive or unnecessary files and directories. While not a direct blocker for the `vercel --prod` command (as Vercel uses its own build process), it's crucial for security and repository cleanliness. Key entries include:
        ```
        # Local environment variables
        .env*.local

        # Next.js build output
        .next/

        # Node.js dependencies
        node_modules/
        ```

*   **`NEXTAUTH_URL` Configuration:**
    *   Specifically verify that the `NEXTAUTH_URL` environment variable in your Vercel project settings is set to the correct and final production URL (e.g., `https://www.yourdomain.com`). This is critical for NextAuth.js to function correctly in production.

## 3. Expected Outcome of the Command

When you run `vercel --prod`, the following will occur:

1.  **Code Upload:** The Vercel CLI will upload your project's code (respecting `.vercelignore` or `.gitignore` if `.vercelignore` is not present) to Vercel.
2.  **Build Process:** Vercel's build infrastructure will execute the build command for your project (typically `next build` for Next.js applications). This process compiles your application, optimizes assets, and prepares it for deployment.
3.  **Deployment:** The built application is deployed to Vercel's global infrastructure.
4.  **Aliasing:** The new deployment is automatically aliased to your project's production domain(s) configured in the Vercel dashboard.
5.  **Deployment URL Output:** The Vercel CLI will output a unique deployment URL (e.g., `https://your-project-un1qu3h4sh-vercel.app`) and the production URL(s) it has been aliased to.

---

By ensuring these prerequisites are met, you can achieve a smooth and successful production deployment to Vercel.
