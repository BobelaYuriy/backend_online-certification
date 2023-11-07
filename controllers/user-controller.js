const bcrypt = require('bcrypt');
const User = require('../models/user')
const UserDto = require('../dtos/user-dto');
const tokenService = require('../services/token-service');
const cloudinary = require('../utils/cloudinary')
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

        res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, overwrite: true });
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
        return res.status(200).json(token)
    } catch (err) {
        console.error('Auth error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};

  const refresh = async (req, res) => {
    try {
        const {refreshToken} = req.cookies;
        ///
        if (!refreshToken) {    
            return res.status(401).json({ error: 'Token is not found' });
        }
        const userId = tokenService.validateRefreshToken(refreshToken);//чому тут id?
        const tokenFromDb = await tokenService.findToken(refreshToken);

        if (!userId || !tokenFromDb) {
            return res.status(401).json({ error: 'Unauthorized: Invalid user ID or token not found' });
        }
        const user = await User.findById(userId.id);
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({ ...userDto });

        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        const userData = { ...tokens, user: userDto };
        ////
        res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, overwrite: true });

        return res.json(userData);
    } catch (err) {
        console.error('refresh err:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};

const updateProfile = async (req, res) => {
    try {
      const userId = req.user.id; // Отримуємо ідентифікатор користувача з авторизації
      const { username, city, age, sex, avatar } = req.body; // Отримуємо дані профілю, які користувач хоче оновити
  
      // Створюємо об'єкт, який міститиме тільки ті поля профілю, які користувач хоче оновити
      const updatedProfile = {};
  
      if (username) {
        updatedProfile.username = username;
      }
      if (city) {
        updatedProfile.city = city;
      }
      if (age) {
        updatedProfile.age = age;
      }
      if (sex) {
        updatedProfile.sex = sex;
      }
      if (avatar) {
        const res = await cloudinary.uploader.upload(avatar,{
            folder: "avatars",
          });
        updatedProfile.avatar = res.url;
      }
  
      // Оновлюємо профіль користувача
      const updatedUser = await User.findByIdAndUpdate(userId, updatedProfile, { new: true });
  
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

const getUserById = async (req, res) => {
    try {
      const userId = req.user.id; // Отримання ID користувача з параметра запиту
  
      // Знаходимо користувача за його ID
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: "Користувача не знайдено" });
      }
  
      res.status(200).json(user); // Відправлення інформації про користувача
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
module.exports = {
  signup,
  signin,
  signout,
  refresh,
  updateProfile,
  getUserById
};