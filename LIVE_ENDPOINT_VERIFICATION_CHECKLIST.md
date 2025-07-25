# Live Endpoint Verification Checklist

This checklist should be used after a Next.js application has been deployed to Vercel production. Use the production URL provided by the `vercel --prod` command output for these checks.

## Verification Items

### URL Accessibility
- [ ] Production URL loads successfully (e.g., HTTP 200 OK).
- [ ] No 5xx server errors encountered (check network tab in browser developer tools).

### Content Verification
- [ ] Expected page title or key static content (e.g., application name, welcome message) is visible on the main page.
- [ ] Application does not show a Vercel default error page (e.g., "404: NOT_FOUND", "500: INTERNAL_SERVER_ERROR") or any old/cached content that should have been updated.

### Browser Console Health
- [ ] No JavaScript errors in the browser console on initial page load.
- [ ] If applicable, Next.js hydration completes without errors logged in the console.

### API Health
- [ ] `/api/health` endpoint (if available and configured) returns a success status (e.g., 200 OK with `{"status": "ok"}` or similar).
- [ ] Other critical API endpoints (e.g., those used for core application functionality on the main page) respond correctly with expected data.

### Environment Variable Dependent Features
- [ ] Features reliant on `CES_AZURE_POSTGRES_URL` (e.g., data display from the database, user login/authentication if it uses this DB) are functional.
- [ ] Features reliant on `AZURE_OPENAI_API_KEY` (e.g., AI-powered insights, content generation) are functional.
- [ ] Tenant-specific information (e.g., branding, data filtering based on `TENANT_NAME` or processed via `X-Tenant-ID` logic) is correctly displayed/applied as expected for the 'ces' tenant.

### Security Headers
*(Verify these using the browser's developer tools under the Network tab, by inspecting the response headers for the main page request)*
- [ ] `X-Tenant-ID` header is present in responses from your application's backend routes and has the correct value (e.g., 'ces').
- [ ] `X-Frame-Options` header is present with the value `DENY`.
- [ ] `X-Content-Type-Options` header is present with the value `nosniff`.
- [ ] `Strict-Transport-Security` (HSTS) header is present (e.g., `max-age=63072000; includeSubDomains; preload`).
- [ ] `Content-Security-Policy` (CSP) header is present and appropriately configured.

### HTTPS Verification
- [ ] Production URL automatically uses HTTPS.
- [ ] SSL certificate is valid (e.g., not expired, matches the production domain, issued by a trusted CA). This can be checked by clicking the padlock icon in the browser's address bar.

---

**Notes:**
* Replace placeholder examples with actual expected values where necessary.
* Some items might require specific knowledge of the application's features and expected behavior.
* If any check fails, document the issue with details (e.g., URL, screenshot, console logs) for troubleshooting.
