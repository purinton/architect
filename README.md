# [![Purinton Dev](https://purinton.us/logos/brand.png)](https://discord.gg/QSBxQnX7PF)

## @purinton/architect [![npm version](https://img.shields.io/npm/v/@purinton/architect.svg)](https://www.npmjs.com/package/@purinton/architect)[![license](https://img.shields.io/github/license/purinton/architect.svg)](LICENSE)[![build status](https://github.com/purinton/architect/actions/workflows/nodejs.yml/badge.svg)](https://github.com/purinton/architect/actions)

A modern, AI-powered Discord app for server automation and administration, built with Node.js and the [@purinton/discord](https://github.com/purinton/discord) foundation. Architect integrates the Model Context Protocol (MCP) and OpenAI for conversational, natural language server management.

---

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Running as a Service (systemd)](#running-as-a-service-systemd)
- [Docker](#docker)
- [Customization](#customization)
  - [Commands](#commands)
  - [Events](#events)
  - [Locales](#locales)
- [Testing](#testing)
- [Support](#support)
- [License](#license)
- [Links](#links)

## Features

- AI-driven Discord server automation and administration
- Conversational interface: chat with Architect by mentioning `@Architect` or replying to its messages
- Only responds to users with **Administrator** permissions for security
- Multi-language/localized responses (see `locales/`)
- Command and event handler architecture (see `commands/` and `events/`)
- Environment variable support via dotenv
- Logging and signal handling via `@purinton/common`
- Ready for deployment with systemd or Docker
- Jest for testing

## Getting Started

1. **Clone this project:**

   ```bash
   git clone https://github.com/purinton/architect.git
   cd architect
   npm install
   ```

2. **Set up your environment:**
   - Copy `.env.example` to `.env` and fill in your Discord app token and other secrets.
   - Edit `package.json` (name, description, author, etc.)
   - Update this `README.md` as needed.

3. **Start the app locally:**

   ```bash
   npm start
   # or
   node architect.mjs
   ```

## Configuration

- All configuration is handled via environment variables in the `.env` file.
- See `.env.example` for required and optional variables.
- The `openai.json` file configures OpenAI prompt and tool integration.
- The `tools.json` file (or `tools.json.example`) defines available MCP tools.

## Running as a Service (systemd)

1. Copy `architect.service` to `/usr/lib/systemd/system/architect.service`.
2. Edit the paths and user/group as needed.
3. Reload systemd and start the service:

   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable architect
   sudo systemctl start architect
   sudo systemctl status architect
   ```

## Docker

1. Build the Docker image:

   ```bash
   docker build -t architect .
   ```

2. Run the container:

   ```bash
   docker run --env-file .env architect
   ```

## Customization

### Commands

- Add new commands in the `commands/` directory.
- Each command has a `.json` definition (for Discord registration/localization) and a `.mjs` handler (for logic).
- Example: see `commands/help.json` and `commands/help.mjs`.

### Events

- Add or modify event handlers in the `events/` directory.
- Each Discord event (e.g., `ready`, `messageCreate`, `interactionCreate`) has its own handler file.
- Example: see `events/messageCreate.mjs` for AI chat logic.

### Locales

- Add or update language files in the `locales/` directory.
- Localize command names, descriptions, and app responses.
- Example: see `locales/en-US.json` for English responses.

## Testing

- Run tests with:

  ```bash
  npm test
  ```

- Tests are in the `tests/` folder and cover commands, events, and tools.

## Support

For help, questions, or to chat with the author and community, visit:

[![Discord](https://purinton.us/logos/discord_96.png)](https://discord.gg/QSBxQnX7PF)[![Purinton Dev](https://purinton.us/logos/purinton_96.png)](https://discord.gg/QSBxQnX7PF)

**[Purinton Dev on Discord](https://discord.gg/QSBxQnX7PF)**

## License

[MIT © 2025 Russell Purinton](LICENSE)

## Links

- [GitHub Repo](https://github.com/purinton/architect)
- [GitHub Org](https://github.com/purinton)
- [GitHub Personal](https://github.com/rpurinton)
- [Discord](https://discord.gg/QSBxQnX7PF)
