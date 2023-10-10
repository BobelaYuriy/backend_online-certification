const mongoose = require('mongoose')
const cardsSchema = new mongoose.Schema({
_id: mongoose.Schema.Types.ObjectId,
title:String,
author:String,
description:String,
date:Date
})

const CardsUsers = mongoose.model('cardsusers', cardsSchema)
module.exports = CardsUsers;
