// tslint:disable:no-any
type WindowBrowserShim = any;
// tslint:enable:no-any

declare global {
  interface Window {
    browser: WindowBrowserShim;
    chrome: WindowBrowserShim;
  }

  var browser: WindowBrowserShim;
}

if (window.browser == null && window.chrome != null) {
  window.browser = window.chrome;
}

export function getExtensionVersion(): string | undefined {
  if (browser != null && browser.runtime != null) {
    return browser.runtime.getManifest().version;
  }

  return undefined;
}

function byteToHex(byte: number) {
  return `0${byte.toString(16)}`.slice(-2);
}

interface ExtensionStorage {
  SECARTA_EXTENSION_INSTALLATION_ID?: string;
}

export async function fetchOrCreateExtensionUniqueId(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    browser.storage.local.get(
      "SECARTA_EXTENSION_INSTALLATION_ID",
      (res: ExtensionStorage) => {
        if (res.SECARTA_EXTENSION_INSTALLATION_ID != null) {
          resolve(res.SECARTA_EXTENSION_INSTALLATION_ID);
        } else {
          const randomBytes = new Uint8Array(20 / 2);
          window.crypto.getRandomValues(randomBytes);
          if (randomBytes.every(elem => elem === 0)) {
            // Edge crypto.getRandomValues returns all 0s
            // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/11795162/
            // Fall back to less cryptographically random method (PRNG strength doesn't really matter)
            randomBytes.forEach(
              // tslint:disable-next-line:insecure-random
              (elem, index) => (randomBytes[index] = Math.random() * 255)
            );
          }

          const installationId: string = [].map
            .call(randomBytes, byteToHex)
            .join("");
          browser.storage.local.set({
            SECARTA_EXTENSION_INSTALLATION_ID: installationId
          });
          resolve(installationId);
        }
      }
    );
  });
}

export function userOrInstallationId(
  user: string | undefined,
  installationId: string
): string {
  return user || `anonymous-${installationId}`;
}

function parseSlugFromUrl(
  url: string
): {
  domain: string;
  org: string;
  repo: string;
  pathname: string;
  rest: string;
} {
  const parsed = new URL(url);
  const { hostname: domain, pathname } = parsed;
  const [org, repo, ...rest] = pathname.slice(1).split("/");

  return { domain, org, repo, pathname, rest: rest.join("/") };
}

export function extractSlugFromCurrentUrl(): {
  domain: string;
  org: string;
  repo: string;
  pathname: string;
  rest: string;
} {
  return parseSlugFromUrl(document.URL);
}

export function getSlugFromUrl(url: string): string {
  const { org, repo } = parseSlugFromUrl(url);

  return `${org}/${repo}`;
}

export function isRepositoryPrivate() {
  return document.querySelector("h1.private") != null;
}

export function buildGithubProfilePicUrl(user: string): string {
  return `https://github.com/${user}.png`;
}

const MOST_RECENT_GITHUB_USER = "MOST_RECENT_GITHUB_USER";

export function setGitHubUser(user: string) {
  browser.storage.local.set({ [MOST_RECENT_GITHUB_USER]: user });
}

export async function getGitHubUserFromStorage(): Promise<string | undefined> {
  return new Promise<string | undefined>((resolve, reject) =>
    browser.storage.local.get(
      MOST_RECENT_GITHUB_USER,
      ({
        MOST_RECENT_GITHUB_USER: user
      }: {
        MOST_RECENT_GITHUB_USER: string | undefined;
      }) => {
        resolve(user);
      }
    )
  );
}
