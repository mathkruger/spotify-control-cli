import {
    callTokenRequest,
    listActiveDevices,
    pausePlayCurrent,
    getCurrentStatus,
    skipCurrent,
    setVolume,
    getRefreshedToken
} from '../services/spotify-service.js'
import { app } from "../services/api/routes.js"
import { saveCache, readCache } from '../utils/cache-manager.js'
import { askQuestions } from '../utils/console-input.js'
import { eventEmitter, eventNames } from '../utils/events.js'

const SERVER_PORT = process.env.PORT

let activeDevice = null
let token = null
let isPlaying = false
let currentStatus = null

async function getCachedTokenOrRefresh() {
    token = readCache()

    if (token) {
        if (token.error) {
            token = null
        }
        else {
            token.expiration_date = new Date(token.expiration_date)
            const now = new Date()
    
            if (token.expiration_date < now) {
                const newToken = await getRefreshedToken(token.refresh_token)
                token = !newToken.error ? {...token, ...newToken} : null
                saveCache(token)
            }
        }
    }

    return token
}

async function loginProcess(menuCallback) {
    let server = app.listen(SERVER_PORT)

    callTokenRequest(async (received) => {
        token = received
        saveCache(token)
        server.close()
        menuCallback()
    })
}

async function getPlayerStatus() {
    currentStatus = await getCurrentStatus(token)

    isPlaying = currentStatus.is_playing
    if (currentStatus.device) {
        activeDevice = currentStatus.device.id
    }

    eventEmitter.emit(eventNames.PLAYER_STATUS_CHANGED, currentStatus)
    eventEmitter.emit(eventNames.IS_PLAYING_CHANGED, isPlaying)

}

async function chooseDevice() {
    const response = await listActiveDevices(token)
    const selected = await askQuestions([
        {
            type: "list",
            name: "device",
            message: "Escolha um dispositivo para controlar",
            choices: response.devices.map(x => x.name)
        }
    ])

    activeDevice = response.devices.find(x => x.name == selected.device).id
}

async function pausePlay() {
    await pausePlayCurrent(token, activeDevice, isPlaying)
    isPlaying = !isPlaying
    eventEmitter.emit(eventNames.IS_PLAYING_CHANGED, isPlaying)
}

async function skipMusic(method) {
    await skipCurrent(token, activeDevice, method)
}

async function changeVolume(method) {
    const currentVolume = currentStatus.device.volume_percent
    let nextVolume = 0
    switch (method) {
        default:
        case 'plus':
            nextVolume = currentVolume + 5
        break

        case 'minus':
            nextVolume = currentVolume - 5 
        break
    }

    await setVolume(token, activeDevice, nextVolume)
    await getPlayerStatus()
}

export {
    loginProcess,
    getPlayerStatus,
    chooseDevice,
    pausePlay,
    changeVolume,
    getCachedTokenOrRefresh,
    skipMusic
}