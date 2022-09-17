require('../db/setEnvironment')
const jwt = require('jsonwebtoken');
const { UnauthenticatedError } = require('../errors');
const User = require('../models/User')

const auth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
        throw new UnauthenticatedError('authorization unvalid')
    const token = authHeader.split(' ')[1]
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        req.user = { _id: payload._id }
        next()
    } catch (e) {
        throw new UnauthenticatedError('authorization unvalid')
    }

}

module.exports = auth