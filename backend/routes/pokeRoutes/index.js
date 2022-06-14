const express = require('express');
const router = express.Router();
const { getPokemon } = require('../../middleware/pokeApiMiddleware');

router.post('/pokemon/:pokeQuery', getPokemon);

module.exports = router;