// const config = require('../../config');
const axios = require('axios');
const config = require('../../config');
const pokemonChainToArray = require('../../utils/pokemonChainToArray');
const { pokeApiURL, defaultTTL } = config;
/**
 * Middleware that gets a pokemon from the pokeapi
 */
module.exports = async (req, res) => {
    //add itself to the cache if it doesn't have any object
    // req.cache.getPokemon = req.cache?.getPokemon || {};

    console.log("calling getpokemon ", req.params)
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

        //add location encounters
        const locationEncountersUrl = pokemon?.location_area_encounters

        if (locationEncountersUrl) {
            const locationEncountersRequest = await axios.get(locationEncountersUrl)
            const locationEncounters = locationEncountersRequest?.data;
            pokemon.locations = locationEncounters;
        }

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
            defaultTTL, completePokemonResponse);
        req.saveCache("getPokemon", pokemon.name.toLowerCase(),
            defaultTTL, completePokemonResponse);

        // req.cache.getPokemon[pokemon.id] = { data: pokemon, ttl: Date.now() + defaultTTL };
        // req.cache.getPokemon[pokemon.name.toLowerCase()] = { data: pokemon, ttl: Date.now() + defaultTTL };

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
    // cache.getPokemon[pokemon.id] = { data: pokemon, ttl: Date.now() + defaultTTL };
    // cache.getPokemon[pokemon.name.toLowerCase()] = { data: pokemon, ttl: Date.now() + defaultTTL };
    req.saveCache("getPokemon", pokemon.id,
        defaultTTL, pokemon);
    req.saveCache("getPokemon", pokemon.name.toLowerCase(),
        defaultTTL, pokemon);

    res.json({ isCached: false, ...pokemon })
}

function sendCachedResponse(req, res, pokeQuery) {
    const pokemon = req.cache.getPokemon[pokeQuery].data

    //refresh the time to live
    req.saveCache("getPokemon", pokemon.id,
        defaultTTL, pokemon);
    req.saveCache("getPokemon", pokemon.name.toLowerCase(),
        defaultTTL, pokemon);

    return res.json({ isCached: true, ttl: defaultTTL, ...pokemon });
}