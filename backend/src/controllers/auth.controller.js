const bcrypt = require('bcrypt');
const { prisma } = require('../config/database');
const { generateToken } = require('../utils/token');

// Helper for audit logs
const logAudit = async (userId, action, details = {}, ipAddress = null) => {
  try {
    // Only log if user exists (for anonymous logs like failed login, we might not have a userId if user doesn't exist. We handle this below)
    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action,
          entity: 'USER',
          entityId: userId,
          details,
          ipAddress
        }
      });
    }
  } catch (err) {
    console.error('Audit log failed', err);
  }
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Default role is ACCOUNTANT, prevent normal registration as ADMIN
    const finalRole = role && ['ACCOUNTANT', 'VIEWER'].includes(role) ? role : 'ACCOUNTANT';

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: finalRole,
      }
    });

    // Audit log
    await logAudit(user.id, 'REGISTER', { email: user.email, role: user.role }, req.ip);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      await logAudit(user.id, 'FAILED_LOGIN', { reason: 'Inactive account' }, req.ip);
      return res.status(401).json({ success: false, message: 'Account is inactive' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      await logAudit(user.id, 'FAILED_LOGIN', { reason: 'Incorrect password' }, req.ip);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = generateToken(user.id, user.role, user.email);

    await logAudit(user.id, 'LOGIN', {}, req.ip);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'User profile retrieved',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    // In a stateless JWT architecture, the token is invalidated on the client-side.
    // However, we log the logout action.
    if (req.user) {
      await logAudit(req.user.id, 'LOGOUT', {}, req.ip);
    }
    
    res.status(200).json({
      success: true,
      message: 'Logout successful. Please remove token on client.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout
};
