import 'dotenv/config'
import { initializeApplication } from './controllers/menu-controller.js'

const args = process.argv

await initializeApplication(args[2] === 'twitch' || args[2] === 't')