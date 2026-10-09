const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

// Imagen del menú principal
const IMAGEN_MENU = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3WIkECPSy4v-SW4xQHKmKgNT4SIIBRP9TS0ilJ10HjA&s=10';

// Lista de los 100 Personajes de Anime exactos
const listaPersonajes = [
    { nombre: "Angel Devil", anime: "Chainsaw Man", genero: "Masculino / Demonio", valor: 1500 },
    { nombre: "Power", anime: "Chainsaw Man", genero: "Femenino", valor: 1200 },
    { nombre: "Makima", anime: "Chainsaw Man", genero: "Femenino", valor: 2500 },
    { nombre: "Denji", anime: "Chainsaw Man", genero: "Masculino", valor: 1000 },
    { nombre: "Aki Hayakawa", anime: "Chainsaw Man", genero: "Masculino", valor: 1100 },
    { nombre: "Son Goku", anime: "Dragon Ball Z", genero: "Masculino", valor: 3000 },
    { nombre: "Vegeta", anime: "Dragon Ball Z", genero: "Masculino", valor: 2800 },
    { nombre: "Gohan", anime: "Dragon Ball Z", genero: "Masculino", valor: 2000 },
    { nombre: "Naruto Uzumaki", anime: "Naruto", genero: "Masculino", valor: 2500 },
    { nombre: "Sasuke Uchiha", anime: "Naruto", genero: "Masculino", valor: 2400 },
    { nombre: "Kakashi Hatake", anime: "Naruto", genero: "Masculino", valor: 2200 },
    { nombre: "Sakura Haruno", anime: "Naruto", genero: "Femenino", valor: 900 },
    { nombre: "Itachi Uchiha", anime: "Naruto", genero: "Masculino", valor: 2900 },
    { nombre: "Monkey D. Luffy", anime: "One Piece", genero: "Masculino", valor: 3000 },
    { nombre: "Roronoa Zoro", anime: "One Piece", genero: "Masculino", valor: 2700 },
    { nombre: "Nami", anime: "One Piece", genero: "Femenino", valor: 1300 },
    { nombre: "Sanji", anime: "One Piece", genero: "Masculino", valor: 2100 },
    { nombre: "Nico Robin", anime: "One Piece", genero: "Femenino", valor: 1800 },
    { nombre: "Satoru Gojo", anime: "Jujutsu Kaisen", genero: "Masculino", valor: 3000 },
    { nombre: "Yuji Itadori", anime: "Jujutsu Kaisen", genero: "Masculino", valor: 1500 },
    { nombre: "Megumi Fushiguro", anime: "Jujutsu Kaisen", genero: "Masculino", valor: 1700 },
    { nombre: "Nobara Kugisaki", anime: "Jujutsu Kaisen", genero: "Femenino", valor: 1200 },
    { nombre: "Sukuna", anime: "Jujutsu Kaisen", genero: "Masculino / Maldición", valor: 2900 },
    { nombre: "Tanjiro Kamado", anime: "Demon Slayer", genero: "Masculino", valor: 2000 },
    { nombre: "Nezuko Kamado", anime: "Demon Slayer", genero: "Femenino", valor: 2200 },
    { nombre: "Zenitsu Agatsuma", anime: "Demon Slayer", genero: "Masculino", valor: 1400 },
    { nombre: "Inosuke Hashibira", anime: "Demon Slayer", genero: "Masculino", valor: 1400 },
    { nombre: "Kyojuro Rengoku", anime: "Demon Slayer", genero: "Masculino", valor: 2600 },
    { nombre: "Eren Yeager", anime: "Attack on Titan", genero: "Masculino", valor: 2700 },
    { nombre: "Mikasa Ackerman", anime: "Attack on Titan", genero: "Femenino", valor: 2500 },
    { nombre: "Levi Ackerman", anime: "Attack on Titan", genero: "Masculino", valor: 3000 },
    { nombre: "Armin Arlert", anime: "Attack on Titan", genero: "Masculino", valor: 1600 },
    { nombre: "Saitama", anime: "One Punch Man", genero: "Masculino", valor: 3000 },
    { nombre: "Genos", anime: "One Punch Man", genero: "Masculino / Cyborg", valor: 1900 },
    { nombre: "Tatsumaki", anime: "One Punch Man", genero: "Femenino", valor: 2400 },
    { nombre: "Light Yagami", anime: "Death Note", genero: "Masculino", valor: 2300 },
    { nombre: "L Lawliet", anime: "Death Note", genero: "Masculino", valor: 2500 },
    { nombre: "Misa Amane", anime: "Death Note", genero: "Femenino", valor: 1100 },
    { nombre: "Ryuk", anime: "Death Note", genero: "Shinigami", valor: 2000 },
    { nombre: "Killua Zoldyck", anime: "Hunter x Hunter", genero: "Masculino", valor: 2700 },
    { nombre: "Gon Freecss", anime: "Hunter x Hunter", genero: "Masculino", valor: 2200 },
    { nombre: "Hisoka Morow", anime: "Hunter x Hunter", genero: "Masculino", valor: 2400 },
    { nombre: "Kurapika", anime: "Hunter x Hunter", genero: "Masculino", valor: 2100 },
    { nombre: "Izuku Midoriya", anime: "My Hero Academia", genero: "Masculino", valor: 1900 },
    { nombre: "Katsuki Bakugo", anime: "My Hero Academia", genero: "Masculino", valor: 2000 },
    { nombre: "Shoto Todoroki", anime: "My Hero Academia", genero: "Masculino", valor: 2100 },
    { nombre: "All Might", anime: "My Hero Academia", genero: "Masculino", valor: 2600 },
    { nombre: "Ochaco Uraraka", anime: "My Hero Academia", genero: "Femenino", valor: 1200 },
    { nombre: "Ken Kaneki", anime: "Tokyo Ghoul", genero: "Masculino", valor: 2400 },
    { nombre: "Touka Kirishima", anime: "Tokyo Ghoul", genero: "Femenino", valor: 1700 }
];

