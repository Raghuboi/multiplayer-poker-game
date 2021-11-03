const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    hash: {
        type: String,
        required: true,
    },
    uniqueString: {
        type: String,
        required: false
    },
    isValid: {
        type: Boolean,
        required: false,
        default: false
    }
}) 

module.exports = mongoose.model('User', userSchema)