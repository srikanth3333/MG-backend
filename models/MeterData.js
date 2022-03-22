const mongoose = require('mongoose')

const MeterDataSchema = mongoose.Schema({
    companyName: {
        type: String,
    },
    serialId: {
        type: String,
    },
    ulrNo: {
        type: String,
    },
    log: {
        type: String,
    },
    pdf: {
        type: String,
    },
    startDate: {
        type: Date,
    },
}, {timestamps: true})


module.exports = mongoose.model("MeterData", MeterDataSchema)