const express = require('express')
const MeterData = require('../models/MeterData')
const Report = require('../models/Report')
const router = express.Router();
const multer  = require('multer')
var ObjectID = require('mongodb').ObjectID;

var MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://srikanth:zxcvbnm321A@cluster0.kvdaf.mongodb.net/Reports?retryWrites=true&w=majority"
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '.pdf')
    }
})
  
var upload = multer({ storage: storage });


router.get('/addReportsListData', async function (req, res) {
    try{
        
        let query = {}
        if(req.query.skillSet) {
            query = {...query, ['Skill Set']: {$regex: req.query.skillSet, $options:'i'}}
        }
        if(req.query.experienceRel) {
            query = {...query, ['Rel Exp']: {$gte: parseInt(req.query.experienceRel)}}
        }
        if(req.query.experienceTotal) {
            query = {...query, ['Total Exp']: {$regex: req.query.experienceTotal, $options:'i'}}
        }
        if(req.query.noticePeriod) {
            query = {...query, ['Notice Period']: {$regex: req.query.noticePeriod, $options:'i'}}
        }
        if(req.query.preWorkLoc) {
            query = {...query, ['Preferred Work Location']: {$regex: req.query.preWorkLoc, $options:'i'}}
        }
        if(req.query.category) {
            query = {...query, ['Category']: {$regex: req.query.category, $options:'i'}}
        }
        if (req.query.startDate && req.query.endDate && !isNaN(new Date(req.query.startDate)) && !isNaN(new Date(req.query.endDate))) {
            startDate = new Date(req.query.startDate);
            endDate = new Date(req.query.endDate);
            query["Timestamp"] = {$gte: startDate, $lte: endDate};
        }

        let page = req.query.page
        MongoClient.connect(url, async function(err, db) {
            if (err) throw err;
            var dbo = db.db("Reports");
            let totalCounts = await dbo.collection("reports").find(query).count()
            let data = await dbo.collection("reports").find(query).limit(20).skip(page*20).toArray()
            res.json({result:data,totalCounts})
          });
    }catch(e)  {
        return res.send(JSON.stringify(e))
    }
})



router.get('/groupList', async function (req, res) {
    try{
        
        let query = {}
        if(req.query.skillSet) {
            query = {...query, ['Skill Set']: {$regex: req.query.skillSet, $options:'i'}}
        }
        if(req.query.experienceRel) {
            query = {...query, ['Rel Exp']: {$regex: req.query.experienceRel, $options:'i'}}
        }
        if(req.query.experienceTotal) {
            query = {...query, ['Total Exp']: {$regex: req.query.experienceTotal, $options:'i'}}
        }
        if(req.query.noticePeriod) {
            query = {...query, ['Notice Period']: {$regex: req.query.noticePeriod, $options:'i'}}
        }
        if(req.query.preWorkLoc) {
            query = {...query, ['Preferred Work Location']: {$regex: req.query.preWorkLoc, $options:'i'}}
        }
        if(req.query.category) {
            query = {...query, ['Category']: {$regex: req.query.category, $options:'i'}}
        }

        if (req.query.startDate) {
            query = {...query, ['Timestamp']: {$gt : req.query.startDate}}
        }

        if (req.query.contactNo) {
            query = {...query, ['Candiate Name']: req.query.contactNo}
        }

        

        let page = req.query.page
        MongoClient.connect(url, async function(err, db) {
            if (err) throw err;
            var dbo = db.db("Reports");
            let totalCounts = await dbo.collection("reports").find(query).count()
            let data = await dbo.collection("reports").aggregate([
                {$match: query},
                {$group: {
                    _id: `$${['Email ID']}`,
                    // count: { $count: { } },
                    data: { $push: '$$ROOT' }
                }},
                {
                    $project: {
                      _id:0,
                      data:1,
                      count :1
                    }
                },
                {$limit: 20}
            ]).toArray()
            res.json({result:data,totalCounts})
          });
    }catch(e)  {
        return res.send(JSON.stringify(e))
    }
})


router.get('/getReportOptions',  async (req, res) => {
    try{
        let query = {};
        let option = null
        if(req.query.skillSet == 'true') {
            option = `$${['Skill Set']}`
        }
        if(req.query.experienceRel == 'true') {
            option = `$${['Rel Exp']}`
        }
        if(req.query.experienceTotal == 'true') {
            option = `$${['Total Exp']}`
        }
        if(req.query.noticePeriod == 'true') {
            option = `$${['Notice Period']}`
        }
        if(req.query.preWorkLoc == 'true') {
            option = `$${['Preferred Work Location']}`
        }
        if(req.query.category == 'true') {
            option = `$${['Category']}`
        }

        console.log(query)

        MongoClient.connect(url, async function(err, db) {
            if (err) throw err;
            var dbo = db.db("Reports");
            let data = await dbo.collection("reports").aggregate([
                {$match: query},
                {$group: {_id: option}},
                // {$group: {_id: {$toLower:{$trim:{input:String(option)}}}}},
                // {$project: {_id:0,['Skill Set']: 1,['Rel Exp']:1,['Total Exp']:1,['Notice Period']:1,['Preferred Work Location']:1,['Category']:1}},
                // {$project: {_id:0,['Skill Set']: 1,['Rel Exp']:1,['Total Exp']:1,['Notice Period']:1,['Preferred Work Location']:1,['Category']:1}},
                // {$limit: 20}
                // {$sort: { Timestamp: -1 }}
            ]).toArray()
            res.send(data)
        });
    }catch(e)  {
        return res.send(JSON.stringify(e))
    }
})


