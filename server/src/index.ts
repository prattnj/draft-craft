import http from 'http'
import path from 'path'
import { WebSocketServer } from 'ws'
import sirv from 'sirv'
import { handleConnection } from './rooms'

const PORT = parseInt(process.env.PORT ?? '3014', 10)
const clientDist = path.resolve(__dirname, '../../client/dist')
const serveStatic = sirv(clientDist, { single: true })

const server = http.createServer((req, res) => serveStatic(req, res, () => {
  res.statusCode = 404
  res.end('Not found')
}))

const wss = new WebSocketServer({ server, path: '/ws' })
wss.on('connection', handleConnection)

server.listen(PORT, () => console.log(`DraftCraft server listening on http://localhost:${PORT}`))
