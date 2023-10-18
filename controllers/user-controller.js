const bcrypt = require('bcrypt');
const User = require('../models/user')
const jwt = require('jsonwebtoken');
const UserDto = require('../dtos/user-dto');
const tokenService = require('../services/token-service');
const {validationResult} = require('express-validator');
const ApiError = require('../exceptions/api-error');
const SECRET = process.env.JWT_ACCESS_SECRET;
require("dotenv").config();

const signup = async (req, res,next) => {
    try {
        const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Помилка при валідації', errors.array()))
            }
        const { username, email, password } = req.body;
        // Перевірка наявності коректної email адреси
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email address' });
        }

        // Перевірка наявності паролю
        if (!password) {
            return res.status(400).json({ error: 'Password is required' });
        }

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

        const userData = {...tokens, user: userDto};

        res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
        
        res.status(201).json({ userData });
    } catch (err) {
        next(err)
    }
};

const signin = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ error: 'Wrong username or password' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Wrong username or password' });
        }

        const token = jwt.sign({ userId: user._id },SECRET, { expiresIn: '1h' });

        res.status(200).json({ token });
    } catch (err) {
        console.error('Auth error:', err);
        res.status(500).json({ error: 'Server error' });
    }
  };

  const signout = async (req, res, next) => {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return res.status(400).json({ error: 'Bad Request: Refresh token not provided' });
        }

        const token = await tokenService.removeToken(refreshToken);

        if (!token) {
            return res.status(404).json({ error: 'Not Found: Token not found or already expired' });
        }

        res.clearCookie('refreshToken');
        return res.status(200).json({ message: 'Token removed successfully' });
    } catch (err) {
        next(err)
    }
};

  const refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.cookies;
        const userId = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);

        if (!userId || !tokenFromDb) {
            return res.status(401).json({ error: 'Unauthorized: Invalid user ID or token not found' });
        }

        const user = await User.findById(userId.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({ ...userDto });

        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        const userData = { ...tokens, user: userDto };

        res.cookie('refreshToken', userData.refreshToken, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true
        });

        return res.json(userData);
    } catch (err) {
        next(err)
    }
};
  

module.exports = {
  signup,
  signin,
  signout,
  refresh
};