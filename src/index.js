import 'dotenv/config';
import readline from 'readline'
import { eventEmitter, eventNames } from './services/events.js'
import { app } from "./services/auth-service.js"
import { callTokenRequest, listActiveDevices, pausePlayCurrent, getCurrentStatus } from './services/spotify.js'

let activeDevice = null
let token = null
let server = null
let isPlaying = false
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
})

showSpotifyOptions(false)

async function loginProcess() {
    server = app.listen(8888)

    callTokenRequest()

    eventEmitter.on(eventNames.TOKEN_RECEIVED, async (params) => {
        token = params
        const currentStatus = await getCurrentStatus(token)
        isPlaying = currentStatus.isPlaying
        if (currentStatus.device) {
            activeDevice = currentStatus.device.id
        }
        showSpotifyOptions(token)
    })
}

async function chooseDevice() {
    const response = await listActiveDevices(token)
    activeDevice = response.devices[0].id
    showSpotifyOptions(token)
}

async function pausePlay() {
    await pausePlayCurrent(token, activeDevice, isPlaying)
    isPlaying = !isPlaying
    showSpotifyOptions(token)
}

function exit() {
    server.close()
    process.exit(0)
}

function showSpotifyOptions(isLoggedIn = true) {
    const options = isLoggedIn ? `
    1 - Escolher dispositivo
    2 - Pausar/Continuar
    3 - Próxima
    4 - Anterior
    0 - Sair
    ` : `
    1 - Entrar
    0 - Sair
    `

    rl.question('O que deseja fazer?' + options, async option => {
        if (option == 0) {
            return exit()
        }

        if (!isLoggedIn) {
            if (option == 1) {
                return await loginProcess()
            }
        } else {
            if (option == 1) {
                return await chooseDevice()
            }

            if (option == 2) {
                return await pausePlay()
            }
        }

        rl.close();
    })

}