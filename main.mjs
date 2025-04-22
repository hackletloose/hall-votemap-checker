import 'dotenv/config'; // npm install dotenv
import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch'; // npm install node-fetch

// Variables from environment variables
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const API_ENDPOINT = process.env.API_ENDPOINT || 'http://your-api-url/get_votemap_status';
const API_KEY = process.env.API_KEY;

// Discord Client setup
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

// Store the previous votemap data to detect changes
let previousVotemapData = null;

/**
 * Fetches votemap status from the API with API key
 */
async function getVotemapStatus() {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
    });
    const data = await response.json();
    if (data.failed) {
      throw new Error(data.error || 'API request failed');
    }
    return data.result;
  } catch (error) {
    console.error('Error fetching votemap status:', error);
    return [];
  }
}

/**
 * Compares two votemap datasets to detect changes in map names only
 */
function hasMapNamesChanged(newData, oldData) {
  if (!oldData) return true; // If no previous data, assume changed
  if (newData.length !== oldData.length) return true; // Different number of maps

  // Extract map IDs from both datasets
  const newMapIds = newData.map(item => item.map.id).sort();
  const oldMapIds = oldData.map(item => item.map.id).sort();

  // Compare sorted map IDs
  return newMapIds.join(',') !== oldMapIds.join(',');
}

/**
 * Builds and updates or creates the votemap embed
 */
async function updateVotemapEmbed(channel, existingMessage = null) {
  const votemapData = await getVotemapStatus();

  // Check if map names have changed
  const hasChanged = hasMapNamesChanged(votemapData, previousVotemapData);
  previousVotemapData = votemapData; // Update previous data

  // Build fields for each map
  const fields = votemapData.map((mapData) => {
    const mapName = mapData.map.pretty_name;
    const voteCount = mapData.voters.length;
    const votersList = mapData.voters.length > 0 ? mapData.voters.join(', ') : 'No votes yet';

    return {
      name: `${mapName} (${voteCount} votes)`,
      value: `Voters: ${votersList}`,
      inline: false,
    };
  });

  // Create embed
  const embed = new EmbedBuilder()
    .setColor('#00ff00')
    .setTitle('🗳️ Votemap Live')
    .setDescription('Current votemap status')
    .addFields(fields)
    .setTimestamp(new Date());

  if (hasChanged || !existingMessage) {
    // If map names changed or no existing message, send a new one
    const newMessage = await channel.send({ embeds: [embed] });
    return newMessage; // Return the new message for future updates
  } else {
    // If no change in map names, update the existing message
    await existingMessage.edit({ embeds: [embed] });
    return existingMessage;
  }
}

/**
 * Starts the bot and sets up the update interval
 */
client.once('ready', async () => {
  console.log(`Bot is online as: ${client.user.tag}`);

  // Check if API_KEY is provided
  if (!API_KEY) {
    console.error('API_KEY is not set in .env file. Please provide an API key.');
    process.exit(1);
  }

  try {
    const channel = await client.channels.fetch(DISCORD_CHANNEL_ID);
    if (!channel) {
      console.error('Channel not found. Please check your DISCORD_CHANNEL_ID.');
      return;
    }

    // Send initial embed and keep reference to the message
    let currentMessage = await channel.send({
      embeds: [new EmbedBuilder().setDescription('Starting Votemap Live...')]
    });

    // Update every 30 seconds
    setInterval(async () => {
      try {
        currentMessage = await updateVotemapEmbed(channel, currentMessage);
      } catch (error) {
        console.error('Error updating votemap embed:', error);
      }
    }, 30000);

  } catch (err) {
    console.error('Error accessing the channel:', err);
  }
});

client.login(DISCORD_TOKEN).catch((err) => {
  console.error('Error during login:', err);
});
