import { Auth0Client } from "@auth0/auth0-spa-js";

let auth0;

if (typeof window !== "undefined") {
  auth0 = new Auth0Client({
    domain: "dev-p50yfm85qfrp68xo.us.auth0.com",
    client_id: "GHOd8ZLASus1iPqiK42SGsjuZqMLxiCM",
    redirect_uri: window.location.origin,
    cacheLocation: "localstorage",
  });
}

export const login = async () => {
  if (!auth0) return;
  await auth0.loginWithRedirect({
    connection: "google-oauth2",
  });
};

export const handleRedirectCallback = async () => {
  if (!auth0) return;
  const result = await auth0.handleRedirectCallback();
  return result;
};

export const getToken = async () => {
  if (!auth0) return;
  const token = await auth0.getTokenSilently();
  return token;
};

export const logout = () => {
  if (!auth0) return;
  auth0.logout({
    returnTo: window.location.origin,
  });
};
