import "server-only";

import { StackServerApp } from "@stackframe/stack";

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  urls: {
    handler: "/handler",
    signIn: "/handler/sign-in",
    signUp: "/handler/sign-up",
    afterSignIn: "/",
    afterSignUp: "/",
    home: "/",
    oauthCallback: "/handler/oauth-callback",
    magicLinkCallback: "/handler/magic-link-callback",
    accountSettings: "/handler/account-settings",
    teamInvitation: "/handler/team-invitation"
  }
});
