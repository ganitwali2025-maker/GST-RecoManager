const express = require('express');
const { register, login, getMe, logout } = require('../controllers/auth.controller');
const { registerValidator, loginValidator } = require('../validators/auth.validator');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
