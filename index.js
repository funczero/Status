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
  ws: {
    properties: {
      $browser: "Discord Android",
      user_agent:
        "Mozilla/5.0 (Linux; Android 12; Pixel 4 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36", // Simula um navegador Android moderno
    },
  },
});

const app = express();
const PORT = 80;

app.use(express.json());
app.use(require('cors')());

const PREFIX = '.';

function formatUptime(seconds) {
  const months = Math.floor(seconds / (30 * 24 * 60 * 60));
  seconds %= 30 * 24 * 60 * 60;

  const days = Math.floor(seconds / (24 * 60 * 60));
  seconds %= 24 * 60 * 60;

  const hours = Math.floor(seconds / (60 * 60));
  seconds %= 60 * 60;

  const minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);

  return `${months}M ${days}D ${hours}H ${minutes}m ${seconds}s`;
}

client.once('ready', () => {
  console.log(`Bot online como ${client.user.tag}`);

  console.log("Configuração do WebSocket:", client.options.ws.properties);

  client.user.setPresence({
    status: 'online',
    activities: [
      {
        name: '📱 Usando Discord no celular',
        type: 'PLAYING',
      },
    ],
  });

  console.log('Status configurado como "Simulando celular verde".');
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

    const uptime = formatUptime(process.uptime());

    const embed = {
      color: 0x00ff00,
      title: 'Informações do Sistema',
      fields: [
        { name: 'Ping da API', value: `${apiPing}ms`, inline: true },
        { name: 'Latência', value: `${latency}ms`, inline: true },
        { name: 'Uso de CPU', value: `${cpuPercentage}%`, inline: true },
        { name: 'Uso de Memória', value: `${memoryMB}MB / ${totalMemoryMB}MB`, inline: true },
        { name: 'Uptime do Bot', value: uptime, inline: false },
      ],
      timestamp: new Date(),
    };

    msg.edit({ content: null, embeds: [embed] });
  }
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

client.login(process.env.TOKEN);
