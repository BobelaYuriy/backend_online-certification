const mongoose = require('mongoose')

const TokenSchema = new mongoose.Schema({
user:{type:mongoose.Schema.ObjectId, ref:'user'},
refreshToken:{type:String, required:true},
})

const token = mongoose.model('users', usersSchema)
module.exports = token;
