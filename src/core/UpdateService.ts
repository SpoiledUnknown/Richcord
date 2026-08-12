import * as https from "https";
import { UpdateServices } from "../utils/Constants.js";

export interface UpdateCheckResult {
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  releaseUrl?: string;
}

interface GitHubRelease {
  tag_name: string;
  html_url: string;
  draft: boolean;
  prerelease: boolean;
}

export class UpdateService {
  public async checkUpdate(): Promise<UpdateCheckResult> {
    return new Promise((resolve) => {
      const currentVersion = UpdateServices.VERSION;
      const url = `https://api.github.com/repos/${UpdateServices.GITHUB_REPOSITORY_OWNER}/${UpdateServices.GITHUB_REPOSITORY_NAME}/releases/latest`;

      const req = https.get(
        url,
        {
          timeout: 5000,
          headers: {
            "User-Agent": "Richcord-CLI",
            Accept: "application/vnd.github+json",
          },
        },
        (res) => {
          let data = "";

          res.setEncoding("utf8");

          res.on("data", (chunk: string) => {
            data += chunk;
          });

          res.on("end", () => {
            if (res.statusCode !== 200) {
              resolve({
                currentVersion,
                latestVersion: currentVersion,
                hasUpdate: false,
              });

              return;
            }

            try {
              const release = JSON.parse(data) as GitHubRelease;

              if (typeof release.tag_name !== "string" || typeof release.html_url !== "string") {
                resolve({
                  currentVersion,
                  latestVersion: currentVersion,
                  hasUpdate: false,
                });

                return;
              }

              // GitHub's /releases/latest endpoint normally excludes
              // prereleases and drafts, but keep this defensive check.
              if (release.draft || release.prerelease) {
                resolve({
                  currentVersion,
                  latestVersion: currentVersion,
                  hasUpdate: false,
                });

                return;
              }

              const latestVersion = release.tag_name;

              const hasUpdate = this.compareVersions(currentVersion, latestVersion) < 0;

              resolve({
                currentVersion,
                latestVersion,
                hasUpdate,
                releaseUrl: release.html_url,
              });
            } catch {
              resolve({
                currentVersion,
                latestVersion: currentVersion,
                hasUpdate: false,
              });
            }
          });
        }
      );

      req.on("error", () => {
        resolve({
          currentVersion,
          latestVersion: currentVersion,
          hasUpdate: false,
        });
      });

      req.on("timeout", () => {
        req.destroy();

        resolve({
          currentVersion,
          latestVersion: currentVersion,
          hasUpdate: false,
        });
      });
    });
  }

  private compareVersions(v1: string, v2: string): number {
    const [major1, minor1, patch1] = this.parseVersion(v1);
    const [major2, minor2, patch2] = this.parseVersion(v2);

    if (major1 !== major2) {
      return major1 > major2 ? 1 : -1;
    }

    if (minor1 !== minor2) {
      return minor1 > minor2 ? 1 : -1;
    }

    if (patch1 !== patch2) {
      return patch1 > patch2 ? 1 : -1;
    }

    return 0;
  }

  private parseVersion(version: string): [number, number, number] {
    const normalized = version.trim().replace(/^v/i, "");

    const parts = normalized.split(".");

    const major = this.parseVersionPart(parts[0]);
    const minor = this.parseVersionPart(parts[1]);
    const patch = this.parseVersionPart(parts[2]);

    return [major, minor, patch];
  }

  private parseVersionPart(value: string | undefined): number {
    if (!value) {
      return 0;
    }

    const match = value.match(/^\d+/);

    if (!match) {
      return 0;
    }

    return Number.parseInt(match[0], 10);
  }
}
