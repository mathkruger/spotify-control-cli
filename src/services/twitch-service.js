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
                eventEmitter.emit(eventNames.COMMAND_RECEIVED, 'próxima')
            break

            case commands.PREVIOUS:
                eventEmitter.emit(eventNames.COMMAND_RECEIVED, 'anterior')
            break

            default:
                if (message.startsWith(commands.SONG)) {
                    const args = message.replace(commands.SONG, '').trim()
                    eventEmitter.emit(eventNames.COMMAND_RECEIVED, 'trocar_de_música|' + args)
                }
            break
        }
    })
}

export {
    generateBotClient
}