const {Schema, model} = require('mongoose');

const usersSchema = new Schema({
email:{type:String, unique:true, required:true},
username:{type:String, unique:true, required:true},
password:{type:String, required:true},
})
module.exports = model('users', usersSchema);
