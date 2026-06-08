const express = require('express');
const { getMessages, sendMessage, deleteMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.get('/:channelId/messages',    getMessages);
router.post('/:channelId/messages',   upload.single('file'), sendMessage);
router.delete('/messages/:id',        deleteMessage);

module.exports = router;
