//express server
const config = require('./config');
const express = require('express');
const app = express();
const { renderCSSTriangles, requiredCSSRules } = require('dae2css')
const fs = require("fs")
const cors = require('cors');


const { port = 3000 } = config;

//routes
const pokeRoutes = require('./routes/pokeRoutes');
const cacheRoutes = require('./routes/cacheRoutes');

//internal middleware
const cacheMiddleware = require('./middleware/cacheInternalMiddleware');


app.use(cors());
//handle add and cache responses.
//handle auto remove cache
app.use(cacheMiddleware);

//routes 
app.use("/pokeapi", pokeRoutes);
app.use("/cache", cacheRoutes);

app.listen(port, () => console.log(`App listening on port ${port}!`));