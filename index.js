require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { Client, GatewayIntentBits } = require('discord.js');
const os = require('os');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],
});

const app = express();
const PORT = 80;

app.use(express.json());
app.use(require('cors')());

const PREFIX = '.';

function formatUptimeModern(seconds) {
  const months = Math.floor(seconds / (30 * 24 * 60 * 60));
  seconds %= 30 * 24 * 60 * 60;

  const days = Math.floor(seconds / (24 * 60 * 60));
  seconds %= 24 * 60 * 60;

  const hours = Math.floor(seconds / (60 * 60));
  seconds %= 60 * 60;

  const minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);

  return `${months}M:${days}D:${hours}H:${minutes}m:${seconds}s`;
}

function generateProgressBar(percentage) {
  const totalBars = 20;
  const filledBars = Math.round((percentage / 100) * totalBars);
  const emptyBars = totalBars - filledBars;

  const filled = '█'.repeat(filledBars);
  const empty = '░'.repeat(emptyBars);

  return `${filled}${empty}`;
}

client.once('ready', () => {
  console.log(`Bot online como ${client.user.tag}`);
  client.user.setPresence({
    status: 'dnd',
    activities: [{ name: 'https://funczero.xyz', type: 'WATCHING' }],
  });
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'ping') {
    const msg = await message.channel.send('Calculando...');

    const latency = msg.createdTimestamp - message.createdTimestamp;
    const apiPing = client.ws.ping;

    const cpuUsage = process.cpuUsage();
    const memoryUsage = process.memoryUsage();

    const cpuPercentage = ((cpuUsage.user + cpuUsage.system) / 1e6).toFixed(2);
    const memoryMB = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
    const totalMemoryMB = (os.totalmem() / 1024 / 1024).toFixed(2);

    const uptimeInSeconds = process.uptime();
    const uptimeFormatted = formatUptimeModern(uptimeInSeconds);

    const percentage = (uptimeInSeconds % (24 * 60 * 60)) / (24 * 60 * 60) * 100;
    const progressBar = generateProgressBar(percentage);

    const embed = {
      color: 0x00ff00,
      title: 'Informações do Sistema',
      fields: [
        { name: 'Ping da API', value: `${apiPing}ms`, inline: true },
        { name: 'Latência', value: `${latency}ms`, inline: true },
        { name: 'Uso de CPU', value: `${cpuPercentage}%`, inline: true },
        { name: 'Uso de Memória', value: `${memoryMB}MB / ${totalMemoryMB}MB`, inline: true },
        { name: 'Sistema Operacional', value: `${os.type()} ${os.release()}`, inline: true },
        { name: 'Uptime do Bot', value: `${uptimeFormatted}\n${progressBar}`, inline: false },
      ],
      timestamp: new Date(),
    };

    msg.edit({ content: null, embeds: [embed] });
  }
});

client.login(process.env.TOKEN);
