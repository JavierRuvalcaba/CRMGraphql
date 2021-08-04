const { gql } = require('apollo-server')

const typeDefs = gql`
    type User {
        id: ID
        name: String
        lastname: String
        email: String
        created: String
    }

    type Token {
        token: String
    }
    
    type Product {
        id: ID
        name: String
        stock: Int
        price: Float
        created: String
    }

    type Client {
        id: ID
        name: String
        lastname: String
        company: String
        email: String
        phone: String
        seller: ID
    }

    type ProductsOrder {
        id: ID
        quantity: Int
        name: String
        price: Float
    }

    type Order {
        id: ID
        order: [ProductsOrder]
        total: Float
        client: Client
        seller: ID
        status: OrderStatus
    }

    type TopClient {
        total: Float
        client: [Client]
    }

    type TopSeller {
        total: Float
        seller: [User]
    }

    input UserInput {
        name: String!
        lastname: String!
        email: String!
        password: String!
    }

    input LoginInput {
        email: String!
        password: String!
    }

    input ProductInput {
        name: String!
        stock: Int!
        price: Float!
    }

    input ClientInput {
        name: String!
        lastname: String!
        company: String!
        email: String!
        phone: String
    }

    input ProductsOrderInput {
        id: ID!
        quantity: Int!
        name: String
        price: Float
    }

    input OrderInput {
        order: [ProductsOrderInput]
        total: Float
        client: ID!
        status: OrderStatus
    }

    enum OrderStatus {
        PENDING
        COMPLETED
        CANCELED
    }

    type Query {
        getUser: User

        # Products
        getProducts: [Product]
        getProductById(id: ID): Product

        # Clients
        getClients: [Client]
        getSellerClients: [Client]
        getClientById(id: ID!): Client

        # Orders
        getOrders: [Order]
        getOrdersBySeller: [Order]
        getOrderById(id: ID!): Order
        getOrdersByStatus(status: String!): [Order]

        # Advanced Search
        getTopClients: [TopClient]
        getTopSellers: [TopSeller]
        searchProduct(text: String!): [Product]
    }

    type Mutation {
        createUser(input: UserInput): User
        authentication(input: LoginInput): Token

        # Products
        addProduct(input: ProductInput): Product
        updateProduct(id: ID!, input: ProductInput): Product
        deleteProduct(id: ID!): String

        # Clients
        addClient(input: ClientInput): Client
        updateClient(id: ID!, input: ClientInput): Client
        deleteClient(id: ID!): String

        # Orders
        createOrder(input: OrderInput): Order
        updateOrder(id: ID!, input: OrderInput): Order
        deleteOrder(id: ID!): String
    }
`

module.exports = typeDefs