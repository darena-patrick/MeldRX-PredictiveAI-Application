// utils/auth.js

import { UserManager, OidcClient } from 'oidc-client-ts';

const config = {
  authority: process.env.NEXT_PUBLIC_AUTHORITY,
  client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
  response_type: 'code',
  redirect_uri: process.env.NEXT_PUBLIC_CALLBACK_URL,
};

export const userManager = new UserManager(config);
export const oidcClient = new OidcClient(config);

export const handleLaunch = async () => {
  if (typeof window === "undefined") return { user: null, token: "", patientId: undefined };

  if (window.location.pathname === '/launch') {
    console.log('Launching authentication...', window.location);

    const extraQueryParams = {};
    const params = new URLSearchParams(window.location.search);

    params.forEach((value, key) => {
      extraQueryParams[key === 'iss' ? 'aud' : key] = value;
    });

    await userManager.signinRedirect({
      scope: 'openid profile launch patient/*.read',
      extraQueryParams,
    });

    const user = await userManager.getUser();

    if (user) {
      // Extract patientId if available
      const patientId = user.profile.patient ? user.profile.patient : undefined;

      return { user, token: user.access_token, patientId };
    }

    throw new Error("User not authenticated");
  }

  throw new Error("Not on launch page");
};

export const handleCallback = async () => {
  if (typeof window === "undefined") return { user: null, token: "", patientId: undefined };

  if (window.location.pathname === "/callback") {
    console.log("Handling callback...", window.location);

    try {
      // Process the OIDC response directly using oidcClient
      const signinResponse = await oidcClient.processSigninResponse(window.location.href);
      console.log("Processed OIDC Sign-in Response:", signinResponse);

      // Extract user and profile from the signinResponse
      const user = {
        name: signinResponse.profile.name || "User", // Fallback if 'name' is undefined
        id: signinResponse.profile.sub || "Unknown ID", // Fallback for user ID
        access_token: signinResponse.access_token,
      };

      // Extract patientId from the response or URL query params
      const patientId = signinResponse.patient || new URLSearchParams(window.location.search).get("patient");
      console.log('patientId', patientId);

      // Return the user data and patientId
      return {
        user,
        token: signinResponse.access_token,
        patientId: patientId || "Unknown Patient",
      };
    } catch (err) {
      console.error("Error during callback processing:", err);
      throw new Error("Error during callback processing");
    }
  }

  throw new Error("Not on callback page");
};


export { config };