// Generar hasta 100 personajes
const personajes100 = [];
for (let i = 0; i < 100; i++) {
    const base = listaPersonajes[i % listaPersonajes.length];
    personajes100.push({
        id: i + 1,
        nombre: i >= 50 ? `${base.nombre} (SSR #${i + 1})` : base.nombre,
        nombreBusqueda: base.nombre,
        anime: base.anime,
        genero: base.genero,
        valor: base.valor + (i * 10)
    });
}

// Función para buscar la FOTO OFICIAL del personaje en AniList
async function buscarFotoOficialBuffer(nombrePersonaje) {
    const query = `
    query ($search: String) {
      Character (search: $search) {
        image {
          large
        }
      }
    }`;

    try {
        const response = await axios.post('https://graphql.anilist.co', {
            query: query,
            variables: { search: nombrePersonaje }
        });

        const imageUrl = response.data?.data?.Character?.image?.large;
        if (imageUrl) {
            const imgRes = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            return Buffer.from(imgRes.data);
        }
    } catch (e) {
        console.log('No se pudo obtener imagen oficial, usando respaldo.');
    }

    // Imagen de respaldo por si falla la conexión
    const res = await axios.get(IMAGEN_MENU, { responseType: 'arraybuffer' });
    return Buffer.from(res.data);
}

