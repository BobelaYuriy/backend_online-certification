const {Schema, model} = require('mongoose');

const TokenSchema = new mongoose.Schema({
    user:{type: Schema.Types.ObjectId, ref:'users'},
    refreshToken:{type:String, required:true},
})

module.exports = model('tokens', TokenSchema)

