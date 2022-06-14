const mongoose = require('mongoose')

if (process.argv.length < 3) {
    // list phonebook entries
    console.log('Please provide the password as an argument: node mongo.js <password>')
    process.exit(1)
} else if (process.argv.length === 4) {
    // add person
    console.log('Phone number is missing')
    process.exit(1)
  }

// CONNECTION
const password = process.argv[2]
const url = `mongodb+srv://fullstackpart3:${password}@cluster0.i6wxbxr.mongodb.net/?retryWrites=true&w=majority`

// Data model
const phonebookSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', phonebookSchema)

if (process.argv.length === 5) {
    // add new person
    mongoose.connect(url).then((result) => {
        console.log('connected')

        const person = new Person({
            name: process.argv[3],
            number: process.argv[4],
        })

        return person.save()
    })
    .then(() => {
        console.log(`Added "${process.argv[3]}" with number "${process.argv[4]}" to phone book`)
        return mongoose.connection.close()
    })
    .catch((err) => console.log(err))
}

else if (process.argv.length === 3) {
    // list people in phonebook
    mongoose.connect(url).then((result) => {
        console.log('connected')

        Person.find({}).then(result=> {
            result.forEach(person => {
                console.log(`${person.name} ${person.number}`)
            })
            mongoose.connection.close()
        })
    })
    .catch((err) => console.log(err))
}