const mongoose = require('mongoose')

const CategoryHeadingSchema = mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    },
    name: {
        type: String,
    }
}, {timestamps: true})


module.exports = mongoose.model("CategoryHeading", CategoryHeadingSchema)