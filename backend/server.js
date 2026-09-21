const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

const DATA_FILE = path.join(__dirname, "data", "products.json");

// ======================================================
// CONFIGURATION ADMIN
// ======================================================

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// ======================================================
// CONFIGURATION AMAZON AFFILIATION
// ======================================================

const AMAZON_ASSOCIATE_TAG =
    process.env.AMAZON_ASSOCIATE_TAG || "pcfinderfr-21";

// ======================================================
// MIDDLEWARES
// ======================================================

app.use(cors());
app.use(express.json());

// ======================================================
// AUTHENTIFICATION ADMIN
// ======================================================

function requireAdmin(req, res, next) {
    if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
        console.error(
            "ERREUR : ADMIN_USERNAME ou ADMIN_PASSWORD n'est pas configuré dans Render."
        );

        return res.status(500).json({
            error: "Authentification administrateur non configurée"
        });
    }

    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Basic ")) {
        res.setHeader(
            "WWW-Authenticate",
            'Basic realm="PCFinder Administration"'
        );

        return res.status(401).send(
            "Authentification administrateur requise."
        );
    }

    try {
        const encodedCredentials =
            authorization.slice(6);

        const decodedCredentials =
            Buffer.from(
                encodedCredentials,
                "base64"
            ).toString("utf8");

        const separatorIndex =
            decodedCredentials.indexOf(":");

        if (separatorIndex === -1) {
            res.setHeader(
                "WWW-Authenticate",
                'Basic realm="PCFinder Administration"'
            );

            return res.status(401).send(
                "Identifiants invalides."
            );
        }

        const username =
            decodedCredentials.slice(
                0,
                separatorIndex
            );

        const password =
            decodedCredentials.slice(
                separatorIndex + 1
            );

        if (
            username !== ADMIN_USERNAME ||
            password !== ADMIN_PASSWORD
        ) {
            res.setHeader(
                "WWW-Authenticate",
                'Basic realm="PCFinder Administration"'
            );

            return res.status(401).send(
                "Identifiants invalides."
            );
        }

        next();

    } catch (error) {
        console.error(
            "Erreur lors de l'authentification admin :",
            error
        );

        res.setHeader(
            "WWW-Authenticate",
            'Basic realm="PCFinder Administration"'
        );

        return res.status(401).send(
            "Authentification invalide."
        );
    }
}

// ======================================================
// INTERFACE ADMIN
// ======================================================

const ADMIN_DIR = path.join(__dirname, "admin");

app.use(
    "/admin",
    requireAdmin,
    express.static(ADMIN_DIR)
);

app.get(
    "/admin",
    requireAdmin,
    (req, res) => {
        res.sendFile(
            path.join(
                ADMIN_DIR,
                "admin.html"
            )
        );
    }
);

// ======================================================
// OUTILS AMAZON AFFILIATION
// ======================================================

function createAmazonAffiliateUrl(url) {
    if (!url) {
        return url;
    }

    const originalUrl = String(url).trim();

    if (!originalUrl) {
        return originalUrl;
    }

    const lowerUrl = originalUrl.toLowerCase();

    if (
        !lowerUrl.includes("amazon.fr") &&
        !lowerUrl.includes("amzn.eu") &&
        !lowerUrl.includes("amzn.to") &&
        !lowerUrl.includes("link.amazon")
    ) {
        return originalUrl;
    }

    // --------------------------------------------------
    // Recherche de l'ASIN
    // --------------------------------------------------

    let asin = null;

    const dpMatch = originalUrl.match(
        /\/dp\/([A-Z0-9]{10})/i
    );

    if (dpMatch) {
        asin = dpMatch[1];
    }

    if (!asin) {
        const gpProductMatch = originalUrl.match(
            /\/gp\/product\/([A-Z0-9]{10})/i
        );

        if (gpProductMatch) {
            asin = gpProductMatch[1];
        }
    }

    if (!asin) {
        const productMatch = originalUrl.match(
            /\/product\/([A-Z0-9]{10})/i
        );

        if (productMatch) {
            asin = productMatch[1];
        }
    }

    // --------------------------------------------------
    // Si aucun ASIN n'est trouvé
    // --------------------------------------------------

    if (!asin) {
        console.warn(
            "Impossible de trouver l'ASIN Amazon dans :",
            originalUrl
        );

        return originalUrl;
    }

    // --------------------------------------------------
    // Génération du lien affilié propre
    // --------------------------------------------------

    return (
        "https://www.amazon.fr/dp/" +
        asin +
        "?tag=" +
        encodeURIComponent(
            AMAZON_ASSOCIATE_TAG
        )
    );
}

