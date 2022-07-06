const express = require('express')
const MeterData = require('../models/MeterData')
const Profile = require('../models/Profile')
const Category = require('../models/Category')
const CategoryHeading = require('../models/CategoryHeading')
const router = express.Router();
const multer  = require('multer')
const accountSid = "AC9b083a467b123820fef40a0e330fb685"; 
const authToken = '5d821c541f4ed25fa504bb52f3f5cd01';
const client = require('twilio')(accountSid, authToken);
const  ObjectID = require('mongodb').ObjectId;
var MongoClient = require('mongodb').MongoClient;

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '.pdf')
    }
})
  
var upload = multer({ storage: storage });


const sendOtp = (mobileNo,res,otp) => {
client.messages
  .create({
     body: `otp is ${otp}`,
     from: '+19404681609',
     to: `+91${mobileNo}`
   })
  .then(message => {
    return res.json({"id":message.sid, "status":true})
  })
  .catch(err => {
    return res.json({"msg":JSON.stringify(err), "status":false})
  })
}


router.get("/login", async (req, res) => {
    try{
        
        let profile = await Profile.findOne({mobileNo:req.query.name})
        console.log(profile)
        if(profile) {   
            let otp = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
            MongoClient.connect("mongodb://127.0.0.1:27017", async function(err, db) {
                if (err) throw err;
                var dbo = db.db("test");
                await dbo.collection("profiles").updateOne({"mobileNo":req.query.name},{$set:{"otp":otp}})
            })    
            // console.log(data)
            sendOtp(req.query.name,res,otp)
            // return res.send({status:true,msg:'success',profile})
        }else if(profile) {
            return res.send({status:false,msg:'Invalid credentials'})
        }else {
            return res.send({status:false,msg:'No user found'})
        }
        
    }catch(e){
        return res.send(JSON.stringify(e))
    }
})




router.get("/sendOtp", () => {
    try {
        let 
        
    }catch(err) {

    }

})


router.get("/verifyOtp", async (req, res) => {
    try{
        let profile = await Profile.findOne({mobileNo:req.query.name})
        console.log(profile.name)
        // console.log(req.query.otp)
        if(profile && profile.otp == parseInt(req.query.otp)) {   
            return res.send({status:true,msg:'success',profile})
        }else if(profile) {
            return res.send({status:false,msg:'Wrong otp'})
        }else {
            return res.send({status:false,msg:'No user found'})
        }
        
    }catch(e){
        return res.send(JSON.stringify(e))
    }
})

