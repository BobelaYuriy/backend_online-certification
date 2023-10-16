const CardsUsers = require('../models/cards')
const verifyToken = require('./token-controller')

const allcourses = async (req, res) => {
    try {
     
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit)||5;
        let accessNextPage = true
        let accessPreviousPage = true

        const courses = await CardsUsers.find()
        .skip((page-1)*limit)
        .limit(limit);
        
        const nextpage = await CardsUsers.find()
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

module.exports = {
    allcourses
  };