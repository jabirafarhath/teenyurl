const mongoose = require('mongoose')
const shortId = require('shortid')
shortId.generate()

const newUrlSchema = new mongoose.Schema({
    original:{
        type:String,
        required:true
    },
    new:{
        type:String,
        required:true,
        default: shortId.generate
    },
    clicks:{
        type:Number,
        required:true,
        default:0
    }
})

module.exports = mongoose.model('NewUrl',newUrlSchema)