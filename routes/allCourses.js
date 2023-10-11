const express = require('express');
const db = require('../db');
const CardsUsers = require('../models/cards')

const router = express.Router();
const SECRET = process.env.JWT_SECRET;

router.get('/courses', async (req, res) => {
    try {
        const cardsUsers = await CardsUsers.find();
    
        const limit = parseInt(req.query.limit);
        
        let result = [];
        for (let i = 0; i < cardsUsers.length; i += limit) {
            result.push(cardsUsers.slice(i, i + limit));
        }
        
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;