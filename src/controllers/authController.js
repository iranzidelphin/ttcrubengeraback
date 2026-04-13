import bcrypt from 'bcrypt';
import { User } from '../models/User.js';
import { createToken } from '../utils/createToken.js';
import { buildUserResponse } from '../utils/userResponse.js';

const allowedRoles = ['student', 'teacher', 'parent'];

function normalizeRole(role) {
  return allowedRoles.includes(role) ? role : 'student';
}

function buildUsernameFromEmail(email) {
  return email
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '') || 'user';
}

export async function registerUser(req, res) {
  try {
    const { firstName, lastName = '', email, password, role } = req.body;

    if (!firstName || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'First name, email, and password are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const baseUsername = buildUsernameFromEmail(normalizedEmail);
    let normalizedUsername = baseUsername;
    let suffix = 1;

    const existingEmail = await User.findOne({ email: normalizedEmail });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email already exists.',
      });
    }

    while (await User.findOne({ username: normalizedUsername })) {
      normalizedUsername = `${baseUsername}${suffix}`;
      suffix += 1;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: normalizedUsername,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizeRole(role),
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user: buildUserResponse(user),
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while creating account.',
    });
  }
}

export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required.',
      });
    }

    const identifier = email.toLowerCase().trim();
    const user = await User.findOne({ email: identifier });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
    }

    const token = createToken(user._id.toString());

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while logging in.',
    });
  }
}

export async function getCurrentUser(req, res) {
  return res.status(200).json({
    success: true,
    user: buildUserResponse(req.user),
  });
}
