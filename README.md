# Hyperisms Discord Bot

A Discord bot to collect and share Hyper's hilarious quotes and one-liners!

## Features

- Add new hyperisms with `!hyperism new <quote>`
- Get random hyperisms with `!hyperism`
- View hyperism count, list, and more
- SQLite database for persistent storage

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Create a Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" section and click "Add Bot"
4. Under "Privileged Gateway Intents", enable:
   - MESSAGE CONTENT INTENT
5. Copy your bot token

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your bot token:

```
DISCORD_TOKEN=your_bot_token_here
COMMAND_PREFIX=!
```

### 4. Invite Bot to Your Server

1. In the Discord Developer Portal, go to "OAuth2" > "URL Generator"
2. Select scopes: `bot`
3. Select bot permissions: `Send Messages`, `Read Messages/View Channels`, `Read Message History`
4. Copy the generated URL and open it in your browser
5. Select your server and authorize the bot

### 5. Run the Bot

```bash
npm start
```

## Commands

- `!hyperism` - Get a random hyperism
- `!hyperism new <quote>` - Add a new hyperism
- `!hyperism count` - See how many hyperisms are stored
- `!hyperism list` - Show the 10 most recent hyperisms
- `!hyperism delete <id>` - Delete a hyperism by ID
- `!hyperism help` - Show help message

## Examples

```
!hyperism new That's what she said!
!hyperism
!hyperism count
!hyperism list
!hyperism delete 5
```

## Database

The bot uses SQLite with the `better-sqlite3` package. The database file (`hyperisms.db`) is created automatically in the project root when you first run the bot.

## Project Structure

```
hyperisms/
├── src/
│   ├── index.js      # Main bot logic
│   └── database.js   # Database operations
├── .env              # Environment variables (create this)
├── .env.example      # Example environment file
├── .gitignore
├── package.json
└── README.md
```