function processAmazonOffers(product) {
    if (!product || !Array.isArray(product.offers)) {
        return product;
    }

    product.offers = product.offers.map(function (offer) {
        if (!offer || typeof offer !== "object") {
            return offer;
        }

        const updatedOffer = {
            ...offer
        };

        const merchant = String(
            updatedOffer.merchant ||
            updatedOffer.store ||
            updatedOffer.shop ||
            ""
        ).toLowerCase();

        const url = String(
            updatedOffer.url ||
            updatedOffer.link ||
            ""
        );

        const isAmazon =
            merchant.includes("amazon") ||
            url.toLowerCase().includes("amazon.fr") ||
            url.toLowerCase().includes("amzn.eu") ||
            url.toLowerCase().includes("amzn.to") ||
            url.toLowerCase().includes("link.amazon");

        if (isAmazon && url) {
            const affiliateUrl =
                createAmazonAffiliateUrl(url);

            if (updatedOffer.url !== undefined) {
                updatedOffer.url = affiliateUrl;
            }

            if (updatedOffer.link !== undefined) {
                updatedOffer.link = affiliateUrl;
            }

            if (
                updatedOffer.url === undefined &&
                updatedOffer.link === undefined
            ) {
                updatedOffer.url = affiliateUrl;
            }
        }

        return updatedOffer;
    });

    return product;
}

// ======================================================
// OUTILS DE CALCUL DES SCORES
// ======================================================

function extractNumber(value) {
    if (value === null || value === undefined) {
        return 0;
    }

    const match = String(value)
        .replace(",", ".")
        .match(/[\d.]+/);

    if (!match) {
        return 0;
    }

    return Number(match[0]);
}

function clamp(value, min, max) {
    return Math.max(
        min,
        Math.min(max, value)
    );
}

// ======================================================
// SCORE GPU
// ======================================================

function getGpuScore(gpu) {
    const value = String(gpu || "").toLowerCase();

    if (value.includes("5090")) return 10;
    if (value.includes("5080")) return 9.8;
    if (value.includes("5070 ti")) return 9.5;
    if (value.includes("5070")) return 9.2;
    if (value.includes("5060")) return 8.8;
    if (value.includes("5050")) return 8.1;
    if (value.includes("4090")) return 10;
    if (value.includes("4080")) return 9.7;
    if (value.includes("4070 ti")) return 9.2;
    if (value.includes("4070")) return 8.8;
    if (value.includes("4060")) return 8.0;
    if (value.includes("4050")) return 7.0;
    if (value.includes("3090")) return 9.5;
    if (value.includes("3080")) return 9.0;
    if (value.includes("3070")) return 8.0;
    if (value.includes("3060")) return 7.0;
    if (value.includes("3050")) return 5.8;

    if (value.includes("rx 7900")) return 9.5;
    if (value.includes("rx 7800")) return 8.8;
    if (value.includes("rx 7700")) return 8.2;
    if (value.includes("rx 7600")) return 7.2;

    if (value.includes("arc b580")) return 8.0;
    if (value.includes("arc a770")) return 7.5;
    if (value.includes("arc a750")) return 7.0;

    return 5;
}

// ======================================================
// SCORE CPU
// ======================================================

function getCpuScore(cpu) {
    const value = String(cpu || "").toLowerCase();

    if (
        value.includes("9950") ||
        value.includes("9950x")
    ) return 10;

    if (
        value.includes("9900") ||
        value.includes("9850") ||
        value.includes("9800")
    ) return 9.8;

    if (
        value.includes("7950") ||
        value.includes("7950x")
    ) return 9.7;

    if (
        value.includes("7900") ||
        value.includes("7900x")
    ) return 9.5;

    if (
        value.includes("9700") ||
        value.includes("9700x")
    ) return 9.3;

    if (value.includes("7800x3d")) return 9.5;

    if (
        value.includes("7700") ||
        value.includes("7700x")
    ) return 8.9;

    if (
        value.includes("7600") ||
        value.includes("7600x")
    ) return 8.1;

    if (value.includes("ryzen 7 260")) return 8.8;
    if (value.includes("ryzen 9")) return 9.2;
    if (value.includes("ryzen 7 8")) return 8.7;
    if (value.includes("ryzen 7 7")) return 8.0;
    if (value.includes("ryzen 7")) return 7.8;
    if (value.includes("ryzen 5 7")) return 6.9;
    if (value.includes("ryzen 5")) return 6.5;

    if (value.includes("ultra 9")) return 9.3;
    if (value.includes("ultra 7")) return 8.7;
    if (value.includes("ultra 5")) return 7.8;

    if (value.includes("i9")) return 9.5;
    if (value.includes("i7")) return 8.3;

    if (
        value.includes("i5-14") ||
        value.includes("i5-13")
    ) return 7.8;

    if (value.includes("i5-12")) return 6.8;
    if (value.includes("i5")) return 6.8;
    if (value.includes("i3")) return 4.5;

    return 5;
}

