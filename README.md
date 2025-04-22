# Votemap Discord Bot for Hell let Loose

A Discord bot that fetches and displays live votemap status from an API, updating an embedded message every 30 seconds. The bot shows map names, vote counts, and voter lists in a clean, embedded format. It only sends a new message when map names change, otherwise updating the existing message to reduce spam.

## Features
- Fetches votemap data from a configurable API endpoint
- Displays live votemap status in a Discord channel
- Updates every 30 seconds with minimal channel spam
- Uses environment variables for secure configuration
- Error handling for API and Discord interactions

## Prerequisites
- Node.js 16 or higher
- A Discord bot token (create one at [Discord Developer Portal](https://discord.com/developers/applications))
- A Discord channel ID
- An CRCON API endpoint providing votemap data
- An CRCON API key for the endpoint

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/hackletloose/hall-votemap-checker.git
   cd hall-votemap-checker

2. Install dependencies:
   ```bash
   npm install

3. Create a .env file in the root directory and add the following:
   ```bash
   DISCORD_TOKEN=your_discord_bot_token
   DISCORD_CHANNEL_ID=your_channel_id
   API_ENDPOINT=http://your-api-url/get_votemap_status
   API_KEY=your_api_key

4. Start the bot:
   ```bash
   node main.mjs

## Usage
- The bot will log in to Discord and post an initial message in the specified channel.
- Every 30 seconds, it fetches votemap data and updates the embedded message.
- If the map names change, a new message is sent; otherwise, the existing message is edited.

## Licence
This project is licensed under the MIT License.
