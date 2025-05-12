const scraperCochesDeMetal = require("./scrapers/scraperCochesDeMetal");
const scraperCKModelcars = require("./scrapers/scraperCkModelcars");
const scraperLego = require("./scrapers/scraperLego");

async function obtenerPrecioGlobal(query) {
    const resultados = await Promise.allSettled([
        scraperCochesDeMetal(query),
        scraperCKModelcars(query),
        scraperLego(query),
    ]);

    const resumen = {};
    let todosLosPrecios = [];

    const tiendas = ["CochesDeMetal", "CKModelcars", "LEGO"];

    resultados.forEach((resultado, index) => {
        const tienda = tiendas[index];

        if (resultado.status === "fulfilled" && resultado.value.media !== null) {
            const precios = resultado.value.detalles;
            resumen[tienda] = {
                media: resultado.value.media,
                precios: precios,
            };
            todosLosPrecios = todosLosPrecios.concat(precios);
        } else {
            resumen[tienda] = {
                media: null,
                precios: [],
                error: resultado.reason?.message || resultado.value?.mensaje || "Error desconocido.",
            };
        }
    });

    const mediaGlobal = todosLosPrecios.length > 0
        ? Number((todosLosPrecios.reduce((a, b) => a + b, 0) / todosLosPrecios.length).toFixed(2))
        : null;

    return {
        query,
        mediaGlobal,
        totalResultados: todosLosPrecios.length,
        resumen,
    };
}

// Obtener el modelo desde argumentos
const query = process.argv.slice(2).join(" ");

if (!query) {
    console.error("Error: debes introducir el modelo de maqueta como argumento.");
    console.error("Ejemplo: node index.js ferrari bburago 1:24");
    process.exit(1);
}

obtenerPrecioGlobal(query).then(resultado => {
    console.log(JSON.stringify(resultado, null, 2));
});
