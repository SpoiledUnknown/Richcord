<p align="center">
  <img src="./public/Richcord.png" alt="Richcord" width="120" style="border-radius: 1rem">
</p>

<h1 align="center">Richcord</h1>

<p align="center">
  A customizable Discord Rich Presence application powered by a custom cross-platform IPC core.
</p>

<p align="center">
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT">
  </a>
  <a href="https://spoiledunknown.github.io/Richcord/">
    <img src="https://img.shields.io/badge/Documentation-GitHub%20Pages-blue.svg" alt="Documentation">
  </a>
  <a href="https://www.npmjs.com/package/richcord">
    <img src="https://img.shields.io/npm/v/richcord.svg" alt="npm version">
  </a>
</p>

<br>

## 📖 Overview

**Richcord** is a customizable Discord Rich Presence application that provides fine-grained control over your Discord activity without unnecessarily complicating the user experience.

Richcord uses a custom, platform-agnostic IPC implementation to communicate directly with the Discord desktop client.

### ✨ Features

- 🔌 Cross-platform Discord IPC
- 🎮 Rich Presence activity configuration
- 🔄 Automatic reconnection
- 💾 Persistent configuration
- 🖥️ Interactive CLI
- 🔍 GitHub-based update checking
- 🧩 Reusable Core API
- 📦 npm package
- 🖥️ Standalone Linux and Windows executables

---

## 📦 Installation

Richcord can be installed either through **npm** or by downloading a standalone executable from the [GitHub Releases](https://github.com/SpoiledUnknown/Richcord/releases).

### Requirements

- Discord Desktop
- **Node.js 20 or newer** — only required when installing through npm

> [!IMPORTANT]
> Discord Desktop must be installed and running for Richcord to communicate with Discord.

### Option 1 — npm

The npm package provides both the **Richcord Core API** and the **Richcord CLI**.

#### Install the CLI globally

```bash
npm install -g richcord
```

Verify the installation:

```bash
richcord --version
```

You can then use Richcord directly from your terminal:

```bash
richcord --help
```

#### Install Core as a dependency

If you are building an application on top of Richcord Core:

```bash
npm install richcord
```

Then import the Core API:

```javascript
import { RichcordClient } from "richcord";
```

Richcord is an **ES modules** only package.

### Option 2 — Windows executable

Download the latest **`richcord.exe`** from the [GitHub Releases](https://github.com/SpoiledUnknown/Richcord/releases).

The executable is self-contained and does not require Node.js to be installed.

You can place the executable somewhere on your system and add its directory to your `PATH` to use the `richcord` command globally.

Verify the installation:

```powershell
richcord --version
```

### Option 3 — Linux executable

Download the latest **`richcord-linux-x64`** executable from the [GitHub Releases](https://github.com/SpoiledUnknown/Richcord/releases).

The executable is self-contained and does not require Node.js to be installed.

Make it executable:

```bash
chmod +x richcord-linux-x64
```

You can then run it directly:

```bash
./richcord-linux-x64 --version
```

To use the `richcord` command globally, place or symlink the executable into a directory included in your `PATH`.

For example:

```bash
sudo install richcord-linux-x64 /usr/local/bin/richcord
```

Then:

```bash
richcord --version
```

---

## 🚀 Quick Start

The following examples assume that Richcord is available as the `richcord` command through either the npm installation or a standalone executable.

### 1. Configure your Discord Application

Create an application through the [Discord Developer Portal](https://discord.com/developers/applications) and copy its **Application ID / Client ID**.

Then run:

```bash
richcord config
```

### 2. Configure your Rich Presence

```bash
richcord set
```

This interactively configures your activity, including:

- Activity type
- Details and state
- Timestamps
- Images/assets
- Buttons
- Other Rich Presence properties

### 3. Start Rich Presence

```bash
richcord start
```

### 4. Check status

```bash
richcord status
```

### 5. Stop Richcord

```bash
richcord stop
```

To clear the currently active Rich Presence without deleting your saved configuration:

```bash
richcord clear
```

> [!TIP]
> Run `richcord --help` at any time to see all available commands.

---

## ⌨️ CLI Commands

| Command            | Description                    |
| ------------------ | ------------------------------ |
| `richcord`         | Display basic information      |
| `richcord help`    | Display available commands     |
| `richcord version` | Display the installed version  |
| `richcord config`  | Configure Richcord             |
| `richcord set`     | Configure Rich Presence        |
| `richcord start`   | Start Rich Presence            |
| `richcord stop`    | Stop the running instance      |
| `richcord clear`   | Clear the active Rich Presence |
| `richcord reset`   | Reset saved configuration      |
| `richcord status`  | Show current status            |
| `richcord update`  | Check for a newer release      |

**Global options:**

```text
-h, --help       Show help
-V, --version    Show version
```

---

## 🏗️ Architecture

Richcord consists of two primary layers:

```text
┌───────────────────────┐
│          CLI          │
│   User-facing app     │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│         Core          │
│   Public API + IPC    │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│   Discord Desktop     │
│      IPC Client       │
└───────────────────────┘
```

The **Core** handles Discord IPC, transports, handshaking, serialization, validation, connection management, and the public API.

The **CLI** consumes the Core's public API and contains no Discord IPC implementation.

The Core is frontend-independent and can be consumed by other applications through the npm package.

---

## 🛠️ Development

Clone the repository:

```bash
git clone https://github.com/SpoiledUnknown/Richcord.git
cd Richcord
```

Install dependencies:

```bash
npm install
```

Build the project:

```bash
npm run build
```

Check the project:

```bash
npm run check
```

Run the CLI during development:

```bash
npm run dev
```

Generate API documentation:

```bash
npm run build:docs
```

The project is written in TypeScript and consists of a reusable **Core** and a **CLI** frontend. The CLI consumes the Core's public API rather than implementing Discord IPC itself.

> [!IMPORTANT]
> Discord IPC, transports, handshaking, serialization, and other low-level RPC functionality belong to the Core and should not be implemented directly in the CLI.

---

## 📚 Documentation

For complete API documentation:

**[📖 Read the Richcord Documentation](https://spoiledunknown.github.io/Richcord/)**

For downloads and previous releases:

**[📦 View GitHub Releases](https://github.com/SpoiledUnknown/Richcord/releases)**

For the published npm package:

**[📦 View Richcord on npm](https://www.npmjs.com/package/richcord)**

---

## 📄 License

Richcord is licensed under the [MIT License](LICENSE.md).
