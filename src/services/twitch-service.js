import tmi from 'tmi.js'
import { eventEmitter, eventNames } from '../utils/events.js'

const commands = {
    NEXT: '!proxima',
    PREVIOUS: '!anterior',
    SONG: '!musica'
}

function generateBotClient() {
    const client = new tmi.Client({
        options: { debug: true, messagesLogLevel: "info" },
        connection: {
            reconnect: true,
            secure: true
        },
    
        channels: [`${process.env.TWITCH_CHANNEL}`]
    })

    client.connect().catch(console.error);

    client.on('message', async (channel, tags, message, self) => {
        if (self) return;

        switch (message) {
            case commands.NEXT:
                eventEmitter.emit(eventNames.COMMAND_RECEIVED, { command: 'próxima' })
            break

            case commands.PREVIOUS:
                eventEmitter.emit(eventNames.COMMAND_RECEIVED, { command: 'anterior' })
            break

            default:
                if (message.startsWith(commands.SONG)) {
                    const args = message.replace(commands.SONG, '').trim()
                    if (args.length === 0) {
                        await sendErrorMessage(client, 'ERRO: Você precisa mandar a música corretamente "música - artista"')
                    }
                    else {
                        eventEmitter.emit(eventNames.COMMAND_RECEIVED, { command: 'trocar_de_música', args })
                    }
                }
            break
        }
    })
}

async function sendErrorMessage(client, message) {
    return await client.raw(message)
}

export {
    generateBotClient
}