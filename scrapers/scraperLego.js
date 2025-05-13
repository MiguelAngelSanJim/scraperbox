const { chromium } = require("playwright");

async function obtenerPrecioMedioLego(query) {
  const url = `https://www.lego.com/es-es/search?q=${encodeURIComponent(query)}`;
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled']
  });

  try {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      locale: 'es-ES',
      timezoneId: 'Europe/Madrid',
      viewport: { width: 1280, height: 720 }
    });

    const page = await context.newPage();

    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      'Connection': 'keep-alive',
      'DNT': '1',
      'Upgrade-Insecure-Requests': '1'
    });

    await page.goto(url, { waitUntil: "networkidle", timeout: 90000 });

    const productos = await page.$$eval("li[data-test='product-leaf']", items =>
      items.map(el => {
        const titulo = el.querySelector("[data-test='product-title']")?.textContent?.toLowerCase() || "";
        const precioRaw = el.querySelector("[data-test='product-leaf-price']")?.textContent || "";
        const precio = parseFloat(precioRaw.replace("€", "").replace(",", ".").trim());
        return { titulo, precio };
      }).filter(p => !isNaN(p.precio) && p.precio > 5)
    );

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
