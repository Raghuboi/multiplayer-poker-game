import React, { useState, useEffect } from 'react'
import { Link, Redirect } from 'react-router-dom'
import randomCodeGenerator from '../utils/randomCodeGenerator'
import './Homepage.css'
import io from 'socket.io-client'

let socket
//const ENDPOINT = 'http://localhost:5000'
const ENDPOINT = 'https://raghu-poker-game.herokuapp.com/'

const Homepage = () => {
    const [waiting, setWaiting] = useState([])
    const [waitingToggle, setWaitingToggle] = useState(false)
    const [code, setCode] = useState('')
    const [roomCode, setRoomCode] = useState('')

    useEffect(() => {

        const connectionOptions =  {
            "forceNew" : true,
            "reconnectionAttempts": "Infinity",                   
            "transports" : ["websocket"]
        }
        socket = io.connect(ENDPOINT, connectionOptions)

        //cleanup on component unmount
        return function cleanup() {
            socket.emit('waitingDisconnection')
            //shut down connnection instance
            socket.off()
        }
    }, [])

    useEffect(() => {
        socket.on('waitingRoomData', ({ waiting }) => {
            waiting && setWaiting(waiting)
        })

        socket.on('randomCode', ({ code }) =>{
            code && setCode(code)
        })
    }, [])

    useEffect(() => {
        waitingToggle===false && socket.emit('waitingDisconnection')
        waitingToggle===true && socket.emit('waiting')
    }, [waitingToggle])

    if (waiting.length>=2) {

        const users = waiting.slice(0,2)

        socket.emit('randomCode', {
            id1: users[0],
            id2: users[1],
            code: randomCodeGenerator(3)
        })

        if (users[0] === socket.id && code!=='') {
            socket && socket.emit('waitingDisconnection', (users[0]))
            return <Redirect to={`/play?roomCode=${code}`}/>
        }
        
        else if (users[1] === socket.id && code!=='') {
            socket && socket.emit('waitingDisconnection', (users[0]))
            return <Redirect to={`/play?roomCode=${code}`}/>
        }
    }

    return (
        <div className='Homepage'>
            <div className='homepage-menu'>
                <div className='homepage-form'>
                    <div className='homepage-join'>
                        <input type='text' placeholder='Game Code' onChange={(event) => {
                            if (event.target.value===null) alert('Try again.')
                            else setRoomCode(event.target.value)
                        }}  />
                        <Link to={`/play?roomCode=${roomCode}`}><button className="game-button green">JOIN GAME</button></Link>
                    </div>
                    <h1>OR</h1>
                    <div className='homepage-create'>
                        <Link to={`/play?roomCode=${randomCodeGenerator(3)}`}><button className="game-button orange">CREATE GAME</button></Link>
                        <button onClick={() => {setWaitingToggle(!waitingToggle)}} >{waitingToggle ? waiting.length+" in Queue!" : "AUTOMATIC MATCHMAKING"}</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Homepage