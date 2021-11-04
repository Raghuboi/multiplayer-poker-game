import React, { useState, useEffect, useContext } from 'react'
import { Redirect } from 'react-router-dom'
import randomCodeGenerator from '../../utils/randomCodeGenerator'
import './Homepage.css'
import io from 'socket.io-client'
import { UserContext } from '../../utils/UserContext'
import SignIn from '../../components/auth/SignIn'
import {
    Heading,
    VStack,
    Spacer,
    Flex
} from '@chakra-ui/react'
import WaitingButton from './WaitingButton'
import GameCodeModal from './GameCodeModal'
import SignUp from '../auth/SignUp'

let socket
const ENDPOINT = process.env.REACT_APP_ENDPOINT

const Homepage = () => {
    const [waiting, setWaiting] = useState([])
    const [waitingToggle, setWaitingToggle] = useState(false)
    const [code, setCode] = useState('')
    const { user } = useContext(UserContext)

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
        !waitingToggle && socket.emit('waitingDisconnection')
        waitingToggle && socket.emit('waiting')
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
        <div className="Homepage">
            <Flex className="noselect" justify="center" align="center" flexDir="column" flexWrap="wrap">
            {!user && <Heading m="1rem 0" color="whitesmoke" size="lg">Sign In/Register to unlock Premium features</Heading>}
            {user && <Heading m="1rem 0" color="whitesmoke" size="lg">Welcome, {user.username}!</Heading>}
            <VStack w="lg" s="1rem" align="center" justify="center">
                <Spacer/>                
                <SignIn w="30%" size="lg"/>
                {!(user) && <SignUp w="30%" size="lg"/>}
                <GameCodeModal w="30%" size="lg" />
                <WaitingButton 
                    w="30%"
                    size="lg"
                    onClose={() => {setWaitingToggle(false)}} 
                    onTrigger={() => {setWaitingToggle(true)}} 
                    queueLength={waiting.length} 
                />
            </VStack>
            </Flex>
        </div> 
    )
}

export default Homepage