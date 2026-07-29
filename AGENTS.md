# Project delivery rules

For every user-requested code or interface change in this project:

1. Keep unrelated user changes untouched.
2. Run `npm.cmd test` after implementation.
3. If tests pass, stage only the files belonging to the request and create a concise commit.
4. Push the completed branch to the configured GitHub `origin` without waiting for a separate push request.
5. Use the GitHub–Vercel integration for deployment:
   - pushes to `main` deploy to production;
   - pushes to other branches create preview deployments.
6. Confirm the Vercel deployment status and report its URL.

Do not push or deploy when tests fail, GitHub authentication is unavailable, the intended file scope is ambiguous, or unrelated changes would be included. Never commit `.env` files, tokens, `.vercel` credentials, or other secrets.
