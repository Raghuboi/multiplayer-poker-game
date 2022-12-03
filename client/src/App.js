import { Route } from 'react-router-dom'
import Homepage from './components/Homepage/Homepage'
import Game from './components/Game/Game'
import Verify from './components/auth/Verify'
import './App.css'
import './cards.css'
import './game.css'
import { UserContext } from './utils/UserContext'
import { useState, useEffect } from 'react'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
	styles: {
		global: {
			body: {
				bg: 'whiteAlpha.200',
				color: 'white',
				m: 0,
				p: 0,
			},
		},
	},
})

const App = () => {
	const url = process.env.REACT_APP_ENDPOINT
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = fetch(`${url}/auth/`, {
					method: 'GET',
					credentials: 'include',
					mode: 'cors',
				})
					.then((res) => res.json())
					.then((data) => {
						if (data.user) setUser(data.user)
					})
				setLoading(false)
			} catch (error) {
				console.error(error)
				setLoading(false)
			}
		}
		if (loading) fetchData()
	}, [])

	if (loading) return <h1>Loading...</h1>

	return (
		<div className='App'>
			<UserContext.Provider value={{ user, setUser }}>
				<ChakraProvider>
					<Route path='/' exact component={Homepage} />
					<Route path='/play' exact component={Game} />
					<Route path='/verify' exact component={Verify} />
				</ChakraProvider>
			</UserContext.Provider>
		</div>
	)
}

export default App
