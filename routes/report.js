const express = require('express')
const MeterData = require('../models/MeterData')
const Report = require('../models/Report')
const router = express.Router();
const multer  = require('multer')
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
var nodemailer = require('nodemailer');
var MongoClient = require('mongodb').MongoClient;
const render = require('xlsx')

const url = "mongodb+srv://srikanth:zxcvbnm321A@cluster0.kvdaf.mongodb.net/Reports?retryWrites=true&w=majority"
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '.xlsx')
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
                "Contact No" : req.body['Contact No'],
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
            query = {...query, ['Current Status']: req.query.currentStatus} 
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
    // console.log(process.env.SEND_GRID_API)
    // const msg = {
    //     to: 'srikanth939196@gmail.com',
    //     from: 'srikanth.s@mind-graph.com', 
    //     subject: 'OTP',
    //     text: `your otp is ${'1234'}`,
    //     // html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    //   }
    //   sgMail
    //     .send(msg)
    //     .then(() => {
    //         console.log(msg)
    //         return res.json({status:true,msg:"Email sent"})
    //     })
    //     .catch((error) => {
    //         console.log(error)
    //         return res.json({status:false,msg:"Something went wrong try again later"})
    //     })
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'nonen3021@gmail.com',
          pass: 'zxcvbnm321A@'
        }
      });
      
      var mailOptions = {
        from: 'nonen3021@gmail.com',
        to: email,
        subject: 'OTP',
        text: `your otp is ${otp}`
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
          return res.json({status:false,msg:"Something went wrong try again later"})
        } else {
          console.log('Email sent: ' + info.response);
          return res.json({status:true,msg:"Email sent"})
        }
      });
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


router.post("/uploadResumesExcel", upload.single('excel'), (req,res) => {
    const file = render.readFile(`uploads/${req.file.filename}`)
    let sheets = file.SheetNames;
    sheets.map((item) => {
        render.utils.sheet_to_json(file.Sheets[item]).map(async (value) => {
            console.log(value)
            MongoClient.connect(url, async function(err, db) {
                if (err) throw err;
                var dbo = db.db("Reports");
                await dbo.collection("reports").insertOne({
                    "Timestamp" : new Date(Math.round((value.Timestamp - 25569)*86400*1000)),
                    "Email Address" : value['Email Address'],
                    "Vendor Name" : value['Vendor Name'],
                    "Candiate Name" : value['Candiate Name'],
                    "Pan/Aadhar No" : value['Aadhar No'],
                    "Contact No" : value['Contact No'],
                    "Skill Set" : value['Skill Set'],
                    "Total Exp" : parseInt(value['Total Exp']),
                    "Rel Exp" : parseInt(value['Rel Exp']),
                    "Current Company" : value['Current Company'],
                    "Current Work Location" : value['Current Work Location'],
                    "Preferred Work Location" : value['Preferred Work Location'],
                    "Email ID" : value['Email ID'],
                    "Notice Period" : parseInt(value['Notice Period']),
                    "GAP (If Any)" : parseInt(value['GAP (If Any)']),
                    "Telephonic Round -Date" : new Date(Math.round((value['Telephonic Round -Date'] - 25569)*86400*1000)),
                    "Telephonic Round -Time" : new Date(Math.round((value['Telephonic Round -Time'] - 25569)*86400*1000)),
                    "Category" : value['Category'],
                    "Bill RATE" : value['Bill RATE'],
                    "Resume" : value['Resume'],
                    "RMG SPOC NAME" : value['RMG SPOC NAME'],
                    "RMG Email ID" : value['RMG Email ID'],
                    "For the Date of submission" : new Date(Math.round((value['For the Date of submission'] - 25569)*86400*1000))
                })
            });
            
        })
    })
    
    return res.send({status:true,msg:'success'})
})


