const express = require('express')
const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
const WebSocket = require('ws')
const jwt = require('jsonwebtoken')
const app = express()
const PORT = 8081
const RULES_DIR = path.resolve(__dirname, '../rules')
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key'

// Security middleware
const isLocalhost = (req) => {
  const ip = req.ip || req.connection.remoteAddress
  return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1'
}

const requireAuth = (req, res, next) => {
  if (!isLocalhost(req)) {
    return res.status(403).json({ error: 'Access restricted to localhost' })
  }

  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    jwt.verify(token, JWT_SECRET)
    next()
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// WebSocket server for hot reload
const wss = new WebSocket.Server({ noServer: true })

// Watch for file changes
const watcher = chokidar.watch(RULES_DIR, {
  ignored: /(^|[\/\\])\../,
  persistent: true
})

// Handle WebSocket connections
wss.on('connection', (ws, req) => {
  if (!isLocalhost(req)) {
    ws.close(1008, 'Access restricted to localhost')
    return
  }
  
  console.log('📡 Client connected to hot reload')
  
  ws.on('close', () => {
    console.log('📡 Client disconnected')
  })
})

// Notify clients of file changes
watcher.on('change', (path) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'fileChanged',
        file: path.split('/').pop()
      }))
    }
  })
})

app.use(express.json())
app.use(express.static(path.join(__dirname, 'ui')))

// Login endpoint
app.post('/api/login', (req, res) => {
  const { password } = req.body
  if (password === process.env.DASHBOARD_PASSWORD || password === 'dev-password') {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' })
    res.json({ token })
  } else {
    res.status(401).json({ error: 'Invalid credentials' })
  }
})

// Protected routes
app.get('/api/rules', requireAuth, (req, res) => {
  const files = fs.readdirSync(RULES_DIR).filter(f => f.endsWith('.mdc'))
  const result = files.map(f => ({
    name: f,
    content: fs.readFileSync(path.join(RULES_DIR, f), 'utf8')
  }))
  res.json(result)
})

app.post('/api/rules/:file', requireAuth, (req, res) => {
  const file = req.params.file
  const content = req.body.content
  if (!file.endsWith('.mdc')) return res.status(400).send("Invalid file")
  fs.writeFileSync(path.join(RULES_DIR, file), content, 'utf8')
  res.sendStatus(200)
})

const server = app.listen(PORT, () => {
  console.log(`📡 Rule dashboard live at http://localhost:${PORT}`)
  console.log('🔒 Security: Localhost-only + JWT authentication enabled')
})

// Upgrade HTTP server to WebSocket
server.on('upgrade', (request, socket, head) => {
  if (!isLocalhost(request)) {
    socket.destroy()
    return
  }
  
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request)
  })
}) 