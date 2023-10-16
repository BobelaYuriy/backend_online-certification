const mongoose = require('mongoose')

const usersSchema = new mongoose.Schema({
email:{type:String, unique:true, required:true},
username:{type:String, unique:true, required:true},
password:{type:String, required:true},
})

const acauntsUsers = mongoose.model('users', usersSchema)
module.exports = acauntsUsers;
