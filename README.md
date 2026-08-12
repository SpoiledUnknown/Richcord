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
  <a href="https://spoiledunknown.github.io/Richcord-Presence/">
    <img src="https://img.shields.io/badge/Documentation-GitHub%20Pages-blue.svg" alt="Documentation">
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

> [!NOTE]
> Richcord is actively being developed. The Core and CLI are currently available, while additional frontend functionality is planned for future releases.

---

## 📦 Installation

### Requirements

- [Node.js](https://nodejs.org/) 20 or newer
- Discord Desktop

### Install using npm

```bash
npm install -g richcord
```

Verify the installation:

```bash
richcord --version
```

> [!IMPORTANT]
> Discord Desktop must be installed and running for Richcord to communicate with Discord.

---

## 🚀 Quick Start

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

```
-h, --help       Show help
-V, --version    Show version
```

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

The project is written in TypeScript and consists of a reusable **Core** and a **CLI** frontend. The CLI consumes the Core's public API rather than implementing Discord IPC itself.

> [!IMPORTANT]
> Discord IPC, transports, handshaking, serialization, and other low-level RPC functionality belong to the Core and should not be implemented directly in the CLI.

---

## 📚 Documentation

For complete documentation, including Core API and CLI documentation:

**[📖 Read the Richcord Documentation](https://spoiledunknown.github.io/Richcord/)**

---

## 📄 License

Richcord is licensed under the [MIT License](LICENSE.md).
