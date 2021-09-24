const conn = require('./config/db')
const { ApolloServer } = require('apollo-server')
const typeDefs = require('./db/schema')
const resolvers = require('./db/resolvers')
const jwt = require('jsonwebtoken')
require('dotenv').config({path: '.env'})

conn()

const server = new ApolloServer({
    typeDefs,
    resolvers,
    cors: {
        origin: '*',
        credentials: true
    },
    context: ({ req }) => {
        const token = req.headers['authorization'] || ''
        if(token) {
            try {
                const user = jwt.verify(token.replace('Bearer ',''), process.env.USER_SECRETE)
                return { user }
            }
            catch(err) {
                console.log(err)
            }
        }
    }
})

server.listen({ port: process.env.PORT || 4000 }).then( ({ url }) => {
    console.log(`Server ready on `, url)
})