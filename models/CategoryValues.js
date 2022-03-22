const mongoose = require('mongoose')

const CategoryValuesSchema = mongoose.Schema({
    categorySubHeading: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CategorySubHeading',
    },
    name: {
        type: String,
    }
}, {timestamps: true})


module.exports = mongoose.model("CategoryValues", CategoryValuesSchema)