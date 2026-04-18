import type { AppSettings } from "../types";

interface GitHubFileResponse {
  content: string;
  sha: string;
  encoding: string;
}

export async function fetchFile(
  settings: AppSettings,
  path: string
): Promise<{ content: string; sha: string } | null> {
  const { githubToken, repoOwner, repoName } = settings;
  const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

  const data: GitHubFileResponse = await res.json();
  const content = atob(data.content.replace(/\n/g, ""));
  // Handle UTF-8 decoding properly
  const bytes = Uint8Array.from(content, (c) => c.charCodeAt(0));
  const decoded = new TextDecoder().decode(bytes);
  return { content: decoded, sha: data.sha };
}

export async function updateFile(
  settings: AppSettings,
  path: string,
  content: string,
  sha: string,
  message: string
): Promise<{ sha: string }> {
  const { githubToken, repoOwner, repoName } = settings;
  const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}`;

  // Encode content to base64 (handle UTF-8)
  const encoded = btoa(
    String.fromCharCode(...new TextEncoder().encode(content))
  );

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, content: encoded, sha }),
  });

  if (res.status === 409) {
    throw new ConflictError("File was modified externally");
  }
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

  const data = await res.json();
  return { sha: data.content.sha };
}

export async function testConnection(settings: AppSettings): Promise<boolean> {
  const { githubToken, repoOwner, repoName } = settings;
  const url = `https://api.github.com/repos/${repoOwner}/${repoName}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  return res.ok;
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}
