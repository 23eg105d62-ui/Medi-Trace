import exp from 'express';
import UserModel from '../Models/UserModel.js';
import { protect } from '../Middlewares/auth.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const authRoutes = exp.Router();

// Register a new user
authRoutes.post('/register', async (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
        return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await UserModel.create({ name, email, passwordHash });

    res.status(201).json({ message: 'User registered successfully', payload: newUser });
});

// Login
authRoutes.post('/login', async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ message: 'Login successful', token, payload: user });
});

// Get current logged-in user
authRoutes.get('/me', protect, async (req, res, next) => {
    const user = await UserModel.findById(req.user._id).select('-passwordHash');
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User fetched successfully', payload: user });
});

// Update own password
authRoutes.put('/update-password', protect, async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Both current and new password are required' });
    }

    const user = await UserModel.findById(req.user._id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updated = await UserModel.findByIdAndUpdate(
        req.user._id,
        { $set: { passwordHash: hashedPassword } },
        { new: true }
    );

    res.status(200).json({ message: 'Password updated successfully', payload: updated });
});