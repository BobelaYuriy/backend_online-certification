const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const usersSchema = new mongoose.Schema({
_id: mongoose.Schema.Types.ObjectId,
email:String,
username:String,
password:String
})

usersSchema.pre('save', async function (next){
    
})

const acauntsUsers = mongoose.model('users', usersSchema)
module.exports = acauntsUsers;
