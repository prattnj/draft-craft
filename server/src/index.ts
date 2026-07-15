import { WebSocketServer } from 'ws'
import { handleConnection } from './rooms'

const PORT = parseInt(process.env.PORT ?? '3014', 10)
const wss = new WebSocketServer({ port: PORT, path: '/ws' })

wss.on('connection', handleConnection)
wss.on('listening', () => console.log(`DraftCraft server listening on ws://localhost:${PORT}/ws`))
