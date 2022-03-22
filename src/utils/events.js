import { EventEmitter } from 'events'
const eventEmitter = new EventEmitter();
const eventNames = {
    CODE_RECEIVED: 'code_received',
    TOKEN_RECEIVED: 'token_received',
    ACTIVE_DEVICE_CHANGED: 'active_device_changed',
    PLAYER_STATUS_CHANGED: 'player_status_changed',
    IS_PLAYING_CHANGED: 'is_playing_changed'
}
export {
    eventEmitter,
    eventNames
}