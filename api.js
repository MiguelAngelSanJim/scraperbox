const express = require("express");
const cors = require("cors");

const scraperCochesDeMetal = require("./scrapers/scraperCochesDeMetal");
const scraperCKModelcars = require("./scrapers/scraperCkModelcars");
const scraperLego = require("./scrapers/scraperLego");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get("/precio-medio", async (req, res) => {
    const query = req.query.query;
    if (!query || query.trim().length < 2) {
        return res.status(400).json({ error: "Parámetro 'query' obligatorio." });
    }

    try {
        const [coches, ck, lego] = await Promise.all([
            scraperCochesDeMetal(query),
            scraperCKModelcars(query),
            scraperLego(query),
        ]);

        const detallesTotales = [
            ...(coches.detalles || []),
            ...(ck.detalles || []),
            ...(lego.detalles || [])
        ];

        const mediaGlobal =
            detallesTotales.length > 0
                ? Number((detallesTotales.reduce((a, b) => a + b, 0) / detallesTotales.length).toFixed(2))
                : null;

        const resumen = {
            CochesDeMetal: {
                media: coches.media || null,
                precios: coches.detalles || [],
                ...(coches.mensaje && { error: coches.mensaje })
            },
            CKModelcars: {
                media: ck.media || null,
                precios: ck.detalles || [],
                ...(ck.mensaje && { error: ck.mensaje })
            },
            LEGO: {
                media: lego.media || null,
                precios: lego.detalles || [],
                ...(lego.mensaje && { error: lego.mensaje })
            }
        };

        res.json({
            query,
            mediaGlobal,
            totalResultados: detallesTotales.length,
            resumen
        });
    } catch (error) {
        console.error("Error general:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

app.listen(PORT, () => {
    console.log(`✅ API corriendo en http://localhost:${PORT}`);
});
