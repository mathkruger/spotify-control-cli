import { askQuestions } from '../utils/console-input.js'
import { eventEmitter, eventNames } from '../utils/events.js'
import {
    loginProcess,
    getPlayerStatus,
    chooseDevice,
    pausePlay,
    changeVolume,
    getCachedTokenOrRefresh,
    skipMusic,
    searchAndPlayContent
} from './spotify-controller.js'
import {
    drawLine,
    drawText,
    drawCenteredText
} from '../utils/console.js'
import { generateBotClient } from '../services/twitch-service.js'

let token = null
let isPlaying = null
let currentStatus = null

async function initializeApplication(twitchBotMode = false) {
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

    if (twitchBotMode) {
        const isLoggedIn = token != null;
        if (isLoggedIn) {
            await getPlayerStatus()
            
            generateBotClient()

            eventEmitter.on(eventNames.COMMAND_RECEIVED, async (command) => {
                drawText('Você recebeu o comando ' + command, 'green', 'bold')
                const commandSplitted = command.includes('|') ? command.split('|') : [command]
                await callSpotifyAction(commandSplitted[0], isLoggedIn, commandSplitted[1])
            })
        }
        else {
            console.log('Entre no modo convencional, faça login, e volte aqui.')
        }

    }
    else {
        showMenu()
    }
}

async function showMenu(error = null) {
    console.clear();
    const isLoggedIn = token != null;

    if (isLoggedIn) await getPlayerStatus()

    const options = isLoggedIn ? [
        'Escolher dispositivo',
        'Trocar de música',
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
        await callSpotifyAction(selected.menu, isLoggedIn)
        await showMenu()
    } catch (error) {
        await showMenu(error)
    }
}

async function callSpotifyAction(action, isLoggedIn, args = null) {
    if (action == 'sair') {
        return closeApplication()
    }

    if (!isLoggedIn) {
        if (action == 'logar_com_sua_conta_spotify') {
            return await loginProcess(showMenu)
        }
    } else {
        if (action == 'escolher_dispositivo') {
            await chooseDevice()
        }

        if (action == 'trocar_de_música') {
            if (!args) {
                const selected = await askQuestions([
                    {
                        type: "input",
                        name: "term",
                        message: "Digite a música e artista"
                    }
                ])

                await searchAndPlayContent(selected.term)
            }
            else {
                await searchAndPlayContent(args)
            }
        }

        if (action == 'pausar' || action == 'continuar') {
            await pausePlay()
        }

        if (action == 'próxima') {
            await skipMusic('next')
        }

        if (action == 'anterior') {
            await skipMusic('previous')
        }

        if (action == 'aumentar_volume') {
            await changeVolume('plus')
        }

        if (action == 'diminuir_volume') {
            await changeVolume('minus')
        }
    }
} 

function closeApplication() {
    console.clear()
    process.exit(0)
}

export {
    initializeApplication
}
