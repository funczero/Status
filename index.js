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
      user_agent: "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Mobile Safari/537.36", // Simula navegador móvel
    },
  },
});

const app = express();
const PORT = 80;

app.use(express.json());
app.use(require('cors')());

const USER_ID = '1006909671908585586';
const GUILD_ID = '1148661284594790400';
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

  return `${months} mese(s), ${days} dia(s), ${hours} hora(s), ${minutes} minuto(s) e ${seconds} segundos`;
}

app.get('/status', async (req, res) => {
  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    console.log('Servidor encontrado:', guild.name);

    const member = await guild.members.fetch(USER_ID);
    console.log('Status do membro:', member.presence?.status);

    const isOnline = member.presence?.status === 'online';

    res.json({
      message: `FuncZero está ${isOnline ? 'online' : 'offline'}`,
      online: isOnline,
    });
  } catch (error) {
    console.error('Erro ao obter status do usuário:', error.message);
    res.status(500).json({ error: 'Erro ao obter status do usuário' });
  }
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

client.once('ready', () => {
  console.log(`Bot está online como ${client.user.tag}`);
  
  console.log("Configuração atual do WebSocket:", client.options.ws);

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
        { name: 'Sistema Operacional', value: `${os.type()} ${os.release()}`, inline: true },
        { name: 'Uptime do Bot', value: uptime, inline: true },
      ],
      timestamp: new Date(),
    };

    msg.edit({ content: null, embeds: [embed] });
  }
});

client.login(process.env.TOKEN);
