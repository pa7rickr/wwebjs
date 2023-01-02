require("./config")
const fs = require("fs")
const yargs = require("yargs/yargs")
const chalk = require("chalk")
const qrcode = require("qrcode-terminal")
const util = require("util")
const path = require("path")
const cloudDBAdapter = require('./lib/cloudDBAdapter')
const { Low, JSONFile } = require('./lib/lowdb')
const { exec, spawn, execSync } = require("child_process")
const { Client, LocalAuth, RemoteAuth, MessageMedia, Message } = require("whatsapp-web.js")
const { decryptMedia } = require("@open-wa/wa-decrypt")
const { jsonformat, sleep } = require("./lib/Function")
const { MongoStore } = require("wwebjs-mongo")
const mongoDB = require('./lib/mongoDB')
const mongoose = require("mongoose")
const Spinnies = require('spinnies')
const _ = require('lodash')

try {
    require.resolve("yt-search")
} catch(e) {
    console.log(`plugin "yt-search" is not found. Trying to installing...`)
    exec('npm i yt-search', (err, stdout) => { console.log(err) })
    
}


sleep(5000)
connect()
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())

const spins = new Spinnies({ 
	color: 'white',
    succeedColor: 'greenBright',
    disableSpins: false,
    spinner: { 
        interval: 90,
        frames: [ '🌑', '🌘', '🌗', '🌖', '🌕', '🌔', '🌓', '🌒']
     }
})

async function connect() {
    let mongojs = await mongoose.connect('mongodb+srv://pa7rickr:123Patrickr@cluster0.bo7ovfq.mongodb.net/?retryWrites=true&w=majority')
    let store = new MongoStore({ mongoose: mongoose })
    console.log(__filename)
    const conn = new Client({
        authStrategy:  new RemoteAuth({
            store: store,
            backupSyncIntervalMs: 60 * 1000
            // dataPath: `./session`
        }),
        puppeteer: {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    })
    
    if (conn) { 
    	spins.add('spinner-1', { text: "Initializing browser..." })
        await sleep(10000) 
        spins.succeed('spinner-1', { text: `Using browser folder: '${__dirname}/session/session` })
        spins.add('spinner-2', { text: "Checking Authentication..." })
    }
    
    conn.initialize()
    if (global.opts["server"]) {
        require("./lib/Server")(conn, process.env.PORT || 8000)
    } else if (!global.opts["server"]) {
        conn.on("qr", qr => {
            qrcode.generate(qr, { small: true })
            spins.update('spinner-2', { text: "Please scan qr to login." })
        })
    }
    

    conn.on("authenticated", async(auth) => {
        spins.update('spinner-2', { text: "Success to Authenticated! Try to connecting client..." })
    })

    conn.on("auth_failure", async(auth_err) => {
        console.log(auth_err)
        spins.fail('spinner-2', { text: "Failed to Authenticated! Process exited." })
        process.exit()
    })

    conn.on("ready", () => {
        spins.succeed('spinner-2', { text: "Success to Connect! Enjoy the bot (・∀・)" })
    })

    conn.on("disconnected", async(reason) => {
        console.log("Disconnect ", reason)
        connect()
    })

    conn.on("message_create", (msg) => {
        try {
            if (!msg) return
            if (!global.options.public && !msg.fromMe) return
            if (msg.id.id.startsWith("3EB") && msg.id.id.length == 20) return 
            require("./hisoka_chat").start(conn, msg)
        } catch(e) {
            console.error(e)
        }
    })
    
    conn.on("message_reaction", (msg) => {
        try {
            if (!msg) return
            require("./hisoka_chat").reaction(msg, conn)
        } catch(e) {
            console.error(e)
        }
    })
        
    conn.on("incoming_call", async (call) => { 
    	let caller = await conn.getContactById(call.from)
        conn.sendMessage(call.from, 'Sistem otomatis blokir.')
        await sleep(8000)
        await caller.block()
    })
    
    conn.on("change_state", async (state) => console.log(state))
    conn.on("group_join", async (call) => console.log(call))
    conn.on("group_leave", async (call) => console.log(call))
    conn.on("message_revoke_everyone", async (revokedMessage, m) => {  
    	try {
        	if (!(m || revokedMessage)) return 
            console.log(revokedMessage, m)
            m.reply("Terdeteksi menghapus pesan!")
            let mentions = []
            for (let i of m.mentionedIds) mentions.push(await conn.getContactById(i))
            if (['image', 'video', 'ptt', 'audio', 'document'].includes(m.type)) {
                let mediaData = await decryptMedia(m._data)
                let media = new MessageMedia(m._data.mimetype, mediaData.toString('base64'), m._data.filename)
                await conn.sendMessage(m.from, media, { caption: m.body, mentions: mentions, extra: { isForwarded: true }})
            } else if (m.type == 'sticker') {
                let mediaData = await decryptMedia(m._data)
                let media = new MessageMedia(m._data.mimetype, mediaData.toString('base64'), m._data.filename)
                await conn.sendMessage(m.from, media, { isForwarded: true,  sendMediaAsSticker: true, stickerName: global.packname, stickerAuthor: global.author })
            } else conn.sendMessage(m.from, m.body, { mentions: mentions, extra: { isForwarded: true } })
        } catch (e) { 
        	console.log(e)
        }
    })
    
    /** 
       * Use command as node . [options] or pm2 start node -- <appname> [options]
       * $ node . --db 'mongodb:xxxxxxxx' (with string!, does not work without string!)
       * $ pm2 start node -- index.js --db 'mongodb:xxxxxxxx'
       * $ node . --db 'https://xxxxxxxxx' (with string!, does not work without string!)
       * $ pm2 start node -- index.js --db 'https://xxxxxxxxx' 
    **/ 
    global.db = new Low(
        /https?:\/\//.test(opts['db'] || '') ? new cloudDBAdapter(opts['db']) : 
        /mongodb/.test(opts['db']) ? new mongoDB(opts['db']) : 
        new JSONFile('./tmp/database.json')
    )
    global.DATABASE = global.db // Backwards Compatibility
    global.loadDatabase = async function loadDatabase() {
        if (global.db.READ) return new Promise((resolve) => setInterval(function () { (!global.db.READ ? (clearInterval(this), resolve(global.db.data == null ? global.loadDatabase() : global.db.data)) : null) }, 1 * 1000))
        if (global.db.data !== null) return
        global.db.READ = true
        await global.db.read()
        global.db.READ = false
        global.db.data = {
            users: {},
            chats: {},
            settings: {},
            stats: {},
            ...(global.db.data || {})
        }
        global.db.chain = _.chain(global.db.data)
    }
    loadDatabase() 
    if (global.db.data == null) await loadDatabase() 
    if (global.db) setInterval(async () => {
        if (global.db.data) await global.db.write()
    }, 30 * 1000) // To write database every 30 seconds! 
    
    // Groups Update
    conn.on("group_update", (action) => {
        if (!action) return action
        require("./hisoka_group")(conn, action)
    })

    return conn
}

// connect()