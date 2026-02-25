import { StackClientApp } from "@stackframe/stack";

export const stackClientApp = new StackClientApp({
  tokenStore: "nextjs-cookie",
//manually set the redirect URLs for after sign in and sign up. This is required for the StackAuth flow to know where to send users after they authenticate.
  urls: {
    afterSignIn: '/dashboard',
    afterSignUp: '/dashboard',
  }
});
