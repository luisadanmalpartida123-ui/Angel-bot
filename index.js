const http = require('http');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const axios = require('axios');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

// 1. Servidor HTTP para mantener activo el Web Service en Render
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot Angel-KC activo 24/7');
}).listen(PORT, () => {
    console.log(`Servidor de salud corriendo en el puerto ${PORT}`);
});

// Archivo para guardar las colecciones de los usuarios
const DB_FILE = './user_collections.json';

// Cargar o inicializar la base de datos de usuarios
let userCollections = {};
if (fs.existsSync(DB_FILE)) {
    try {
        userCollections = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    } catch (e) {
        userCollections = {};
    }
}

function saveDatabase() {
    fs.writeFileSync(DB_FILE, JSON.stringify(userCollections, null, 2));
}

// Función para obtener un personaje aleatorio desde AniList
async function getRandomAnimeCharacter() {
    const randomPage = Math.floor(Math.random() * 100) + 1;
    const query = `
    query ($page: Int) {
      Page(page: $page, perPage: 1) {
        characters(sort: FAVOURITES_DESC) {
          id
          name {
            full
            native
          }
          image {
            large
          }
          media(perPage: 1) {
            nodes {
              title {
                romaji
                english
              }
            }
          }
        }
      }
    }
    `;

    try {
        const response = await axios.post('https://graphql.anilist.co', {
            query: query,
            variables: { page: randomPage }
        });

        const character = response.data?.data?.Page?.characters[0];
        if (character) {
            const animeTitle = character.media?.nodes[0]?.title?.english || character.media?.nodes[0]?.title?.romaji || 'Anime Desconocido';
            return {
                id: character.id,
                name: character.name.full,
                anime: animeTitle,
                image: character.image.large
            };
        }
    } catch (error) {
        console.error('Error al consultar AniList:', error.message);
    }
    return null;
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Conexión cerrada. Reconectando...', shouldReconnect);
            if (shouldReconnect) {
                startBot();
            }
        } else if (connection === 'open') {
            console.log('¡BOT ANGEL-KC CONECTADO CON ÉXITO Y LISTO!');
        }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        for (const msg of messages) {
            if (!msg.message || msg.key.fromMe) continue;

            const from = msg.key.remoteJid;
            const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
            const sender = msg.key.participant || from;

            if (!text.startsWith('#')) continue;

            const args = text.slice(1).trim().split(/ +/);
            const command = args.shift().toLowerCase();

            switch (command) {
                case 'ping':
                    await sock.sendMessage(from, { text: '🏓 ¡Pong! El bot Angel-KC está activo 24/7.' }, { quoted: msg });
                    break;

                case 'dado':
                    const dado = Math.floor(Math.random() * 6) + 1;
                    await sock.sendMessage(from, { text: `🎲 Lanzaste el dado y salió: *${dado}*` }, { quoted: msg });
                    break;

                case 'menu':
                case 'ayuda':
                    const menuText = `✨ *MENÚ DE COMANDOS - BOT ANGEL-KC* ✨\n\n` +
                        `🎴 *Gacha / Anime:*\n` +
                        `• \`#claim\` o \`#gacha\`: Obtén un personaje de anime aleatorio.\n` +
                        `• \`#mi-coleccion\`: Mira los personajes que has reclamado.\n\n` +
                        `🛠️ *Utilidades:*\n` +
                        `• \`#ping\`: Verificar estado del bot.\n` +
                        `• \`#dado\`: Lanzar un dado.\n` +
                        `• \`#menu\`: Mostrar este menú.`;
                    await sock.sendMessage(from, { text: menuText }, { quoted: msg });
                    break;

                case 'claim':
                case 'gacha':
                    await sock.sendMessage(from, { text: '🔍 Buscando un personaje de anime en AniList...' }, { quoted: msg });
                    
                    const char = await getRandomAnimeCharacter();
                    if (!char) {
                        await sock.sendMessage(from, { text: '❌ Ocurrió un error al obtener el personaje. Intenta de nuevo.' }, { quoted: msg });
                        break;
                    }

                    if (!userCollections[sender]) {
                        userCollections[sender] = [];
                    }

                    userCollections[sender].push({
                        id: char.id,
                        name: char.name,
                        anime: char.anime,
                        date: new Date().toLocaleDateString()
                    });
                    saveDatabase();

                    const responseText = `✨ *¡PERSONAJE OBTENIDO!* ✨\n\n` +
                        `👤 *Nombre:* ${char.name}\n` +
                        `📺 *Anime:* ${char.anime}\n` +
                        `🆔 *ID:* ${char.id}\n\n` +
                        `🎉 ¡Guardado en tu colección! Usa \`#mi-coleccion\` para ver tus personajes.`;

                    await sock.sendMessage(from, {
                        image: { url: char.image },
                        caption: responseText
                    }, { quoted: msg });
                    break;

                case 'mi-coleccion':
                case 'coleccion':
                    const userChars = userCollections[sender] || [];
                    if (userChars.length === 0) {
                        await sock.sendMessage(from, { text: '🎒 Tu colección está vacía. Usa \`#claim\` para obtener tu primer personaje.' }, { quoted: msg });
                        break;
                    }

                    let listText = `🎒 *TU COLECCIÓN DE PERSONAJES (${userChars.length}):*\n\n`;
                    userChars.forEach((c, idx) => {
                        listText += `${idx + 1}. *${c.name}* (${c.anime})\n`;
                    });

                    await sock.sendMessage(from, { text: listText }, { quoted: msg });
                    break;
            }
        }
    });
}

startBot();
