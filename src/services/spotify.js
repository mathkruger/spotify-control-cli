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

    const token = await result.json()
    token.expiration_date = generateExpirationDate(token.expires_in)

    return token
}

async function getRefreshedToken(refresh_token) {
    const client_id = process.env.SPOTIFY_CLIENT_ID
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET
    const redirect_uri = process.env.SPOTIFY_REDIRECT_URL

    const result = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `grant_type=refresh_token&refresh_token=${refresh_token}`
    })

    const token = await result.json()
    console.log(token)
    token.expiration_date = generateExpirationDate(token.expires_in)

    return token
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

    return result.status === 204 ? await result.text() : await result.json()
}

async function skipCurrent(token, device_id, method) {
    const result = await fetch(`https://api.spotify.com/v1/me/player/${method}?device_id=${device_id}`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token.access_token,
            'Content-Type': 'application/json'
        },
    })

    return result.status === 204 ? await result.text() : await result.json()
}

async function setVolume(token, device_id, value) {
    const result = await fetch(`https://api.spotify.com/v1/me/player/volume?volume_percent=${value}&device_id=${device_id}`, {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + token.access_token,
            'Content-Type': 'application/json'
        },
    })

    return result.status === 204 ? await result.text() : await result.json()
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

function generateExpirationDate(expires_in) {
    const date = new Date()
    const newHour = date.getHours() + (expires_in / 60 / 60)
    date.setHours(newHour + ((date.getTimezoneOffset() / 60) * -1))
    return date
}

export {
    callTokenRequest,
    getToken,
    getRefreshedToken,
    listActiveDevices,
    pausePlayCurrent,
    getCurrentStatus,
    skipCurrent,
    setVolume
}