require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
});

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors());

const USER_ID = process.env.USER_ID; 
const GUILD_ID = process.env.GUILD_ID;

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