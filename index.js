const http = require('http')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

// Middleware
app.use(express.json())
app.use(cors())
app.use(express.static('build'))
morgan.token("body", req => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let persons = [
    { 
        "id": 1,
        "name": "Arto Hellas", 
        "number": "040-123456"
      },
      { 
        "id": 2,
        "name": "Ada Lovelace", 
        "number": "39-44-5323523"
      },
      { 
        "id": 3,
        "name": "Dan Abramov", 
        "number": "12-43-234345"
      },
      { 
        "id": 4,
        "name": "Mary Poppendieck", 
        "number": "39-23-6423122"
      }
]

app.get('/info', (request, response) => {
    let amount = persons.length
    let date = new Date()
    response.send(`
        <p>PhoneBook has info for ${amount} people</p>
        <p>${date}</p>`)
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
  
    response.status(204).end()
})

const generateId = () => {
    const id = Math.floor(Math.random()*10000)
    return id
  }

app.post('/api/persons', (request, response) => {
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
    const existingPerson = persons.find(
        (person) => person.name.toLowerCase() === body.name.toLowerCase()
    )
    if (existingPerson) {
        return response.status(400).json({
            error: 'name already in the phonebook'
        })
    }
    // way 2
    /*
    if (persons.find(person => person.name === body.name)) {
        return response.status(400).json({ 
            error: "name is already in" 
        })
    } */

    const person = {
        id: generateId(),
        name: body.name,
        number: body.number,
    }

    persons = persons.concat(person)
    
    response.json(person)
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
}) 