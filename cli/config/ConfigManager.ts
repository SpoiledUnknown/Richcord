import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { CLIConfigData, RuntimeState, AppConfig, SerializedActivity } from "../types/CLIConfig.js";
import { APP_NAME, CONFIG_FILE_NAME, RUNTIME_FILE_NAME } from "../utils/Constants.js";
import { DEFAULT_CLI_CONFIG, validateAndMigrateConfig } from "./ConfigSchema.js";

export class ConfigManager {
  private configDir: string;
  private configPath: string;
  private runtimePath: string;

  constructor(customDir?: string) {
    this.configDir = customDir ?? this.resolveConfigDir();
    this.configPath = path.join(this.configDir, CONFIG_FILE_NAME);
    this.runtimePath = path.join(this.configDir, RUNTIME_FILE_NAME);
  }

  public getConfigDir(): string {
    return this.configDir;
  }

  public getConfigPath(): string {
    return this.configPath;
  }

  public getRuntimePath(): string {
    return this.runtimePath;
  }

  private resolveConfigDir(): string {
    const platform = os.platform();
    const home = os.homedir();

    if (platform === "win32") {
      const appData = process.env.APPDATA || path.join(home, "AppData", "Roaming");
      return path.join(appData, APP_NAME);
    } else if (platform === "darwin") {
      return path.join(home, "Library", "Application Support", APP_NAME);
    } else {
      const xdgConfig = process.env.XDG_CONFIG_HOME || path.join(home, ".config");
      return path.join(xdgConfig, APP_NAME.toLowerCase());
    }
  }

  public ensureDir(): void {
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }
  }

  public exists(): boolean {
    return fs.existsSync(this.configPath);
  }

  public load(): CLIConfigData {
    if (!this.exists()) {
      return { ...DEFAULT_CLI_CONFIG };
    }

    try {
      const content = fs.readFileSync(this.configPath, "utf-8");
      const parsed = JSON.parse(content);
      return validateAndMigrateConfig(parsed);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Configuration file at "${this.configPath}" is corrupted (invalid JSON).`, {
          cause: error,
        });
      }
      throw error;
    }
  }

  public save(data: CLIConfigData): void {
    this.ensureDir();
    const tempPath = `${this.configPath}.tmp.${Date.now()}`;
    const content = JSON.stringify(data, null, 2);

    try {
      fs.writeFileSync(tempPath, content, "utf-8");
      fs.renameSync(tempPath, this.configPath);
    } catch (error) {
      if (fs.existsSync(tempPath)) {
        try {
          fs.unlinkSync(tempPath);
        } catch {
          // Ignore temp file cleanup error
        }
      }
      throw new Error(`Failed to save configuration atomically: ${(error as Error).message}`, {
        cause: error,
      });
    }
  }

  public updateAppConfig(appConfig: Partial<AppConfig>): CLIConfigData {
    const current = this.load();
    const updated: CLIConfigData = {
      ...current,
      config: {
        ...current.config,
        ...appConfig,
      },
    };
    this.save(updated);
    return updated;
  }

  public updateActivity(activity: SerializedActivity): CLIConfigData {
    const current = this.load();
    const updated: CLIConfigData = {
      ...current,
      activity,
    };
    this.save(updated);
    return updated;
  }

  public reset(): void {
    if (fs.existsSync(this.configPath)) {
      fs.unlinkSync(this.configPath);
    }
  }

  // Runtime state helpers
  public saveRuntime(state: RuntimeState): void {
    this.ensureDir();
    fs.writeFileSync(this.runtimePath, JSON.stringify(state, null, 2), "utf-8");
  }

  public loadRuntime(): RuntimeState | null {
    if (!fs.existsSync(this.runtimePath)) {
      return null;
    }
    try {
      const content = fs.readFileSync(this.runtimePath, "utf-8");
      return JSON.parse(content) as RuntimeState;
    } catch {
      return null;
    }
  }

  public clearRuntime(): void {
    if (fs.existsSync(this.runtimePath)) {
      try {
        fs.unlinkSync(this.runtimePath);
      } catch {
        // Ignore failure
      }
    }
  }
}
