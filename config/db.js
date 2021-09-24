const mongoose = require('mongoose')
require('dotenv').config({path: '.env'})

const getDBConnection = async () => {
    try {
        await mongoose.connect(process.env.DB_CONNECTION_STR, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        })
    }
    catch(err) {
        console.log('Failed DB connection: ', err)
        process.exit(1)
    }
}

module.exports = getDBConnection