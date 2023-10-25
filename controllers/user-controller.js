const bcrypt = require('bcrypt');
const User = require('../models/user')
const UserDto = require('../dtos/user-dto');
const tokenService = require('../services/token-service');
require("dotenv").config();

const signup = async (req, res) => {
    try {
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
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

const signin = async (req, res) => {
    console.log(req.headers);
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const user = await User.findOne({ username });

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
        const userData = {...tokens, user: userDto};

        res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
        res.status(200).json(userData);
    } catch (err) {
        console.error('Auth error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

  const signout = async (req, res) => {
    console.log(req.headers);
    try {
        const {refreshToken} = req.cookies;

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
        console.error('Auth error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};

  const refresh = async (req, res) => {
    try {
        const {refreshToken} = req.cookies;
        if (!refreshToken) {    
            return res.status(401).json({ error: 'Token is not found' });
        }
        const userId = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);

        if (!userId || !tokenFromDb) {
            return res.status(401).json({ error: 'Unauthorized: Invalid user ID or token not found' });
        }
        const user = await User.findById(userId.id);
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({ ...userDto });

        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        const userData = { ...tokens, user: userDto };

        res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})

        return res.json(userData);
    } catch (err) {
        console.error('refresh err:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
  signup,
  signin,
  signout,
  refresh
};