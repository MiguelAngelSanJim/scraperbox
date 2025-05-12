const { chromium } = require("playwright");

async function obtenerPrecioMedioLego(query) {
  const url = `https://www.lego.com/es-es/search?q=${encodeURIComponent(query)}`;
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    const productos = await page.$$eval("li[data-test='product-leaf']", items => {
      return items.map(el => {
        const titulo = el.querySelector("[data-test='product-title']")?.textContent?.toLowerCase() || "";
        const precioRaw = el.querySelector("[data-test='product-leaf-price']")?.textContent || "";
        const precio = parseFloat(precioRaw.replace("€", "").replace(",", ".").trim());
        return { titulo, precio };
      }).filter(p => !isNaN(p.precio) && p.precio > 5);
    });

    const relevantes = productos.filter(p =>
      query.toLowerCase().split(" ").every(palabra => p.titulo.includes(palabra))
    );

    const precios = relevantes.map(p => p.precio);
    if (precios.length === 0) {
      return { media: null, detalles: [], mensaje: "No se encontraron precios relevantes." };
    }

    const suma = precios.reduce((a, b) => a + b, 0);
    return {
      media: Number((suma / precios.length).toFixed(2)),
      detalles: precios
    };

  } catch (error) {
    console.error("Error en scraper LEGO:", error.message);
    return { media: null, detalles: [], mensaje: error.message };
  } finally {
    await browser.close();
  }
}

module.exports = obtenerPrecioMedioLego;
