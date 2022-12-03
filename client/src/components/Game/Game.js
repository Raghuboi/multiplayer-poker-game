import React, { useState, useEffect, useContext } from 'react'
import DECK_OF_CARDS from '../../utils/deck'
import shuffleArray from '../../utils/shuffleArray'
import { getHand, getWinner } from '../../utils/gameFunctions'
import io from 'socket.io-client'
import queryString from 'query-string'
import Cards from './Cards'
import useSound from 'use-sound'

import shufflingSound from '../../assets/sounds/shuffling-cards-1.mp3'
import checkSound from '../../assets/sounds/check-sound.mp3'
import chipsSound from '../../assets/sounds/chips-sound.mp3'
import cardFlipSound from '../../assets/sounds/card-flip.mp3'

import { UserContext } from '../../utils/UserContext'
import RaiseModal from './RaiseModal'
import { Button, HStack, Flex, Heading, Box } from '@chakra-ui/react'

let socket
const ENDPOINT = process.env.REACT_APP_ENDPOINT

function Game(props) {
	const data = queryString.parse(props.location.search)

	// initialize socket state
	const [room, setRoom] = useState(data.roomCode)
	const [roomFull, setRoomFull] = useState(false)
	const [users, setUsers] = useState([])
	const [currentUser, setCurrentUser] = useState('')

	const { user } = useContext(UserContext)

	useEffect(() => {
		const connectionOptions = {
			forceNew: true,
			reconnectionAttempts: 'Infinity',
			transports: ['websocket'],
		}
		socket = io.connect(ENDPOINT, connectionOptions)

		socket.emit('join', { room: room }, (error) => {
			if (error) setRoomFull(true)
		})

		//cleanup on component unmount
		return () => {
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
	const [player1Name, setPlayer1Name] = useState()
	const [player2Name, setPlayer2Name] = useState()

	const [playShufflingSound] = useSound(shufflingSound)
	const [playChipsSound] = useSound(chipsSound)
	const [playCardFlipSound] = useSound(cardFlipSound)
	const [playCheckSound] = useSound(checkSound)

	const [localHand, setLocalHand] = useState('N/A')

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
			raiseAmount: 0,
			player1Name: 'Player 1',
			player2Name: 'Player 2',
		})

		setShuffledDeck(shuffledCards.splice(0, 2))
	}, [])

	useEffect(() => {
		socket.on(
			'initGameState',
			({
				gameOver,
				winner,
				turn,
				player1Deck,
				player2Deck,
				houseDeck,
				increment,
				player1Chips,
				player2Chips,
				numberOfTurns,
				pot,
				raiseAmount,
				player1Name,
				player2Name,
			}) => {
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
				setPlayer1Name(player1Name)
				setPlayer2Name(player2Name)
				setWinner(winner)
			}
		)

		socket.on(
			'updateGameState',
			({
				gameOver,
				winner,
				turn,
				player1Deck,
				player2Deck,
				houseDeck,
				increment,
				player1Chips,
				player2Chips,
				numberOfTurns,
				pot,
				raiseAmount,
				player1Name,
				player2Name,
			}) => {
				gameOver && setGameOver(gameOver)
				winner && setWinner(winner)
				turn && setTurn(turn)
				player1Deck && setPlayer1Deck(player1Deck)
				player2Deck && setPlayer2Deck(player2Deck)
				houseDeck && setHouseDeck(houseDeck)
				increment !== undefined && increment !== null && setIncrement(increment)
				player1Chips !== undefined &&
					player1Chips !== null &&
					setPlayer1Chips(player1Chips)
				player2Chips !== undefined &&
					player2Chips !== null &&
					setPlayer2Chips(player2Chips)
				numberOfTurns && setNumberOfTurns(numberOfTurns)
				pot && setPot(pot)
				raiseAmount !== undefined &&
					raiseAmount !== null &&
					setRaiseAmount(raiseAmount)
				player1Name && setPlayer1Name(player1Name)
				player2Name && setPlayer2Name(player2Name)
			}
		)

		socket.on('roomData', ({ users }) => {
			setUsers(users)
		})

		socket.on('currentUserData', ({ name }) => {
			setCurrentUser(name)
		})
	}, [])

	useEffect(() => {
		if (
			user &&
			user.username &&
			player1Name !== user.username &&
			player2Name !== user.username
		) {
			if (currentUser === 'Player 1')
				socket.emit('updateGameState', { player1Name: user.username })
			if (currentUser === 'Player 2')
				socket.emit('updateGameState', { player2Name: user.username })
		}
		socket.emit('updateGameState', {
			raiseAmount: 0,
		})
		if (numberOfTurns === 2) {
			socket.emit('updateGameState', { increment: 0 })
			playShufflingSound()
		} else if (numberOfTurns === 4) {
			socket.emit('updateGameState', {
				houseDeck: [...houseDeck, shuffledDeck[0]],
				increment: 0,
			})
			playCardFlipSound()
		} else if (numberOfTurns === 6) {
			socket.emit('updateGameState', {
				houseDeck: [...houseDeck, shuffledDeck[1]],
				increment: 0,
			})
			playCardFlipSound()
		} else if (numberOfTurns === 8) {
			socket.emit('updateGameState', {
				gameOver: true,
				winner: getWinner(
					player1Name,
					player2Name,
					getHand(player1Deck, houseDeck),
					getHand(player2Deck, houseDeck)
				),
			})
		}

		if (!gameOver && currentUser === 'Player 1')
			setLocalHand(getHand(player1Deck, houseDeck))
		else if (!gameOver && currentUser === 'Player 2')
			setLocalHand(getHand(player2Deck, houseDeck))
	}, [numberOfTurns])

	async function callHandler() {
		if (currentUser === 'Player 1') {
			socket.emit('updateGameState', {
				turn: 'Player 2',
				player1Chips: player1Chips - increment,
				numberOfTurns: numberOfTurns + 1,
				pot: pot + increment,
			})
			if (increment === 0) playCheckSound()
			else playChipsSound()
		} else if (currentUser === 'Player 2') {
			socket.emit('updateGameState', {
				turn: 'Player 1',
				player2Chips: player2Chips - increment,
				numberOfTurns: numberOfTurns + 1,
				pot: pot + increment,
			})
			if (increment === 0) playCheckSound()
			else playChipsSound()
		}
	}

	async function raiseHandler(amount) {
		amount = parseInt(amount)

		if (currentUser === 'Player 1') {
			numberOfTurns % 2 === 0 &&
				socket.emit('updateGameState', {
					turn: 'Player 2',
					increment: amount,
					player1Chips: player1Chips - amount,
					numberOfTurns: numberOfTurns + 1,
					pot: pot + amount,
				})
			numberOfTurns % 2 !== 0 &&
				socket.emit('updateGameState', {
					turn: 'Player 2',
					increment: amount - increment,
					player1Chips: player1Chips - amount,
					numberOfTurns: numberOfTurns,
					pot: pot + amount,
					raiseAmount: amount,
				})
			playChipsSound()
		} else if (currentUser === 'Player 2') {
			numberOfTurns % 2 === 0 &&
				socket.emit('updateGameState', {
					turn: 'Player 1',
					increment: amount,
					player2Chips: player2Chips - amount,
					numberOfTurns: numberOfTurns + 1,
					pot: pot + amount,
				})
			numberOfTurns % 2 !== 0 &&
				socket.emit('updateGameState', {
					turn: 'Player 1',
					increment: amount - increment,
					player2Chips: player2Chips - amount,
					numberOfTurns: numberOfTurns,
					pot: pot + amount,
					raiseAmount: amount,
				})
			playChipsSound()
		}
	}

	function foldHandler() {
		if (currentUser === 'Player 1') {
			socket.emit('updateGameState', {
				gameOver: true,
				winner: player2Name,
			})
		} else if (currentUser === 'Player 2') {
			socket.emit('updateGameState', {
				gameOver: true,
				winner: player1Name,
			})
		}
	}

	//local state
	const [shuffledDeck, setShuffledDeck] = useState('')
	const [restart, setRestart] = useState(false)

	useEffect(() => {
		if (
			gameOver === true &&
			winner !== player1Name &&
			winner !== player2Name &&
			winner !== 'Tie'
		) {
			socket.emit('updateGameState', {
				winner: getWinner(
					player1Name,
					player2Name,
					getHand(player1Deck, houseDeck),
					getHand(player2Deck, houseDeck)
				),
			})
		}

		if (restart === true) {
			const shuffledCards = shuffleArray(DECK_OF_CARDS)
			const player1Deck = shuffledCards.splice(0, 2)
			const player2Deck = shuffledCards.splice(0, 2)
			const houseDeck = shuffledCards.splice(0, 3)

			if (winner === player1Name) {
				socket.emit('initGameState', {
					gameOver: false,
					turn: 'Player 1',
					player1Deck: [...player1Deck],
					player2Deck: [...player2Deck],
					houseDeck: [...houseDeck],
					player1Chips: player1Chips + pot,
					player2Chips: player2Chips,
					increment: 10,
					numberOfTurns: 0,
					winner: '',
					pot: 0,
					player1Name: player1Name,
					player2Name: player2Name,
				})
			} else if (winner === player2Name) {
				socket.emit('initGameState', {
					gameOver: false,
					turn: 'Player 2',
					player1Deck: [...player1Deck],
					player2Deck: [...player2Deck],
					houseDeck: [...houseDeck],
					player1Chips: player1Chips,
					player2Chips: player2Chips + pot,
					increment: 10,
					numberOfTurns: 0,
					winner: '',
					pot: 0,
					player1Name: player1Name,
					player2Name: player2Name,
				})
			} else if (winner === 'Tie') {
				socket.emit('initGameState', {
					gameOver: false,
					turn: 'Player 1',
					player1Deck: [...player1Deck],
					player2Deck: [...player2Deck],
					houseDeck: [...houseDeck],
					player1Chips: player1Chips + pot / 2,
					player2Chips: player2Chips + pot / 2,
					increment: 10,
					numberOfTurns: 0,
					winner: '',
					pot: 0,
					player1Name: 'Player 1',
					player2Name: 'Player 2',
				})
			}
			setRestart(false)
			setShuffledDeck(shuffledCards.splice(0, 2))
		}
	}, [restart])

	if (users.length < 2) return <h1>Waiting...</h1>

	return (
		<div className='game-bg noselect'>
			<div className='game-board'>
				<Box
					position='absolute'
					top='0.3125rem'
					left='0.3125rem'
					translate='transform(-0.3125rem, -0.3125rem)'
					backgroundColor='whitesmoke'
					color='black'
					padding='0.5rem'
					borderRadius='0.25rem'
				>
					<Heading size='md' fontFamily='inherit'>
						Room Code: {data.roomCode}
					</Heading>
				</Box>
				<Cards
					numberOfTurns={numberOfTurns}
					player1Deck={player1Deck}
					player2Deck={player2Deck}
					houseDeck={houseDeck}
					gameOver={gameOver}
					currentUser={currentUser}
					player1Chips={player1Chips}
					player2Chips={player2Chips}
					turn={turn}
					player1Name={player1Name}
					player2Name={player2Name}
					winner={winner}
				/>

				<Flex justify='center' align='center' w='100%' mt='1rem'>
					<Heading size='md' fontFamily='inherit' style={{ color: '#FFD700' }}>
						Pot ​💰​: {pot}
					</Heading>
				</Flex>
				<HStack
					m='1rem'
					justify='center'
					align='center'
					spacing='1rem'
					color='black'
				>
					{!gameOver && (
						<>
							<Button
								isDisabled={
									currentUser !== turn ||
									(currentUser === 'Player 2' && player2Chips < increment) ||
									(currentUser === 'Player 1' && player1Chips < increment) ||
									gameOver
								}
								variant='solid'
								border='2px solid black'
								size='md'
								w='10rem'
								onClick={() => callHandler()}
							>
								{(raiseAmount === 0 &&
									increment &&
									numberOfTurns < 2 &&
									`Buy In(${increment})`) ||
									(raiseAmount === 0 && increment && `Call(${increment})`) ||
									(raiseAmount > 0 && `Call(${raiseAmount})`) ||
									'Check'}
							</Button>
							<RaiseModal
								minRaise={raiseAmount > 0 ? raiseAmount : increment}
								maxRaise={
									currentUser === 'Player 1' ? player1Chips : player2Chips
								}
								initialValue={raiseAmount > 0 ? raiseAmount + increment : null}
								isDisabled={turn !== currentUser || gameOver}
								callHandler={() => {
									callHandler()
								}}
								raiseHandler={(amount) => {
									raiseHandler(amount)
								}}
							/>
							<Button
								isDisabled={currentUser !== turn || gameOver}
								colorScheme='red'
								variant='solid'
								border='2px solid black'
								size='md'
								w='10rem'
								onClick={() => foldHandler()}
							>
								Fold
							</Button>
						</>
					)}

					{gameOver && (
						<Button
							isLoading={restart}
							onClick={() => {
								setRestart(true)
							}}
							w='10rem'
						>
							Restart
						</Button>
					)}
				</HStack>
			</div>
		</div>
	)
}

export default Game
