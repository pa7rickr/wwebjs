/**
    * PatrickBot, Powered by "whatsapp-web.js"
    * This Source Code support all device
    * Follow my instagram: @pa7rickr
**/
process.on('uncaughtException', console.error)
require("./config")

const { Aki } = require("aki-api")
const { exec, spawn, execSync } = require("child_process")
const { getRandom, checkURL, formatp } = require("./lib/Function")
const { MessageMedia, Button, List } = require("whatsapp-web.js")
const { parseMention, formatDate, runtime, sleep } = require("./lib/Function")
const { webp2mp4File } = require("./lib/Converter")
const moment = require("moment-timezone")
const speed = require('performance-now')
const wa = require("whatsapp-web.js")
const axios = require('axios')
const chalk = require('chalk')
const path = require("path")
const jimp = require('jimp')
const util = require('util')
const os = require('os')
const fs = require('fs')

this.anonymous = this.anonymous ? this.anonymous : {}
this.akinator = this.akinator ? this.akinator : {}
this.menfess = this.menfess ? this.menfess : {}

// Membuat object game untuk menyimpan data permainan
this.game = {
  groupId: "6288989029718-1624806045@g.us",
  allPlayers: {}, // Array untuk menyimpan data pemain
  players: {}, // Array untuk menyimpan data pemain
  roles: [], // Array untuk menyimpan peran pemain
  votes: {}, // Objek untuk menyimpan data voting
  dayDuration: 90 * 1000, // Durasi sesi siang (voting) dalam milisecond
  nightDuration: 90 * 1000, // Durasi sesi malam (aksi werewolf/seer/guardian) dalam milisecond
  discussionDuration: 90 * 1000, // Durasi sesi diskusi dalam milisecond
  state: 'lobby', // Menyimpan status permainan ('lobby', 'day', 'night', 'finished')
  minimumPlayers: 4, // Jumlah pemain minimal
  maximumPlayers: 32, // Jumlah pemain maksimal
  totalPlayers: 0, // Jumlah pemain yang bergabung
  totalWerewolf: 0, // Jumlah pemain werewolf
  totalSeer: 0, // Jumlah pemain seer
  totalGuardian: 0, // Jumlah pemain guardian
  totalVillagers: 0, // Jumlah pemain villagers
  total: 0, // Jumlah hari yang dimainkan
  werewolfKilled: [], // Array untuk menyimpan pemain yang dibunuh werewolf
  protectedPlayer: [], // Menyimpan pemain yang dilindungi guardian
  villagerVoted: null, // Menyimpan pemain yang terpilih sebagai target voting sesi siang
  killedPlayer: [], // Menyimpan pemain yang terbunuh di sesi malam
  seenPlayer: null // Menyimpan pemain yang diterawang di sesi malam
}

let game = this.game

/**** API Module ****/
let bochil = require('@bochilteam/scraper')
let yts = '' 
let hxz = require('hxz-api')
let xa = require('xfarr-api')

