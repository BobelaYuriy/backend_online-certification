const express = require('express');
const db = require('../db');
const jwt = require('jsonwebtoken');
const CardsUsers = require('../models/cards')

const router = express.Router();
const SECRET = process.env.JWT_SECRET;

function verifyToken(req, res, next) {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ error: 'Authorization token is missing' });
    }

    jwt.verify(token.split(' ')[1], SECRET, (err, decoded) => {
        console.log('Decoded token:', decoded);
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.decodedToken = decoded;

        next();
    });
}

router.get('/courses',verifyToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page)||1;
        const limit = parseInt(req.query.limit)||5;
        

        const courses = await CardsUsers.find()
        .skip((page-1)*limit)
        .limit(limit);
        res.json(courses);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;