// ======================================================
// SCORE RAM
// ======================================================

function getRamScore(ram) {
    const amount = extractNumber(ram);

    if (amount >= 64) return 10;
    if (amount >= 48) return 9.5;
    if (amount >= 32) return 9;
    if (amount >= 24) return 8;
    if (amount >= 16) return 7;
    if (amount >= 12) return 5.5;
    if (amount >= 8) return 4;
    if (amount >= 4) return 2.5;

    return 3;
}

// ======================================================
// SCORE STOCKAGE
// ======================================================

function getStorageScore(storage) {
    const value = String(storage || "").toLowerCase();
    const amount = extractNumber(value);

    if (
        value.includes("2 to") ||
        value.includes("2tb") ||
        value.includes("2 tb")
    ) return 10;

    if (
        value.includes("1 to") ||
        value.includes("1tb") ||
        value.includes("1 tb")
    ) return 8.5;

    if (amount >= 2000) return 10;
    if (amount >= 1000) return 8.5;
    if (amount >= 512) return 6.5;
    if (amount >= 256) return 5;
    if (amount >= 128) return 3.5;

    return 4;
}

// ======================================================
// SCORE ÉCRAN
// ======================================================

function getScreenScore(product) {
    let score = 5;

    const brightness = extractNumber(product.brightness);

    const refresh = Number(
        product.refreshRate ||
        extractNumber(product.refresh)
    );

    const screenSize =
        Number(product.screenSize) ||
        extractNumber(product.screen);

    const resolution = String(
        product.resolution || ""
    ).toLowerCase();

    const gamut = String(
        product.colorGamut || ""
    ).toLowerCase();

    const screenType = String(
        product.screenType || ""
    ).toLowerCase();

    if (screenType.includes("oled")) {
        score += 1.2;
    } else if (screenType.includes("mini")) {
        score += 1;
    } else if (screenType.includes("ips")) {
        score += 0.4;
    }

    if (
        resolution.includes("2560") ||
        resolution.includes("2880") ||
        resolution.includes("3200") ||
        resolution.includes("3840")
    ) {
        score += 1;
    } else if (
        resolution.includes("1920 × 1200") ||
        resolution.includes("1920x1200")
    ) {
        score += 0.4;
    }

    if (gamut.includes("100% srgb")) {
        score += 1.4;
    } else if (
        gamut.includes("100% dci") ||
        gamut.includes("100% p3")
    ) {
        score += 1.8;
    } else if (
        gamut.includes("90% srgb") ||
        gamut.includes("95% srgb")
    ) {
        score += 1;
    } else if (gamut.includes("45% ntsc")) {
        score -= 0.5;
    }

    if (brightness >= 500) {
        score += 1;
    } else if (brightness >= 400) {
        score += 0.7;
    } else if (brightness >= 300) {
        score += 0.3;
    } else if (brightness >= 250) {
        score -= 0.2;
    } else if (brightness > 0) {
        score -= 0.6;
    }

    if (refresh >= 240) {
        score += 0.8;
    } else if (refresh >= 180) {
        score += 0.6;
    } else if (refresh >= 165) {
        score += 0.5;
    } else if (refresh >= 144) {
        score += 0.3;
    }

    if (screenSize >= 16) {
        score += 0.2;
    }

    return clamp(
        Math.round(score),
        1,
        10
    );
}

// ======================================================
// SCORE AUTONOMIE
// ======================================================

