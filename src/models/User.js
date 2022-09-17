require('../db/setEnvironment')
const mongoose = require('mongoose')
const validator = require('validator')
const bcrybt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { NotFoundError, BadRequestError } = require('../errors')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        maxLength: 20,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value))
                throw new Error(`please make sure to enter a valid email`)
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 8,
        alias: "pass",
        validate(value) {
            if (value.toLowerCase().includes('password'))
                throw new Error(`you can't have the word password in your password`)
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})
UserSchema.statics.findByCredentials = async function (email, pass) {
    if (!validator.isEmail(email))
        throw new BadRequestError('please enter a valid email')
    const user = await User.findOne({ email })
    if (!user)
        throw new NotFoundError('enable to log')
    let isMatch = await bcrybt.compare(pass, user.pass)
    if (!isMatch)
        throw new NotFoundError('enable to log')
    return user
}
UserSchema.methods.isMatch = async function (pass) {
    return await bcrybt.compare(pass, this.pass)
}
UserSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}
UserSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.__v
    return userObject
}

UserSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrybt.hash(user.password, 8)
    }
    next()
})
const User = mongoose.model('User', UserSchema)
module.exports = User