router.post('/addCategory', async function (req, res) {
    try{
        let category = Category.insertMany([
            {
                heading:"TESTING",
                sectionHeading:"BIOLOGICAL DISCIPLINE",
                subHeading:"Animal Food & Feed",
                names:["Chemical","Biological","Mechanical","Electrical","Electronics","Fluid Flow","Forensic","Non-Destructive (NDT)","Photometry","Radiological","Diagnostic Radiology QA Testing","Software & IT System"]
            },
            {
                heading:"TESTING",
                sectionHeading:"BIOLOGICAL DISCIPLINE",
                subHeading:"Antimicrobial activity Products",
                names:["Adhesives Glues and Sealant","Fuels and Oils","Lubricants","Packaging Materials","Paints and surface coatings","Pulp & Paper","Soaps & Detergents","Textiles & Fabrics","Toys and Other Children\u2019s Products","Water Miscible Products","Wood & Wooden Products","Others"]
            },
            {
                heading:"TESTING",
                sectionHeading:"BIOLOGICAL DISCIPLINE",
                subHeading:"AYUSH Products",
                names:["Ayurvedic drugs","Herbal formulations","Homeopathic Drugs","Siddha Drugs","Unani Drugs","Others"]

            },
            {
                heading:"TESTING",
                sectionHeading:"BIOLOGICAL DISCIPLINE",
                subHeading:"Biocides",
                names:["Algicides","Antiseptics","Bactericides","Disinfectants","Fungicides","Herbicides","Insecticides","Sanitizers","Sporicides","Viricides","Weedicides","Others"]
            },
            {
                heading:"TESTING",
                sectionHeading:"BIOLOGICAL DISCIPLINE",
                subHeading:"Biological Monitoring",
                names:["Blood alcohol","Drugs & Drug Metabolites","Fluoride","Interferons","Others"]
            },
            {
                heading:"TESTING",
                sectionHeading:"BIOLOGICAL DISCIPLINE",
                subHeading:"Biological Tests on Other Miscellaneous Test Items",
                names:["Adhesives Glues and Sealant","Fuels and Oils","Lubricants","Packaging Materials","Paints and surface coatings","Pulp & Paper","Soaps & Detergents","Textiles & Fabrics","Toys and Other Children\u2019s Products","Wood & Wooden Products","Others"]
            },
            {
                heading:"TESTING",
                sectionHeading:"BIOLOGICAL DISCIPLINE",
                subHeading:"Biologically Derived Pharmaceuticals",
                names:["Enzymes","Growth factors","Hormones","Monoclonal Antibodies (MABs)","Recombinant Proteins","Single Cell Proteins (SCP)","Vaccines","Others"]
            },
            {
                heading:"TESTING",
                sectionHeading:"BIOLOGICAL DISCIPLINE",
                subHeading:"Biopesticides and Biofertilizers",
                names:["Others"]
            },
            {
                heading:"TESTING",
                sectionHeading:"BIOLOGICAL DISCIPLINE",
                subHeading:"Cell Culture",
                names:["Cell permeability test","Purity","Others"]
            },
            {
                heading:"TESTING",
                sectionHeading:"BIOLOGICAL DISCIPLINE",
                subHeading:"Cosmetics & Essential Oil",
                names:["Perfumes","Tooth Paste","Hygiene products","Cosmetics"]
            },
            {
                heading:"TESTING",
                sectionHeading:"BIOLOGICAL DISCIPLINE",
                subHeading:"Drugs and Pharmaceuticals",
                names:["Antibiotics","Bioassays of Other Products (Other Than Those Products Mentioned Above)","Chemotherapeutic Agents","Drug Intermediates","Drug Substances (Active Pharmaceuticals Ingredients (API))","Endotoxins","Filtrable Solutions & Soluble Preparations","Immunological Products","Microbial limit test","Non-Filterable Preparations Including Ointments","Preservative efficacy","Pyrogen tests","Raw Materials","Sterility tests","Synthetic Drugs","Veterinary Drugs","Others"]
            },
            {
                heading:"TESTING",
                sectionHeading:"BIOLOGICAL DISCIPLINE",
                subHeading:"Pollution & Environment",
                names:["Air surface","Bio burden Estimation of Classified and non-classified area","Effluents Waste water","Sewage","Soil","Solid waste","Others"]
            },
            {
                heading:"TESTING",
                sectionHeading:"BIOLOGICAL DISCIPLINE",
                subHeading:"Food and Agricultural Products",
                names:["Bakery & Confectionery Products","Beverages (Alcoholic \/ Non-Alcoholic)","Canned & Processed Foods","Cereals, Pulses & Cereal Products","Coffee & Cocoa Products","Edible Colors & Flavors","Edible Oils & Fats","Edible Salts","Eggs & Egg Products ","Essential Nutrients Including Vitamins","Food Additives & Preservatives","Fruit & Fruit Products","Gelatin and Other Gums","Herbs, Spices & Condiments","Honey & Honey Products","Infant Foods","Jams, Juices, Sauces & Concentrates","Meat & Meat Products","Milk & Dairy Products (Except Human Milk)","Natural Waxes","Nuts & Nut Products","Oil Seeds & By-Products","Poultry & Poultry Products","Snacks and Instant Mixes","Starch & Starch Products","Sugar & Sugar Products","Tea","Tobacco & Tobacco Products","Vegetables & Vegetable Products","Others"]
            },
            {
                heading:"TESTING",
                sectionHeading:"BIOLOGICAL DISCIPLINE",
                subHeading:"Plants",
                names:["Plants  ","Plants material","Other"]
            },
            {
                heading:"TESTING",
                sectionHeading:"BIOLOGICAL DISCIPLINE",
                subHeading:"GM Products",
                names:["Promoter & Terminator Screening","Qualitative Detection","Quantitative Analysis","Others"]
            },
            {
                heading:"TESTING",
                sectionHeading:"BIOLOGICAL DISCIPLINE",
                subHeading:"1.1.16. Industrial Cultures",
                names:["Cultures for baking and brewing","Dairy Starter Cultures","Mushroom Spawn","Probiotics Cultures","Rhizobial Cultures"]
            },
            {
                heading:"TESTING",
                sectionHeading:"BIOLOGICAL DISCIPLINE",
                subHeading:"1.1.17. Marine /Aqua culture Food Products",
                names:["Artemia & Artemia Products","Crab & Crab Products","Fish & Fish Products","Molecular identification of bacterial, fungal, viral pathogens","Oyster","Prawn & Prawn Products","Shrimps","Others"]
            },
            {
                heading:"TESTING",
                sectionHeading:"BIOLOGICAL DISCIPLINE",
                subHeading:"1.1.18. Medical Accessories & Surgical products",
                names:["Blood Bags","Catheter","Condoms","Copper T","Hypodermic Needles","Tubal Rings","Others"]
            },
            {
                heading:"TESTING",
                sectionHeading:"BIOLOGICAL DISCIPLINE",
                subHeading:"1.1.19. Molecular Analysis (Tests for Various Matrices-Human, Plants, Animal, Microbial)",
                names:["16S rDNA sequencing","Bacterial Mutagenicity Tests","Bacterial\/ fungal\/viral Pathogen Detection","Detection of adulterants","Fragment Analysis","Gene Expression \/Gene Copy Number","Genotyping","Next Gen- Sequencing","Sister Chromatid Exchange Tests","Transformation Assays In Cell culture","Others"]
            },
            {
                heading:"TESTING",
                sectionHeading:"BIOLOGICAL DISCIPLINE",
                subHeading:"1.1.20. Nutraceuticals & Functional Foods",
                names:["Carotenoids","Dietary Fibres","Flavonoids","Fortified Food","Phytoestrogens","Prebiotics","Probiotics","Soy Proteins","Others"]
            },
            {
                heading:"TESTING",
                sectionHeading:"BIOLOGICAL DISCIPLINE",
                subHeading:"1.1.21. Nutritional Supplements",
                names:["Others"]
            },
            {
                heading:"TESTING",
                sectionHeading:"BIOLOGICAL DISCIPLINE",
                subHeading:"1.1.22. Plants and Plant Materials",
                names:["Identification of Bacterial /Fungal/Viral Pathogens","Others"]
            },

            {
                heading:"TESTING",
                sectionHeading:"BIOLOGICAL DISCIPLINE",
                subHeading:"1.1.23. Residue Analysis",
                names:["Antibiotic residue analysis by micro assay ","Others"]
            },
            {
                heading:"TESTING",
                sectionHeading:"BIOLOGICAL DISCIPLINE",
                subHeading:"1.1.24. Resistance to Microbial Attack",
                names:["Electrical Components","Leather & Leather Products","Packaging Materials","Paints and surface coatings","Textiles and Fabrics","Timber and Allied Material","Wood and Wood Proc\\ducts","Others"]
            },

            {
                heading:"TESTING",
                sectionHeading:"BIOLOGICAL DISCIPLINE",
                subHeading:"1.1.25. Seed Testing",
                names:["Germination","GM Testing","Purity","Others"]
            },
            {
                heading:"TESTING",
                sectionHeading:"BIOLOGICAL DISCIPLINE",
                subHeading:"1.1.26. Toxicology",
                names:["Acute Toxicity (oral, dermal, inhalation)","Ame\u2019s test","Cytogenetics","Cytotoxicity","Eye irritation test","Mucous membrane irritation test","Mutagenicity (In -vitro)","Skin sensitization test","In vitro studies using cell culture\/chick embryos   ","Material mediated Pyrogenicity","Hemolytic properties of material (Hemocompatibility) Implantation (bone, muscle, Subcutaneous)  ","Others"]
            },
            {
                heading:"TESTING",
                sectionHeading:"BIOLOGICAL DISCIPLINE",
                subHeading:"1.1.27. Veterinary Testing",
                names:["Specified tests in biochemistry, Haematology, cytopathology, histopathology, serology, parasitology","Others"]
            },
            {
                heading:"TESTING",
                sectionHeading:"BIOLOGICAL DISCIPLINE",
                subHeading:"1.1.28. Water",
                names:["Distilled \/Demineralized Water","Drinking Water","Ground Water\/ Surface Water","Packaged Drinking Water","Packaged Natural Mineral Water","Water for Construction Purpose","Water for industrial purpose","Water for Medicinal Purposes","Water for Processed Food Industry","Water for Swimming Pool and Spas  ","Water Purifiers ","Others"]
            },
            {
                heading:"TESTING",
                sectionHeading:"BIOLOGICAL DISCIPLINE",
                subHeading:"1.1.29. Wild Life Forensic",
                names:["Others"]
            },
            {
                heading:"TESTING",
                sectionHeading:"BIOLOGICAL DISCIPLINE",
                subHeading:"1.1.30.  Miscellaneous",
            },
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
        let mobileNo = await Profile.findOne({mobileNo:req.body.mobileNo})
        if(mobileNo) {
            console.log(mobileNo)
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
            query = {...query, companyName: {$regex: req.query.companyName, $options:'i'}}
        }
        if(req.query.serialId) {
            query = {...query, serialId:{$regex: req.query.serialId, $options:'i'}}
        }
        if(req.query.ulrNo) {
            query = {...query, ulrNo:{$regex: req.query.ulrNo, $options:'i'}}
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