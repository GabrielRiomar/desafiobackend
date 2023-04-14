const knex = require('../database/knex')
const { hash, compare } = require('bcryptjs')
const AppError = require('../utils/AppError')

const sqliteConnection = require('../database/sqlite')

class UsersController {
  async create(request, response) {
    const { name, email, password } = request.body

    const database = await sqliteConnection()

    const checkUserExists = await knex('users').where('email', email).first()

    if (checkUserExists) {
      throw new AppError('E-mail already on use.', 401)
    }

    const hashedPassword = await hash(password, 8)

    await database.run(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    )

    return response.status(201).json()
  }

  async update(request, response) {
    const { name, email, password, old_password } = request.body
    const { id } = request.params

    const database = await sqliteConnection()
    const user = await database.get('SELECT * FROM users WHERE id = (?)', [id])

    if (!user) {
      throw new AppError('User not found.', 401)
    }

    const userWithUpdatedEmail = await database.get(
      'SELECT * FROM users WHERE email = (?)',
      [email]
    )

    if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
      throw new AppError('E-mail already on use.', 401)
    }

    user.name = name ?? user.name
    user.email = email ?? user.email

    if (password && !old_password) {
      throw new AppError('Please, inform your Old Password')
    }

    if (password && old_password) {
      const checkOldPassword = await compare(old_password, user.password)

      if (!checkOldPassword) {
        throw new AppError('Password does not match', 401)
      }

      user.password = await hash(password, 8)
    }

    await database.run(
      `
    UPDATE users SET
    name = ?,
    email = ?,
    password = ?,
    updated_at = DATETIME('NOW')
    WHERE id = ?`,
      [user.name, user.email, user.password, id]
    )
    return response.status(200).json()
  }
}

module.exports = UsersController
