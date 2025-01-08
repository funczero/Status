require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
});

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(require('cors')());

const USER_ID = '1006909671908585586';
const GUILD_ID = '1148661284594790400'; 

app.get('/status', async (req, res) => {
  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    const member = await guild.members.fetch(USER_ID);

    const isOnline = member.presence?.status === 'online';

    res.json({
      message: `FuncZero está ${isOnline ? 'online' : 'offline'}`,
    });
  } catch (error) {
    console.error('Erro ao obter status do usuário:', error.message);
    res.status(500).json({ error: 'Erro ao obter status do usuário' });
  }
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

client.once('ready', () => {
  console.log(`Bot está online como ${client.user.tag}`);
});

client.login(process.env.TOKEN);
