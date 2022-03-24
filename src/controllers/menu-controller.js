import { askQuestions } from '../utils/console-input.js'
import { eventEmitter, eventNames } from '../utils/events.js'
import {
    loginProcess,
    getPlayerStatus,
    chooseDevice,
    pausePlay,
    changeVolume,
    getCachedTokenOrRefresh,
    skipMusic
} from './spotify-controller.js'
import {
    drawLine,
    drawText,
    drawCenteredText
} from '../utils/console.js'

let token = null
let isPlaying = null
let currentStatus = null

async function initializeApplication() {
    token = await getCachedTokenOrRefresh()

    eventEmitter.on(eventNames.TOKEN_RECEIVED, (newStatus) => {
        token = newStatus
    })

    eventEmitter.on(eventNames.PLAYER_STATUS_CHANGED, (newStatus) => {
        currentStatus = newStatus
    })

    eventEmitter.on(eventNames.IS_PLAYING_CHANGED, (newStatus) => {
        isPlaying = newStatus
    })

    showMenu()
}

async function showMenu(error = null) {
    console.clear();
    const isLoggedIn = token != null;

    if (isLoggedIn) await getPlayerStatus()

    const options = isLoggedIn ? [
        'Escolher dispositivo',
        isPlaying ? 'Pausar' : 'Continuar',
        'Próxima',
        'Anterior',
        'Aumentar volume',
        'Diminuir volume',
        'Sair'
    ] : [
        'Logar com sua conta spotify',
        'Sair'
    ]

    drawLine(false, 'green', 'bgBlack')
    drawCenteredText(' ', 'bgBlack')
    drawCenteredText('Spoti CLI', 'green', 'bold', 'bgBlack')
    drawCenteredText(' ', 'bgBlack')
    drawLine(false, 'green', 'bgBlack')

    if (error) drawText(`Aconteceu um erro na sua última ação, tente novamente: ${error}`)

    if (isLoggedIn && currentStatus.item) {
        drawText('Tocando agora:', 'dim')
        drawText(currentStatus.item.name + ' (' + currentStatus.item.album.name + ') - ' + currentStatus.item.artists[0].name, 'bgGray')
        drawLine(false, 'dim')
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

    try {
        if (selected.menu == 'sair') {
            return closeApplication()
        }
    
        if (!isLoggedIn) {
            if (selected.menu == 'logar_com_sua_conta_spotify') {
                return await loginProcess(showMenu)
            }
        } else {
            if (selected.menu == 'escolher_dispositivo') {
                await chooseDevice()
            }
    
            if (selected.menu == 'pausar' || selected.menu == 'continuar') {
                await pausePlay()
            }
    
            if (selected.menu == 'próxima') {
                await skipMusic('next')
            }
    
            if (selected.menu == 'anterior') {
                await skipMusic('previous')
            }

            if (selected.menu == 'aumentar_volume') {
                await changeVolume('plus')
            }

            if (selected.menu == 'diminuir_volume') {
                await changeVolume('minus')
            }
        }

        await showMenu()
    } catch (error) {
        await showMenu(error)
    }
}

function closeApplication() {
    console.clear()
    process.exit(0)
}

export {
    initializeApplication
}
