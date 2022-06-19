(() => {
    const Utils = {
        capitalize: (str) => {
            if (!str) return "";
            try {
                return str.charAt(0).toUpperCase() + str.slice(1);
            } catch (e) {
                console.log(e);
                throw new Error(e)
            }
        },
        fetchPokemon: ({ nameOrId }) => {
            if (!nameOrId) return null;
            return fetch(`http://localhost:3000/pokeapi/pokemon/${nameOrId}`, {
                method: "POST",
            }).then(res => res.json())
                .catch(err => { throw new Error(err) });
        },
        fetchCache: () => {
            return fetch(`http://localhost:3000/cache`, {
                method: "GET",
            }).then(res => res.json())
                .catch(err => { throw new Error(err) });
        },
        deconstructSprites: (sprites) => {

        },
        formatTTLToSeconds: (ttl) => {
            const timeLeft = new Date(ttl * 1000).toISOString().split("T")[1].split(".")[0].split(":");
            if (timeLeft.length !== 3)
                return "0s";

            return `${Number(timeLeft[0]) ? Number(timeLeft[0]) + "h " : ""}`
                + `${Number(timeLeft[1]) ? Number(timeLeft[1]) + "m " : ""}`
                + `${Number(timeLeft[2]) ? Number(timeLeft[2]) + "s" : "0s"}`;
        },
        flatSpriteObject: (spriteObject) => {
            let sprites = Object.entries(spriteObject);
            let flatSprites = [];
            // sprites.forEach(sprite => {
            for (let sprite of sprites) {
                if (sprite[1] === null)
                    continue;
                // console.log(flatSprites)//sprite)
                if (typeof sprite[1] === "object")
                    flatSprites.push(...Utils.flatSpriteObject(sprite[1]).flat());
                else
                    flatSprites.push(sprite[1]);
            }

            return flatSprites.flat();
        },
        getCardStylesFromTypes: (types) => {
            const pokeTypes = types.map(t => t.type.name)
            if (pokeTypes.length === 1)
                pokeTypes.push("default")

            const [first, second] = pokeTypes

            console.log(first, second)
            //linear gradient
            return `border:15px solid var(--${second});background:linear-gradient(90deg, var(--${first}) 0%, var(--${first}) 100%)`


        }
    }
    document.Utils = Utils;
})()