exports.reaction = async (message, conn) => { 
	try { 
      // Fungsi untuk menampilkan list pemain dalam bentuk string
        function getPlayerListString() {
          let listString = '';
          let i = 1;
          for (let playerId in game.players) {
            let player = game.players[playerId];
            listString += `${i}. @${player.id}\n`;
            i++;
          }
          return listString.trim();
        }
	  if (message.id.remote !== game.groupId) return 
	  if (!message.id.remote.endsWith("@g.us")) return 
	  if (game.state !== 'waiting') return conn.sendMessage(message.id.remote, 'Silahkan ketik */werewolf* terlebih dahulu.');
	  let parseMentions = async (text) => {
    	let tagged = []
    	let parses = [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@c.us')
        for (let id of parses) tagged.push(await conn.getContactById(i))
        return tagged
      }
        
      sendMessageWithMentions = async (jid, text, options = {}) => { 
    	let mentions = []
    	let parses = [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@c.us')
        let regex = /@c\.us/g
        text = text.replace(regex, '')
        for (let id of parses) mentions.push(await conn.getContactById(id))
        return conn.sendMessage(jid, text, { ...options, mentions })
      }
      
      let reactionID = message.msgId._serialized
      if (reactionID == game.quotedReactID) {
        if (message.reaction == '🐺') { 
          if (Object.keys(game.players).length > game.maximumPlayers) return conn.sendMessage(message.id.remote, `Jumlah pemain dalam room terdapat 32 pemain! Anda tidak dapat bergabung. Jika anda Moderator, silahkan ketik /start-ww`);
          let player = game.players[message.senderId];
          if (player) return conn.sendMessageWithMentions(message.id.remote, `Anda sudah terdaftar di game ini.\n\n📜 List pemain yang bergabung:\n${getPlayerListString ()}`);
          // Jika belum terdaftar, daftarkan pemain ke database
          game.players[message.senderId] = { id: message.senderId, alive: true, votes: 0 };
          sendMessageWithMentions(message.id.remote, `*[ Werewolf - Game ]*\n\n📜 List pemain yang bergabung:\n${getPlayerListString ()}\n\nKamu telah berhasil didaftarkan di game ini. ${Object.keys(game.players).length >= game.minimumPlayers ? 'Permainan ini dapat dimulai, ketik /start-ww untuk memulai permainan.' : 'Permainan ini tak dapat dimulai, karena pemain yang bergabung kurang dari 5.'}`);
        } else if (message.reaction = '') {
          delete game.players[message.senderId]        
        }
      }
    } catch (e) { 
    	console.log(e)
    	conn.sendMessage(message.id.remote, 'Terjadi kesalahan. Silahkan ketik */join-ww* untuk bergabung dalam permainan.')
    }
}
               
exports.start = async (conn, m) => {
    try {
        const { body, from, hasMedia: isMedia, type } = m
        let sender = m.author || m.from
        var prefix = /^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi.test(body) ? body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi)[0] : '#'
        let isCmd = body.startsWith(prefix)
        const command = body.trim().split(/ +/).shift().toLowerCase()
        const args = body.trim().split(/ +/).slice(1)
        const isOwner = [conn.info.wid._serialized, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@c.us').includes(sender)
        const text = args.join(" ")
        const quoted = m.hasQuotedMsg ? await m.getQuotedMessage() : m
        const mime = (quoted._data || quoted).mimetype || ""
        const isGroup = from.endsWith("@g.us")
        const contact = await conn.getChatById(sender)

        const metadata = await m.getChat()
        const groupName = isGroup ? metadata.name : ""
        const participants = isGroup ? metadata.groupMetadata.participants : []
        const groupAdmins = isGroup ? participants.filter(v => v.isAdmin && !v.isSuperAdmin).map(v => v.id._serialized) : []
        const isBotAdmin = isGroup ? groupAdmins.includes(conn.info.wid._serialized) : false
        const isAdmin = isGroup ? groupAdmins.includes(sender) : false

        if (isCmd) {
            console.log(chalk.red('~') + '>', 
                '[ ' + chalk.greenBright(moment(m.timestamp * 1000).tz('Asia/Jakarta').format('HH:mm:ss')) + ' ]', '-', 
                '"' + chalk.greenBright(isGroup ? 'Group' : 'Private') + '"', '=', 
                chalk.greenBright(command), 'from', 
                chalk.greenBright(sender.split`@`[0]), 'in args:', 
                chalk.greenBright(args.length)
            )
        }

        if (options.mute && !isOwner) return
        if (!options.public) { 
            if (!m.id.fromMe) return
        }
        
        let dayText = "☀️ Siang datang. Matahari tepat di atas kepala. Warga desa mempunyai 90 detik untuk saling tuduh, membela diri atau menyebarkan gosip ~(˘▾˘~). \n\n🗓 Hari ke"
        let nightText = "🌙 Malam telah tiba, desa semakin sepi. Sebagian telah tertidur kelelahan, sebagian masih memikirkan gebetan. (ง•‌-•‌)ง  Pemain malam hari: kalian punya 90 detik untuk menjalankan aksimu!"
        
        
        // Fungsi untuk mengacak peran pemain
        function shuffleRoles() {
          const { players } = game;
          const playerIds = Object.keys(players);
          game.totalPlayers = playerIds.length;
          game.totalWerewolf = Math.floor(game.totalPlayers / 3);
          game.totalSeer = 1;
          game.totalGuardian = 1;
          game.totalVillagers = game.totalPlayers - game.totalWerewolf - game.totalSeer - game.totalGuardian;
          game.roles = [
            ...Array(game.totalWerewolf).fill('werewolf'),
            ...Array(game.totalSeer).fill('seer'),
            ...Array(game.totalGuardian).fill('guardian'),
            ...Array(game.totalVillagers).fill('villager'),
          ];
          game.roles = shuffleArray(game.roles);
          playerIds.forEach((playerId, index) => {
            game.players[playerId].role = game.roles[index];
          });
        }
       
        function shuffleArray(array) {
          let keys = Object.keys(array);
          for (let i = keys.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [keys[i], keys[j]] = [keys[j], keys[i]];
          }
          let shuffledArray;
          if (!Array.isArray(array)) {
            shuffledArray = {};
            for (let key of keys) shuffledArray[array[key].id] = array[key]; 
          } else { 
            shuffledArray = [];
            for (let key of keys) shuffledArray.push(array[key]); 
          }          
          return shuffledArray;
        }

      
        // Fungsi untuk menampilkan list pemain dalam bentuk string
        function getPlayerListString() {
          let listString = '';
          let i = 1;
          for (let playerId in game.players) {
            let player = game.players[playerId];
            listString += `${i}. @${player.id}\n`;
            i++;
          }
          return listString.trim();
        }
        
        // Fungsi untuk mencari pemain yang terpilih sebagai target voting sesi siang
        function findVotedPlayer() {
          let voteCount = {};
          for (let player of Object.values(game.players)) {
            voteCount[player.id] = player.votes;
          }
          let sortedPlayers = Object.values(game.players).sort((a, b) => {
            return b.votes - a.votes;
          });
          let tie = false;
          for (let i = 1; i < sortedPlayers.length; i++) {
            if (sortedPlayers[i].votes === votes) tie = true
          }
          let votedPlayer = sortedPlayers[0];
          return votedPlayer;
        }
        
        // Fungsi untuk mengurutkan pemain sesuai jumlah suara yang didapatkan
        function getVotedListString() {
          let sortedPlayers = Object.values(game.players).sort((a, b) => {
            return b.votes - a.votes;
          });          
          let listString = '';
          for (let i = 0; i < sortedPlayers.length; i++) {
            let player = sortedPlayers[i];
            if (player.votes > 0) {
                let votedPlayers = player.votedPlayers;
                listString += `- @${player.id} *(${player.votes} votes)* `;
                listString += '\n';
            }
          }      
          return listString.trim();
        }
        
        // Fungsi untuk menentukan tim yang menang
        function findWinner() {
          let werewolfCount = 0;
          let otherCount = 0;
          for (let playerId in game.players) {
            let player = game.players[playerId];
            if (player.role === 'werewolf') {
              werewolfCount++;
            } else {
              otherCount++;
            }
          }
          
          if (werewolfCount >= otherCount) {
            let teks = [
`*[ Werewolf - Game ]*

🥳 Selamat kepada tim werewolf! 
🎉 Kalian berhasil mengalahkan tim villagers!
🎮 Permainan telah selesai. Terimakasih telah bermain!`, 
`[ Werewolf - Game ]

😌 Yahhh! Tim werewolf berhasil memenangkan permainan! 🐺🔥 

🎮 Permainan telah selesai, terima kasih telah bermain bersama kami. Semoga menyenangkan! 😁`, 
`[ Werewolf - Game ]
Gila! Tim werewolf berhasil mengalahkan tim villagers! 🌙🌟 

🎮 Permainan ini sudah berakhir, terima kasih telah bergabung. Sampai jumpa di permainan selanjutnya! 🙌`,
`*[ Werewolf - Game ]*

Wahh, kemenangan untuk tim werewolf! 🐺🎉 

🎮 Permainan telah selesai, terima kasih atas kesediaan bermain bersama kami. Sampai jumpa di permainan selanjutnya!`][Math.floor(Math.random() * 3)]
            conn.sendMessage(game.groupId, teks);
            return true
          } else if (werewolfCount == 0) {
            let teks = [
`*[ Werewolf - Game ]*

🥳 Selamat kepada tim villagers! 
🎉 Kalian berhasil mengalahkan werewolf dan menyelamatkan desa kalian!
🎮 Permainan telah selesai. Terimakasih telah bermain!`, 
`[ Werewolf - Game ]*

🎮 Permainan telah selesai, dan hasilnya adalah kemenangan untuk tim villagers! Yuhuu 🎉

Terima kasih telah bermain bersama kami. 😄😄😄`, 
`*[ Werewolf - Game ]*

🎉 Horeee, tim villagers menang! Kalian telah membuktikan bahwa kalian memiliki kekuatan dan kecerdasan yang tidak terkalahkan. 🎉🎉🎉

Terima kasih telah bermain bersama kami, semoga kita bisa bermain lagi suatu saat nanti. 😍😍😍`][Math.floor(Math.random() * 3)]
            conn.sendMessage(game.groupId, teks);
            return true
          } else {
            return false 
          }
        }


        // Fungsi untuk memulai sesi siang (voting)
        async function startDay() {
          if (game.state !== 'day') return 
          let winner = findWinner();
          if (winner) { 
          	setTimeout(endGame, 20 * 1000)
          } else { 
            game.total += 1
            // Reset semua database
            game.votes = {};
            game.werewolfKilled = [];
            game.protectedPlayer = [];
            game.villagerVoted = null;
            game.killedPlayer = [];
            game.seenPlayer = null;
            for (let player in game.players) { 
              console.log('player', player)
              game.players[player].votes = 0;
              delete game.players[player].hasVoted  
              delete game.players[player].hasChosenTarget 
              delete game.players[player].hasSeenTarget  
              delete game.players[player].hasProtectTarget 
            }

            game.state = 'day'; 
            let discussText = [
`*[ Werewolf - Game ]*

🌞🏡 Selamat siang, semuanya! 

📜 Berikut list pemain yang masih hidup/mati: 
${getPlayersAliveOrDead()}

🕵️‍♀️ Saatnya menguji kemampuan detektif kita. Kita cuman punya waktu ⏰ ${game.discussionDuration / 1000} detik sebelum pemungutan suara dimulai. Jadi mari gunakan waktu ini untuk menyampaikan bukti dan argumen kita. 

📆 Hari ke - ${game.total}`, 
`*[ Werewolf - Game ]*

🌞🏡 Selamat siang, semuanya! 

📜 Berikut list pemain yang masih hidup/mati: 
${getPlayersAliveOrDead()}

⏰ Waktu diskusi sebelum voting telah tiba! Siapkan strategimu dan pertimbangkan baik-baik sebelum memutuskan pemain yang akan dibunuh hari ini. Jangan lupa, kita semua adalah villagers yang bekerja sama mengalahkan werewolf 🐺

📆 Hari ke - ${game.total}`, 
`*[ Werewolf - Game ]*

🌞🏡 Selamat siang, semuanya! 

📜 Berikut list pemain yang masih hidup/mati: 
${getPlayersAliveOrDead()}

💡 Saatnya untuk berdiskusi dan memutuskan pemain yang akan dibunuh hari ini! Jangan lupa untuk mendengarkan pendapat orang lain dan memberikan alasanmu yang kuat. Kita harus bersatu untuk mengalahkan werewolf 🐺

📆 Hari ke - ${game.total}`, 
`*[ Werewolf - Game ]*

🌞🏡 Selamat siang, semuanya! 

📜 Berikut list pemain yang masih hidup/mati: 
${getPlayersAliveOrDead()}

⏳ ${game.discussionDuration / 1000} detik lagi sebelum voting dimulai! Siapkan strategimu dan pertimbangkan baik-baik sebelum memutuskan pemain yang akan dibunuh hari ini. Jangan lupa, kita harus bekerja sama untuk mengalahkan werewolf 🐺

📆 Hari ke - ${game.total}`, 
`*[ Werewolf - Game ]*

🌞🏡 Selamat siang, semuanya! 

📜 Berikut list pemain yang masih hidup/mati: 
${getPlayersAliveOrDead()}

🤔 Sudah waktunya untuk berdiskusi. Kalian memiliki waktu ${game.discussionDuration / 1000} detik untuk memutuskan pemain yang akan dibunuh hari ini. Kita harus bekerja sama untuk mengalahkan werewolf 🐺 Jangan lupa untuk mendengarkan pendapat orang lain dan memberikan alasanmu yang kuat sebelum memutuskan.

📆 Hari ke - ${game.total}`][Math.floor(Math.random() * 5)]
            let discussMessage = await conn.sendMessageWithMentions(game.groupId, discussText)
            // Setelah waktu diskusi habis, beritahukan pemain untuk mulai voting
            setTimeout(async function() {
              game.state = 'vote' 
              let teks = `*[ Werewolf - Game ]*
 
🚨 Waktu diskusi telah selesai! 🚨

🗳️ Voting sesi siang telah dimulai! Reply pesan ini dengan mengirim */vote <nomor pemain>* untuk memilih pemain yang akan dihukum gantung. Kalian hanya mempunyai ⏰ ${game.discussionDuration / 1000} detik untuk memilih suara.

📝 List pemain yang dapat divoting: 
${getPlayerListString()}

⚠️ *Peringatan:* Anda hanya bisa vote sekali saat voting sesi siang. Jadi pastikan pilihanmu sudah tepat sebelum mengirimkan suara.`
              let stanzaID = await conn.sendMessageWithMentions(game.groupId, teks, { quotedMessageId: discussMessage.id._serialized })
              game.quotedStanzaID = stanzaID.id._serialized
              setTimeout(endDay, game.dayDuration);
            }, game.discussionDuration)
          }
        }
        
        
        async function endDay() {
          if (game.state !== 'vote') return
          let votedPlayers = Object.values(game.players).filter(player => player.votes > 0);
          let highestVotes = votedPlayers[0] ? votedPlayers[0].votes : 0;
          let tiedPlayers = votedPlayers.filter(player => player.votes === highestVotes);
          console.log('tied', tiedPlayers, 'voted', votedPlayers)
          let nonVoters = Object.values(game.players).filter(player => player.votes === 0);
          let nonVotersListString = '';
          if (nonVoters.length > 1) {
            for (let i = 0; i < nonVoters.length; i++) {
              nonVotersListString += `${i + 1}. @${nonVoters[i].id}\n`;
            }
           }
           
           // Jika ada pemain yang memiliki jumlah voting yang sama dan tertinggi
          if (tiedPlayers.length > 1) {
            let teks = `*[ Werewolf - Game ]*

Pemberian hasil voting telah selesai! 

🗳️ Berikut adalah list pemain yang memiliki jumlah voting terbanyak:
${getVotedListString()}

✖️ Pemain yang tidak ikut voting: 
${nonVotersListString}

📊 Karena terdapat jumlah voting yang sama-sama tinggi,
👤 Tidak ada pemain yang akan dibunuh.
🌙 Sepertinya hari mulai menjadi gelap.

🔥 Semangat untuk malam hari yang akan datang!`
            conn.sendMessageWithMentions(game.groupId, teks);
            game.state = 'night';
            setTimeout(startNight, 10 * 1000);
            return;
          }
          if (tiedPlayers.length == 0) {
            let teks = `*[ Werewolf - Game ]*

Pemberian hasil voting telah selesai! 

📊 Tidak ada pemain yang memberikan suara.
🗣️ Mari kita sama-sama lebih aktif dan bertanggung jawab dalam voting nanti.
🌙 Sepertinya hari mulai menjadi gelap.

🔥 Semangat untuk malam hari yang akan datang!`
            conn.sendMessageWithMentions(game.groupId, teks);
            game.state = 'night';
            setTimeout(startNight, 10 * 1000);
            return;
          }
          
          let killedPlayer = tiedPlayers[0];
          let teks = `*[ Werewolf - Game ]*

Pemberian hasil voting telah selesai! 

🗳️ Berikut adalah list pemain yang memiliki jumlah voting terbanyak:
${getVotedListString()}

✖️ Pemain yang tidak ikut voting: 
${nonVotersListString}`
          let messageResult = await conn.sendMessageWithMentions(game.groupId, teks);
          await sleep(5 * 1000)
          let messageAgain = [
`*[ Werewolf - Game ]*\n\n😱 Oh tidak, @${killedPlayer.id} telah dibunuh dengan dihukum gantung! Kamu tidak bisa melanjutkan permainan lagi. ${killedPlayer.role == 'werewolf' ? 'Tetapi' : 'Sayang sekali'}, peran dia adalah ${killedPlayer.role == 'werewolf' ? 'werewolf 🐺' : killedPlayer.role + ' 🙁'}. Sepertinya hari mulai menjadi gelap 🌙. Semangat untuk malam hari yang akan datang! 🔥`,
`*[ Werewolf - Game ]*\n\n💔 Sayang sekali, @${killedPlayer.id} telah dibunuh dengan dihukum gantung. Kamu tidak bisa melanjutkan permainan lagi. ${killedPlayer.role == 'werewolf' ? 'Tapi ternyata' : 'Ternyata'} peran dia adalah ${killedPlayer.role == 'werewolf' ? 'werewolf 🐺' : killedPlayer.role + ' yang tidak beruntung 🙁'}. Sepertinya hari mulai menjadi gelap 🌙. Semangat untuk malam hari yang akan datang! 🔥`,
`*[ Werewolf - Game ]*\n\n😢 @${killedPlayer.id} telah dibunuh dengan dihukum gantung karena memiliki jumlah voting terbanyak. ${killedPlayer.role == 'werewolf' ? 'Tapi ternyata' : 'Ternyata'} peran dia adalah ${killedPlayer.role == 'werewolf' ? 'werewolf 🐺' : killedPlayer.role + ' yang tidak beruntung 💔'}. Sepertinya hari mulai menjadi gelap 🌙. Semangat untuk malam hari yang akan datang! 🔥`][Math.floor(Math.random() * 3)] 
          conn.sendMessageWithMentions(game.groupId, messageAgain, { quotedMessageId: messageResult.id._serialized });
          let killMessage = [
"*[ Werewolf - Game ]*\n\nYahh! Kamu telah dibunuh dengan dihukum gantung 💀 Sayang sekali, permainanmu di sini sudah berakhir 💔 Tapi jangan menyerah, coba lagi di permainan berikutnya 💪🏼",
"*[ Werewolf - Game ]*\n\nGantung!!! Kamu telah terbunuh dan tidak bisa melanjutkan permainan 💀 Selamat tinggal, semoga bisa bertemu lagi di permainan berikutnya 😅",
"*[ Werewolf - Game ]*\n\nAduh, kamu tertangkap basah oleh voting terbanyak dan terpaksa harus dihukum gantung 💀 Sayang sekali, permainanmu di sini sudah berakhir 💔 Tapi jangan menyerah, coba lagi di permainan berikutnya 💪🏼",
"*[ Werewolf - Game ]*\n\nGame over! Kamu telah dibunuh dengan dihukum gantung 💀 Sayang sekali, permainanmu di sini sudah berakhir 💔 Tapi jangan menyerah, coba lagi di permainan berikutnya 💪🏼",
"*[ Werewolf - Game ]*\n\nKamu terkena imbas dari voting terbanyak dan harus dihukum gantung 💀 Sayang sekali, permainanmu di sini sudah berakhir 💔 Tapi jangan menyerah, coba lagi di permainan berikutnya 💪🏼"][Math.floor(Math.random() * 5)]
          conn.sendMessage(killedPlayer.id, killMessage, { quotedMessageId: messageResult.id._serialized });
          delete game.players[killedPlayer.id];
          game.allPlayers[killedPlayer.id].alive = false 
          game.state = 'night';
          let winner = findWinner();
          if (winner) { 
          	setTimeout(endGame, 10 * 1000)
              return
          }
          setTimeout(startNight, 10 * 1000);
        }

        // Fungsi untuk memulai sesi malam (aksi werewolf/seer/guardian)
        async function startNight() {
          if (game.state !== 'night') return
          let winner = findWinner();
          if (winner) { 
          	setTimeout(endGame, 10 * 1000)
              return
          }
          game.state = 'night';
          let nightText = [
`*[ Werewolf - Game ]*

🌙 Malam telah tiba, desa semakin sepi. Sebagian telah tertidur kelelahan, sebagian masih memikirkan gebetan. (ง•‌-•‌)ง  

🌃 Pemain malam hari: kalian punya 90 detik untuk menjalankan aksimu!

Untuk pemain *werewolf/seer/guardian*, silahkan melihat pesan yang dikirim oleh bot 🤖.

Jangan lupa, selama malam hari kita harus tetap diam dan menjaga rahasia kita 🤫

Semoga malam ini kita bisa memenangkan permainan 🏆`, 
`*[ Werewolf - Game ]*

🌙 Malam hari telah tiba! Ini saatnya werewolf, seer, dan guardian melakukan tugas mereka. Semua pemain harus tenang dan membiarkan aksi terjadi. Jangan sampai terlalu terlena, ya! 💤

Untuk pemain *werewolf/seer/guardian*, silahkan melihat pesan yang dikirim oleh bot 🤖.

Jangan lupa, selama malam hari kita harus tetap diam dan menjaga rahasia kita 🤫

Semoga malam ini kita bisa memenangkan permainan 🏆`, 
`*[ Werewolf - Game ]*

🌙 Saatnya werewolf, seer, dan guardian melakukan tugas mereka! Jangan lupa, semua pemain harus tenang dan membiarkan aksi terjadi. 🌙

Untuk pemain *werewolf/seer/guardian*, silahkan melihat pesan yang dikirim oleh bot 🤖.

Jangan lupa, selama malam hari kita harus tetap diam dan menjaga rahasia kita 🤫

Semoga malam ini kita bisa memenangkan permainan 🏆`, 
`*[ Werewolf - Game ]*

🌝 Malam hari sudah datang, werewolf dan guardian harus siap untuk menjalankan tugasnya. Jangan sampai terlalu terlena, ya! 💤

Untuk pemain *werewolf/seer/guardian*, silahkan melihat pesan yang dikirim oleh bot 🤖.

Jangan lupa, selama malam hari kita harus tetap diam dan menjaga rahasia kita 🤫

Semoga malam ini kita bisa memenangkan permainan 🏆`, 
`*[ Werewolf - Game ]*

🌝 Ini saatnya *werewolf/seer/guardian* melakukan aksinya di malam hari! Jangan lupa, semua pemain harus tenang dan membiarkan aksi terjadi. 🌑

Untuk pemain *werewolf/seer/guardian*, silahkan melihat pesan yang dikirim oleh bot 🤖.

Jangan lupa, selama malam hari kita harus tetap diam dan menjaga rahasia kita 🤫

Semoga malam ini kita bisa memenangkan permainan 🏆`, 
`*[ Werewolf - Game ]*

🌒 90 detik untuk werewolf/guardian/seer akan menjalankan tugas mereka. Jangan lupa, semua pemain harus tenang dan membiarkan aksi terjadi. 🌒

Untuk pemain *werewolf/seer/guardian*, silahkan melihat pesan yang dikirim oleh bot 🤖.

Jangan lupa, selama malam hari kita harus tetap diam dan menjaga rahasia kita 🤫

Semoga malam ini kita bisa memenangkan permainan 🏆`][Math.floor(Math.random() * 6)]
          let messageNight = await conn.sendMessage(game.groupId, nightText);
          await sleep(5 * 1000)
          for (let playerId in game.players) {
            let player = game.players[playerId];
            if ((player.role === 'werewolf' || player.role === 'seer' || player.role === 'guardian')) {
              let listString = getPlayerListString();
              if (player.role === 'werewolf') {
                let teks = [
`*[ Werewolf - Game ]*

🌙 Malam hari telah tiba, waktunya untuk beraksi sebagai werewolf 🐺 Ayo lihat role pemain yang berperan sebagai werewolf! Ketik */kill <nomor pemain>* untuk membunuh pemain yang dipilih 💀.

📜 List pemain yang dapat dipilih:
${listString}

⚠️ *Ingat*, kamu hanya bisa membunuh satu pemain saat ini!`,
`*[ Werewolf - Game ]*

🌙 Malam hari telah tiba, waktunya untuk 🐺 Werewolf untuk menjalankan tugasnya. Gunakan command */kill <nomor pemain>* untuk membunuh pemain yang kamu pilih 💀 Siapkan strategimu dengan baik!

📜 List pemain yang dapat dipilih:
${listString}

⚠️ *Ingat*, kamu hanya bisa membunuh satu pemain saat ini!`,
`*[ Werewolf - Game ]*

Werewolf, saatnya kamu menunjukkan aksimu di malam hari ini 🌙 Gunakan command */kill <nomor pemain>* untuk membunuh pemain yang kamu pilih.

📜 List pemain yang dapat dipilih:
${listString}

⚠️ *Ingat*, kamu hanya bisa membunuh satu pemain saat ini!`,
`*[ Werewolf - Game ]*

🌃 Malam hari telah tiba, saatnya Werewolf menjalankan aksinya 🌙 Gunakan command */kill <nomor pemain>* untuk membunuh pemain yang kamu pilih.

📜 List pemain yang dapat dipilih:
${listString}

⚠️ *Ingat*, kamu hanya bisa menerawang satu pemain saat ini!`,
`*[ Werewolf - Game ]*

🌃 Malam hari telah tiba, waktunya Werewolf untuk menjalankan tugasnya 🌙 Gunakan command */kill <nomor pemain>* untuk membunuh pemain yang kamu pilih.

📜 List pemain yang dapat dipilih:
${listString}

⚠️ *Ingat*, kamu hanya bisa membunuh satu pemain saat ini!`][Math.floor(Math.random() * 5)]
                conn.sendMessageWithMentions(player.id, teks, { quotedMessageId: messageNight.id._serialized });
              } else if (player.role === 'seer') {
                let teks = [
`*[ Werewolf - Game ]*

🌙 Malam hari telah tiba, waktunya untuk beraksi sebagai seer 🔮 Ayo lihat role pemain yang berperan sebagai werewolf! Ketik */see <nomor pemain>* untuk melihat perannya 🧐.

📜 List pemain yang dapat dipilih:
${listString}

⚠️ *Ingat*, kamu hanya bisa menerawang satu pemain saat ini!`,
`*[ Werewolf - Game ]*

🌙 Malam hari telah tiba, waktunya untuk 🔮 Seer untuk menjalankan tugasnya. Gunakan command */see <nomor pemain>* untuk mengetahui role dari pemain yang kamu pilih 🔮 Siapkan strategimu dengan baik!

📜 List pemain yang dapat dipilih:
${listString}

⚠️ *Ingat*, kamu hanya bisa menerawang satu pemain saat ini!`,
`*[ Werewolf - Game ]*

Seer, saatnya kamu menunjukkan kemampuanmu di malam hari ini 🌙 Gunakan command */see <nomor pemain>* untuk mengetahui role dari pemain yang kamu pilih. Berhati-hatilah dalam memilih, karena keputusanmu dapat menentukan keberlangsungan permainan 🔮

📜 List pemain yang dapat dipilih:
${listString}

⚠️ *Ingat*, kamu hanya bisa menerawang satu pemain saat ini!`,
`*[ Werewolf - Game ]*

🌃 Malam hari telah tiba, saatnya Seer menjalankan tugasnya 🌙 Gunakan command */see <nomor pemain>* untuk mengetahui role dari pemain yang kamu pilih. Jangan lupa, tidak semua pemain seperti yang terlihat 🔮

📜 List pemain yang dapat dipilih:
${listString}

⚠️ *Ingat*, kamu hanya bisa menerawang satu pemain saat ini!`,
`*[ Werewolf - Game ]*

Seer, saatnya kamu menggunakan kekuatanmu di malam hari ini 🌙 Gunakan command */see <nomor pemain>* untuk mengetahui role dari pemain yang kamu pilih. Ingatlah, setiap keputusan yang kamu ambil dapat menentukan keberlangsungan permainan 🔮

📜 List pemain yang dapat dipilih:
${listString}

⚠️ *Ingat*, kamu hanya bisa menerawang satu pemain saat ini!`,
`*[ Werewolf - Game ]*

🌃 Malam hari telah tiba, waktunya Seer untuk menjalankan tugasnya 🌙 Gunakan command '/see <nomor pemain>' untuk mengetahui role dari pemain yang kamu pilih. Jangan sia-siakan kesempatanmu, segera gunakan kekuatanmu untuk mengalahkan werewolf 🔮

📜 List pemain yang dapat dipilih:
${listString}

⚠️ *Ingat*, kamu hanya bisa menerawang satu pemain saat ini!`][Math.floor(Math.random() * 6)]
                conn.sendMessageWithMentions(player.id, teks, { quotedMessageId: messageNight.id._serialized });
              } else if (player.role === 'guardian') {
                let teks = [
`*[ Werewolf - Game ]*

🌙 Malam hari telah tiba, waktunya untuk beraksi sebagai guardian 👼 Ayo lindungi pemain yang berperan sebagai villagers/seer! Ketik */protect <nomor pemain>* untuk melindunginya 🛡️.

📜 List pemain yang dapat dipilih:
${listString}

⚠️ *Ingat*, kamu hanya bisa melindungi satu pemain saat ini!`,
`*[ Werewolf - Game ]*

🌙 Malam hari telah tiba, waktunya untuk 👼 Guardian untuk menjalankan tugasnya. Gunakan command */protect <nomor pemain>* untuk melindungi pemain yang kamu pilih 🔮 Siapkan strategimu dengan baik!

📜 List pemain yang dapat dipilih:
${listString}

⚠️ *Ingat*, kamu hanya bisa melindungi satu pemain saat ini!`,
`*[ Werewolf - Game ]*

Guardian, saatnya kamu menunjukkan kemampuanmu di malam hari ini 🌙 Gunakan command */see <nomor pemain>* untuk melindungi pemain yang kamu pilih. Berhati-hatilah dalam memilih, karena keputusanmu dapat menentukan keberlangsungan permainan 👼

📜 List pemain yang dapat dipilih:
${listString}

⚠️ *Ingat*, kamu hanya bisa melindungi satu pemain saat ini!`,
`*[ Werewolf - Game ]*

🌃 Malam hari telah tiba, saatnya Guardian menjalankan tugasnya 🌙 Gunakan command */see <nomor pemain>* untuk melindungi pemain yang kamu pilih. Jangan sampai kamu melindungi pemain werewolf 💀

📜 List pemain yang dapat dipilih:
${listString}

⚠️ *Ingat*, kamu hanya bisa melindungi satu pemain saat ini!`,
`*[ Werewolf - Game ]*

Guardian, saatnya kamu melindungi pemain di malam hari ini 🌙 Gunakan command */protect <nomor pemain>* untuk melindungi pemain yang kamu pilih. Ingatlah, setiap keputusan yang kamu ambil dapat menentukan keberlangsungan permainan 👼

📜 List pemain yang dapat dipilih:
${listString}

⚠️ *Ingat*, kamu hanya bisa melindungi satu pemain saat ini!`][Math.floor(Math.random() * 5)]
                conn.sendMessageWithMentions(player.id, teks, { quotedMessageId: messageNight.id._serialized });
              }
            }
          }
          setTimeout(endNight, game.nightDuration);
        }

        function endNight() {
      	if (game.state !== 'night') return console.log('oi')
          game.state = 'day';
          let killedPlayers = game.killedPlayer;
          let protectedPlayers = game.protectedPlayer;
          let killedPlayerList = [];
          let protectedPlayerList = [];
          for (let killedPlayer of killedPlayers) {
            if (protectedPlayers.length > 0) { 
              for (let protectedPlayer of protectedPlayers) {
                if (protectedPlayer.id == killedPlayer.id) protectedPlayerList.push(killedPlayer.id);
              }
              conn.sendMessageWithMentions(killedPlayer.id, `*[ Werewolf - Game ]*

🎉 Wow, selamat @${killedPlayer.id}! 

😅 Kamu hampir terbunuh oleh werewolf tapi ternyata kamu dilindungi oleh guardian. Kamu masih bisa melanjutkan permainan dengan selamat ??

☀️ Siang hari hampir tiba, siapkan strategimu untuk mengalahkan werewolf 🐺`);
            } else {          
              if (killedPlayer.role !== 'werewolf') {
                conn.sendMessageWithMentions(killedPlayer.id, '*[ Werewolf - Game ]*\n\n😔 Yahh, Anda telah terbunuh oleh werewolf dan tidak bisa melanjutkan permainan. 🙏');
                game.allPlayers[killedPlayer.id].alive = false
                delete game.players[killedPlayer.id];
                killedPlayerList.push(killedPlayer.id);
              }
            }
          }
          
          let killedPlayerString = killedPlayerList.join(', @');
          let protectedPlayerString = protectedPlayerList.join(', @');
          if (killedPlayerList.length > 0) {
            if (protectedPlayerList.length == 0) {
              let teks = `*[ Werewolf - Game ]*

🌅 Pagi hari sudah tiba! 
🌙 Pada saat malam hari saat itu,

🐺 Tiba-tiba pemain @${killedPlayerString} dibunuh oleh werewolf. 

👤 Peran dari pemain @${killedPlayer.id} adalah ${killedPlayer.role}.

⛅ Matahari hampir tepat diatas kita, silahkan bersiap - siap pada siang hari yang akan datang!

📆 Hari ke - ${game.total}`
              conn.sendMessageWithMentions(game.groupId, teks);
            } else {
              let teks = `*[ Werewolf - Game ]*

🌅 Pagi hari sudah tiba! 
🌙 Pada saat malam hari saat itu,

👤 Tiba-tiba pemain @${killedPlayerString} dibunuh oleh werewolf. 

👤 Peran dari pemain @${killedPlayer.id} adalah ${killedPlayer.role}.

🛡️ Tetapi terdapat pemain @${protectedPlayerString} yang berhasil diselamatkan oleh guardian.

⛅ Matahari hampir tepat diatas kita, silahkan bersiap - siap pada siang hari yang akan datang!

📆 Hari ke - ${game.total}`
              conn.sendMessageWithMentions(game.groupId, teks);
            }	
          } else {
            let teks = `*[ Werewolf - Game ]*

🌅 Pagi hari sudah tiba! 
🌙 Pada saat malam hari saat itu,
👤 Tidak ada pemain yang dibunuh oleh werewolf.

⛅ Matahari hampir tepat diatas kita, silahkan bersiap - siap pada siang hari yang akan datang!

📆 Hari ke - ${game.total}`
            conn.sendMessageWithMentions(game.groupId, teks);
          }
          let winner = findWinner();
          if (winner) { 
          	setTimeout(endGame, 10 * 1000)
              return
          } else setTimeout(startDay, 10 * 1000);
        }
        
        function getPlayersAliveOrDead() {
          let players = Object.values(game.allPlayers);
          let message = '';
          for (let i = 0; i < players.length; i++) {
            let status = players[i].alive ? '🍃 Hidup' : `💀 Mati (${players[i].role})`;
            message += `${i + 1}. @${players[i].id} - ${status}\n`
          }
          return message.trim();
        }

        // Fungsi untuk memulai game
        function startGame() {
          game.state = 'day';
          shuffleRoles();
          game.allPlayers = Object.assign({}, game.players)
          for (let playerId in game.players) {
            let player = game.players[playerId];
            let message = `*[ Werewolf - Game ]*\n\n👋 Halo, role kamu adalah *${player.role}* ${player.role == 'werewolf' ? '🐺' : player.role == 'seer' ? '🔮' : player.role == 'guardian' ? '💂' : '👤'}. \n`;
            if (player.role === 'werewolf') {
              message += `\nTugas kamu adalah membunuh pemain lain selama malam hari. Saat malam hari kamu dapat membunuh pemain lain dengan mengetik */kill <nomor pemain>*.`;
            } else if (player.role === 'seer') {
              message += `\nTugas kamu adalah melihat peran pemain lain selama malam hari. Saat malam hari kamu dapat melihat peran pemain lain dengan mengetik */see <nomor pemain>*.`;
            } else if (player.role === 'guardian') {
              message += ` \nTugas kamu adalah melindungi pemain lain selama malam hari. Saat malam hari kamu dapat melindungi pemain lain dengan mengetik */protect <nomor pemain>*.`;
            } else {
              message += `\nTugas kamu adalah membantu tim villagers menang dengan melakukan voting pada sesi siang. Saat sesi siang kamu dapat melakukan voting dengan mengetik */vote <nomor pemain>*.`;
            }
            conn.sendMessage(player.id, message);
          }
          setTimeout(startDay, 5 * 1000);
        }

        // Fungsi untuk mengakhiri permainan
        function endGame() {
          conn.sendMessage(game.groupId, `Permainan telah selesai. Terima kasih telah bermain!`);

          // Hapus semua data permainan 
          game.players = {}
          game.votes = {}
          game.roles = []
          game.werewolfKilled = [] 
          game.protectedPlayer = []
          game.killedPlayer = []
          game.villagerVoted = null 
          game.seenPlayer = null
          game.totalPlayers = 0 
          game.totalWerewolf = 0 
          game.totalSeer = 0
          game.totalGuardian = 0 
          game.totalVillagers = 0
          game.total = 1
          game.state = 'lobby' 
          delete game.allPlayers

        } 

        if ((game.state !== 'waiting') && game.players[sender] && game.players[sender].alive) {
        	let player = game.players[sender]
        	if (body.startsWith('/vote') && game.state == 'vote' ) {
            	if (player.hasVoted) return conn.sendMessage(m.from, 'Maaf, kamu sudah mem-voting pemain saat ini.'); 
                if (!(game.quotedStanzaID == quoted.id._serialized)) return conn.sendMessageWithMentions(game.groupId, `Hmm, sepertinya @${player.id} tidak mereply pesan atas (yang saya reply). Silahkan mengirim ulang command anda dengan mereply pesan diatas.`, { quotedMessageId: game.quotedStanzaID })
                let votedPlayerIndex = text;
                if (isNaN(votedPlayerIndex) || votedPlayerIndex < 1 || votedPlayerIndex > Object.values(game.players).length) return conn.sendMessage(m.from, 'Nomor array pemain yang Anda masukkan tidak valid.');
                let votedPlayer = Object.values(game.players)[votedPlayerIndex - 1];
                votedPlayer.votes += 1;
                let votedListString = getVotedListString();
                player.hasVoted = true;
                let teks = `*[ Werewolf - Game ]*
 
🗳️ Terimakasih atas pilihanmu! 
Kamu telah vote kepada pemain @${votedPlayer.id}.

📊 Hasil voting sementara:
${getVotedListString()}

📣 Ingat, kamu hanya bisa memberikan suara sekali saja dalam setiap sesi voting!`
                conn.sendMessageWithMentions(player.id, teks, { quotedMessageId: m.id._serialized });
            } 
            
            if (body.startsWith('/kill') && !m.isGroup) {
            	if (game.state !== 'night') return conn.sendMessage(m.from, 'Sesi malam belum dimulai atau sudah selesai.');
                if (player.role !== 'werewolf') return conn.sendMessage(m.from, 'Anda bukan werewolf.');
                if (player.hasChosenTarget) return conn.sendMessage(m.from, 'Anda sudah memilih target pembunuhan.');  
                // Jika pemain belum memilih target pembunuhan 
                let targetIndex = parseInt(text) - 1;
                let targetPlayer = Object.values(game.players)[targetIndex];
                if (isNaN(targetIndex) || !targetPlayer) return conn.sendMessage(playerId, 'Nomor yang anda berikan tidak ada dalam list pemain.', { quotedMessageId: m.id._serialized });
                
                player.hasChosenTarget = true;
                game.killedPlayer.push(targetPlayer);
                let teks = `*[ Werewolf - Game ]*
 
👤 Kamu memilih untuk membunuh @${targetPlayer.id}.
📣 Ingat, kamu hanya bisa membunuh pemain sekali saja!`
                conn.sendMessageWithMentions(m.from, teks, { quotedMessageId: m.id._serialized });
            } else if (body.startsWith('/see') && !m.isGroup) {
            	if (game.state !== 'night') return conn.sendMessage(m.from, 'Sesi malam belum dimulai atau sudah selesai.');
                if (player.role !== 'seer') return conn.sendMessage(m.from, 'Anda bukan seer.');
                if (player.hasSeenTarget) return conn.sendMessage(m.from, 'Anda sudah memilih target penerawangan.');  
                // Jika pemain belum memilih target diterawang 
                let seenIndex = parseInt(text) - 1;
                let seenPlayer = Object.values(game.players)[seenIndex];
                if (isNaN(seenIndex) || !seenPlayer) return conn.sendMessage(playerId, 'Nomor yang anda berikan tidak ada dalam list pemain.', { quotedMessageId: m.id._serialized });
                
                player.hasSeenTarget = true;
                game.seenPlayer = seenPlayer;
                let teks = `*[ Werewolf - Game ]*
 
👤 Kamu memilih untuk menerawang @${seenPlayer.id}.
🔮 Peran pemain @${seenPlayer.id} adalah ${seenPlayer.role}.
📣 Ingat, kamu hanya bisa menerawang pemain sekali saja!`
                conn.sendMessageWithMentions(m.from, teks, { quotedMessageId: m.id._serialized });
            } else if (body.startsWith('/protect') && !m.isGroup) {
            	if (game.state !== 'night') return conn.sendMessage(m.from, 'Sesi malam belum dimulai atau sudah selesai.');
                if (player.role !== 'guardian') return conn.sendMessage(m.from, 'Anda bukan guardian.');
                if (player.hasProtectTarget) return conn.sendMessage(m.from, 'Anda sudah memilih target perlindungan.');  
                // Jika pemain belum memilih target dilindungi 
                let protectedIndex = parseInt(text) - 1;
                let protectedPlayer = Object.values(game.players)[protectedIndex];
                if (isNaN(protectedIndex) || !protectedPlayer) return conn.sendMessage(playerId, 'Nomor yang anda berikan tidak ada dalam list pemain.', { quotedMessageId: m.id._serialized }); 
                
                player.hasProtectTarget = true;
                game.protectedPlayer.push(protectedPlayer);
                let teks = `*[ Werewolf - Game ]*
 
👤 Kamu memilih untuk melindungi @${protectedPlayer.id}.
📣 Ingat, kamu hanya bisa melindungi pemain sekali saja!`
                conn.sendMessageWithMentions(m.from, teks, { quotedMessageId: m.id._serialized });
            }
        }

        let parseMentions = async (text) => {
        	let tagged = []
        	let parses = [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@c.us')
            for (let id of parses) tagged.push(await conn.getContactById(i))
            return tagged
        }
        
        conn.sendMessageWithMentions = async (jid, text, options = {}) => { 
        	let mentions = []
        	let parses = [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@c.us')
            let regex = /@c\.us/g
            text = text.replace(regex, '')
            for (let id of parses) mentions.push(await conn.getContactById(id))
            return conn.sendMessage(jid, text, { ...options, mentions })
        }

        conn.sendFile = async (jid, path, fileName, options = {}) => { 
        	let media = path.includes('http') ? await MessageMedia.fromUrl(path, { unsafeMime: true })  :  await MessageMedia.fromFilePath(path)
            let mime = media.filename.split('.').pop()
            if (mime == 'webm') { 
                media.filename = media.filename.split('.').slice(0, -1) + '.mp3'
                media.mimetype = 'audio/mpeg'
            }
            if (fileName) media.filename = fileName + '.' + media.filename.split('.').pop()
            
            if (options.mimetype) media.mimetype = options.mimetype
            return conn.sendMessage(jid, media, { caption: (fileName ? fileName + '.' + media.filename.split('.').pop() : media.filename), ...options })
        }
        switch (command) { 
        	case '/werewolf': {
        	    if (m.from !== game.groupId) return m.reply('Perintah hanya dapat digunakan di grup (https://chat.whatsapp.com/FIdMh612Iru1ZQgrXLp8KN)')
                if (!isGroup) return global.mess("group", m)
                if (game.state !== 'lobby') return conn.sendMessage(m.from, `${game.state == 'waiting' ? 'Silahkan mereaksi 🐺 pesan itu untuk bergabung dalam permainan.' : 'Game sudah dimulai. Anda tidak dapat lagi bergabung.'}`, { quotedMessageId: game.state == 'waiting' ? game.quotedReactID : '' });
                game.state = 'waiting'
                let reactID = await conn.sendMessageWithMentions(m.from, `Permainan telah berhasil dibuat. Silahkan me-reaksi pesan ini dengan emoji 🐺`, { quotedMessageId: m.id._serialized });
                game.quotedReactID = reactID.id._serialized
            }
            break
            case '/start-ww': {
              if (m.from !== game.groupId) return
              if (!isGroup) return global.mess("group", m)
              if (!isOwner) return m.reply('Anda bukan moderator!')
              if (game.state !== 'waiting') return m.reply('Game sudah dimulai atau sedang dalam proses.');
              if (Object.keys(game.players).length < game.minimumPlayers) return conn.sendMessage(m.from, `Belum terdapat minimal ${game.minimumPlayers - Object.keys(game.players).length} pemain yang dibutuhkan untuk memulai game.\n\n📜 List pemain yang bergabung:\n${getPlayerListString ()}`);
              let shufflePlayers = shuffleArray(game.players)
              game.players = shufflePlayers 
              conn.sendMessage(m.from, '*[ Werewolf - Game ]*\n\nBerhasil memulai permainan. Silahkan melihat chat pribadi bot masing-masing untuk melihat role yang didapatkan. 🐺💂🔮', { quotedMessageId: m.id._serialized })
              setTimeout(startGame, 5 * 1000);
            }
            break; 
            case '/list-ww': {
              if (game.state == 'waiting') return m.reply('Game belum dimulai');
              let listPlayers = getPlayersAliveOrDead() 
              let teks = `*[ Werewolf - Game ]*
 
📝 Berikut ini adalah list semua pemain: 
${listPlayers}`
              conn.sendMessageWithMentions(m.from, teks)
            }
            break;
            case '/end-ww': {
              if (game.state == 'waiting') return conn.sendMessage(m.from, 'Game belum dimulai');
              endGame()
            }
            break;
        	case prefix+'menu':
            case prefix+'help': { 
            	let timestampi = speed()
                let latensii = speed() - timestampi
            	let anu = 
`Hai, *${m._data.notifyName}* 👋
▸ *Kecepatan Respon:* ${latensii.toFixed(4)}s
▸ *Runtime:* ${runtime(process.uptime())}
▸ *Database:* MongoDB
Berikut ini adalah semua
command yang ada di PatrickBot

- *Werewolf Commands* 
▸ /werewolf 
▸ /start-ww
▸ /end-ww 
▸ /list-ww 

- *Maker Commands* 
▸ #sticker *<reply foto|video>*
▸ #stickerwm *<reply foto|video>*
▸ #toimage *<reply foto|video>*

- *Group Commands* 
▸ #caripesan *<query>*
▸ #announce *<teks>*
▸ #revokegc
▸ #linkgc 

- *Private Commands* 
▸ #confess *<nomor|nama|pesan>*

- *Social Media* 
▸ #play *<query>*
▸ #ytmp3 *<url>*
▸ #ytmp4 *<url>*
▸ #instagram *<url>*
▸ #tiktok *<url>*
▸ #mediafire *<url>*

- *Owner Commands* 
▸ > *<code>*
▸ < *<code>*
▸ #info`
                conn.sendMessage(m.from, anu)
            }
            break 
            case prefix+'info': {
                let timestampi = speed()
                let latensii = speed() - timestampi
                let respon = 
`🤖 PatrickBot Info
▸ *Response Speed:* ${latensii.toFixed(4)} _second_
▸ *Runtime:* ${runtime(process.uptime())}
▸ *Database:* Replit

💻 *Info Server:*
RAM: ${formatp(os.totalmem() - os.freemem())} / ${formatp(os.totalmem())}

👨‍💻 *NodeJS Memory Usage:*
${Object.keys(used).map((key, _, arr) => `${key.padEnd(Math.max(...arr.map(v=>v.length)),' ')}: ${formatp(used[key])}`).join('\n')}

${cpus[0] ? `▸ Total CPU Usage
${cpus[0].model.trim()} (${cpu.speed} MHZ)\n${Object.keys(cpu.times).map(type => `- *${(type + '*').padEnd(6)}: ${(100 * cpu.times[type] / cpu.total).toFixed(2)}%`).join('\n')}
CPU Core(s) Usage (${cpus.length} Core CPU)
${cpus.map((cpu, i) => `${i + 1}. ${cpu.model.trim()} (${cpu.speed} MHZ)\n${Object.keys(cpu.times).map(type => `- *${(type + '*').padEnd(6)}: ${(100 * cpu.times[type] / cpu.total).toFixed(2)}%`).join('\n')}`).join('\n\n')}` : ''}`.trim()
                conn.sendMessage(m.from, respon)
            }
            break

           /** 
                * It's a Maker Command
                * Please add features related with maker in here
                * @pa7rick
            **/
            case prefix+"s":
            case prefix+"sgif":
            case prefix+"swm":
            case prefix+"stickergif":
            case prefix+"stickerwm":
        	case prefix+"sticker": {
        	    if (!/image/.test(mime)) return m.reply(`Reply foto dengan caption ${command} packname|author`)
                let [authors, packnames] = text.split`|`
                let encmedia = await quoted.downloadMedia()
                conn.sendMessage(m.from, encmedia, { quotedMessageId: m.id._serialized, sendMediaAsSticker: true, stickerName: packnames ? packnames : global.packname, stickerAuthor: authors ? authors : global.author, stickerCategories: ['😎','😾','🗿'] })
            }
            break 
            case prefix+"toimg":
            case prefix+"tovid":
            case prefix+"tovideo":
            case prefix+"toimage": { 
            	if (!/webp/.test(mime)) return m.reply(`Hanya Support mime webp`)
                let message = await quoted.downloadMedia()
                let dir = path.join(process.cwd(), `./tmp/undefined.jpg`)
                let buff = Buffer.from(message.data, "base64")
                fs.writeFileSync(dir, buff)
                if (!quoted._data.isAnimated) {
                    let ran = await getRandom(".png")
                    exec(`ffmpeg -i ${dir} ${ran}`, (err) => {
                        fs.unlinkSync(dir)
                        if (err) throw err
                        let media = MessageMedia.fromFilePath(ran)
                        conn.sendMessage(m.from, media, { caption: `Sticker to Image`, quotedMessageId: m.id._serialized })
                        fs.unlinkSync(ran)
                    })
                } else if (quoted._data.isAnimated) {
                    let message = await quoted.downloadMedia()
                    let buff = Buffer.from(message.data, "base64")
                    fs.writeFileSync(dir, buff)
                    let webp = await webp2mp4File(dir)
                    let media = MessageMedia.fromUrl(webp.result)
                    conn.sendMessage(m.from, media, { caption: `Sticker to Video`, quotedMessageId: m.id._serialized })
                    fs.unlinkSync(dir)
                }
            } 
            break 
            case prefix+"inspect": { 
            	if (!text) return m.reply(`Kirim perintah ${command} url`)
            	let linkRegex = /chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i
                let [, code] = text.match(linkRegex) || {}
                if (!code) return m.reply(`Kirim perintah ${command} url`)
                let data = await conn.getInviteInfo(code)
                if (!data) return m.reply("Terjadi kesalahan.")
                let teks = `*Group Information*\n\n` 
                teks += `*ID:* \n${data.id._serialized}\n\n` 
                teks += `*Nama:*\n${data.subject}\n\n` 
                teks += `*Deskripsi:*\n${data.desc ? data.desc : 'No description' }${data.descTime ? `\n\n*Deskripsi terakhir diubah oleh:*\n@${data.descOwner.user}\n(${moment(data.descTime * 1000).tz('Asia/Jakarta').format('DD/MM/YYYY | HH:mm:ss')})` : '' }\n\n`
                teks += `*Total peserta:*\n${data.size} Member\n\n` 
                teks += `*Waktu dibuat:*\n${moment(data.creation * 1000).tz('Asia/Jakarta').format('DD/MM/YYYY | HH:mm:ss')}\n\n`
                teks += `*Pemilik grup:*\n${data.owner ? `@${data.owner.user}` : 'Tidak diketahui'}\n\n`
                teks += `*Kontak yang diketahui bergabung*: ${data.participants ? '\n' + data.participants.map((user, i) => ++i + '. @' + user.id._serialized.split`@`[0]).join('\n').trim() : 'Tidak ada'}\n\n`
                let mentions = []
                let id = parseMention(teks)
                for (let i of id) mentions.push(await conn.getContactById(i))
                let pp
                try {
                    pp = await conn.getProfilePicUrl(data.id._serialized) || 'https://i0.wp.com/www.gambarunik.id/wp-content/uploads/2019/06/Top-Gambar-Foto-Profil-Kosong-Lucu-Tergokil-.jpg'
                } catch {
                    pp = 'https://i0.wp.com/www.gambarunik.id/wp-content/uploads/2019/06/Top-Gambar-Foto-Profil-Kosong-Lucu-Tergokil-.jpg'
                }
                let media = await MessageMedia.fromUrl(pp)
                conn.sendMessage(m.from, media, { caption: teks, mentions, quotedMessageId: m.id._serialized })
            } 
            break 
            
            /** 
                * It's a Private Commands
                * Please add features related with group in here
                * @pa7rick
            **/
            case prefix+"confess": 
            case prefix+"menfess": { 
            	if (isGroup) return global.mess("private", m)
            	let [number, name, message] = text.split`|`
                if (isNaN(number)) return m.reply(`query "number" harus berisi angka!`)
                if (number.length < 5 || number.length > 13) return m.reply(`query "number" harus > dari 5 dan < dari 13!`)
                if (!(number || name || message)) return m.reply(`Kirim perintah ${command} nomor nama pesan\nContoh: ${command} 62xxxxxx|ur crush|hey my gf`)
                if (!number.includes("@c.us")) number = number + "@c.us"
                let isOn = await conn.isRegisteredUser(number)
                if (!isOn) return m.reply(`Nomor yang kamu isi, tidak terdaftar di whatsapp!`)
                let teks = `*From:* ${name}\n`
                teks += `*Message:*\n${message}\n───────────────\n`
                teks += `Kamu dapat membalas pesan ini\n`
                teks += `hanya 1x dengan me-reply pesan ini.\n`
                let messageId = await conn.sendMessage(number, teks, { extra: { isForwarded: true, forwardingScore: 129 }})
                conn.sendMessage(m.from, "Pesanmu dah dikirim. Silahkan tunggu balasan dia.")
                this.menfess[m.from] = { 
                	name: name,
                	messageId: messageId._data.id.id,
                	from: m.from,
                    to: number,
                	message: message 
                }
            }
            break 
            case '/next':
            case '/leave': {
            	if (isGroup) return global.mess("private", m)
                let room = Object.values(this.anonymous).find(room => room.check(sender))
                if (!room) return m.reply(`Kamu tidak sedang berada di dalam anonymous chat\nKetik */start* untuk mencari partner chat!`)
                m.reply(`Berhasil meninggalkan partner chat.`)
                let other = room.other(sender)
                if (other) conn.sendMessage(other, `Partner meninggalkan chat.\nKetik */start* untuk mencari partner chat.`)
                delete this.anonymous[room.id]
                if (command === '/leave') break
            }
            case '/start': {
            	if (isGroup) return global.mess("private", m)
                if (Object.values(this.anonymous).find(room => room.check(sender))) return m.reply(`Kamu masih berada di dalam anonymous chat\nKetik */next* untuk melewati partner chat!\nKetik */leave* untuk meninggalkan partner chat!`)
                let room = Object.values(this.anonymous).find(room => room.state === 'WAITING' && !room.check(sender))
                if (room) {
                    conn.sendMessage(room.a, `Partner telah ditemukan.\nKetik */next* untuk melewati partner chat.\nKetik */leave* untuk meninggalkan partner chat.`)
                    room.b = sender
                    room.state = 'CHATTING'
                    m.reply(`Partner telah ditemukan.\nKetik */next* untuk melewati partner chat.\nKetik */leave* untuk meninggalkan partner chat.`)
                } else {
                    let id = + new Date
                    this.anonymous[id] = {
                        id,
                        a: sender,
                        b: '',
                        state: 'WAITING',
                        check: function (who = '') {
                            return [this.a, this.b].includes(who)
                        },
                        other: function (who = '') {
                            return who === this.a ? this.b : who === this.b ? this.a : ''
                        },
                    }
                    m.reply(`Silahkan tunggu sebentar untuk mencari partner. Ketik *${prefix}leave* untuk meninggalkan anonymous chat!`)
                }
            }
            break 
            case '/akinator': {
    			if (isGroup) return global.mess("private", m)
    			if (sender in this.akinator) return m.reply('Kamu sedang ada sesi akinator.')
                this.akinator[sender] = {
                	aki: new Aki({ region: 'id', childMode: false, proxy: undefined }),
                    state: 'PLAYING' 
                }
                let aki = this.akinator[sender].aki
                await aki.start()
                teks = `*${aki.question}*\n`
                teks += `*Progress:* ${aki.progress}\n\n`
                teks += `1. Iya\n`
                teks += `2. Tidak\n`
                teks += `3. Tidak tahu\n`
                teks += `4. Mungkin\n`
                teks += `5. Mungkin tidak\n\n`
                teks += `Ketik angka/teksnya!\n`
                teks += `Ketik *#delakinator* untuk hapus sesi!`
                m.reply(teks)
    		}
    		break 
    		case '/delakinator': {
    			if (m.isGroup) return m.reply(mess.private)
    			if (!(sender in this.akinator)) return m.reply('Tidak ada sesi akinator!')
    			delete this.akinator[sender]
    			m.reply('Sukses menghapus sesi akinator!')
    		}
    		break 

            /** 
                * It's a Group Commands
                * Please add features related with group in here
                * @pa7rick
            **/
            case prefix+"caripesan": { 
            	let [text1, text2] = text.split`,`
                let fetch = await conn.searchMessages(text1, { page: 1, limit: text2 || null, chatId: m.from })
                let total = fetch.length
                let sp = total < Number(text2) ? `Hanya ditemukan ${total} pesan` : `Ditemukan ${total} pesan`
                m.reply(sp)   
                fetch.map(async ({ id }) => {
                    let { remote: remoteJid, _serialized: serial } = id
                    conn.sendMessage(m.from, "Nih Pesannya", { quotedMessageId: serial })
                })
            } 
            break 
            case prefix+"tagall": 
            case prefix+"hidetag": 
            case prefix+"announce": 
            case "@everyone": { 
            	if (!isGroup) return global.mess("group", m)
                if (!isAdmin) return global.mess("admin", m)
            	let _participants = participants.map(v => v.id._serialized)
                let mentions = []
                for (let jid of _participants) mentions.push(await conn.getChatById(jid))
                if (m.hasMedia) {
                    let message = await quoted.downloadMedia()
                    conn.sendMessage(m.from, message, { caption: text, mentions })
                } else {
                    conn.sendMessage(m.from, text, { mentions })
                }
            }
            break 
            case prefix+"revokegc":
            case prefix+"revoke": { 
                if (!isGroup) return global.mess("group", m)
                if (!isAdmin) return global.mess("admin", m)
                if (!isBotAdmin) return global.mess("botAdmin", m)
                await metadata.revokeInvite().then((res) => {
                    m.reply(jsonformat(res))
                }).catch((err) => {
                    m.reply(jsonformat(err))
                })
            }
            break 
            case prefix+"linkgc": { 
            	if (!isGroup) return global.mess("group", m)
                if (!isBotAdmin) return global.mess("botAdmin", m)
            	let link = await metadata.getInviteCode()
                conn.sendMessage(m.from, `https://chat.whatsapp.com/${link}\n\nLink Group : ${groupName}`, { linkPreview: true })
            }
            break 
            
            /** 
                * It's a Social Media 
                * Please add features related with socmed in here
                * @pa7rick
            **/
            case prefix+'play': {
    			if (!text) return m.reply(`Kirim perintah *${command}* query`)
    			let url = await yts(text)
    			if (!url) return m.reply("Video tidak ditemukan!")   
                let data = await bochil.youtubedlv2(url.all[0].url).catch((e) => { return m.reply(`Terjadi kesalahan\n\n${e}`) }) 
                let { title, thumbnail, audio } = data
    			let { quality, fileSizeH, fileSize, download } = audio['128kbps']
                let teks = `Berhasil mendapatkan data.\n`    
    		    teks += `▸ *Judul:* ${title}\n` 
                teks += `▸ *Kualitas:* 128kbps\n`
                teks += `▸ *Ukuran file:* ${fileSizeH}\n` 
                if (fileSize > 100000) { 
                    teks += `Ukuran file lebih dari 100 MB (Batas >= 100 MB)`
                    return conn.sendMessage(m.from, thumb, { caption: teks, quotedMessageId: m.id._serialized })
                } else teks += `Tunggu bentar, file lagi dikirim segera.`
        	    let thumb = await MessageMedia.fromUrl(thumbnail)
                let media = await download()
                conn.sendMessage(m.from, thumb, { caption: teks, quotedMessageId: m.id._serialized })
        	    conn.sendFile(m.from, media, title, { quotedMessageId: m.id._serialized })
            }
    		break 
            case prefix+'mp3':
    		case prefix+'ytmp3': {
    			if (!text) return m.reply(`Kirim perintah *${command}* url`)
                if (!(text.includes("youtu.be") || text.includes("youtube.com"))) return m.reply(`URL harus *youtube.com* atau *youtu.be* link.`)
                let url = checkURL(text)[0].replace('youtube.com', 'youtu.be').replace('/shorts', '').replace('?feature=share', '').replace('watch?v=', '')
    			let data = await bochil.youtubedlv2(url).catch((e) => { return m.reply(`Terjadi kesalahan\n\n${e}`) }) 
                let { title, thumbnail, audio } = data 
    			let { quality, fileSizeH, fileSize, download } = audio['128kbps']
                let teks = `Berhasil mendapatkan data.\n`    
    		    teks += `▸ *Judul:* ${title}\n` 
                teks += `▸ *Kualitas:* 128kbps\n`
                teks += `▸ *Ukuran file:* ${fileSizeH}\n` 
                if (fileSize > 100000) { 
                    teks += `Ukuran file lebih dari 100 MB (Batas >= 100 MB)`
                    return conn.sendMessage(m.from, thumb, { caption: teks, quotedMessageId: m.id._serialized })
                } else teks += `Tunggu bentar, file lagi dikirim segera.`
        	    let thumb = await MessageMedia.fromUrl(thumbnail)
                let media = await download()
                conn.sendMessage(m.from, thumb, { caption: teks, quotedMessageId: m.id._serialized })
        	    conn.sendFile(m.from, media, title, { quotedMessageId: m.id._serialized })
            }
            break 
            case prefix+'mp4':
    		case prefix+'ytmp4': {
    			if (!text) return m.reply(`Kirim perintah *${command}* url`)
                if (!(text.includes("youtu.be") || text.includes("youtube.com"))) return m.reply(`URL harus *youtube.com* atau *youtu.be* link.`)
                let url = checkURL(text)[0].replace('youtube.com', 'youtu.be').replace('/shorts', '').replace('?feature=share', '').replace('watch?v=', '')
    			let data = await bochil.youtubedlv2(url).catch((e) => { return m.reply(`Terjadi kesalahan\n\n${e}`) }) 
                let { title, thumbnail, video } = data
    			let { quality, fileSizeH, fileSize, download } = video['360p'] || video['480p']  
                let teks = `Berhasil mendapatkan data.\n`    
    		    teks += `▸ *Judul:* ${title}\n` 
                teks += `▸ *Kualitas:* 360p\n`
                teks += `▸ *Ukuran file:* ${fileSizeH}\n` 
                if (fileSize > 100000) { 
                    teks += `Ukuran file lebih dari 100 MB (Batas >= 100 MB)`
                    return conn.sendMessage(m.from, thumb, { caption: teks, quotedMessageId: m.id._serialized })
                } else teks += `Tunggu bentar, file lagi dikirim segera.`
        	    let thumb = await MessageMedia.fromUrl(thumbnail)
                let media = await download()
                conn.sendMessage(m.from, thumb, { caption: teks, quotedMessageId: m.id._serialized })
        	    conn.sendFile(m.from, media, title, { quotedMessageId: m.id._serialized })
            }
    		break
    	    case prefix+'instagram': { 
    		    if (!text) return m.reply(`Kirim perintah *${command}* url`)
    			if (!text.includes("instagram.com")) return m.reply(`URL harus *instagram.com* link.`) 
                let data = await bochil.instagramdlv2(checkURL(text)[0]).catch((e) => { return m.reply(`Terjadi kesalahan.\n\n${e}`) })
                for (let i of data) conn.sendFile(sender, i.url, 'Instagram Downloader', { quotedMessageId: m.id._serialized })
            }
    		break  
            case prefix+'tiktoknowm':
    	    case prefix+'tiktok': {
    			if (!text) return m.reply(`Kirim perintah *${command}* url`)
    			if (!text.includes("tiktok.com")) return m.reply(`URL harus *tiktok.com* link.`)
                let { video } = await bochil.tiktokdlv3(checkURL(text)[0]).catch((e) => { return m.reply(`Terjadi kesalahan\n\n${e}`) }) 
    			conn.sendFile(m.chat, video.no_watermark, 'Tiktok Downloader', { quotedMessageId: m.id._serialized })
    		}
    		break 
    		case prefix+'mediafire': {
    			if (!text) return m.reply(`Kirim perintah *${command}* url`)
    			if (!text.includes("mediafire.com")) return m.reply(`URL harus *mediafire.com* link.`)
    			global.mess("wait", m)
                let data = await bochil.mediafiredl(checkURL(text)[0]).catch((e) => { return m.reply(`Terjadi kesalahan.\n\n${e}`) })
    		    let teks = `▣ Mediafire Download\n`
    		    teks += `▸ *Judul file:* ${data.filename}\n`
    		    teks += `▸ *Tipe file:* ${data.filetype}\n` 
    		    teks += `▸ *Ekstensi:* ${data.ext}\n`
    		    teks += `▸ *Upload:* ${data.aploud}\n`
    		    teks += `▸ *Ukuran file:* ${data.filesizeH}\n`
    		    teks += `Tunggu bentar, file lagi dikirim segera.` 
               if (filesize > 100000) { 
                    teks += `Ukuran file lebih dari 100 MB (Batas >= 100 MB)`
                    return conn.sendMessage(m.from, teks, { quotedMessageId: m.id._serialized })
                } else teks += `Tunggu bentar, file lagi dikirim segera.`
    		    conn.sendMessage(m.from, teks, { quotedMessageId: m.id._serialized })
    		    conn.sendFile(m.chat, data.url, data.filename, { quotedMessageId: m.id._serialized, sendMediaAsDocument: true })
            }
    		break 
            default:
            if (sender in this.akinator) {
            	let aki = this.akinator[sender].aki
                if (aki.progress >= 70 || aki.currentStep >= 78) {
                    await aki.win().catch(e => delete this.akinator[m.sender]);
                    delete this.akinator[m.sender]
                    let thumbnail = await getBuffer(aki.answers[0].absolute_picture_path)
                    teks = `Akinator selesai.\n`
                    teks += `Mungkin karakter anda:\n`
                    teks += `*Karakter:* ${aki.answers[0].name}\n`
                    teks += `*Deskripsi:* ${aki.answers[0].description}\n\n`
                    teks += `Semoga jawabannya benar.\n`
                    teks += `Untuk bermain lagi ketik */akinator*.`
                    return conn.sendFile(m.chat, thumbnail, teks, { quotedMessageId: m.id._serialized })
                }
                if (body.toLowerCase().startsWith('1') || body.toLowerCase().startsWith('iya')) {
                	await aki.step(0).catch(e => delete this.akinator[m.sender]);
                    teks = `*${aki.question}*\n`
                    teks += `*Progress:* ${aki.progress}\n\n`
                    teks += `1. Iya\n`
                    teks += `2. Tidak\n`
                    teks += `3. Tidak tahu\n`
                    teks += `4. Mungkin\n`
                    teks += `5. Mungkin tidak\n\n`
                    teks += `Ketik angka/teksnya!\n`
                    teks += `Ketik *#delakinator* untuk hapus sesi!`
                    m.reply(teks)
                } else if (body.toLowerCase().startsWith('2') || body.toLowerCase().startsWith('tidak')) {
                	await aki.step(1).catch(e => delete this.akinator[m.sender]);
                    teks = `*${aki.question}*\n`
                    teks += `*Progress:* ${aki.progress}\n\n`
                    teks += `1. Iya\n`
                    teks += `2. Tidak\n`
                    teks += `3. Tidak tahu\n`
                    teks += `4. Mungkin\n`
                    teks += `5. Mungkin tidak\n\n`
                    teks += `Ketik angka/teksnya!\n`
                    teks += `Ketik *#delakinator* untuk hapus sesi!`
                    m.reply(teks)
                } else if (body.toLowerCase().startsWith('3') || body.toLowerCase().startsWith('tidak tahu')) {
                	await aki.step(2).catch(e => delete this.akinator[m.sender]);
                    teks = `*${aki.question}*\n`
                    teks += `*Progress:* ${aki.progress}\n\n`
                    teks += `1. Iya\n`
                    teks += `2. Tidak\n`
                    teks += `3. Tidak tahu\n`
                    teks += `4. Mungkin\n`
                    teks += `5. Mungkin tidak\n\n`
                    teks += `Ketik angka/teksnya!\n`
                    teks += `Ketik *#delakinator* untuk hapus sesi!`
                    m.reply(teks)
                } else if (body.toLowerCase().startsWith('4') || body.toLowerCase().startsWith('mungkin')) {
                	await aki.step(3).catch(e => delete this.akinator[m.sender]);
                    teks = `*${aki.question}*\n`
                    teks += `*Progress:* ${aki.progress}\n\n`
                    teks += `1. Iya\n`
                    teks += `2. Tidak\n`
                    teks += `3. Tidak tahu\n`
                    teks += `4. Mungkin\n`
                    teks += `5. Mungkin tidak\n\n`
                    teks += `Ketik angka/teksnya!\n`
                    teks += `Ketik *#delakinator* untuk hapus sesi!`
                    m.reply(teks)
                } else if (body.toLowerCase().startsWith('5') || body.toLowerCase().startsWith('mungkin tidak')) {
                	await aki.step(4).catch(e => delete this.akinator[m.sender]);
                    teks = `*${aki.question}*\n`
                    teks = `*${aki.question}*\n`
                    teks += `*Progress:* ${aki.progress}\n\n`
                    teks += `1. Iya\n`
                    teks += `2. Tidak\n`
                    teks += `3. Tidak tahu\n`
                    teks += `4. Mungkin\n`
                    teks += `5. Mungkin tidak\n\n`
                    teks += `Ketik angka/teksnya!\n`
                    teks += `Ketik *#delakinator* untuk hapus sesi!`
                    m.reply(teks)
                }
            }
            let room = Object.values(this.menfess).find(room => room.to == m.from)
            if (room && (m._data.quotedStanzaID == room.messageId)) { 
            	conn.interface.openChatWindow(room.to)
                let screenshot = await conn.pupPage.screenshot()
                let image = await jimp.read(screenshot)
                let cropImage = await image.crop(360, 0, 440, 600).getBufferAsync('image/jpeg')
                let media = new MessageMedia('image/jpeg', cropImage.toString('base64'), 'ss')
                conn.sendMessage(room.from, media, { caption: "Pesan dari dia.", extra: { isForwarded: true, forwardingScore: 129 }})
                m.reply('Terimakasih atas balasanmu.\nPesan ini akan difoto dan dikirim ke sender')
                delete this.menfess[room.from]
            }
            if ((Object.values(this.anonymous).find(room => [room.a, room.b].includes(sender) && room.state === 'CHATTING')) && m.isGroup && body.startsWith(prefix)) return m.reply(`Kamu masih berada di dalam anonymous chat\nKetik *${prefix}leave* di private chat bot untuk meninggalkan partner chat!`)
            if ((Object.values(this.anonymous).find(room => [room.a, room.b].includes(sender) && room.state === 'CHATTING')) && !m.isGroup) {
            	let room = Object.values(this.anonymous).find(room => [room.a, room.b].includes(sender) && room.state === 'CHATTING')
                let other = [room.a, room.b].find(user => user !== sender)
                if (body.startsWith(prefix) && !(body.includes('leave') || body.includes('next'))) return m.reply(`Kamu masih berada di dalam anonymous chat\nKetik *${prefix}leave* untuk meninggalkan partner chat!`)
                m.forward(other)
            } 
            
            if (body.startsWith(">")) { 
            	if (!isOwner) return
                try {
                    let evaled = await eval(body.slice(2))
                    if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
                    await m.reply(evaled)
                } catch (err) {
                    ma = util.format(err)
                    console.log(ma)
                    await m.reply(ma)
                } 
            }
            if (body.startsWith('$')) {
			    if (!isOwner) return 
			    exec(body.slice(2), (err, stdout) => {
				    if (err) return m.reply(err)
				    if (stdout) return m.reply(stdout)
			    })
			}
            if (body.startsWith("<")) {
            	if (!isOwner) return
                try {
                    let evaled = await eval('(async () => {' + body.slice(2) + '})()')
                    if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
                    await m.reply(evaled)
                } catch (err) {
                    ma = util.format(err)
                    console.log(ma)
                    await m.reply(ma)
                }
            }
        }
    } catch (e) {
        m.reply(util.format(e))
    }
}

global.reloadFile(__filename)
