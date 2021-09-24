const User = require('../models/users')
const Product = require('../models/products')
const Client = require('../models/clients')
const Order = require('../models/orders')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config({path: '.env'})
const SECRETE = process.env.USER_SECRETE

const resolvers = {
    Query: {
        getUser: async (_, {}, ctx) => {
            return ctx.user
        },

        // Products
        getProducts: async () => {
            try {
                return await Product.find({})
            }
            catch(err) {
                console.log(err)
            }
        },
        getProductById: async (_, { id }) => {
            try {
                const product = await Product.findById(id)
                if(!product) throw new Error('Product not found')

                return product
            }
            catch(err) {
                console.log(err)
            }
        },

        // Clients
        getClients: async () => {
            try {
                return await Client.find({})
            }
            catch(err) {
                console.log(err)
            }
        },

        getSellerClients: async (_, {}, ctx) => {
            try {
                return await Client.find({ seller: ctx.user.id.toString()})
            }
            catch(err) {
                console.log(err)
            }
        },
        getClientById: async (_, { id }, ctx) => {
            try {
                const client = await Client.findById(id)
                if(!client) throw new Error('Client not found')
                if(client.seller.toString() !== ctx.user.id)
                    throw new Error('You do not have permission to see this client')

                return client

            }
            catch(err) {
                console.log(err)
            }
        },

        // Orders
        getOrders: async () => {
            try {
                const orders = await Order.find({})
                return orders
            }
            catch(err) {
                console.log(err)
            }
        },
        getOrdersBySeller: async (_, { }, ctx) => {
            try {
                const orders = await Order.find({ seller: ctx.user.id}).populate('client')
                return orders
            }
            catch(err) {
                console.log(err)
            }
        },
        getOrderById: async (_, { id }, ctx) => {
            try {
                const order = await Order.findById(id)
                if(!order) throw new Error('Client not found')
                if(order.seller.toString() !== ctx.user.id)
                    throw new Error('You do not have permission to see this order')

                return order
            }
            catch(err) {
                console.log(err)
            }
        },
        getOrdersByStatus: async (_, { status }, ctx ) => {
            try {
                const orders = Order.find({ seller: ctx.user.id, status })
                return orders
            }
            catch(err) {
                console.log(err)
            }
        },

        // Advanced Search
        getTopClients: async () => {
            try {
                const clients = await Order.aggregate([
                    { $match: { status: "COMPLETED"}},
                    { $group: {
                        _id: '$client',
                        total: { $sum: '$total'}
                    }},
                    {
                        $lookup: {
                            from: 'clients',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'client'
                        }
                    },
                    { $limit: 5 },
                    { $sort: { total: -1 } }
                ])

                return clients
            }
            catch(err) {
                console.log(err)
            }
        },
        getTopSellers: async () => {
            try {
                const sellers = await Order.aggregate([
                    { $match: { status: "COMPLETED"}},
                    { $group: {
                        _id: '$seller',
                        total: { $sum: '$total'}
                    }},
                    {
                        $lookup: {
                            from: 'users',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'seller'
                        }
                    },
                    { $limit: 5 },
                    { $sort: { total: -1 } }
                ])

                return sellers
            }
            catch(err) {
                console.log(err)
            }
        },
        searchProduct: async (_, { text }) => {
            try {
                return await Product.find({ $text: { $search: text }})
            }
            catch(err) {
                console.log(err)
            }
        }
    },
    Mutation: {
        createUser: async (_, { input }) =>  {
            const { email, password } = input
            // Check if user already exists
            const exists = await User.findOne({email})
            if (exists) throw new Error('User already exists!')

            // Hash password
            const salt = await bcryptjs.genSalt(10)
            input.password = await bcryptjs.hash(password, salt)

            try {
                const user = new User(input)
                user.save()
                return user
            }
            catch(err) {
                console.log('Failed to create user: ', err)
            }

            return 'Creating user...'
        },
        authentication: async (_, { input }) => {
            const { email, password } = input

            const user = await User.findOne({email})
            if (!user) throw new Error('User does not exists!')

            const rightPwd = await bcryptjs.compare(password, user.password)
            if(!rightPwd) throw new Error('Incorrect password')

            return {
                token: createToken(user, '24h')
            }
        },

        // Products
        addProduct: async (_, { input }) => {
            try {
                const product = new Product(input)
                const newProduct =  await product.save()
                return newProduct
            }
            catch(err) {
                console.log(err)
            }
        },
        updateProduct: async (_, { id, input }) => {
            try {
                let product = await Product.findById(id)
                if(!product) throw new Error('Product not found')

                product = await Product.findOneAndUpdate({ _id: id }, input, { new: true })
                return product                
            }
            catch(err){
                console.log(err)
            }
        },
        deleteProduct: async (_, { id }) => {
            try {
                const product = await Product.findById(id)
                if(!product) throw new Error('Product not found')

                await Product.findOneAndDelete({ _id: id})
                return `Product ${id} was deleted`
            }
            catch(err) {
                console.log(err)
            }
        },

        // Clients
        addClient: async (_, { input }, ctx) => {
            const { email } = input
            try {
                const exists = await Client.findOne({ email })
                if(exists) throw new Error('Client already exists!')

                const client = new Client(input)
                client.seller = ctx.user.id
                return await client.save()
            }
            catch(err) {
                console.log(err)
            }
        },
        updateClient: async (_, { id, input }, ctx) => {
            try {
                let client = await Client.findById(id)
                if(!client) throw new Error('Client not found')
                if(client.seller.toString() !== ctx.user.id)
                    throw new Error('You do not have permission to see this client')

                client = await Client.findOneAndUpdate({ _id: id }, input, { new: true })
                return client
            }
            catch(err) {
                console.log(err)
            }
        },
        deleteClient: async (_, { id }, ctx) => {
            try {
                const client = await Client.findById(id)
                if(!client) throw new Error('Client not found')
                if(client.seller.toString() !== ctx.user.id)
                    throw new Error('You do not have permission to see this client')

                await Client.findOneAndDelete({ _id: id })
                return  `Client ${client.name} ${client.lastname} was deleted`
            }
            catch(err) {
                console.log(err)
            }
        },

        // Orders
        createOrder: async (_, { input }, ctx) => {
            const { client } = input

            try {
                const dbClient = await Client.findById(client)
                if(!dbClient) throw new Error('Client not found')
                
                if(dbClient.seller.toString() !== ctx.user.id)
                    throw new Error('You do not have permission to see this client')

                for await ( const row of input.order) {
                    const { id } = row
                    const product = await Product.findById(id)
                    
                    if(product.stock < row.quantity) {
                        throw new Error(`Your order of ${product.name} exceeds the quantity available.`)
                    } 
                    else {
                        product.stock = product.stock - row.quantity
                        await product.save()
                    }
                }
                
                const order = new Order(input)
                order.seller = ctx.user.id
                const result = await order.save()
                return result
            }
            catch(err) {
                console.log(err)
            } 
        },
        updateOrder: async (_, { id, input }, ctx) => {
            try {
                const existsOrder =  await Order.findById(id)
                if(!existsOrder) throw new Error('Order not found')
                
                const dbClient = await Client.findById(input.client)
                if(!dbClient) throw new Error('Client not found')
                
                if(dbClient.seller.toString() !== ctx.user.id)
                    throw new Error('You do not have permission to see this client')

                for await ( const row of input.order) {
                    const { id } = row
                    const product = await Product.findById(id)
                    
                    if(product.stock < row.quantity) {
                        throw new Error(`Your order of ${product.name} exceeds the quantity available.`)
                    } 
                    else {
                        product.stock = product.stock - row.quantity
                        await product.save()
                    }
                }

                const result = await Order.findOneAndUpdate({ _id: id }, input, { new: true })
                return result
            }
            catch(err) {
                console.log(err)
            } 
        },
        deleteOrder: async (_, { id }, ctx) => {
            try {
                const existsOrder =  await Order.findById(id)
                if(!existsOrder) throw new Error('Order not found')
                
                if(existsOrder.seller.toString() !== ctx.user.id)
                    throw new Error('You do not have permission to see this client')

                await Order.findOneAndDelete({ _id: id })
                return 'Order was deleted'
            }
            catch(err) {
                console.log(err)
            } 
        },
    }
}

const createToken = (user, expiresIn) => {
    const { id, name } = user
    return jwt.sign(
        { id, name },
        SECRETE,
        {expiresIn}
    )
}

module.exports = resolvers