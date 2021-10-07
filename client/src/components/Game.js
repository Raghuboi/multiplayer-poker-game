import React, { useState, useEffect } from 'react'
import DECK_OF_CARDS from '../utils/deck'
import shuffleArray from '../utils/shuffleArray'
import { getHand, getWinner } from '../utils/gameFunctions'
import io from 'socket.io-client'
import queryString from 'query-string'
import Cards from './Cards'
import useSound from 'use-sound'

import shufflingSound from '../assets/sounds/shuffling-cards-1.mp3'
import checkSound from '../assets/sounds/check-sound.mp3'
import chipsSound from '../assets/sounds/chips-sound.mp3'
import cardFlipSound from '../assets/sounds/card-flip.mp3'

let socket
//const ENDPOINT = 'http://localhost:5000'
const ENDPOINT = 'https://raghu-poker-game.herokuapp.com/'

function Game(props) {
    const data = queryString.parse(props.location.search)

    // initialize socket state
    const [room, setRoom] = useState(data.roomCode)
    const [roomFull, setRoomFull] = useState(false)
    const [users, setUsers] = useState([])
    const [currentUser, setCurrentUser] = useState('')

    useEffect(() => {
        const connectionOptions =  {
            "forceNew" : true,
            "reconnectionAttempts": "Infinity",                   
            "transports" : ["websocket"]
        }
        socket = io.connect(ENDPOINT, connectionOptions)

        socket.emit('join', {room: room}, (error) => {
            if(error)
                setRoomFull(true)
        })

        //cleanup on component unmount
        return function cleanup() {
            socket.emit('disconnection')
            //shut down connnection instance
            socket.off()
        }
    }, [])

    //initialize game state
    const [gameOver, setGameOver] = useState()
    const [winner, setWinner] = useState('')
    const [turn, setTurn] = useState('')
    const [numberOfTurns, setNumberOfTurns] = useState('')
    const [player1Deck, setPlayer1Deck] = useState([])
    const [player2Deck, setPlayer2Deck] = useState([])
    const [houseDeck, setHouseDeck] = useState([])
    const [player1Chips, setPlayer1Chips] = useState('')
    const [player2Chips, setPlayer2Chips] = useState('')
    const [increment, setIncrement] = useState('')
    const [pot, setPot] = useState('')
    const [raiseAmount, setRaiseAmount] = useState('')

    const [playShufflingSound] = useSound(shufflingSound)
    const [playChipsSound] = useSound(chipsSound)
    const [playCardFlipSound] = useSound(cardFlipSound)
    const [playCheckSound] = useSound(checkSound)

     //runs once on component mount
     useEffect(() => {

        //shuffle DECK_OF_CARDS array
        const shuffledCards = shuffleArray(DECK_OF_CARDS)

        //extract 2 cards to player1Deck
        const player1Deck = shuffledCards.splice(0, 2)

        //extract 2 cards to player2Deck
        const player2Deck = shuffledCards.splice(0, 2)

        //extract 3 cards to houseDeck
        const houseDeck = shuffledCards.splice(0, 3)

        //send initial state to server
        socket.emit('initGameState', {
            gameOver: false,
            turn: 'Player 1',
            player1Deck: [...player1Deck],
            player2Deck: [...player2Deck],
            houseDeck: [...houseDeck],
            player1Chips: 500,
            player2Chips: 500,
            increment: 10,
            numberOfTurns: 0,
            pot: 0,
            raiseAmount: 0
        })

        setShuffledDeck(shuffledCards.splice(0, 2))
    }, [])

    useEffect(() => {
        socket.on('initGameState', ({ gameOver, turn, player1Deck, player2Deck, houseDeck, increment, player1Chips, player2Chips, numberOfTurns, pot 
        , raiseAmount}) => {
            setGameOver(gameOver)
            setTurn(turn)
            setPlayer1Deck(player1Deck)
            setPlayer2Deck(player2Deck)
            setHouseDeck(houseDeck)
            setIncrement(increment)
            setPlayer1Chips(player1Chips)
            setPlayer2Chips(player2Chips)
            setNumberOfTurns(numberOfTurns)
            setPot(pot)
            setRaiseAmount(raiseAmount)
        })

        socket.on('updateGameState', ({ gameOver, winner, turn, player1Deck, player2Deck, houseDeck, increment, player1Chips, player2Chips, numberOfTurns, pot
        , raiseAmount }) => {
            gameOver && setGameOver(gameOver)
            winner && setWinner(winner)
            turn && setTurn(turn)
            player1Deck && setPlayer1Deck(player1Deck)
            player2Deck && setPlayer2Deck(player2Deck)
            houseDeck && setHouseDeck(houseDeck)
            increment!==undefined && increment!==null && setIncrement(increment) 
            player1Chips!==undefined && player1Chips!==null && setPlayer1Chips(player1Chips) 
            player2Chips!==undefined && player2Chips!==null && setPlayer2Chips(player2Chips) 
            numberOfTurns && setNumberOfTurns(numberOfTurns)
            pot && setPot(pot)
            raiseAmount!==undefined && raiseAmount!==null && setRaiseAmount(raiseAmount)
        })

        socket.on("roomData", ({ users }) => {
            setUsers(users)
        })

        socket.on('currentUserData', ({ name }) => {
            setCurrentUser(name)
        })

    }, [])

    useEffect(()=> {

        socket.emit('updateGameState', {
            raiseAmount: 0
        })

        if ((numberOfTurns===0) && (users.length===2)) playShufflingSound()

        if (numberOfTurns===2) {
            socket.emit('updateGameState', {
                houseDeck: [...houseDeck, shuffledDeck[0]],
                increment: 0
            })
            playCardFlipSound()
        }

        if (numberOfTurns===4) {
            socket.emit('updateGameState', {
                houseDeck: [...houseDeck, shuffledDeck[1]],
                increment: 0
            })
            playCardFlipSound()
        }

        if (numberOfTurns===6) {
            socket.emit('updateGameState', {
                gameOver: true
            })
        }
    }, [numberOfTurns])

    function callHandler() {
        if (turn!==currentUser){
            alert('Wait for your turn!')
            return
        }
        if (currentUser==='Player 1') {
            if (player1Chips<increment) {
                alert('Not enough money!')
                return
            }
            socket.emit('updateGameState', {
                turn: 'Player 2',
                player1Chips: (player1Chips-increment),
                numberOfTurns: numberOfTurns+1,
                pot: pot+increment,
            })
            if (increment===0) playCheckSound()
            else playChipsSound()
        }

        else if (currentUser==='Player 2') {
            if (player2Chips<increment) {
                alert('Not enough money!')
                return 
            }
            socket.emit('updateGameState', {
                turn: 'Player 1',
                player2Chips: (player2Chips-increment),
                numberOfTurns: numberOfTurns+1,
                pot: pot+increment,
            })
            if (increment===0) playCheckSound()
            else playChipsSound()
        }
    }

    function raiseHandler(value) {
        if (turn!==currentUser){
            alert('Wait for your turn!')
            return
        }

        const amount = parseInt(prompt('Enter a raise amount: '))
        if (amount<=increment) alert('raise amount cannot be less/equal to '+increment)
        else if (raiseAmount>0 && amount<=raiseAmount) alert('raise amount has to be more than '+raiseAmount)
        else if (!amount) alert('Try again.')

        else if (currentUser==='Player 1') {
            if (player1Chips<amount) {
                alert('Not enough money!')
                return 
            }
            numberOfTurns%2===0 && socket.emit('updateGameState', {
                turn: 'Player 2',
                increment: amount,
                player1Chips: (player1Chips-amount),
                numberOfTurns: numberOfTurns+1,
                pot: pot+amount
            })

            numberOfTurns%2!==0 && socket.emit('updateGameState', {
                turn: 'Player 2',
                increment: amount-increment,
                player1Chips: (player1Chips-amount),
                numberOfTurns: numberOfTurns,
                pot: pot+amount,
                raiseAmount: amount
            })
            playChipsSound()
        }

        else if (currentUser==='Player 2') {
            if (player2Chips<amount) {
                alert('Not enough money!')
                return 
            }
            numberOfTurns%2===0 && socket.emit('updateGameState', {
                turn: 'Player 1',
                increment: amount,
                player2Chips: (player2Chips-amount),
                numberOfTurns: numberOfTurns+1,
                pot: pot+amount
            })

            numberOfTurns%2!==0 && socket.emit('updateGameState', {
                turn: 'Player 1',
                increment: amount-increment,
                player2Chips: (player2Chips-amount),
                numberOfTurns: numberOfTurns,
                pot: pot+amount,
                raiseAmount: amount
            })
            playChipsSound()
        }

        else alert('Try again.')
    }

    function foldHandler() {
        if (turn!==currentUser){
            alert('Wait for your turn!')
            return
        }

        if (currentUser==='Player 1') {
            socket.emit('updateGameState', {
                gameOver: true,
                winner: 'Player 2'
            })
        }

        if (currentUser==='Player 2') {
            socket.emit('updateGameState', {
                gameOver: true,
                winner: 'Player 1'
            })
        }
    }

    //local state
    const [shuffledDeck, setShuffledDeck] = useState('')
    const [restart, setRestart] = useState(false)
    
    useEffect(() => {

        if (gameOver===true && winner==='') {
            socket.emit('updateGameState', {
                winner: getWinner(getHand(player1Deck, houseDeck), getHand(player2Deck, houseDeck))
            })
        }
        
        if (restart===true) {
                    //shuffle DECK_OF_CARDS array
                    const shuffledCards = shuffleArray(DECK_OF_CARDS)
    
                    //extract 2 cards to player1Deck
                    const player1Deck = shuffledCards.splice(0, 2)
            
                    //extract 2 cards to player2Deck
                    const player2Deck = shuffledCards.splice(0, 2)
            
                    //extract 3 cards to houseDeck
                    const houseDeck = shuffledCards.splice(0, 3)
            
                    //send initial state to server
                   
                   if (winner==='Player 1') {
                    socket.emit('initGameState', {
                        gameOver: false,
                        turn: 'Player 1',
                        player1Deck: [...player1Deck],
                        player2Deck: [...player2Deck],
                        houseDeck: [...houseDeck],
                        player1Chips: player1Chips+pot,
                        player2Chips: player2Chips,
                        increment: 10,
                        numberOfTurns: 0,
                        winner: '',
                        pot: 0
                    })
                   }
    
                   else if (winner==='Player 2') {
                    socket.emit('initGameState', {
                        gameOver: false,
                        turn: 'Player 1',
                        player1Deck: [...player1Deck],
                        player2Deck: [...player2Deck],
                        houseDeck: [...houseDeck],
                        player1Chips: player1Chips,
                        player2Chips: player2Chips+pot,
                        increment: 10,
                        numberOfTurns: 0,
                        winner: '',
                        pot: 0
                    })
                   }
    
                   else if (winner==='Tie') {
                    socket.emit('initGameState', {
                        gameOver: false,
                        turn: 'Player 1',
                        player1Deck: [...player1Deck],
                        player2Deck: [...player2Deck],
                        houseDeck: [...houseDeck],
                        player1Chips: player1Chips+(pot/2),
                        player2Chips: player2Chips+(pot/2),
                        increment: 10,
                        numberOfTurns: 0,
                        winner: '',
                        pot: 0
                    })
                   }
            
                    setRestart(false)
                    setShuffledDeck(shuffledCards.splice(0, 2))
        }
    
        }, [restart])

    //console.log({raiseAmount, numberOfTurns})
    //console.log("pot: "+pot)
    //console.log("increment: "+increment)
    //console.log("Player 1: "+player1Chips)
    //console.log("Player 2: "+player2Chips)
    //console.log(getHand(player1Deck, houseDeck))
    //console.log(getHand(player2Deck, houseDeck))
    //console.log(getWinner(getHand(player1Deck, houseDeck), getHand(player2Deck, houseDeck)))

    return (
        <>
        {users && users.length===1 && <div className="waiting"><h1 className="waiting-text">⏳ Waiting for second player to join...</h1><h1 className="waiting-text">Room Code: {data.roomCode}</h1></div>}
        {users && users.length===2 && <div className="game">
        {gameOver===false && <div className="game-buttons">
            <h3>Turn: {(currentUser===turn) ? "You" : turn}</h3>
            <button className={(turn===currentUser) ? "game-button" : "game-button-disabled"} onClick={() => callHandler()}>
                {  raiseAmount===0 && increment && numberOfTurns<2 && "Buy In("+increment+")"
                || raiseAmount===0 && increment && "Call("+increment+")" 
                || raiseAmount>0 && "Call("+raiseAmount+")" 
                || "Check"}</button>
            <button className={(turn===currentUser) ? "game-button" : "game-button-disabled"} onClick={() => raiseHandler()}>Raise</button>
            <button className={(turn===currentUser) ? "game-button" : "game-button-disabled"} onClick={() => foldHandler()}>Fold</button>
        </div>}

        {gameOver===true && <div className="end-screen">
            <h1>Winner: {winner==='' && getWinner(getHand(player1Deck, houseDeck), getHand(player2Deck, houseDeck)) || winner}</h1>
            <h1>Player 1 Hand: {getHand(player1Deck, houseDeck).type}</h1>
            <h1>Player 2 Hand: {getHand(player2Deck, houseDeck).type}</h1>
            <button onClick={()=>{setRestart(true)}}>Restart</button>
            </div>}

        <Cards player1Deck={player1Deck} player2Deck={player2Deck} houseDeck={houseDeck} gameOver={gameOver} currentUser={currentUser} 
        player1Chips={player1Chips} player2Chips={player2Chips} turn={turn} 
        winner={gameOver===true && getWinner(getHand(player1Deck, houseDeck), getHand(player2Deck, houseDeck)) || ''}/>

        <div className="info-left">
            {gameOver===false && <h2>Hand: {currentUser==='Player 1' ? getHand(player1Deck, houseDeck).type : getHand(player2Deck, houseDeck).type}</h2>}
            <h2 style={{color: "#FFD700"}}>Pot ​💰​: {pot}</h2>
        </div>
        <div className="info">
            <h3 className="info-item">Room Code: {data.roomCode}</h3>
        </div>
        </div>}
    </>
    )
}

export default Game
