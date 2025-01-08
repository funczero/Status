require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences, // Adicionado para acessar presenças
  ],
});

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(require('cors')());

const USER_ID = '1006909671908585586'; // Substitua pelo seu ID de usuário
const GUILD_ID = '1148661284594790400'; // Substitua pelo ID do servidor

// Rota para verificar status
app.get('/status', async (req, res) => {
  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    const member = await guild.members.fetch(USER_ID);

    const isOnline = member.presence?.status === 'online';

    res.json({
      username: member.user.username,
      status: isOnline ? 'online' : 'offline',
    });
  } catch (error) {
    console.error('Erro ao obter status do usuário:', error.message);
    res.status(500).json({ error: 'Erro ao obter status do usuário.' });
  }
});

// Inicializa o servidor
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

// Evento ready do bot
client.once('ready', () => {
  console.log(`Bot está online como ${client.user.tag}`);
});

// Login do bot
client.login(process.env.DISCORD_TOKEN);
