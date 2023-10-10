var express = require('express');
var router = express.Router();
const CardsUsers = require('../models/cards')
const arr = [1,2,3,4,5]
router.get('/courses', async (req, res) => {
    try {
      // Отримуємо дані з колекції
      //const cardsUsers = await CardsUsers.find();
      res.json(arr);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  module.exports = router;