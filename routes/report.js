const express = require('express')
const MeterData = require('../models/MeterData')
const Report = require('../models/Report')
const router = express.Router();
const multer  = require('multer')
var ObjectID = require('mongodb').ObjectID;
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey("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")

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
            query = {...query, ['Rel Exp']: {$gte: parseInt(req.query.experienceTotal)}}
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

        if(parseInt(req.query.experienceTotal) < parseInt(req.query.experienceRel)) {
                return res.json({status:false,msg:"Total"})
        }

        console.log(query);
        let page = req.query.page
        MongoClient.connect(url, async function(err, db) {
            if (err) throw err;
            var dbo = db.db("Reports");
            let totalCounts = await dbo.collection("reports").find(query).count()
            let data = await dbo.collection("reports").find(query).limit(20).skip(page*20).sort({"Timestamp": 1}).toArray()
            res.json({status:true,result:data,totalCounts})
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
            query = {...query, ['Timestamp']: {$gte : req.query.startDate}}
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


router.get('/employeeGraph',  async (req, res) => {
    try{
        let option = null
        let query = {}
        if(req.query.emailAddress  == 'true') {
            option = `$${['Email Address']}`
        }
        if (req.query.startDate && req.query.endDate && !isNaN(new Date(req.query.startDate)) && !isNaN(new Date(req.query.endDate))) {
            startDate = new Date(req.query.startDate);
            endDate = new Date(req.query.endDate);
            query["Timestamp"] = {$gte: startDate, $lte: endDate};
        }
        console.log(query)
        MongoClient.connect(url, async function(err, db) {
            if (err) throw err;
            var dbo = db.db("Reports");
            let data = await dbo.collection("reports").aggregate([
                {$match: query},
                {$group: {_id:option, count: {$sum: 1}}},
            ]).toArray()
            return res.send(data)
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
            await dbo.collection("reports").insertOne({
                "Timestamp" : new Date(req.body.Timestamp),
                "Email Address" : req.body['Email Address'],
                "Vendor Name" : req.body['Vendor Name'],
                "Candiate Name" : req.body['Candiate Name'],
                "Pan/Aadhar No" : req.body['Vendor Name'],
                "Contact No." : req.body['Pan/Aadhar No'],
                "Skill Set" : req.body['Skill Set'],
                "Total Exp" : req.body['Total Exp'],
                "Rel Exp" : req.body['Rel Exp'],
                "Current Company" : req.body['Current Company'],
                "Current Work Location" : req.body['Current Work Location'],
                "Preferred Work Location" : req.body['Preferred Work Location'],
                "Email ID" : req.body['Email ID'],
                "Notice Period" : req.body['Notice Period'],
                "GAP (If Any)" : req.body['GAP (If Any)'],
                "Telephonic Round -Date" : new Date(req.body['Telephonic Round -Date']),
                "Telephonic Round -Time" : new Date(req.body['Telephonic Round -Time']),
                "Category" : req.body['Category'],
                "Bill RATE" : req.body['Bill RATE'],
                "Resume" : req.body['Resume'],
                "RMG SPOC NAME" : req.body['RMG SPOC NAME'],
                "RMG Email ID" : req.body['RMG Email ID'],
                "For the Date of submission" : new Date(req.body['For the Date of submission'])
            })
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
            await dbo.collection("onboardDetails").find({}).toArray((err,result) => {
                if (err) throw err;
                let i = 0;
                // For Date Update
                result.map(async (item) => {
                    // console.log(item)
                    // if(!item["Tentative DOJ"]) {
                    //     await dbo.collection("onboardDetails").updateOne({"_id":ObjectID(item._id)}, {$set: {["Tentative DOJ"]:''}})
                    //     // res.send(item)
                    // }else {
                    //     await dbo.collection("onboardDetails").updateOne({"_id":ObjectID(item._id)}, {$set: {["Tentative DOJ"]: new Date(item["Tentative DOJ"])}})
                    //     i += 1
                    //     console.log(item._id)
                    //     console.log(i)    
                    // }
                    
                })
                // For Int Parse
                // result.map(async (item) => {
                //     await dbo.collection("onboardDetails").updateOne({"_id":ObjectID(item._id)}, {$set: {["Total Exp"]: parseInt(item["Total Exp"])}})
                //     i += 1
                //     console.log(item._id)
                //     console.log(i)
                // })

            })
           
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
        if(req.query.currentStatus) {
            query = {...query, ['Current Status']: {$regex: req.query.currentStatus, $options:'i'}} 
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
            query["Tentative DOJ"] = {$gte: startDate, $lte: endDate};
        }

        console.log(query)

        MongoClient.connect(url, async function(err, db) {
            if (err) throw err;
            var dbo = db.db("Reports");
            let totalCounts = await dbo.collection("onboardDetails").find(query).count()
            let result = await dbo.collection("onboardDetails").find(query).limit(20).skip(page*20).sort({["Tentative DOJ"]:1}).toArray()
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

const sendMail = (email,res,otp) => {
    const msg = {
        to: email,
        from: 'srikanth.s@mind-graph.com', 
        subject: 'OTP',
        text: `your otp is ${otp}`,
        // html: '<strong>and easy to do anywhere, even with Node.js</strong>',
      }
      sgMail
        .send(msg)
        .then(() => {
            return res.json({status:true,msg:"Email sent"})
        })
        .catch((error) => {
            return res.json({status:false,msg:"Something went wrong try again later"})
        })
}

router.get("/userLogin", async (req, res) => {
    try{
        MongoClient.connect(url, async function(err, db) {
            if (err) throw err;
            var dbo = db.db("Reports");
            let data = await dbo.collection("reports").findOne({['Email Address']:req.query.email})
            if(!data) {
                return res.json({status:false,msg:"Not a regitered user"})
            }
            let otp = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
            await dbo.collection("reports").updateOne({['Email Address']:req.query.email},{$set:{otp:otp}},{upsert:true})
            .then((result) => {
                // res.send(result)
                sendMail(req.query.email,res,otp)    
            })
            .catch(err => res.json({status:false,msg:err}))
            
        });
    }catch(e){
        return res.send(JSON.stringify(e))
    }
})


router.get('/verifyOtp', async (req, res) => {
    Promise.resolve().then(async ()=> {
        let email = req.query.email
        let otp = req.query.otp
        MongoClient.connect(url, async function(err, db) {
            if (err) throw err;
            var dbo = db.db("Reports");
            let user = await dbo.collection("reports").findOne({['Email Address']:email})
            if(!user) {
                return res.json({status:false,msg:"Not a regitered user"})
            }
            if(user.otp == otp) {
                return res.json({status:true,msg:'success'})
            }else {
                return res.json({status:false,msg:'Wrong otp please try again with correct otp'})
            }
            
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            message: "Failed",
            error: JSON.stringify(err)
        });
    });
})

router.get('/verifyUser', async (req, res) => {
    Promise.resolve().then(async ()=> {
        let email = req.query.email
        MongoClient.connect(url, async function(err, db) {
            if (err) throw err;
            var dbo = db.db("Reports");
            let user = await dbo.collection("reports").findOne({['Email Address']:email})
            if(!user) {
                return res.json({status:false,msg:"Not a regitered user"})
            }
            return res.json({status:true,msg:'success'})
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            message: "Failed",
            error: JSON.stringify(err)
        });
    });
})

// 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







module.exports = router;