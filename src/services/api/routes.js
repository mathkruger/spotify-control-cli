import express from 'express'
import { callbackHandler, loginHandler } from './handlers.js';

const app = express();

app.get('/login', loginHandler)
app.get('/callback', callbackHandler)

export {
    app
}