const mongoose = require('mongoose')

const ProductSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    stock: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    created: {
        type: String,
        default: Date.now()
    }
})

ProductSchema.index({ name: 'text' })

module.exports = mongoose.model('Product',ProductSchema)