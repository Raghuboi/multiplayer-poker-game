const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/auth/user')
const randString = require('../utils/randString')
const sendMail = require('../utils/send-mail')

const SALT_ROUNDS = 10
const ACCESS_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 2 * 60 * 1000
}
const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 10 * 60 * 1000
}

const generateTokens = (user) => {
    const accessToken = jwt.sign({
        id: user._id,
        email: user.email,
        username: user.username,
    }, process.env.SECRET, { expiresIn: '2m' })

    const refreshToken = jwt.sign({
        id: user._id    
    }, process.env.SECRET_2, { expiresIn: '1d' })

    return { accessToken, refreshToken }
}

const verifyJWT = async (req, res, next) => {
    const token = await req.cookies.access
    const refresh = await req.cookies.refresh

    if (token) {
        jwt.verify(token, process.env.SECRET, async function(err, decoded) {
            if (!err && decoded) {
                res.json({ user: decoded })
            } else next()
        })
    } else if (!token && refresh) {
        jwt.verify(refresh, process.env.SECRET_2, async function(err, decoded) {
            if (!err && decoded) {
                const { id } = await decoded
                if (!id) next()
                const user = await User.findById(id)
                if (!user) next()
                else {
                    const { accessToken, refreshToken } = generateTokens(user)
                    res.cookie('refresh', refreshToken, REFRESH_COOKIE_OPTIONS)
                    res.cookie('access', accessToken, ACCESS_COOKIE_OPTIONS)
                    res.json({ user: { id: user._user, email: user.email, username: user.username  } })
                }
            } else next()
        })
    } else next()
}

router.get('/', verifyJWT, async (req, res) => {
    res.status(401)
})

router.post('/signin', verifyJWT, async (req, res, next) => {
    const { email, password } = req.body
    if (!email || !password) res.status(400).json({ error: 'Please fill all the fields' })
    try {
        const user = await User.findOne({ email: email })        
        if (!user) res.status(401).json( { error: 'Not found' })
        else if  (!user.isValid) res.status(401).json( { error: 'Email not verified' } )

        else {
            const isValid = await bcrypt.compare(password, user.hash)

            if (isValid) {
                const { accessToken, refreshToken } = generateTokens(user)
                res.cookie('refresh', refreshToken, REFRESH_COOKIE_OPTIONS)
                res.cookie('access', accessToken, ACCESS_COOKIE_OPTIONS)
                res.json({ user: { id: user._user, email: user.email, username: user.username  }, message: 'Signed in' })
            }

            else res.status(401).json({ error: 'Incorrect password' })
        }
    } 
    catch (e) {
        console.error(e)
        res.status(500).json({ error: e.message })
    }
    next()
})

router.post('/signup', verifyJWT, async (req, res, next) => {
    const { email, password, username } = req.body 
    if (!email || !password || !username) res.status(400).json({ error: 'Please fill all the fields' })
    try {
        const emailExists = await User.findOne({ email: email })
        if (emailExists) res.status(409).json({ error: 'Email already exists' })
        const usernameExists = await User.findOne({ username: username })
        if (usernameExists) res.status(409).json({ error: 'Username already exists' })
        else {
            const hash = await bcrypt.hash(password, SALT_ROUNDS)
            const uniqueString = randString(10)
            const user = await new User({
                email: email,
                username: username,
                hash: hash,
                uniqueString: uniqueString,
                isValid: false 
            }).save()
            await sendMail(email, uniqueString)
            res.status(200).json({ message: 'Registered, verify your email to Sign In' })
        }
    } 
    catch (e) {
        console.error(e)
        res.status(500).json({ error: e.message })
    }
    next()
})

router.get('/verify/:uniqueString', async (req, res) => {
    const { uniqueString } = req.params
    const user = await User.findOne({ uniqueString: uniqueString })
    if (user && !user.isValid) {
        user.isValid = true
        await user.save()
        res.status(200).send("verified")
        console.log("verified a user")
    } else {
        res.status(401).send("not found")
    }
})

router.post('/signout', async (req, res, next) => {
    /* remove cookies from request header */
    res.clearCookie('access', { sameSite: 'none', secure: true, httpOnly: true })
    res.clearCookie('refresh', { sameSite: 'none', secure: true, httpOnly: true })
    res.status(200)    
    next()
})


module.exports = router