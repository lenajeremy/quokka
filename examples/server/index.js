const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

// --- Helpers ---

const dataPath = (file) => path.join(__dirname, 'data', file)

function read(file) {
  return JSON.parse(fs.readFileSync(dataPath(file), 'utf8'))
}

function write(file, data) {
  fs.writeFileSync(dataPath(file), JSON.stringify(data, null, 2))
}

// In-memory token store: token → userId
const sessions = new Map()

function generateToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

function getUserFromToken(req) {
  const auth = req.headers['authorization'] || ''
  const token = auth.replace('Bearer ', '').trim()
  if (!token) return null
  const userId = sessions.get(token)
  if (!userId) return null
  return read('users.json').find((u) => u.id === userId) || null
}

function requireAuth(req, res, next) {
  const user = getUserFromToken(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  req.user = user
  next()
}

// --- Auth ---

// POST /auth/login
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' })
  }

  const users = read('users.json')
  const user = users.find((u) => u.email === email && u.password === password)

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  const token = generateToken()
  sessions.set(token, user.id)

  const { password: _, ...safeUser } = user
  res.json({ token, user: safeUser })
})

// POST /auth/logout
app.post('/auth/logout', requireAuth, (req, res) => {
  const auth = req.headers['authorization'] || ''
  const token = auth.replace('Bearer ', '').trim()
  sessions.delete(token)
  res.json({ message: 'Logged out' })
})

// GET /auth/me
app.get('/auth/me', requireAuth, (req, res) => {
  const { password: _, ...safeUser } = req.user
  res.json(safeUser)
})

// --- Posts ---

// GET /posts?_limit=&title_like=
app.get('/posts', (req, res) => {
  let posts = read('posts.json')
  const { _limit, title_like } = req.query

  if (title_like) {
    posts = posts.filter((p) =>
      p.title.toLowerCase().includes(title_like.toLowerCase())
    )
  }

  if (_limit) {
    posts = posts.slice(0, parseInt(_limit))
  }

  res.json(posts)
})

// GET /posts/:id
app.get('/posts/:id', (req, res) => {
  const posts = read('posts.json')
  const post = posts.find((p) => p.id === parseInt(req.params.id))
  if (!post) return res.status(404).json({ error: 'Post not found' })
  res.json(post)
})

// --- Todos ---

// GET /todos?search=
app.get('/todos', (req, res) => {
  let todos = read('todos.json')
  const { search, _limit } = req.query

  if (search) {
    todos = todos.filter((t) =>
      t.title.toLowerCase().includes(search.toLowerCase())
    )
  }

  if (_limit) {
    todos = todos.slice(0, parseInt(_limit))
  }

  res.json(todos)
})

// POST /todos
app.post('/todos', (req, res) => {
  const { title, userId = 1 } = req.body
  if (!title) return res.status(400).json({ error: 'title is required' })

  const todos = read('todos.json')
  const newTodo = {
    id: Math.max(0, ...todos.map((t) => t.id)) + 1,
    userId,
    title,
    completed: false,
  }

  todos.push(newTodo)
  write('todos.json', todos)
  res.status(201).json(newTodo)
})

// PATCH /todos/:id
app.patch('/todos/:id', (req, res) => {
  const todos = read('todos.json')
  const idx = todos.findIndex((t) => t.id === parseInt(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Todo not found' })

  todos[idx] = { ...todos[idx], ...req.body }
  write('todos.json', todos)
  res.json(todos[idx])
})

// DELETE /todos/:id
app.delete('/todos/:id', (req, res) => {
  const todos = read('todos.json')
  const idx = todos.findIndex((t) => t.id === parseInt(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Todo not found' })

  todos.splice(idx, 1)
  write('todos.json', todos)
  res.status(200).json({ message: 'Deleted' })
})

// --- Users ---

// GET /users
app.get('/users', (req, res) => {
  const users = read('users.json').map(({ password: _, ...u }) => u)
  res.json(users)
})

// GET /users/:id
app.get('/users/:id', (req, res) => {
  const users = read('users.json')
  const user = users.find((u) => u.id === parseInt(req.params.id))
  if (!user) return res.status(404).json({ error: 'User not found' })
  const { password: _, ...safeUser } = user
  res.json(safeUser)
})

// --- Start ---

app.listen(PORT, () => {
  console.log(`quokkajs dev server running at http://localhost:${PORT}`)
  console.log(`  POST /auth/login`)
  console.log(`  GET  /auth/me`)
  console.log(`  GET  /posts`)
  console.log(`  GET  /todos`)
  console.log(`  POST /todos`)
  console.log(`  PATCH /todos/:id`)
  console.log(`  DELETE /todos/:id`)
  console.log(`  GET  /users`)
})
