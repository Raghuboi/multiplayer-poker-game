require('dotenv').config()
const express = require('express')
const cookieParser = require('cookie-parser')
const socketio = require('socket.io')
const http = require('http')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users')
const authRoutes = require('./routes/auth')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_ATLAS_URI)
const db = mongoose.connection
db.on('error', (error) => {
	console.error(error)
})
db.once('open', () => {
	console.log('Connected to database')
})

const PORT = process.env.PORT

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Credentials', true)
	res.header('Access-Control-Allow-Origin', req.headers.origin)
	res.header(
		'Access-Control-Allow-Methods',
		'GET,PUT,POST,DELETE,UPDATE,OPTIONS'
	)
	res.header(
		'Access-Control-Allow-Headers',
		'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept'
	)
	next()
})
app.use(express.json())
app.use(cookieParser())

app.use('/auth', authRoutes)

io.on('connection', (socket) => {
	socket.on('waiting', () => {
		socket.join('waitingRoom')

		const waitingClients = io.sockets.adapter.rooms.get('waitingRoom')

		io.to('waitingRoom').emit('waitingRoomData', {
			waiting: [...waitingClients],
		})
	})

	socket.on('waitingDisconnection', (id) => {
		if (id) io.sockets.sockets.get(id).leave('waitingRoom')
		else socket.leave('waitingRoom')

		const waitingClients = io.sockets.adapter.rooms.get('waitingRoom')

		if (waitingClients) {
			io.to('waitingRoom').emit('waitingRoomData', {
				waiting: [...waitingClients],
			})
			socket.emit('waitingRoomData', { waiting: [...waitingClients] })
		} else {
			io.to('waitingRoom').emit('waitingRoomData', { waiting: [] })
			socket.emit('waitingRoomData', { waiting: [] })
		}
	})

	socket.on('randomCode', ({ id1, id2, code }) => {
		id1 && io.sockets.sockets.get(id1).emit('randomCode', { code: code })
		id2 && io.sockets.sockets.get(id2).emit('randomCode', { code: code })
	})

	socket.on('join', (payload, callback) => {
		let numberOfUsersInRoom = getUsersInRoom(payload.room).length

		const { error, newUser } = addUser({
			id: socket.id,
			name: numberOfUsersInRoom === 0 ? 'Player 1' : 'Player 2',
			room: payload.room,
		})

		if (error) return callback(error)

		socket.join(newUser.room)

		io.to(newUser.room).emit('roomData', {
			room: newUser.room,
			users: getUsersInRoom(newUser.room),
		})
		socket.emit('currentUserData', { name: newUser.name })
		callback()
	})

	socket.on('initGameState', (gameState) => {
		const user = getUser(socket.id)
		if (user) io.to(user.room).emit('initGameState', gameState)
	})

	socket.on('updateGameState', (gameState) => {
		const user = getUser(socket.id)

		if (user) io.to(user.room).emit('updateGameState', gameState)
	})

	socket.on('sendMessage', (payload, callback) => {
		const user = getUser(socket.id)
		io.to(user.room).emit('message', { user: user.name, text: payload.message })
		callback()
	})

	socket.on('disconnection', () => {
		const user = removeUser(socket.id)
		if (user)
			io.to(user.room).emit('roomData', {
				room: user.room,
				users: getUsersInRoom(user.room),
			})
	})
})

server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
