import { EventEmitter } from 'events'
const eventEmitter = new EventEmitter();
const eventNames = {
    CODE_RECEIVED: 'code_received',
    TOKEN_RECEIVED: 'token_received'
}
export {
    eventEmitter,
    eventNames
}