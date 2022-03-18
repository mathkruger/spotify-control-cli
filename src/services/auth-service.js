import express from 'express'
import open from 'open';
import { eventEmitter, eventNames } from './events.js'

const app = express();
const client_id = process.env.SPOTIFY_CLIENT_ID;
const redirect_uri = process.env.SPOTIFY_REDIRECT_URL;

function generateRandomString(length) {
    let text = ''
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
}

app.get('/login', async function (req, res) {
    const state = generateRandomString(16)
    const scope = 'user-read-private user-read-email user-read-playback-state user-modify-playback-state user-read-currently-playing'

    const url = 'https://accounts.spotify.com/authorize?' +
    new URLSearchParams({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
    })

    open(url)    
    res.sendStatus(200)
})

app.get('/callback', async function (req, res) {
    const code = req.query.code || null
    const state = req.query.state || null

    eventEmitter.emit(eventNames.CODE_RECEIVED, {code, state})
    res.send("<script>window.close()</script>")
})


export {
    app
}