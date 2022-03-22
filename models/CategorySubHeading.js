const mongoose = require('mongoose')

const CategorySubHeadingSchema = mongoose.Schema({
    categoryHeading: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CategoryHeading',
    },
    name: {
        type: String,
    }
}, {timestamps: true})


module.exports = mongoose.model("CategorySubHeading", CategorySubHeadingSchema)