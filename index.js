require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

// Module imports
const Person = require('./models/person')

// Middleware
app.use(express.json())
app.use(cors())
app.use(express.static('build'))
morgan.token('body', req => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


// info page
app.get('/info', (request, response, next) => {
  Person.countDocuments({}).then(count => {
    let info = `<p>Phonebook has info for ${count} people</p>`
    info += new Date()
    response.send(info)
  }).catch(error => next(error))
})

// get all persons
app.get('/api/persons', (request, response, next) => {
  Person.find({}).then(persons => {
    response.json(persons)
  }).catch(error => next(error))
})

// get individual person
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  }).catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {response.status(204).end()})
    .catch(error => next(error))
})

/* function for generating random id, not used with mongo
const generateId = () => {
  const id = Math.floor(Math.random()*10000)
  return id
} */

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  // missing name or number
  if (!body.name) {
    return response.status(400).json({
      error: 'name missing'
    })
  }

  if (!body.number) {
    return response.status(400).json({
      error: 'number missing'
    })
  }

  // name already in (2 ways of doing it)
  // way 1
  /*
  const existingPerson = persons.find(
      (person) => person.name.toLowerCase() === body.name.toLowerCase()
  )
  if (existingPerson) {
    return response.status(400).json({
      error: 'name already in the phonebook'
    })
  } */
  // way 2
  /*
  if (persons.find(person => person.name === body.name)) {
    return response.status(400).json({
        error: "name is already in"
    })
  } */

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  }).catch(error => next(error))
})

/* Update an existing person */
app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  // missing name or number
  if (!name) {
    return response.status(400).json({
      error: 'name missing'
    })
  }

  if (!number) {
    return response.status(400).json({
      error: 'number missing'
    })
  }

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }).
    then(result => {
      response.json(result)
    }).catch(error => next(error))
})

// ERROR HANDLERS
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})