router.get('/getReportgraphs',  async (req, res) => {
    try{
        let option = null
        if(req.query.skillSet == 'true') {
            option = `$${['Skill Set']}`
        }
        if(req.query.preWorkLoc == 'true') {
            option = `$${['Preferred Work Location']}`
        }
        MongoClient.connect(url, async function(err, db) {
            if (err) throw err;
            var dbo = db.db("Reports");
            // let totalCounts = await dbo.collection("reports").find({})
            let data = await dbo.collection("reports").aggregate([
                {$group: {_id: {$toLower:{$trim:{input:option}}}, count: {$sum: 1}}},
                {$match: {count: {$gte:50, $lte: 10000}}},
                {$limit: 15}
            ]).toArray()
            res.send(data)
        });
    }catch(e)  {
        return res.send(JSON.stringify(e))
    }
})


router.post('/addReport', async function (req, res) {
    try{
        MongoClient.connect(url, async function(err, db) {
            if (err) throw err;
            var dbo = db.db("Reports");
            let data = await dbo.collection("reports").insertOne(req.body)
            return res.send({status:true,msg:'success'})
        });
        
    }catch(e)  {
        return res.send(JSON.stringify(e))
    }
})



router.get('/updateTime', async function (req, res) {
    try{
        MongoClient.connect(url, async function(err, db) {
            if (err) throw err;
            var dbo = db.db("Reports");
            await dbo.collection("onboardDetails").insertMany(
               [
                        {
                            "Candidate name": "Sathish Bandi",
                            "Contact No": "9573265650",
                            "Skill Set": "angular",
                            "RGS ID": "7948982",
                            "Tentative DOJ": new Date("12/1/2021"),
                            "Current Status": "On-boarded",
                            "EMP ID": "2254324",
                            "DOJ": 44559,
                            "Date of source": 44522,
                            "Date of selection": new Date("11/25/2021"),
                            "RMG": "Venudeepthi",
                            "TCS Account/ISU": "CPG",
                            "RMG Location": "Hyderabad",
                            "Requirement Email from GENERAL/Known Manager": "Known Manager",
                            "TCS RATE CARD": "85000",
                            "Pay RATE": "108333",
                            "TCS APPROVED RATE CARD": "135000",
                            "Margin": "26667",
                            "BGC Cleared Date": 44558,
                            "BGC SPOC": "AppaRao-TCS",
                            "Location of On-board": "Hyderabad",
                            "Recruiter  name": "Niranjan",
                            "Team Lead  name": "Kiran",
                            "TOI-Spoc": "Kiran"
                        },
                        {
                            "Candidate name": "Sumit Choudhary",
                            "Contact No": "8285575703",
                            "Skill Set": "sap",
                            "RGS ID": "7696171",
                            "Tentative DOJ": new Date("20/1/2022"),
                            "Current Status": "Dropped-FTE Offer In-Hand",
                            "EMP ID": "NA",
                            "DOJ": "NA",
                            "Date of source": 44524,
                            "Date of selection": new Date("11/26/2021"),
                            "RMG": "Mahima",
                            "RMG Location": "Chennai",
                            "Requirement Email from GENERAL/Known Manager": "General",
                            "TCS RATE CARD": " ",
                            "Pay RATE": " ",
                            "TCS APPROVED RATE CARD": " ",
                            "Margin": " ",
                            "BGC Cleared Date": " ",
                            "BGC SPOC": " ",
                            "Location of On-board": " ",
                            "Recruiter  name": " gababu",
                            "Team Lead  name": "Kiran",
                            "TOI-Spoc": "Kiran"
                        },
                        {
                            "Candidate name": "Prasan  kumar Yeduru",
                            "Contact No": "7416136795",
                            "Skill Set": "react",
                            "RGS ID": "7263898",
                            "Tentative DOJ": new Date("13/1/2022"),
                            "Current Status": "Dropped-Medical Issue",
                            "EMP ID": "NA",
                            "DOJ": "NA",
                            "Date of source": 44529,
                            "Date of selection": new Date("1/12/2021"),
                            "RMG": "Madhurima",
                            "TCS Account/ISU": "A&I - Business A lyti",
                            "RMG Location": "Bangalore",
                            "Requirement Email from GENERAL/Known Manager": "General",
                            "TCS RATE CARD": " ",
                            "Pay RATE": " ",
                            "TCS APPROVED RATE CARD": " ",
                            "Margin": " ",
                            "BGC Cleared Date": " ",
                            "BGC SPOC": " ",
                            "Location of On-board": " ",
                            "Recruiter  name": "Niranjan",
                            "Team Lead  name": "Kiran",
                            "TOI-Spoc": "Kiran"
                        },
                        {
                            "Candidate name": "Priyanka S",
                            "Contact No": "8096792431",
                            "Skill Set": "Java",
                            "RGS ID": "7976786",
                            "Tentative DOJ": new Date("12/2/2021"),
                            "Current Status": "On-boarded",
                            "EMP ID": "2280638",
                            "DOJ": 44585,
                            "Date of source": 44544,
                            "Date of selection": new Date("8/12/2021"),
                            "RMG": "Sakthi balan",
                            "TCS Account/ISU": "MFG",
                            "RMG Location": "Chennai",
                            "Requirement Email from GENERAL/Known Manager": "General",
                            "TCS RATE CARD": "75000",
                            "Pay RATE": "37500",
                            "TCS APPROVED RATE CARD": "75000",
                            "Margin": "37500",
                            "BGC Cleared Date": 44558,
                            "BGC SPOC": " resh-TCS",
                            "Location of On-board": "Chennai",
                            "Recruiter  name": " vyaSri",
                            "Team Lead  name": "Niranjan",
                            "TOI-Spoc": "Kiran"
                        }
                    ]
            ,
            (result) => {
                res.send(result);
            }
            )
        });
        
    }catch(e)  {
        return res.send(JSON.stringify(e))
    }
})




