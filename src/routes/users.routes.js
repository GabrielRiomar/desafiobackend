const { Router } = require('express')
const UsersController = require('../Controllers/UsersController')
const usersRoutes = Router()
const usersController = new UsersController()
const ensureAuthenticated = require('../middleware/ensureAuthenticated')

usersRoutes.post('/', usersController.create)
usersRoutes.put('/', ensureAuthenticated, usersController.update)

module.exports = usersRoutes
