// const config = require('../../config');
const axios = require('axios');
const config = require('../../config');
const pokemonChainToArray = require('../../utils/pokemonChainToArray');
const { pokeApiURL } = config;
/**
 * Middleware that gets a pokemon from the pokeapi
 */
module.exports = async (req, res) => {
    //add itself to the cache if it doesn't have any object
    // req.cache.getPokemon = req.cache?.getPokemon || {};

    console.log("calling getpokemon")
    try {
        const { pokeQuery } = req.params;
        if (!pokeQuery)
            res.json({ error: "No query provided" })

        //send if it's cached
        if (req.cache?.getPokemon
            && req.cache?.getPokemon[pokeQuery])
            return sendCachedResponse(req, res, pokeQuery)

        // pokemon request
        const pokemonRequest = await axios.get(`${pokeApiURL}/pokemon/${pokeQuery.toLowerCase()}`)

        const pokemon = pokemonRequest?.data;

        //get species for chain
        const speciesUrl = pokemon?.species.url
        if (!speciesUrl)
            return cacheAndSendDefaultResponse(req, res, pokemon)
        //species request
        const speciesResponse = await axios.get(speciesUrl);

        //evolution chain
        const evolutionChainUrl = speciesResponse?.data?.evolution_chain?.url
        if (!evolutionChainUrl)
            return cacheAndSendDefaultResponse(req, res, pokemon)

        //evolution chain request
        const evolutionChainResponse = await axios.get(evolutionChainUrl)
        if (!evolutionChainResponse)
            return cacheAndSendDefaultResponse(req, res, pokemon)


        // complete success
        const completePokemonResponse = {
            chain: pokemonChainToArray({ initialPokemon: evolutionChainResponse?.data.chain }),
            //in case we need it.
            speciesResponse: speciesResponse?.data,
            //down here cuz its annoying to scroll json
            ...pokemon,
        };
        //save into cache
        req.saveCache("getPokemon", pokemon.id,
            1000 * 60 * 0.5, completePokemonResponse);
        req.saveCache("getPokemon", pokemon.name.toLowerCase(),
            1000 * 60 * 0.5, completePokemonResponse);

        // req.cache.getPokemon[pokemon.id] = { data: pokemon, ttl: Date.now() + 1000 * 60 * 0.5 };
        // req.cache.getPokemon[pokemon.name.toLowerCase()] = { data: pokemon, ttl: Date.now() + 1000 * 60 * 0.5 };

        //return data found
        res.json({
            isCached: false,
            ...completePokemonResponse,
        })
    } catch (e) {
        console.log(e)
        res.json({ error: e.message })
    }
}

function cacheAndSendDefaultResponse(req, res, pokemon) {
    // cache.getPokemon[pokemon.id] = { data: pokemon, ttl: Date.now() + 1000 * 60 * 0.5 };
    // cache.getPokemon[pokemon.name.toLowerCase()] = { data: pokemon, ttl: Date.now() + 1000 * 60 * 0.5 };
    req.saveCache("getPokemon", pokemon.id,
        1000 * 60 * 0.5, pokemon);
    req.saveCache("getPokemon", pokemon.name.toLowerCase(),
        1000 * 60 * 0.5, pokemon);

    res.json({ isCached: false, ...pokemon })
}

function sendCachedResponse(req, res, pokeQuery) {
    const pokemon = req.cache.getPokemon[pokeQuery].data

    //refresh the time to live
    req.saveCache("getPokemon", pokemon.id,
        1000 * 60 * 0.5, pokemon);
    req.saveCache("getPokemon", pokemon.name.toLowerCase(),
        1000 * 60 * 0.5, pokemon);

    return res.json({ isCached: true, ...pokemon });
}