router.get('/getOnboardDetails',  async (req, res) => {
    try{
        let query = {};
        let page = req.query.page
        let startDate = null;
        let endDate = null;
        if(req.query.candidateName) {
            query = {...query, ['Candidate name']: {$regex: req.query.candidateName, $options:'i'}}
        }
        if(req.query.contactNo) {
            query = {...query, ['Contact No']: {$regex: req.query.contactNo, $options:'i'}}
        }
        if(req.query.skillSet) {
            query = {...query, ['Skill Set']: {$regex: req.query.skillSet, $options:'i'}}
        }
        if(req.query.rgsId) {
            query = {...query, ['RGS ID']: {$regex: req.query.rgsId, $options:'i'}}
        }
        if(req.query.tentativeDOJ) {
            query = {...query, ['Tentative DOJ']: parseInt(req.query.tentativeDOJ)}
        }
        if(req.query.rmgLocation) {
            query = {...query, ['RMG Location']: {$regex: req.query.rmgLocation, $options:'i'}}
        }
        if(req.query.recruiterName) {
            query = {...query, ['Recruiter name']: {$regex: req.query.recruiterName, $options:'i'}}
        }
        if(req.query.locationOnboard) {
            query = {...query, ['Location of On-board']: {$regex: req.query.locationOnboard, $options:'i'}}
        }


        if (req.query.startDate && req.query.endDate && !isNaN(new Date(req.query.startDate)) && !isNaN(new Date(req.query.endDate))) {
            startDate = new Date(req.query.startDate);
            endDate = new Date(req.query.endDate);
            query["Tentative DOJ"] = {$gt: startDate, $lt: endDate};
        }

        MongoClient.connect(url, async function(err, db) {
            if (err) throw err;
            var dbo = db.db("Reports");
            let totalCounts = await dbo.collection("onboardDetails").find(query).count()
            let result = await dbo.collection("onboardDetails").find(query).limit(20).skip(page*20).toArray()
            return res.send({result,totalCounts})
        })
    }catch(e)  {
        return res.send(JSON.stringify(e))
    }
})


router.get('/getOnboardOptions',  async (req, res) => {
    try{
        let query = {};
        let option = null
        if(req.query.candidateName == 'true') {
            option = `$${['Candidate name']}`
        }
        if(req.query.contactNo == 'true') {
            option = `$${['Contact No']}`
        }
        if(req.query.skillSet == 'true') {
            option = `$${['Skill Set']}`
        }
        if(req.query.rgsId == 'true') {
            option = `$${['RGS ID']}`
        }
        if(req.query.tentativeDOJ == 'true') {
            option = `$${['Tentative DOJ']}`
        }
        if(req.query.rmgLocation == 'true') {
            option = `$${['RMG Location']}`
        }
        if(req.query.recruiterName == 'true') {
            option = `$${['Recruiter name']}`
        }
        if(req.query.locationOnboard == 'true') {
            option = `$${['Location of On-board']}`
        }

        console.log(query)
        MongoClient.connect(url, async function(err, db) {
            if (err) throw err;
            var dbo = db.db("Reports");
            let data = await dbo.collection("onboardDetails").aggregate([
                {$match: query},
                {$group: {_id: {$toLower:option}}},
            ]).toArray()
            return res.send(data)
        });
    }catch(e)  {
        return res.send(JSON.stringify(e))
    }
})


module.exports = router;