let express = require('express')
let qrcode = require('qrcode')
let { exec, spawn, execSync } = require("child_process")

function connect(conn, PORT) {
    let app = global.app = express()
    let _qr = 'Invalid QR'
    
    conn.on('qr', qr => {
        _qr = qr
    })
    
    app.get('/', async (req, res) => {
    	try {
    	let chat = await conn.getChats()
        let user = {
            name: conn.info.pushname || undefined,
            jid: conn.info.wid._serialized || undefined,
            phone: conn.info.phone || undefined,
            platform: conn.info.platform || undefined,
            total: { 
            	chat: chat.filter(v => v.isGroup == false).length || 0,
                group: chat.filter(v => v.isGroup == true).length || 0
            }    
        }
        res.status(200).json(user)
        } catch { 
        	res.send("Whatsapp not connected!")
        }
    })
    
    app.get('/restart', async (req, res) => {
        exec('pm2 restart', (err, stdout) => {
		    if (err) return res.send("Error while restarting.")
		    if (stdout) return res.send("Succes to restart.")
	    })
    })
    
    app.get('/qr', async (req, res) => {
        res.setHeader('content-type', 'image/png')
        res.end(await qrcode.toBuffer(_qr)) 
    })
    
    let server = app.listen(PORT, () => console.log('App listened on port', PORT))
}

module.exports = connect
