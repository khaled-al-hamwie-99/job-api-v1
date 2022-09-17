const User = require('../models/User')
const { BadRequestError, UnauthenticatedError, NotFoundError } = require('../errors')
const regestir = async (req, res) => {
    const { email, pass, password, name } = req.body
    if (!email || !(pass || password) || !name)
        throw new BadRequestError('please provied email and password and a name')
    const user = await User.create({ name, email, password: password || pass })
    const token = await user.generateAuthToken()
    res.status(201).json({ user, token })
}
const login = async (req, res) => {
    const { email, pass, password } = req.body
    if (!email || !(pass || password))
        throw new BadRequestError('please provied email and password')
    const user = await User.findByCredentials(email, password || pass)
    const token = await user.generateAuthToken()
    res.json({ user, token })
}
const logout = async (req, res) => {
    console.log(req.user)
    res.send("done")
}

const getUser = async (req, res) => {
    res.json(await User.find({ _id: req.params.id }))
}
const getMe = async (req, res) => {
    res.json(await User.find({ _id: req.user._id }))
}
const updateMe = async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'newPassword'];
    const password = req.body.pass || req.body.password
    if (!password || password.length < 8)
        throw new BadRequestError("no password provided")
    const user = await User.findById(req.user._id)
    if (!user)
        throw new NotFoundError('not found')
    const isMatch = await user.isMatch(password)
    if (!isMatch)
        throw new UnauthenticatedError("no password match")
    const validUpdates = updates.filter(allow => allowedUpdates.includes(allow))
    validUpdates.forEach(update => {
        if (update == "newPassword") {
            console.log("new password has been updated")
            user.pass = req.body.newPassword
        }
        user[update] = req.body[update]
    })
    await user.save()
    res.send(user)
}
const deleteMe = async (req, res) => {
    const password = req.body.password || req.body.pass
    if (!password || password.length < 8)
        throw new BadRequestError("no password provided")
    const user = await User.findById(req.user._id)
    if (!user)
        throw new NotFoundError('not found')
    const isMatch = await user.isMatch(password)
    if (!isMatch)
        throw new UnauthenticatedError("enable to delete")
    res.json(await user.remove())
}
const getAllUsers = async (req, res) => {
    res.send(await User.find({}))
    // res.send(req.user)
}
const deleteAll = async (req, res) => {
    await User.deleteMany({ name: "khaled" })
    res.send("done")
}
module.exports = {
    regestir,
    login,
    logout,
    getUser,
    getMe,
    updateMe,
    deleteMe,
    getAllUsers,
    deleteAll
}