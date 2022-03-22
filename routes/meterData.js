const express = require('express')
const MeterData = require('../models/MeterData')
const Profile = require('../models/Profile')
const Category = require('../models/Category')
const CategoryHeading = require('../models/CategoryHeading')
const router = express.Router();
const multer  = require('multer')

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '.pdf')
    }
})
  
var upload = multer({ storage: storage });


router.get("/login", async (req, res) => {
    try{
        let profile = await Profile.findOne({name:req.query.name})
        if(profile && profile.password == req.query.password) {   
            return res.send({status:true,msg:'success',profile})
        }else if(profile) {
            return res.send({status:false,msg:'Invalid credentials'})
        }
        return res.send({status:false,msg:'No user found'})
    }catch(e){
        return res.send(JSON.stringify(e))
    }
})

router.post('/addCategory', async function (req, res) {
    try{
        let category = Category.insertMany([
            {name:"TESTING"},{name:"CALIBRATION"},
        ])
        if(!category){
            return res.status(500).send('The category cannot be created')
        }else {
            return res.send({status:true,msg:'success',category})
        }
    }catch(e)  {
        return res.send(JSON.stringify(e))
    }
})

router.post('/addCategoryHeading', async function (req, res) {
    try{
        let category = CategoryHeading.insertMany()
        if(!category){
            return res.status(500).send('The category cannot be created')
        }else {
            return res.send({status:true,msg:'success'})
        }
    }catch(e)  {
        return res.send(JSON.stringify(e))
    }
})



router.post('/addProfile', async function (req, res) {
    try{
        let username = await Profile.findOne({name:req.body.name})
        if(username) {
            console.log(username)
            return res.send({status:false,msg:"User already exists"})
        }
        let profile = new Profile(req.body)
        profile = await profile.save()
        if(!profile){
            return res.status(500).send('The profile cannot be created')
        }else {
            return res.send({status:true,msg:'success',profile})
        }
    }catch(e)  {
        return res.send(JSON.stringify(e))
    }
})


router.post('/addMeterData', upload.single('pdf'), async function (req, res) {
    try{
        let meterData = new MeterData({
            "companyName":req.body.companyName,
            "serialId":req.body.serialId,
            "startDate":req.body.startDate,
            "ulrNo":req.body.ulrNo,
            "pdf":req.file.filename
        })
        meterData = await meterData.save()
        if(!meterData){
            return res.status(500).send('The meterData cannot be created')
        }else {
            return res.send({status:true,msg:'success',meterData})
        }
    }catch(e)  {
        return res.send(JSON.stringify(e))
    }
})


router.get('/getMeterData',  async (req, res) => {
    try{
        let query = {};
        if(req.query.companyName) {
            query = {...query, companyName:req.query.companyName}
        }
        if(req.query.serialId) {
            query = {...query, serialId:req.query.serialId}
        }
        if(req.query.ulrNo) {
            query = {...query, ulrNo:req.query.ulrNo}
        }
        if(req.query.startDate) {
            query = {...query, startDate:{$gte:new Date(req.query.startDate)}}
        }
        if(req.query.endDate) {
            query = {...query, endDate:{$lte:new Date(req.query.endDate)}}
        }
        let meterData = await MeterData.find(query)
        if(!meterData){
            return res.status(500).send('No records found')
        }
        return res.send({status:true,msg:'success',meterData})
    }catch(e)  {
        return res.send(JSON.stringify(e))
    }
})

module.exports = router;