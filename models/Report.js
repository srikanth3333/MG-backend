const mongoose = require('mongoose')

const ReportSchema = mongoose.Schema({
    "Timestamp" : {type: Date},
    "Email Address" : {type: String},
    "Vendor Name" : {type: String},
    "Candiate Name" : {type: String},
    "Pan/Aadhar No" : {type: String},
    "Contact No." : {type: String},
    "Skill Set" : {type: String},
    "Total Exp" : {type: String},
    "Rel Exp" : {type: String},
    "Current Company" : {type: String},
    "Current Work Location" : {type: String},
    "Preferred Work Location" : {type: String},
    "Email ID" : {type: String},
    "Notice Period" : {type: String},
    "GAP (If Any)" : {type: String},
    "Telephonic Round -Date" : {type: Date},
    "Telephonic Round -Time" : {type: String},
    "Category" : {type: String},
    "Bill RATE" : {type: String},
    "Resume" : {type: String},
    "RMG SPOC NAME" : {type: String},
    "RMG Email ID" : {type: String},
    "For the Date of submission" : {type: Date}
}, {timestamps: true})


module.exports = mongoose.model("Report", ReportSchema)