router.post("/uploadOnboardExcel", upload.single('excel'), (req,res) => {
    const file = render.readFile(`uploads/${req.file.filename}`)
    let sheets = file.SheetNames;
    sheets.map((item) => {
        render.utils.sheet_to_json(file.Sheets[item]).map(async (value) => {
            console.log(value["Candidate Name"])
            MongoClient.connect(url, async function(err, db) {
                if (err) throw err;
                var dbo = db.db("Reports");
                await dbo.collection("onboardDetails").insertOne({
                    "Candidate Name" : value["Candidate Name"],
                    "Contact No" : value["Contact No"],
                    "Skill Set" : value["Skill Set"],
                    "RGS ID" : value["RGS ID"],
                    "Tentative DOJ" : new Date(Math.round((value["Tentative DOJ"] - 25569)*86400*1000)),
                    "Current Status" : value["Current Status"],
                    "EMP ID" : value["EMP ID"],
                    "DOJ" : new Date(Math.round((value["DOJ"] - 25569)*86400*1000)),
                    "Date of source" : new Date(Math.round((value["Date of source"] - 25569)*86400*1000)),
                    "Date of selection" : new Date(Math.round((value["Date of selection"] - 25569)*86400*1000)),
                    "RMG" : value["RMG"],
                    "TCS Account/ISU" : value["TCS Account/ISU"],
                    "RMG Location" : value["RMG Location"],
                    "Requirement Email from GENERAL/Known Manager" : value["Requirement Email from GENERAL/Known Manager"],
                    "TCS RATE CARD" : value["TCS RATE CARD"],
                    "Pay RATE" : value["Pay RATE"],
                    "TCS APPROVED RATE CARD" : value["TCS APPROVED RATE CARD"],
                    "Margin" : value["Margin"],
                    "BGC Cleared Date" : new Date(Math.round((value["BGC Cleared Date"] - 25569)*86400*1000)),
                    "BGC SPOC" : value["BGC SPOC"],
                    "Location of On-board" : value["Location of On-board"],
                    "Recruiter Name" : value["Recruiter Name"],
                    "Team Lead Name" : value["Team Lead Name"],
                    "TOI-Spoc" : value["TOI-Spoc"]
                })
            });
            
        })
    })
    
    
    return res.send({status:true,msg:'success'})
})




router.get("/testMail", (req,res) => {
    var transporter = nodemailer.createTransport({
        host: "smtp.zoho.com",
        port: 443,
        secure: true,      
        auth: {
          user: 'support@cominds.co',
          pass: 'sarath@123'
        }
      });
      
      var mailOptions = {
        from: 'SearchPortal-Support@cominds.co',
        to: "srikanth939196@gmail.com",
        subject: '!!!Greetings from TECHORBIT SOFT SYSTEMS PVT LTD !!!- Documents checklist',
        text: `
            Dear  Mamidisetti Hari,

            !!!Congratulations!!!
            
            We are happy to inform you that you have been selected in our organization,  please find the below-mentioned documents which are to be scanned & submitted to us to initiate the background Verification.
            Education:
            
                1. 10th certificate.
            
                2. 12th Certificate.
            
                3. Graduation, Post-graduation (All Semester Memos/Consolidated Memo, Final Convocation certificate)
            
            Career:
            
                    1. Offer letters from all the Companies
            
                    2. Experience and Relieving letter
            
            Proofs:
            
                    1. Current Address Proof (Electricity bill / Rental Agreement on your name)
            
                    2. Permanent Address proof
            
                    3. Aadhar card
            
                    4. PAN Card
            
                    5. Passport
            
            BGC Form should be filled manually ( Attached)
            
            Note: All documents are to be submitted in PDF format only.*
            
            
            Please feel free to reach me if required. 
            Thanks & Best Regards.
            
            Deepthi - HR Team Lead
            
            Email: hr-in1@techorbit.com  | Ph: +91 8341581968
            
            Techorbit Soft Systems Private Limited,
            
            D.No: 1-95/5/4/154/280 | 4th Floor | Sai Nitish Techno Space | Patrikanagar |
            
            Beside Max cure Hospitals | Hi-tech City |Hyderabad 500081 | Telangana, India Voice: 040-48556767
            
            www.techorbit.com`,
        attachments: [{
            filename: 'TCSBGCform.pdf',
            path: 'C:/Users/Srikanth/Desktop/MG/test/backend/uploads/TCSBGCform.pdf',
            contentType: 'application/pdf'
        },
        {
            filename: 'SampleBGCForm.pdf',
            path: 'C:/Users/Srikanth/Desktop/MG/test/backend/uploads/SampleBGCForm.pdf',
            contentType: 'application/pdf'
        }
        ],
      }
      
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
          return res.json({status:false,msg:"Something went wrong try again later"})
        } else {
          console.log('Email sent: ' + info.response);
          return res.json({status:true,msg:"Email sent"})
        }
      });
})

module.exports = router;