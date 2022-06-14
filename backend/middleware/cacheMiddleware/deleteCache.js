module.exports = (req, res) => {
    console.log(req.cache)
    const clearedCache = req.clearCache();
    res.json({
        success: clearedCache,
        ...(clearedCache ? { cache: req.cache }
            : { error: "No Cache to clear" })
    });
}