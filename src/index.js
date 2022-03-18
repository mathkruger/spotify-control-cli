import 'dotenv/config';
import { app } from "./services/auth-service.js"
import {
    callTokenRequest,
    listActiveDevices,
    pausePlayCurrent,
    getCurrentStatus,
    skipCurrent
} from './services/spotify.js'
import { askQuestions } from './utils/console-input.js';

let activeDevice = null
let token = null
let server = null
let isPlaying = false
let currentStatus = null

showSpotifyOptions()

async function loginProcess() {
    server = app.listen(8888)

    callTokenRequest(async (received) => {
        token = received
        showSpotifyOptions()
    })
}

async function getPlayerStatus() {
    currentStatus = await getCurrentStatus(token)

    isPlaying = currentStatus.is_playing
    if (currentStatus.device) {
        activeDevice = currentStatus.device.id
    }
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
    showSpotifyOptions()
}

async function pausePlay() {
    await pausePlayCurrent(token, activeDevice, isPlaying)
    isPlaying = !isPlaying
    showSpotifyOptions()
}

async function skipMusic(method) {
    await skipCurrent(token, activeDevice, method)
    showSpotifyOptions()
}

function exit() {
    console.clear()
    if (server) server.close()
    process.exit(0)
}

async function showSpotifyOptions() {
    console.clear();
    const isLoggedIn = token != null;

    if (isLoggedIn) await getPlayerStatus()

    const options = isLoggedIn ? [
        'Escolher dispositivo',
        isPlaying ? 'Pausar' : 'Continuar',
        'Próxima',
        'Anterior',
        'Sair'
    ] : [
        'Logar com sua conta spotify',
        'Sair'
    ]

    const title = `
            Spoti CLI
------------------------------------`

    console.log(title)
    if (isLoggedIn) {
        console.log(`
Tocando agora:
    `   )
        console.log(currentStatus.item.name + ' (' + currentStatus.item.album.name + ') - ' + currentStatus.item.artists[0].name)
        console.log('')
    }

    const selected = await askQuestions([
        {
            type: "list",
            name: "menu",
            message: "O que deseja fazer?",
            choices: options,
            filter(val) {
                return val.toLowerCase().replace(/ /g, '_')
            }
        }
    ])

    if (selected.menu == 'sair') {
        return exit()
    }

    if (!isLoggedIn) {
        if (selected.menu == 'logar_com_sua_conta_spotify') {
            return await loginProcess()
        }
    } else {
        if (selected.menu == 'escolher_dispositivo') {
            return await chooseDevice()
        }

        if (selected.menu == 'pausar' || selected.menu == 'continuar') {
            return await pausePlay()
        }

        if (selected.menu == 'próxima') {
            return await skipMusic('next')
        }

        if (selected.menu == 'anterior') {
            return await skipMusic('previous')
        }
    }
}