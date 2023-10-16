const CardsUsers = require('../models/cards')
const db = require('../db');

const allcourses = async (req, res) => {
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
}

module.exports = {
    allcourses
  };