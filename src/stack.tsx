import "server-only";

import { StackServerApp } from "@stackframe/stack";

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  urls: {
    handler: "/auth",
    signIn: "/auth/sign-in",
    signUp: "/auth/sign-up",
    afterSignIn: "/",
    afterSignUp: "/",
    home: "/",
    oauthCallback: "/auth/oauth-callback",
    magicLinkCallback: "/auth/magic-link-callback",
    accountSettings: "/auth/account-settings",
    teamInvitation: "/auth/team-invitation"
  }
});
