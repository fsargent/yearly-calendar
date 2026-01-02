export type GoogleTokenResponse = {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: "Bearer";
  error?: string;
  error_description?: string;
  error_uri?: string;
};

export type GoogleTokenClientConfig = {
  client_id: string;
  scope: string;
  callback: (response: GoogleTokenResponse) => void;
  error_callback?: (response: GoogleTokenResponse) => void;
};

export type GoogleTokenClient = {
  requestAccessToken: (opts?: {
    prompt?: "" | "consent" | "select_account";
  }) => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (
            config: GoogleTokenClientConfig,
          ) => GoogleTokenClient;
          revoke: (token: string, done: () => void) => void;
        };
      };
    };
  }
}

export function isGoogleGisLoaded(): boolean {
  return Boolean(window.google?.accounts?.oauth2?.initTokenClient);
}

export function createTokenClient(
  config: GoogleTokenClientConfig,
): GoogleTokenClient {
  const init = window.google?.accounts?.oauth2?.initTokenClient;
  if (!init) {
    throw new Error(
      "Google Identity Services not loaded. Check src/app.html script tag.",
    );
  }
  return init(config);
}

export function revokeToken(token: string): Promise<void> {
  return new Promise((resolve) => {
    const revoke = window.google?.accounts?.oauth2?.revoke;
    if (!revoke) return resolve();
    revoke(token, resolve);
  });
}
