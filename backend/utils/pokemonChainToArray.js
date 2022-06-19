module.exports = function pokemonChainToArray({ initialPokemon }) {

    //closing condition
    if (!initialPokemon.evolves_to?.length)
        return {
            name: initialPokemon.species.name,
            isBaby: initialPokemon.is_baby,
        };

    return [{
        name: initialPokemon.species.name,
        isBaby: initialPokemon.is_baby
    },
    ...initialPokemon.evolves_to.map(pokemon => {
        let pokemons = pokemonChainToArray({
            initialPokemon: pokemon
        })

        //if it's an array flat it
        if (pokemons?.length)
            return pokemons.flat()

        return pokemons
    })].flat()
}