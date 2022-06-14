module.exports = (req, res) => {
    console.log(req.cache)
    //calculate time left for each cache element
    for (let cacheSegment in req.cache) {
        for (let key in req.cache[cacheSegment]) {
            req.cache.getPokemon[key].timeLeft = formatTTLToSeconds(req.cache.getPokemon[key].ttl);
        }
    }

    res.json(req.cache);
}

function formatTTLToSeconds(ttl) {
    const timeLeft = new Date(ttl - Date.now()).toISOString().split("T")[1].split(".")[0].split(":");
    if (timeLeft.length !== 3)
        return "0s";

    return `${Number(timeLeft[0]) ? Number(timeLeft[0]) + "h " : ""}`
        + `${Number(timeLeft[1]) ? Number(timeLeft[1]) + "m " : ""}`
        + `${Number(timeLeft[2]) ? Number(timeLeft[2]) + "s" : "0s"}`;
}