const ultimasTiradas = {};
const inventarios = {};

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
            console.log('\n--- ESCANEA ESTE CÓDIGO QR ---');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut);
            console.log('Conexión cerrada. Reconectando...', shouldReconnect);
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('¡BOT CONECTADO CON ÉXITO Y LISTO!');
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const jid = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
        const command = text.toLowerCase().trim();

        // 1. Comando #ping
        if (command === '#ping') {
            const start = Date.now();
            const latency = Date.now() - start;
            await sock.sendMessage(jid, { text: `🏓 *Pong!* Latencia: *${latency}ms*.` }, { quoted: msg });
        }

        // 2. Comando #dado
        if (command === '#dado') {
            const numeroDado = Math.floor(Math.random() * 6) + 1;
            const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣'];
            await sock.sendMessage(jid, { text: `🎲 Resultó: *${numeroDado}* ${emojis[numeroDado - 1]}` }, { quoted: msg });
        }

        // 3. SECCIÓN GACHA: Comando #gacha
        if (command === '#gacha') {
            const randomIdx = Math.floor(Math.random() * personajes100.length);
            const p = personajes100[randomIdx];

            ultimasTiradas[jid] = p;

            const caption = `✨ *TIRADA GACHA ANIME* ✨\n\n` +
                `👤 *Nombre:* ${p.nombre}\n` +
                `📺 *Anime:* ${p.anime}\n` +
                `🚻 *Género:* ${p.genero}\n` +
                `💰 *Valor:* $${p.valor}\n\n` +
                `👉 *Escribe "#claim" para reclamar y guardar a este personaje en tu colección.*`;

            try {
                // Obtiene la foto real del personaje desde AniList
                const imageBuffer = await buscarFotoOficialBuffer(p.nombreBusqueda);
                await sock.sendMessage(jid, {
                    image: imageBuffer,
                    caption: caption
                }, { quoted: msg });
            } catch (err) {
                await sock.sendMessage(jid, { text: caption }, { quoted: msg });
            }
        }

        // 4. SECCIÓN GACHA: Comando #claim
        if (command === '#claim') {
            const personajeDisponible = ultimasTiradas[jid];

            if (!personajeDisponible) {
                return await sock.sendMessage(jid, { text: `⚠️ *No hay ningún personaje disponible para reclamar.* Primero tira con el comando *#gacha*.` }, { quoted: msg });
            }

            if (!inventarios[sender]) {
                inventarios[sender] = [];
            }

            inventarios[sender].push(personajeDisponible);
            delete ultimasTiradas[jid];

            await sock.sendMessage(jid, {
                text: `🎉 ¡Felicidades! Has reclamado con éxito a *${personajeDisponible.nombre}* de *${personajeDisponible.anime}* ($${personajeDisponible.valor}). Usa *#mi-coleccion* para ver tus personajes.`
            }, { quoted: msg });
        }

        // 5. SECCIÓN GACHA: Comando #mi-coleccion
        if (command === '#mi-coleccion' || command === '#coleccion') {
            const misPersonajes = inventarios[sender] || [];

            if (misPersonajes.length === 0) {
                return await sock.sendMessage(jid, { text: `🎒 *Tu inventario está vacío.* Usa *#gacha* y luego *#claim* para reclamar personajes.` }, { quoted: msg });
            }

            let lista = `🎒 *TU COLECCIÓN DE PERSONAJES (${misPersonajes.length})*:\n\n`;
            let totalValor = 0;

            misPersonajes.forEach((p, idx) => {
                lista += `${idx + 1}. *${p.nombre}* (${p.anime}) - $${p.valor}\n`;
                totalValor += p.valor;
            });

            lista += `\n💎 *Valor total de tu colección:* $${totalValor}`;

            await sock.sendMessage(jid, { text: lista }, { quoted: msg });
        }

        // 6. Comando #menu
        if (command === '#menu') {
            const caption = `¡Hola! Soy Angel-KC (Pre-Bot)\n\n` +
                `AQUÍ TIENES LA LISTA DE COMANDOS:\n\n` +
                `⚙️ *COMANDOS GENERALES:*\n` +
                `- #ping : Muestra la velocidad del bot\n` +
                `- #dado : Lanza un dado al azar (1-6)\n` +
                `- #menu : Muestra esta lista\n\n` +
                `🎰 *APARTADO GACHA (ANIME):*\n` +
                `- #gacha : Tira por un personaje al azar de 100 disponibles\n` +
                `- #claim : Reclama el personaje obtenido en el último #gacha\n` +
                `- #mi-coleccion : Revisa tu lista de personajes reclamados\n\n` +
                `• CANAL OFICIAL:\njijijaja...`;

            try {
                const res = await axios.get(IMAGEN_MENU, { responseType: 'arraybuffer' });
                await sock.sendMessage(jid, {
                    image: Buffer.from(res.data),
                    caption: caption
                }, { quoted: msg });
            } catch (err) {
                await sock.sendMessage(jid, { text: caption }, { quoted: msg });
            }
        }
    });
}

startBot();