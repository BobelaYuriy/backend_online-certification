const mongoose = require('mongoose')

const usersSchema = new mongoose.Schema({
email:String,
username:String,
password:String
})

const acauntsUsers = mongoose.model('users', usersSchema)
module.exports = acauntsUsers;
