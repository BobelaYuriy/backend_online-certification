const mongoose = require('mongoose')

const TokenSchema = new mongoose.Schema({
    user:{type:mongoose.Schema.ObjectId, ref:'users'},
    refreshToken:{type:String, required:true},
})

const token = mongoose.model('tokens', TokenSchema)
module.exports = token;
