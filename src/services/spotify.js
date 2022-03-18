import fetch from 'node-fetch';
import { eventEmitter, eventNames } from './events.js'

async function callTokenRequest(onTokenReceived) {
    let login_url = process.env.SPOTIFY_LOGIN_URL
    await fetch(login_url)
    
    eventEmitter.on(eventNames.CODE_RECEIVED, async (params) => {
        const response = await getToken(params.code)
        eventEmitter.emit(eventNames.TOKEN_RECEIVED, response)
    })

    eventEmitter.on(eventNames.TOKEN_RECEIVED, onTokenReceived)
}

async function getToken(code) {
    const client_id = process.env.SPOTIFY_CLIENT_ID
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET
    const redirect_uri = process.env.SPOTIFY_REDIRECT_URL

    const result = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `grant_type=authorization_code&code=${code}&redirect_uri=${redirect_uri}`
    })

    return await result.json()
}

async function listActiveDevices(token) {
    const result = await fetch('https://api.spotify.com/v1/me/player/devices', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token.access_token,
            'Content-Type': 'application/json'
        },
    })

    return await result.json()
}

async function pausePlayCurrent(token, device_id, isPlaying) {
    const result = await fetch(`https://api.spotify.com/v1/me/player/${isPlaying ? 'pause' : 'play'}?device_id=${device_id}`, {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + token.access_token,
            'Content-Type': 'application/json'
        },
    })

    return result.status === 204 ? result.text() : await result.json()
}

async function getCurrentStatus(token) {
    const result = await fetch(`https://api.spotify.com/v1/me/player`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token.access_token,
            'Content-Type': 'application/json'
        },
    })

    return result.status === 204 ? { isPlaying: false } : await result.json()
}

export {
    callTokenRequest,
    getToken,
    listActiveDevices,
    pausePlayCurrent,
    getCurrentStatus
}