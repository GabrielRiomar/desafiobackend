# Challenger Stage 08 RocketSeat

## Technologies

- `JavaScript`
- `SQLite`
- `KNEX.js`
- `Node.js`
- `Git` `Github`

## API Documentation

```http
  METHOD /localhost:3333/resource
```

#### Create user

```http
  POST /localhost:3333/users
```

#### Update user

```http
  PUT /localhost:3333/users/:user_id
```

#### Adding a Movie note to the user

```http
  POST /localhost:3333/notes/:user_id
```

#### Show Movie Note

```http
  GET /localhost:3333/notes
```

#### Show Movie Note using it's ID

```http
  GET /localhost:3333/notes/:id
```

#### Delete note

```http
  DELETE /localhost:3333/notes/:id
```

#### Show notes tags

```http
  GET /localhost:3333/tags/:user_id
```
