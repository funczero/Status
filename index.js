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
const PORT = process.env.PORT;

app.use(express.json());
app.use(require('cors')());

const USER_ID = process.env.DISCORD_USER_ID;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

app.get('/status', async (req, res) => {
  try {
    console.log(`[INFO] Solicitando status de ${USER_ID} no servidor ${GUILD_ID}...`);
    
    const guild = await client.guilds.fetch(GUILD_ID);
    if (!guild) throw new Error('Servidor não encontrado.');

    const member = await guild.members.fetch(USER_ID);
    if (!member) throw new Error('Membro não encontrado.');

    const isOnline = member.presence?.status === 'online';
    const statusMessage = isOnline ? '🟢 Online' : '🔴 Offline';

    console.log(`[SUCESSO] Status de ${member.user.tag}: ${statusMessage}`);

    res.json({
      message: `FuncZero está ${statusMessage}`,
      username: member.user.tag,
      id: member.user.id,
      status: isOnline ? 'online' : 'offline',
    });
  } catch (error) {
    console.error('[ERRO] Falha ao obter status:', error.message);
    res.status(500).json({ error: 'Erro ao obter status do usuário.' });
  }
});

app.listen(PORT, () => {
  console.log(`[INFO] Servidor rodando na porta ${PORT}`);
});

client.once('ready', () => {
  console.log(`[INFO] Bot está online como ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);