const knex = require('../database/knex')
const AppError = require('../utils/AppError')
const sqliteConnection = require('../database/sqlite')

class NotesControllers {
  async create(request, response) {
    const { title, description, tags, rating } = request.body
    const { user_id } = request.params

    const checkTitleExists = await knex('notes').where('title', title).first()

    if (checkTitleExists) {
      throw new AppError('Title already on use.', 401)
    }

    if (rating < 1 || rating > 5) {
      throw new AppError(
        'You can only rate that movie with scores between 1 and 5',
        401
      )
    }

    const [note_id] = await knex('notes').insert({
      title,
      description,
      user_id,
      rating
    })

    const tagsInsert = tags.map(name => {
      return {
        note_id,
        name,
        user_id
      }
    })

    await knex('tags').insert(tagsInsert)

    return response.status(201).json()
  }

  async show(request, response) {
    const { id } = request.params
    const note = await knex('notes').where({ id }).first()
    const tags = await knex('tags')
      .where({ note_id: id })
      .orderBy('name')
      .where({ note_id: id })
      .orderBy('created_at')
    return response.json({
      ...note,
      tags
    })
  }

  async delete(request, response) {
    const { id } = request.params

    await knex('notes').where({ id }).delete()

    return response.json()
  }

  async index(request, response) {
    const { title, user_id, tags } = request.query
    let notes
    if (tags) {
      notes
      const filterTags = tags.split(',').map(tag => tag.trim())
      notes = await knex('tags')
        .select(['notes.id', 'notes.title', 'notes.user_id'])
        .where('notes.user_id', user_id)
        .whereLike('title', `%${title}%`)
        .whereIn('name', filterTags)
        .innerJoin('notes', 'notes.id', 'tags.note_id')
        .orderBy('notes.title')
    } else {
      notes = await knex('notes')
        .where({ user_id })
        .whereLike('title', `%${title}%`)
        .orderBy('title')
    }

    const userTags = await knex('tags').where({ user_id })
    const noteWithTags = notes.maps(note => {
      const noteTags = userTags.filter(tag => tag.note_id === note.id)

      return {
        ...note,
        tags: noteTags
      }
    })
    return response.json(noteWithTags)
  }

  async update(request, response) {
    const { title, description, rating } = request.body
    const { id } = request.params
    const database = await sqliteConnection()
    const note = await database.get('SELECT * FROM users WHERE id = (?)', [id])

    note.title = title ?? note.title
    note.description = description ?? note.description
    note.rating = rating ?? note.rating

    if (note.rating < 1 || note.rating > 5) {
      throw new AppError(
        'You can only update older rates that movie with scores between 1 and 5',
        401
      )
    }

    await database.run(
      `
    UPDATE notes SET
    title = ?,
    description = ?,
    rating = ?,
    updated_at = DATETIME('NOW')
    WHERE id = ?`,
      [note.title, note.description, note.rating, id]
    )
    return response.status(200).json()
  }
}

module.exports = NotesControllers
