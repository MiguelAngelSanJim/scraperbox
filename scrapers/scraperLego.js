const { chromium } = require("playwright");

async function obtenerPrecioMedioLego(query) {
    const url = `https://www.lego.com/es-es/search?q=${encodeURIComponent(query)}`;
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
        await page.goto(url, { waitUntil: "networkidle" });

        // Esperamos explícitamente a un precio visible
        await page.waitForSelector("span[data-test='product-leaf-price']", { timeout: 15000 });

        const productos = await page.$$eval("li[data-test='product-item']", items =>
            items.map(item => {
                const tituloEl = item.querySelector("h3[data-test='product-leaf-title-row'], h3, h2");
                const precioEl = item.querySelector("span[data-test='product-leaf-price']");
                const titulo = tituloEl ? tituloEl.textContent.toLowerCase().trim() : "";
                const precioTexto = precioEl ? precioEl.textContent.replace("€", "").replace(",", ".").trim() : "";
                const precio = parseFloat(precioTexto);
                return { titulo, precio };
            }).filter(p => p.titulo && !isNaN(p.precio))
        );

        console.log("Productos LEGO sin filtrar:", productos);


        const palabras = query.toLowerCase().split(" ").filter(p => p.length > 2);
        const relevantes = productos.filter(p =>
            palabras.filter(palabra => p.titulo.includes(palabra)).length >= 2
        );

        if (relevantes.length === 0) {
            return { media: null, detalles: [], mensaje: "No se encontraron precios relevantes." };
        }

        const precios = relevantes.map(p => p.precio);
        const media = precios.reduce((a, b) => a + b, 0) / precios.length;

        return {
            media: Number(media.toFixed(2)),
            detalles: precios,
        };

    } catch (error) {
        console.error("Error en scraper LEGO:", error.message);
        return { error: true, mensaje: "Falló la extracción de datos." };
    } finally {
        await browser.close();
    }
}

module.exports = obtenerPrecioMedioLego;