function getBatteryScore(product) {
    const battery = extractNumber(product.battery);
    const weight = extractNumber(product.weight);
    const cpuScore = getCpuScore(product.cpu);

    let score = 4;

    if (battery >= 90) {
        score += 3;
    } else if (battery >= 80) {
        score += 2.5;
    } else if (battery >= 75) {
        score += 2;
    } else if (battery >= 65) {
        score += 1.5;
    } else if (battery >= 60) {
        score += 1;
    } else if (battery >= 55) {
        score += 0.5;
    } else if (battery > 0) {
        score -= 0.2;
    }

    if (weight > 0) {
        if (weight <= 1.5) {
            score += 1;
        } else if (weight <= 1.8) {
            score += 0.7;
        } else if (weight <= 2) {
            score += 0.4;
        } else if (weight <= 2.3) {
            score += 0.1;
        } else if (weight >= 2.7) {
            score -= 0.6;
        }
    }

    if (cpuScore >= 8.5) {
        score += 0.4;
    } else if (cpuScore >= 7.5) {
        score += 0.2;
    }

    return clamp(
        Math.round(score),
        1,
        10
    );
}

// ======================================================
// CALCUL GLOBAL DES SCORES
// ======================================================

function calculateScores(product) {
    const gpu = getGpuScore(product.gpu);
    const cpu = getCpuScore(product.cpu);
    const ram = getRamScore(product.ram);
    const storage = getStorageScore(product.storage);
    const screen = getScreenScore(product);
    const battery = getBatteryScore(product);

    const gaming = clamp(
        Math.round(
            gpu * 0.60 +
            cpu * 0.25 +
            ram * 0.15
        ),
        1,
        10
    );

    const montage = clamp(
        Math.round(
            cpu * 0.35 +
            gpu * 0.35 +
            ram * 0.20 +
            storage * 0.10
        ),
        1,
        10
    );

    const creation = clamp(
        Math.round(
            cpu * 0.25 +
            gpu * 0.25 +
            ram * 0.20 +
            screen * 0.25 +
            storage * 0.05
        ),
        1,
        10
    );

    const performance = clamp(
        Math.round(
            cpu * 0.45 +
            gpu * 0.45 +
            ram * 0.10
        ),
        1,
        10
    );

    return {
        gaming: gaming,
        montage: montage,
        creation: creation,
        performance: performance,
        screen: screen,
        battery: battery
    };
}

// ======================================================
// APPLIQUER LES MODIFICATIONS MANUELLES
// ======================================================

function applyScoreOverrides(scores, overrides) {
    if (
        !overrides ||
        typeof overrides !== "object"
    ) {
        return scores;
    }

    const allowedScores = [
        "gaming",
        "montage",
        "creation",
        "performance",
        "screen",
        "battery"
    ];

    allowedScores.forEach(function (key) {
        if (
            overrides[key] !== undefined &&
            overrides[key] !== null &&
            overrides[key] !== ""
        ) {
            const value = Number(overrides[key]);

            if (
                Number.isFinite(value) &&
                value >= 1 &&
                value <= 10
            ) {
                scores[key] = Math.round(value);
            }
        }
    });

    return scores;
}

// ======================================================
// LIRE LES PRODUITS
// ======================================================

function getProducts() {
    try {
        const data = fs.readFileSync(
            DATA_FILE,
            "utf8"
        );

        return JSON.parse(data);
    } catch (error) {
        console.error(
            "Erreur lors de la lecture des produits :",
            error
        );

        return [];
    }
}

// ======================================================
// SAUVEGARDER LES PRODUITS
// ======================================================

function saveProducts(products) {
    try {
        fs.writeFileSync(
            DATA_FILE,
            JSON.stringify(products, null, 4),
            "utf8"
        );

        return true;
    } catch (error) {
        console.error(
            "Erreur lors de l'enregistrement :",
            error
        );

        return false;
    }
}

// ======================================================
// RECALCULER TOUS LES SCORES
// ======================================================

function recalculateAllScores() {
    const products = getProducts();
    let changed = false;

    products.forEach(function (product) {
        const automaticScores = calculateScores(product);

        const finalScores = applyScoreOverrides(
            automaticScores,
            product.scoreOverrides
        );

        const oldScores = product.scores || {};

        if (
            JSON.stringify(oldScores) !==
            JSON.stringify(finalScores)
        ) {
            product.scores = finalScores;
            changed = true;
        }

        processAmazonOffers(product);
    });

    if (changed) {
        saveProducts(products);

        console.log(
            "Scores recalculés pour " +
            products.length +
            " produit(s)."
        );
    }
}

