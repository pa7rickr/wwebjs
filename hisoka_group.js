const { MessageMedia, Buttons } = require("whatsapp-web.js")
const chalk = require("chalk")
const { jsonformat } = require("./lib/Function")


module.exports = async (hisoka, m) => {
    try {
    	if (!m) return
        let contact = await hisoka.getContactById(m.author)
        let nameUser = contact.pushname || contact.shortName || contact.name
        let metadata = await hisoka.getChatById(m.id.remote)
        let groupName = metadata.name
        if (m.type == "description") {
            let teks = `Perubahan Deskripsi Terdeteksi\n\n` 
            teks += `▸ *Author:* @${m.author.split("@")[0]}\n`
            teks += `▸ *Dalam grup:* ${metadata.name}\n`
            teks += `▸ *Tanggal:* ${new Date(m.timestamp * 1000)}\n`
            teks += `▸ *Deskripsi baru:* ${m.body}\n`
            hisoka.sendMessage(m.id.remote, teks, { mentions: [contact] })
       } else if (m.type == "subject") {
            let teks = `Perubahan Subject Terdeteksi\n\n` 
            teks += `▸ *Author:* @${m.author.split("@")[0]}\n`
            teks += `▸ *Dalam grup:* ${metadata.name}}\n`
            teks += `▸ *Tanggal:* ${new Date(m.timestamp * 1000)}\n`
            teks += `▸ *Subject baru:* ${m.body}\n`
            hisoka.sendMessage(m.id.remote, teks, { mentions: [contact] })
       } else if (m.type == "picture") {
           let teks = `Perubahan Icon Terdeteksi\n\n` 
           teks += `▸ *Author:* @${m.author.split("@")[0]}\n`
           teks += `▸ *Dalam grup* ${metadata.name}}\n`
           teks += `▸ *Tanggal:* ${new Date(m.timestamp * 1000)}\n`
           teks += `▸ *Tipe:* ${m.body == 'set' ? 'Perubahan' : 'Penghapusan'}\n`
           let profile = await hisoka.getProfilePicUrl(m.id.remote) || 'https://i0.wp.com/www.gambarunik.id/wp-content/uploads/2019/06/Top-Gambar-Foto-Profil-Kosong-Lucu-Tergokil-.jpg'
           let message = await MessageMedia.fromUrl(profile)
           hisoka.sendMessage(m.id.remote, message, { caption: teks, mentions: [contact] })
       } else if (m.type == "ephemeral") {
           let teks = `Perubahan Ephemeral Terdeteksi\n\n` 
           teks += `▸ *Author:* @${m.author.split("@")[0]}\n`
           teks += `▸ *Dalam grup:* ${metadata.name}}\n`
           teks += `▸ *Tanggal:* ${new Date(m.timestamp * 1000)}\n`
           teks += `▸ *Tipe:* ${m.body}\n`
           hisoka.sendMessage(m.id.remote, teks, { mentions: [contact] })
       } else if (m.type == "announce") {
           let teks = `Perubahan Announce Terdeteksi\n\n` 
           teks += `▸ *Author:* @${m.author.split("@")[0]}\n`
           teks += `▸ *Dalam grup:* ${metadata.name}}\n\n`
           teks += `▸ *Tanggal:* ${new Date(m.timestamp * 1000)}\n`
           teks += `Sekarang, mengirim pesan ${(m.body == "on") ? "hanya bisa admin" : "bisa semua member"}\n`
           hisoka.sendMessage(m.id.remote, teks, { mentions: [contact] })
       } else if (m.type == "restrict") {
           let teks = `Perubahan Restrict Terdeteksi\n\n` 
           teks += `▸ *Author:* @${m.author.split("@")[0]}\n`
           teks += `▸ *Dalam grup:* ${metadata.name}}\n`
           teks += `▸ *Tanggal:* ${new Date(m.timestamp * 1000)}\n\n`
           teks += `Sekarang, edit info grup ${(m.body == "on") ? "hanya bisa admin" : "bisa semua member"}\n`
           hisoka.sendMessage(m.id.remote, teks, { mentions: [contact] })
       } else if (m.type == "promote") {
           let participants = m.recipientIds
           for (let jid of participants) {
               let contactJid = await hisoka.getContactById(jid)
               try { ppuser = await hisoka.getProfilePicUrl(contactJid) } catch { ppuser = 'https://i0.wp.com/www.gambarunik.id/wp-content/uploads/2019/06/Top-Gambar-Foto-Profil-Kosong-Lucu-Tergokil-.jpg' } 
               let media = await MessageMedia.fromUrl(ppuser)
               let teks = `Penambahan Moderator/Admin\n\n` 
               teks += `▸ *Sender:* @${jid.split("@")[0]}\n`
               teks += `▸ *Ditambah oleh:* @${m.author.split("@")[0]}\n`
               teks += `▸ *Tanggal:* ${new Date(m.timestamp * 1000)}\n\n`
               teks += `Selamat ${contactJid.pushname}\n`
               teks += `Kamu menjadi moderator/admin di grup ini :D\n`
               hisoka.sendMessage(m.id.remote, media, { caption: teks, mentions: [contact, contactJid] })
           }
       } else if (m.type == "demote") {
       	let participants = m.recipientIds
           for (let jid of participants) {
               let contactJid = await hisoka.getContactById(jid)
               try { ppuser = await hisoka.getProfilePicUrl(contactJid); media = await MessageMedia.fromUrl(ppuser) } catch { media = await MessageMedia.fromFilePath('./image.png')  } 
               let teks = `Penghapusan Moderator/Admin\n\n` 
               teks += `▸ *Sender:* @${jid.split("@")[0]}\n`
               teks += `▸ *Dihapus oleh:* @${m.author.split("@")[0]}\n`
               teks += `▸ *Tanggal:* ${new Date(m.timestamp * 1000)}\n\n`
               teks += `Aduhh, *${contactJid.pushname}!*\n`
               teks += `Moderator telah menghapus admin kamu :(\n`
               hisoka.sendMessage(m.id.remote, media, { caption: teks, mentions: [contact, contactJid] })
           }
       } else if (m.type == "add" && m.type == "invite") {
           let participants = m.recipientIds
           for (let jid of participants) {
               let contactJid = await hisoka.getContactById(jid)
               try { ppuser = await hisoka.getProfilePicUrl(contactJid); media = await MessageMedia.fromUrl(ppuser) } catch { media = await MessageMedia.fromFilePath('./image.png')  } 
               let teks = `Peserta Bergabung/Ditambahkan\n\n` 
               teks += `▸ *Sender:* @${jid.split("@")[0]}\n`
               teks += `${m.type == "add" ?  `▸ Ditambahkan oleh:* ${m.author.split("@")[0]}` : `▸ *Tipe:* Bergabung lewat tautan`}\n`
               teks += `▸ *Bio:* ${contactJid.getAbout()}\n`
               teks += `▸ *Tanggal:* ${new Date(m.timestamp * 1000)}\n\n`
               teks += `Hai *${contactJid.pushname}!*\n`
               teks += `Semoga harimu menyenangkan :D\n`
               hisoka.sendMessage(m.id.remote, media, { caption: teks, mentions: [contact, contactJid] })
           }
       } else if (m.type == "remove" && m.type == "leave" && m.type == "kick") {
           let participants = m.recipientIds
           for (let jid of participants) {
               let contactJid = await hisoka.getContactById(jid)
               try { ppuser = await hisoka.getProfilePicUrl(contactJid); media = await MessageMedia.fromUrl(ppuser) } catch { media = await MessageMedia.fromFilePath('./image.png')  } 
               let teks = `Peserta Keluar/Ditendang\n\n` 
               teks += `▸ *Sender:* @${jid.split("@")[0]}\n`
               teks += `${m.type == "leave" ?  `▸ *Tipe:* Keluar dari grup` : `▸ Dikeluarkan oleh:* ${m.author.split("@")[0]}`}\n`
               teks += `▸ *Tanggal:* ${contactJid.getAbout()}\n`
               teks += `▸ *Date:* ${new Date(m.timestamp * 1000)}\n\n`
               teks += `Bye *${contactJid.pushname}!*\n`
               teks += `Kenapa dia ${m.type == "leave" ? "keluar" : "dikeluarkan"}?\n`
               hisoka.sendMessage(m.id.remote, media, { caption: teks, mentions: [contact, contactJid] })
           }
       } else if (m.type == "revoke_invite") {
            let metadata = await hisoka.getChatById(m.id.remote)
            let teks = `Perubahan Undangan Terdeteksi\n\n` 
            teks += `▸ *Author:* @${m.author.split("@")[0]}\n`
            teks += `▸ *Dalam grup:* ${metadata.name}}\n`
            teks += `▸ *Tanggal:* ${new Date(m.timestamp * 1000)}\n\n`
            hisoka.sendMessage(m.id.remote, teks, { mentions: [contact] })
       }
    } catch (e) {
        console.error(e)
    }
}


global.reloadFile(__filename)