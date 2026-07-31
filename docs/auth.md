# Authentication

All authentication in this app is handled exclusively by **Clerk**. No other auth libraries, custom JWT logic, or session handling should be introduced.

## Rules

- **Clerk only.** Do not implement or suggest alternative auth methods (NextAuth, Auth.js, custom sessions, etc.).
- **Sign in and sign up must always open as a Clerk modal.** Never redirect to a standalone sign-in/sign-up page.
- **`/dashboard` is a protected route.** Users must be authenticated to access it. Unauthenticated requests must be redirected to sign in.
- **Authenticated users visiting `/` must be redirected to `/dashboard`.**

## Implementation Notes

- Use Clerk's `<SignInButton mode="modal">` and `<SignUpButton mode="modal">` for all sign-in/sign-up triggers.
- Use Clerk middleware (`clerkMiddleware` / `authMiddleware`) to protect `/dashboard` and redirect authenticated users away from `/`.
- Use `currentUser()` or `auth()` from `@clerk/nextjs/server` for server-side auth checks.
- Use `useUser()` or `useAuth()` from `@clerk/nextjs` for client-side auth checks.
