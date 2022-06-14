const express = require('express');
const router = express.Router();
const cacheMiddleware = require('../../middleware/cacheMiddleware');

router.get('/', cacheMiddleware.get);
router.delete('/', cacheMiddleware.delete);

module.exports = router;