const express = require('express');
const router = express.Router();
const { getReminderConfig, saveReminderConfig } = require('../controllers/reminderController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getReminderConfig)
    .post(protect, saveReminderConfig);

module.exports = router;
