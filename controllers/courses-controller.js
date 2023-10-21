const CardsUsers = require('../models/cards')
const verifyToken = require('./token-controller')
const mongoose = require('mongoose')
const allcourses = async (req, res) => {
    try {
     
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit)||5;
        const category = req.query.category;
        let accessNextPage = true
        let accessPreviousPage = true
        
        const courses = await CardsUsers.find(category?{category}:{})
        .skip((page-1)*limit)
        .limit(limit);
        
        const nextpage = await CardsUsers.find(category?{category}:{})
        .skip((page)*limit)
        .limit(limit)

        if(nextpage.length == 0){
            accessNextPage = false
            }
        if(page <=1){
            accessPreviousPage = false
        }
        
        res.json({accessNextPage,accessPreviousPage, courses});

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const idcourse = async (req, res) => {
    try {
        const isValidObjectId = mongoose.Types.ObjectId.isValid(req.params.id);

        if (!isValidObjectId) {
            return res.status(400).json({ error: 'Невірний формат ідентифікатора' });
        }
        
        const course = await CardsUsers.findById(req.params.id);
        
        if (!course) {
            return res.status(404).json({ message: 'Курс не знайдено' });
        }

        return res.status(200).json(course)

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const searchcourse = async (req, res) => {
    try {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit) || 5;

        const searchQuery = req.query.query;

        let accessNextPage = true;
        let accessPreviousPage = true;

        const courses = await CardsUsers.find({ title: { $regex: searchQuery, $options: 'i' } }) // Фільтрація за категорією
            .skip((page - 1) * limit)
            .limit(limit);

        const nextpage = await CardsUsers.find({ title: { $regex: searchQuery, $options: 'i' } }) // Фільтрація за категорією
            .skip(page * limit)
            .limit(limit);

        if (nextpage.length === 0) {
            accessNextPage = false;
        }
        if (page <= 1) {
            accessPreviousPage = false;
        }

        res.json({ accessNextPage, accessPreviousPage, courses});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    allcourses,
    idcourse,
    searchcourse
  };