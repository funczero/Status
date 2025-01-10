require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { Client, GatewayIntentBits, MessageEmbed } = require('discord.js');
const os = require('os');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers,
  ],
  ws: {
    properties: {
      $browser: "Discord Android",
      user_agent: "Mozilla/5.0 (Linux; Android 12; Pixel 4 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36",
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

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'sorteio') {
    if (!message.member.permissions.has('MANAGE_MESSAGES')) {
      return message.reply('Você não tem permissão para iniciar sorteios!');
    }

    const duration = args[0];
    const prize = args.slice(1).join(' ');

    if (!duration || !prize) {
      return message.reply(
        'Uso: `.sorteio <duração> <prêmio>`\nExemplo: `.sorteio 1m Gift Card R$50`'
      );
    }

    const durationMs = parseDuration(duration);
    if (!durationMs) {
      return message.reply('Duração inválida! Use formatos como: 10s, 1m, 1h.');
    }

    const embed = new MessageEmbed()
      .setTitle('🎉 Sorteio!')
      .setDescription(`Reaja com 🎉 para participar!\n**Prêmio:** ${prize}`)
      .addField('Tempo Restante', formatDuration(durationMs))
      .setFooter('Sorteio criado por ' + message.author.username)
      .setColor('GREEN');

    const giveawayMessage = await message.channel.send({ embeds: [embed] });
    await giveawayMessage.react('🎉');

    setTimeout(async () => {
      const fetchedMessage = await message.channel.messages.fetch(
        giveawayMessage.id
      );

      const reactions = fetchedMessage.reactions.cache.get('🎉');
      if (!reactions || reactions.count <= 1) {
        return message.channel.send(
          `❌ Sorteio cancelado, pois ninguém participou.`
        );
      }

      const users = await reactions.users.fetch();
      const participants = users.filter((u) => !u.bot).map((u) => u);

      const winner = participants[Math.floor(Math.random() * participants.length)];

      message.channel.send(
        `🎉 Parabéns ${winner}! Você ganhou: **${prize}**`
      );
    }, durationMs);
  }

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
        { name: 'Uptime do Bot', value: uptime, inline: true },
      ],
      timestamp: new Date(),
    };

    msg.edit({ content: null, embeds: [embed] });
  }
});

function parseDuration(duration) {
  const match = duration.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return null;

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return null;
  }
}

// Função para formatar a duração
function formatDuration(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
client.login(process.env.TOKEN);
