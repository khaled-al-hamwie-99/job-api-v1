const express = require('express')
const { login, regestir, getMe, deleteMe, updateMe, getUser, logout } = require('../controllers/auth')
const router = express.Router()
const auth = require('../middleware/authentication')

router.route('/register').post(regestir)
router.route('/login').post(login)
router.use(auth).route('/logout').post(logout)

router.use(auth).route('/users').get(getMe).patch(updateMe).delete(deleteMe)
router.route('/users/:id').get(getUser)

module.exports = router