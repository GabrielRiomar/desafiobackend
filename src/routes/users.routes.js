const { Router } = require('express')
const UsersController = require('../controllers/UsersController')
const usersRoutes = Router()
const usersController = new UsersController()
const ensureAuthenticated = require('../middleware/ensureAuthenticated')
const multer = require('multer')
const uploadConfig = require('../config/upload')
const upload = multer(uploadConfig.MULTER)
const UserAvatarController = require('../')
const userAvatarController = new UserAvatarController()

usersRoutes.post('/', usersController.create)
usersRoutes.put('/', ensureAuthenticated, usersController.update)
usersRoutes.patch(
  '/avatar',
  ensureAuthenticated,
  upload.single('avatar'),
  userAvatarController.update
)

module.exports = usersRoutes
