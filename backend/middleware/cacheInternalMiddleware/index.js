const cache = {
    // getPokemon: {},//future middleware to automate this.
}
module.exports = (req, res, next) => {
    //adding cache to the request for future use
    req.cache = cache;
    //adding a cache function auto save utility
    req.saveCache = (cacheSegment, cacheElement, ttl, data) => {
        if (!cache[cacheSegment])
            cache[cacheSegment] = {};

        cache[cacheSegment][cacheElement] = {
            data,
            ttl: Date.now() + ttl
        }
    }
    req.clearCache = () => {
        if (!Object.keys(cache).length)
            return false;
        for (let key in cache) {
            delete cache[key]
        }
        return true;

    }
    //auto removal for cache
    for (let key in cache.getPokemon) {
        if (cache.getPokemon[key].ttl < Date.now()) {
            delete cache.getPokemon[key];
        }
    }
    next();
}