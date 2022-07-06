const mongoose = require('mongoose')

const ProfileSchema = mongoose.Schema({
    name: {
        type: String,
    },
    role: {
        type: String,
    },
    otp: {
        type: Number,
    },
    mobileNo: {
        type: String,
    },
    address: {
        type: String,
    },
    city: {
        type: String,
    },
    pincode: {
        type: String,
    },
    password: {
        type: String,
    },
    AccCertificateNo: {
        type: String,
    },
    AccValidity: {
        type: Date,
    },
    AcccerificateLink: {
        type: String,
    },
}, {timestamps: true})


module.exports = mongoose.model("Profile", ProfileSchema)