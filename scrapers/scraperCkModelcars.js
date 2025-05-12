const { chromium } = require("playwright");

async function obtenerPrecioMedioCKModelcars(query) {
  const url = `https://ck-modelcars.de/es/l/t-suche/a-18/?s=${encodeURIComponent(query)}`;
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Comprobar si aparece el mensaje "No se ha detectado ningún producto"
    const sinResultados = await page.$("h2.first");
    if (sinResultados) {
      const texto = await sinResultados.textContent();
      if (texto && texto.toLowerCase().includes("no se ha detectado ningún producto")) {
        await browser.close();
        return { media: null, detalles: [], mensaje: "No se encontraron productos en CKModelcars." };
      }
    }

    // Esperar a que haya precios visibles
    await page.waitForSelector("div.div_liste_punkt_preis.rabatt", { timeout: 10000 });

    const precios = await page.$$eval("div.div_liste_punkt_preis.rabatt", divs =>
      divs
        .map(div => parseFloat(div.childNodes[0].textContent.replace("€", "").replace(",", ".").trim()))
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
    console.error("Error en scraper CKModelcars:", error.message);
    return { error: true, mensaje: "Falló la extracción de datos." };
  }
}

module.exports = obtenerPrecioMedioCKModelcars;
