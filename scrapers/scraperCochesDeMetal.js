const { chromium } = require("playwright");

async function obtenerPrecioMedioCochesDeMetal(query) {
  const url = `https://cochesdemetal.es/pt/module/iqitsearch/searchiqit?s=${encodeURIComponent(query)}`;
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

    await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });

    const sinResultados = await page.$("div.alert.alert-warning strong");
    if (sinResultados) {
      const texto = await sinResultados.textContent();
      if (texto && texto.toLowerCase().includes("there are no products")) {
        await browser.close();
        return { media: null, detalles: [], mensaje: "No se encontraron productos en CochesDeMetal." };
      }
    }
    await page.screenshot({ path: "screenshotCochesDeMetal.png", fullPage: true });

    await page.waitForSelector("span.product-price font", { timeout: 10000, state: "attached" });


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
