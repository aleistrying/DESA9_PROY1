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

        formatTTLToSeconds: (ttl) => {
            const timeLeft = new Date(ttl * 1000).toISOString().split("T")[1].split(".")[0].split(":");
            if (timeLeft.length !== 3)
                return "0s";

            return `${Number(timeLeft[0]) ? Number(timeLeft[0]) + "h " : ""}`
                + `${Number(timeLeft[1]) ? Number(timeLeft[1]) + "m " : ""}`
                + `${Number(timeLeft[2]) ? Number(timeLeft[2]) + "s" : "0s"}`;
        }
    }
    document.Utils = Utils;
})()