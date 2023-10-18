const bcrypt = require('bcrypt');
const User = require('../models/user')
const UserDto = require('../dtos/user-dto');
const tokenService = require('../services/token-service');
require("dotenv").config();

const signup = async (req, res) => {
    try {     
        const { username, email, password } = req.body;  
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ error: 'User with the same username or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username,
            email,
            password: hashedPassword,
        });

        await user.save();

        const userDto = new UserDto(user);

        const tokens = tokenService.generateTokens({...userDto});

        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        const userData = {...tokens, user: userDto}

        res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
        
        res.status(201).json({userData});
        
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

const signin = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });//находить обєкт по нікнейму

        if (!user) {
            return res.status(401).json({ error: 'Wrong username or password' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Wrong username or password' });
        }

        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});

        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        userData = {...tokens, user: userDto}
        res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
        res.status(200).json(userData);

    } catch (err) {
        console.error('Auth error:', err);
        res.status(500).json({ error: 'Server error' });
    }
  };

  const signout = async (req, res) => {
    try {
        const {refreshToken} = req.cookies;
        const token = await tokenService.removeToken(refreshToken);
        res.clearCookie('refreshToken');
        res.status(200).json(token)
    } catch (err) {
        console.error('Auth error:', err);
        res.status(500).json({ error: 'Server error' });
    }

  }

  const refresh = async (req, res) =>{
    try {
        const {refreshToken} = req.cookies;
        const userId = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);
        if (!userId || !tokenFromDb) {
           return res.status(400).json({ error: 'Unauthorized: Invalid user ID or token not found'});
        }
        const user = await User.findById(userId.id);
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});

        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        const userData = {...tokens, user: userDto}

        res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})

        res.json(userData);
    } catch (err) {
        console.log("refresh err:", err);
        res.status(500).json({ error: 'Server error' });
    }
  };
  

module.exports = {
  signup,
  signin,
  signout,
  refresh
};