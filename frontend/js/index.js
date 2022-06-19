const Utils = document.Utils;

(() => {
    const App = {
        htmlElements: {
            pokeapiForm: document.querySelector("#pokeapi-form"),

            spritesCb: document.querySelector("#spritesCb"),
            locationCb: document.querySelector("#locationCb"),
            chainCb: document.querySelector("#chainCb"),

            pokeapiInputSearch: document.querySelector("#pokeapi-input-search"),
            pokeapiOutput: document.querySelector("#pokeapi-output"),

            body: document.querySelector("#body"),
            pokeInfoTitle: document.querySelector("#pokeInfo"),
        },
        init: () => {
            App.htmlElements.pokeapiForm.addEventListener(
                "submit",
                App.handlers.onSubmitPokeapiForm
            );
            App.htmlElements.chainCb.addEventListener(
                "input",
                App.handlers.onCheckboxChange
            );
            App.htmlElements.spritesCb.addEventListener(
                "input",
                App.handlers.onCheckboxChange
            );
            App.htmlElements.locationCb.addEventListener(
                "input",
                App.handlers.onCheckboxChange
            );
        },
        cache: {
            response: null,
            interval: null,
            timer: 0,
        },
        handlers: {
            onCheckboxChange: (e) => {
                e.preventDefault();
                // const { target } = e;
                if (App.cache.response) {
                    const renderedTemplate = App.templates.render({
                        response: App.cache.response,
                    });
                    App.htmlElements.pokeapiOutput.innerHTML = renderedTemplate;
                }
            },
            onSubmitPokeapiForm: async (e) => {
                e.preventDefault();

                const query = App.htmlElements.pokeapiInputSearch?.value;
                // console.log(query, searchType);
                if (!query)
                    return App.htmlElements.pokeapiOutput.innerHTML = `<div class="flat-card-container"><h1>Ingrese algún dato para buscar</h1></div>`;

                try {
                    //multirequest depending on searchType
                    const response = await Utils.fetchPokemon({ nameOrId: query.toLowerCase() })
                    if (response?.error)
                        throw new Error(response.error)

                    if (response?.isCached)
                        App.methods.manageCache(response)

                    if (response?.types)
                        response.cardStyles = Utils.getCardStylesFromTypes(response.types);


                    App.cache.response = response

                    //transform the chain object into a readable array:

                    const renderedTemplate = App.templates.render({
                        response,
                    });
                    App.htmlElements.pokeapiOutput.innerHTML = renderedTemplate;
                } catch (error) {
                    App.htmlElements.pokeapiOutput.innerHTML = `<div class="flat-card-container"><h1>${error}</h1></div>`;
                }
            },

        },
        methods: {
            manageCache: (response) => {
                try {
                    App.cache.timer = response.ttl / 1000
                    App.htmlElements.pokeInfoTitle.innerHTML = `Poke-Información ${Utils.formatTTLToSeconds(App.cache.timer)} (cached)`;
                    clearInterval(App.cache.interval);
                    App.cache.interval = setInterval(() => {
                        if (App.cache.timer === 0) {
                            clearInterval(App.cache.interval);
                            App.htmlElements.pokeInfoTitle.innerHTML = `Poke-Información (server will clear cache)`;
                            return;
                        }
                        App.cache.timer--;
                        App.htmlElements.pokeInfoTitle.innerHTML = `Poke-Información ${Utils.formatTTLToSeconds(App.cache.timer)} (cached)`;
                    }, 1000)

                } catch (e) {
                    console.log(e);
                    throw new Error(e)
                }
            },
        },
        templates: {
            render: ({ response }) => {
                const renderMap = {
                    pokemon: App.templates.pokemonCard,
                };
                return renderMap["pokemon"](response);
            },
            errorCard: () => `<h1>There was an error</h1>`,
            pokemonCard: ({ id, name, types, weight, height, sprites, abilities, chain, locations, cardStyles }) => {
                return `<div class="flat-card-container" style="${cardStyles}">
                            ${App.templates.nameCard({ name, id })}
                            <div class="pokemon-general card-section">
                            <h3 class="pokeapi-title w100">Generales de Pokemones</h3>
                            <div class="flex-between-start mt w100">
                            ${App.templates.weightHeight({ weight, height })}
                            ${App.templates.abilities({ abilities })}
                            </div>
                            </div>
                            ${App.htmlElements.spritesCb?.checked ?
                        `<div class="w100 mt card-section">
                        <h3 class="pokeapi-title w100">Sprites del Pokemon</h3>
                                ${App.templates.sprites({ sprites })}
                            </div>`
                        : ""}
                            ${App.htmlElements.locationCb?.checked ?
                        `<div class="w100 mt card-section">
                                <h3 class="pokeapi-title w100">Ubicación del Pokemon</h3>
                                ${App.templates.location({ locations })}
                            </div>`
                        : ""}
                            ${App.htmlElements.chainCb?.checked ?
                        `<div class="w100 mt card-section">
                        <h3 class="pokeapi-title w100">Cadena de Evolución</h3>
                            ${App.templates.evolutionChain({ chain })}
                            </div>` : ""} 
                        </div>`
            },
            // whoCanLearnAbilityCard: ({ name, pokemon }) =>
            //     `<div class="flat-card-container">
            //         <div class="w100 inner-container-fix">
            //             <h3 class="pokeapi-pokemon-name-title">${Utils.capitalize(name).replace("-", " ")}</h3>
            //             <h4 class="pokeapi-pokemon-title mt">Who can learn it?</h4>
            //             ${App.templates.whoCanLearn({ pokemon })}
            //         </div>
            //     </div>`,
            // whoCanLearn: ({ pokemon }) =>
            //     `<ul>
            //         ${pokemon.map((p) => `<li><div class="li-item-container">${Utils.capitalize(p.pokemon.name)} ${p?.is_hidden ? App.templates.iconHidden() : ""}</div></li>`).join("")}
            //     </ul>`,
            nameCard: ({ name, id }) =>
                `<div class="w100 flex-center mb2">
                    <h2 class="pokeapi-pokemon-name-title">${Utils.capitalize(name)} </h2>
                    <h2 class="pokeapi-pokemon-id-title">${id}</h2>
                </div > `,
            sprites: ({ sprites }) =>
                `<!--<h3 class="pokeapi-pokemon-title">Sprites</h3>-->
                    <div class="pokeapi-sprites">
                    ${Utils.flatSpriteObject(sprites)
                    // .filter(([name, link]) => link !== null && ['front_default', 'back_default'].includes(name))
                    // .filter(([name, worlds]) => name !== null && name === "other")
                    // .map(([name, worlds]) => worlds)[0]?.home ?? {})
                    // .filter(([name, link]) => name.includes("default"))
                    // .sort((a, b) => a[0].includes("shiny") ? 1 : -1)
                    .map((link) => `<div class="pokeapi-sprite-container">
                                        <div class="pokeapi-sprite-img-container"><img class="pokeapi-sprite-img" src="${link}" alt="" /></div>
                                        <!--<p class="pokeapi-sprite-name"></p>-->
                                    </div>`)
                    .join("")}
                </div>`,
            location: ({ locations }) =>
                `<!--<h3 class="pokeapi-pokemon-title">Ubicación</h3>-->
                    <div class="pokeapi-location">
                        ${!locations?.length ? "No ubicaciones" :
                    `<ul>
                            ${locations
                        .map(location => `<li>${location.location_area.name.replace(/-/g, " ").split(" ").map(w => Utils.capitalize(w)).join(" ")}</li>
                        <!--<table>Version|Chance) -> ${location.version_details.map(v => `(${Utils.capitalize(v.version.name)}|${v.max_chance})`).toString().replace(/,/g, "")}</table>-->
                        `)
                        .join("")}
                        </ul>`  }
                    </div>`,
            weightHeight: ({ weight, height }) =>
                `<div class="w48" >
                    <h3 class="pokeapi-pokemon-title"> Weight / Height</h3>
                    <p> ${weight} / ${height}</p>
                </div > `,
            abilities: ({ abilities }) =>
                `<div class="w48">
                    <h3 class="pokeapi-pokemon-title">Abilities</h3>
                        ${!abilities?.length ? "No abilities" :
                    `<ul>
                            ${abilities
                        .map(ability => `<li><div class="li-item-container">${Utils.capitalize(ability.ability.name)} ${ability?.is_hidden ? App.templates.iconHidden() : ""}</div></li>`)
                        .join("")}
                        </ul>`  }
                    </div>`,
            evolutionChain: ({ chain }) =>
                `<!--<h3 class="pokeapi-pokemon-title">Evolution Chain</h3>-->
                        ${!chain?.length ? "No evolution chain" :
                    `<ul>
                            ${chain.map(evolution =>
                        `<li>
<div class="li-item-container">
                                    ${Utils.capitalize(evolution.name)} ${evolution?.isBaby ? App.templates.iconBaby() : ""}
                                    </div>
                                </li>`)
                        .join("")}
                        </ul>`}`,
            iconHidden: () => `<img class="pokeapi-icon" src = "./assets/svg/eye.svg" > `,
            iconBaby: () => `<img class="pokeapi-icon" src = "./assets/svg/baby.svg" > `,
        },
    };
    App.init();
})();