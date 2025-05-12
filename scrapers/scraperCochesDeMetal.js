const { chromium } = require("playwright");

async function obtenerPrecioMedioCochesDeMetal(query) {
    const url = `https://cochesdemetal.es/pt/module/iqitsearch/searchiqit?s=${encodeURIComponent(query)}`;
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
        await page.goto(url, { waitUntil: "domcontentloaded" });

        // Comprobar si aparece el mensaje "There are no products."
        const sinResultados = await page.$("div.alert.alert-warning strong");
        if (sinResultados) {
            const texto = await sinResultados.textContent();
            if (texto && texto.toLowerCase().includes("there are no products")) {
                await browser.close();
                return { media: null, detalles: [], mensaje: "No se encontraron productos en CochesDeMetal." };
            }
        }

        // Esperar a que haya precios visibles
        await page.waitForSelector("span.product-price font", { timeout: 10000 });

        const precios = await page.$$eval("span.product-price font", spans =>
            spans.map(span => parseFloat(span.textContent.replace("€", "").replace(",", ".").trim()))
                .filter(p => !isNaN(p))
        );

        await browser.close();

        if (precios.length === 0) {
            return { media: null, detalles: [], mensaje: "No se encontraron precios." };
        }

        const media = precios.reduce((a, b) => a + b, 0) / precios.length;

        return {
            media: Number(media.toFixed(2)),
            detalles: precios,
        };

    } catch (error) {
        await browser.close();
        console.error("Error en scraper CochesDeMetal:", error.message);
        return { error: true, mensaje: "Falló la extracción de datos." };
    }
}

module.exports = obtenerPrecioMedioCochesDeMetal;
