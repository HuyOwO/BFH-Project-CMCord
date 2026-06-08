const express = require('express');
const { getServers, createServer, getServer, joinServer, deleteServer } = require('../controllers/serverController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/',          getServers);
router.post('/',         createServer);
router.post('/join',     joinServer);
router.get('/:id',       getServer);
router.delete('/:id',    deleteServer);

module.exports = router;