// ======================================================
// ROUTE PRINCIPALE
// ======================================================

app.get("/", (req, res) => {
    res.json({
        name: "PCFinder API",
        version: "1.0.0",
        status: "online"
    });
});

// ======================================================
// RÉCUPÉRER TOUS LES PRODUITS
// ======================================================

app.get("/api/products", (req, res) => {
    const products = getProducts();

    res.json(products);
});

// ======================================================
// RÉCUPÉRER UN PRODUIT
// ======================================================

app.get("/api/products/:id", (req, res) => {
    const products = getProducts();
    const id = Number(req.params.id);

    const product = products.find(
        product => product.id === id
    );

    if (!product) {
        return res.status(404).json({
            error: "Produit introuvable"
        });
    }

    res.json(product);
});

// ======================================================
// AJOUTER UN PRODUIT
// ======================================================

app.post(
    "/api/products",
    requireAdmin,
    (req, res) => {
        const products = getProducts();

        let newProduct = {
            ...req.body
        };

        if (!newProduct.name) {
            return res.status(400).json({
                error: "Le nom du produit est obligatoire"
            });
        }

        newProduct =
            processAmazonOffers(newProduct);

        const newId =
            products.length > 0
                ? Math.max(
                    ...products.map(
                        product => product.id
                    )
                ) + 1
                : 1;

        newProduct.id = newId;

        const automaticScores =
            calculateScores(newProduct);

        newProduct.scores =
            applyScoreOverrides(
                automaticScores,
                newProduct.scoreOverrides
            );

        if (
            !newProduct.scoreOverrides ||
            Object.keys(newProduct.scoreOverrides).length === 0
        ) {
            delete newProduct.scoreOverrides;
        }

        products.push(newProduct);

        const saved = saveProducts(products);

        if (!saved) {
            return res.status(500).json({
                error: "Impossible d'enregistrer le produit"
            });
        }

        res.status(201).json(newProduct);
    }
);

// ======================================================
// MODIFIER UN PRODUIT
// ======================================================

app.put(
    "/api/products/:id",
    requireAdmin,
    (req, res) => {
        const products = getProducts();
        const id = Number(req.params.id);

        const index = products.findIndex(
            product => product.id === id
        );

        if (index === -1) {
            return res.status(404).json({
                error: "Produit introuvable"
            });
        }

        const oldProduct = products[index];

        let newProduct = {
            ...oldProduct,
            ...req.body,
            id: id
        };

        const oldOverrides =
            oldProduct.scoreOverrides || {};

        const newOverrides =
            req.body.scoreOverrides || {};

        newProduct.scoreOverrides = {
            ...oldOverrides,
            ...newOverrides
        };

        newProduct =
            processAmazonOffers(newProduct);

        const automaticScores =
            calculateScores(newProduct);

        newProduct.scores =
            applyScoreOverrides(
                automaticScores,
                newProduct.scoreOverrides
            );

        if (
            Object.keys(
                newProduct.scoreOverrides
            ).length === 0
        ) {
            delete newProduct.scoreOverrides;
        }

        products[index] = newProduct;

        const saved = saveProducts(products);

        if (!saved) {
            return res.status(500).json({
                error: "Impossible de modifier le produit"
            });
        }

        res.json(newProduct);
    }
);

// ======================================================
// SUPPRIMER UN PRODUIT
// ======================================================

app.delete(
    "/api/products/:id",
    requireAdmin,
    (req, res) => {
        const products = getProducts();
        const id = Number(req.params.id);

        const newProducts = products.filter(
            product => product.id !== id
        );

        if (
            newProducts.length ===
            products.length
        ) {
            return res.status(404).json({
                error: "Produit introuvable"
            });
        }

        const saved = saveProducts(newProducts);

        if (!saved) {
            return res.status(500).json({
                error: "Impossible de supprimer le produit"
            });
        }

        res.json({
            success: true,
            message: "Produit supprimé"
        });
    }
);

// ======================================================
// DÉMARRER LE SERVEUR
// ======================================================

recalculateAllScores();

app.listen(PORT, "0.0.0.0", () => {
    console.log("");
    console.log("======================================");
    console.log("          PCFinder Backend");
    console.log("======================================");
    console.log("");
    console.log(`Serveur lancé sur le port ${PORT}`);
    console.log("");
    console.log(
        "Tag Amazon utilisé : " +
        AMAZON_ASSOCIATE_TAG
    );
});
