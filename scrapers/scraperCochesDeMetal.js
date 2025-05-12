const { chromium } = require("playwright");

async function obtenerPrecioMedioCochesDeMetal(query) {
  const url = `https://cochesdemetal.es/pt/module/iqitsearch/searchiqit?s=${encodeURIComponent(query)}`;
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    const precios = await page.$$eval("span.price", elements =>
      elements.map(el => {
        const texto = el.textContent.replace("€", "").replace(",", ".").trim();
        return parseFloat(texto);
      }).filter(p => !isNaN(p) && p > 5)
    );

    if (precios.length === 0) {
      return { media: null, detalles: [], mensaje: "No se encontraron precios relevantes." };
    }

    const suma = precios.reduce((a, b) => a + b, 0);
    return {
      media: Number((suma / precios.length).toFixed(2)),
      detalles: precios
    };

  } catch (error) {
    console.error("Error en scraper CochesDeMetal:", error.message);
    return { media: null, detalles: [], mensaje: error.message };
  } finally {
    await browser.close();
  }
}

module.exports = obtenerPrecioMedioCochesDeMetal;
