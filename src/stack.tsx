import "server-only";

import { StackServerApp } from "@stackframe/stack";
import { AUTH_ROUTES, DASHBOARD_ROUTES, PUBLIC_ROUTES } from "@/constants/routes";

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  urls: {
    handler: AUTH_ROUTES.HANDLER,
    signIn: AUTH_ROUTES.SIGN_IN,
    signUp: AUTH_ROUTES.SIGN_UP,
    afterSignIn: DASHBOARD_ROUTES.ROOT,
    afterSignUp: DASHBOARD_ROUTES.ROOT,
    home: PUBLIC_ROUTES.HOME,
    oauthCallback: AUTH_ROUTES.OAUTH_CALLBACK,
    magicLinkCallback: AUTH_ROUTES.MAGIC_LINK_CALLBACK,
    accountSettings: AUTH_ROUTES.ACCOUNT_SETTINGS,
    teamInvitation: AUTH_ROUTES.TEAM_INVITATION
  }
});
