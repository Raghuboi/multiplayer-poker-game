import React, { useState, useEffect } from 'react'
import { Link, Redirect } from 'react-router-dom'
import randomCodeGenerator from '../utils/randomCodeGenerator'
import './Homepage.css'
import io from 'socket.io-client'
import Spinner from './Spinner'

let socket
//const ENDPOINT = 'http://localhost:5000'
const ENDPOINT = 'https://raghu-poker-game.herokuapp.com/'

const Homepage = () => {
    const [waiting, setWaiting] = useState([])
    const [waitingButtonToggle, setWaitingButtonToggle] = useState(false)
    const [gameCodeButtonToggle, setGameCodeButtonToggle] = useState(false)
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
        waitingButtonToggle===false && socket.emit('waitingDisconnection')
        waitingButtonToggle===true && socket.emit('waiting')
    }, [waitingButtonToggle])

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

                {!waitingButtonToggle && <button className={gameCodeButtonToggle ? "form-button" : "home-button"} 
                onClick={()=> {setGameCodeButtonToggle(!gameCodeButtonToggle)}}>{gameCodeButtonToggle ? "Go Back" : "Use Game Code"}</button>}
                {gameCodeButtonToggle && !waitingButtonToggle && <div className='homepage-form game-code-form'>
                    <div className='game-code-join'>
                        <input id="game-code-input" type='text' placeholder='Game Code' onChange={(event) => {
                            if (event.target.value===null) alert('Try again.')
                            else setRoomCode(event.target.value)
                        }}/>
                        <Link to={`/play?roomCode=${roomCode}`}><button className="form-button">JOIN GAME</button></Link>
                    </div>
                    <h1>OR</h1>
                    <div className='game-code-create'>
                        <Link to={`/play?roomCode=${randomCodeGenerator(3)}`}><button className="form-button">CREATE GAME</button></Link>
                    </div>
                </div>}

                {!gameCodeButtonToggle && <div className="homepage-form waiting-form">
                    <button className={waitingButtonToggle ? "form-button" : "home-button"} 
                    onClick={() => {setWaitingButtonToggle(!waitingButtonToggle)}} >{waitingButtonToggle ? "Go Back" : "Use Matchmaking"}</button>
                    {waitingButtonToggle && !gameCodeButtonToggle && <div className="waiting-info">
                        <Spinner/>
                        <h1>{"Waiting, "+waiting.length+" in Queue."}</h1>
                    </div>}
                </div>}

            </div>
        </div>
    )
}

export default Homepage