const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

const DATA_FILE = path.join(
    __dirname,
    "data",
    "products.json"
);

// ======================================================
// CONFIGURATION ADMIN
// ======================================================

const ADMIN_USERNAME =
    process.env.ADMIN_USERNAME;

const ADMIN_PASSWORD =
    process.env.ADMIN_PASSWORD;

// ======================================================
// CONFIGURATION AMAZON AFFILIATION
// ======================================================

const AMAZON_ASSOCIATE_TAG =
    process.env.AMAZON_ASSOCIATE_TAG ||
    "pcfinderfr-21";

// ======================================================
// CONFIGURATION GITHUB
// ======================================================

const GITHUB_TOKEN =
    process.env.GITHUB_TOKEN;

const GITHUB_OWNER =
    process.env.GITHUB_OWNER ||
    "baptr38";

const GITHUB_REPO =
    process.env.GITHUB_REPO ||
    "PCFinder";

const GITHUB_BRANCH =
    process.env.GITHUB_BRANCH ||
    "main";

const GITHUB_API_BASE =
    "https://api.github.com";

// ======================================================
// MIDDLEWARES
// ======================================================

app.use(cors());

app.use(
    express.json({
        limit: "15mb"
    })
);

// ======================================================
// AUTHENTIFICATION ADMIN
// ======================================================

function requireAdmin(req, res, next) {

    if (
        !ADMIN_USERNAME ||
        !ADMIN_PASSWORD
    ) {

        console.error(
            "ERREUR : ADMIN_USERNAME ou ADMIN_PASSWORD n'est pas configuré dans Render."
        );

        return res.status(500).json({
            error:
                "Authentification administrateur non configurée"
        });
    }

    const authorization =
        req.headers.authorization;

    if (
        !authorization ||
        !authorization.startsWith("Basic ")
    ) {

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

        if (
            separatorIndex === -1
        ) {

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

const ADMIN_DIR =
    path.join(
        __dirname,
        "admin"
    );

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
// OUTILS GITHUB
// ======================================================

function isGithubConfigured() {

    return Boolean(
        GITHUB_TOKEN &&
        GITHUB_OWNER &&
        GITHUB_REPO &&
        GITHUB_BRANCH
    );
}

function githubHeaders() {

    return {

        "Authorization":
            `Bearer ${GITHUB_TOKEN}`,

        "Accept":
            "application/vnd.github+json",

        "X-GitHub-Api-Version":
            "2022-11-28",

        "Content-Type":
            "application/json"
    };
}

function githubFileUrl(filePath) {

    return (
        `${GITHUB_API_BASE}/repos/` +
        `${GITHUB_OWNER}/` +
        `${GITHUB_REPO}/contents/` +
        `${filePath}?ref=` +
        encodeURIComponent(
            GITHUB_BRANCH
        )
    );
}

async function getGithubFile(filePath) {

    if (
        !isGithubConfigured()
    ) {
        return null;
    }

    const response =
        await fetch(
            githubFileUrl(filePath),
            {
                method: "GET",
                headers: githubHeaders()
            }
        );

    if (
        response.status === 404
    ) {
        return null;
    }

    if (!response.ok) {

        const text =
            await response.text();

        throw new Error(
            `GitHub GET ${filePath} : ` +
            `${response.status} ${text}`
        );
    }

    return response.json();
}

async function saveGithubFile(
    filePath,
    contentBase64,
    message,
    existingSha = null
) {

    if (
        !isGithubConfigured()
    ) {

        throw new Error(
            "GitHub n'est pas configuré dans les variables d'environnement."
        );
    }

    const body = {

        message: message,

        content: contentBase64,

        branch: GITHUB_BRANCH
    };

    if (existingSha) {
        body.sha = existingSha;
    }

    const response =
        await fetch(
            `${GITHUB_API_BASE}/repos/` +
            `${GITHUB_OWNER}/` +
            `${GITHUB_REPO}/contents/` +
            `${filePath}`,
            {
                method: "PUT",
                headers: githubHeaders(),
                body: JSON.stringify(body)
            }
        );

    if (!response.ok) {

        const text =
            await response.text();

        throw new Error(
            `GitHub PUT ${filePath} : ` +
            `${response.status} ${text}`
        );
    }

    return response.json();
}

// ======================================================
// LIRE PRODUCTS.JSON DEPUIS GITHUB
// ======================================================

async function getProductsFromGithub() {

    const githubFile =
        await getGithubFile(
            "backend/data/products.json"
        );

    if (!githubFile) {
        return null;
    }

    const decoded =
        Buffer.from(
            githubFile.content.replace(
                /\n/g,
                ""
            ),
            "base64"
        ).toString("utf8");

    return {

        products:
            JSON.parse(decoded),

        sha:
            githubFile.sha
    };
}

// ======================================================
// SAUVEGARDER PRODUCTS.JSON SUR GITHUB
// ======================================================

async function saveProductsToGithub(
    products
) {

    const content =
        JSON.stringify(
            products,
            null,
            4
        );

    const contentBase64 =
        Buffer.from(
            content,
            "utf8"
        ).toString("base64");

    const existingFile =
        await getGithubFile(
            "backend/data/products.json"
        );

    return saveGithubFile(
        "backend/data/products.json",
        contentBase64,
        "Mise à jour du catalogue PCFinder",
        existingFile
            ? existingFile.sha
            : null
    );
}

// ======================================================
// SAUVEGARDE LOCALE DE SECOURS
// ======================================================

function saveProductsLocally(
    products
) {

    try {

        fs.writeFileSync(
            DATA_FILE,
            JSON.stringify(
                products,
                null,
                4
            ),
            "utf8"
        );

        return true;

    } catch (error) {

        console.error(
            "Erreur lors de l'enregistrement local :",
            error
        );

        return false;
    }
}

// ======================================================
// LIRE LES PRODUITS
// ======================================================

async function getProducts() {

    if (
        isGithubConfigured()
    ) {

        try {

            const githubData =
                await getProductsFromGithub();

            if (
                githubData &&
                Array.isArray(
                    githubData.products
                )
            ) {

                return githubData.products;
            }

        } catch (error) {

            console.error(
                "Erreur lors de la lecture de products.json depuis GitHub :",
                error
            );

            console.log(
                "Utilisation du fichier local en secours."
            );
        }
    }

    try {

        const data =
            fs.readFileSync(
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

async function saveProducts(
    products
) {

    try {

        saveProductsLocally(
            products
        );

        if (
            isGithubConfigured()
        ) {

            await saveProductsToGithub(
                products
            );

            console.log(
                "Catalogue sauvegardé sur GitHub."
            );

        } else {

            console.warn(
                "GitHub n'est pas configuré. " +
                "Le catalogue est uniquement sauvegardé localement."
            );
        }

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
// UPLOAD IMAGE SUR GITHUB
// ======================================================

function sanitizeFileName(
    fileName
) {

    let cleanName =
        String(
            fileName || "image"
        );

    cleanName =
        path.basename(
            cleanName
        );

    cleanName =
        cleanName
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            );

    cleanName =
        cleanName
            .replace(
                /[^a-zA-Z0-9._-]/g,
                "-"
            )
            .replace(
                /-+/g,
                "-"
            )
            .replace(
                /^[-.]+|[-.]+$/g,
                ""
            );

    if (!cleanName) {
        cleanName = "image";
    }

    return cleanName;
}

async function findAvailableImagePath(
    originalFileName
) {

    const cleanName =
        sanitizeFileName(
            originalFileName
        );

    const extension =
        path.extname(
            cleanName
        );

    const baseName =
        path.basename(
            cleanName,
            extension
        );

    let candidate =
        `images/${cleanName}`;

    let counter = 2;

    while (true) {

        const existingFile =
            await getGithubFile(
                candidate
            );

        if (!existingFile) {
            return candidate;
        }

        candidate =
            `images/${baseName}-${counter}${extension}`;

        counter++;
    }
}

async function uploadImageToGithub(
    imageFile
) {

    if (
        !imageFile ||
        typeof imageFile !== "object"
    ) {

        throw new Error(
            "Fichier image invalide."
        );
    }

    const fileName =
        sanitizeFileName(
            imageFile.name
        );

    const mimeType =
        String(
            imageFile.type || ""
        ).toLowerCase();

    const base64Data =
        String(
            imageFile.dataBase64 || ""
        ).replace(
            /^data:[^;]+;base64,/,
            ""
        );

    if (
        !mimeType.startsWith(
            "image/"
        )
    ) {

        throw new Error(
            "Le fichier sélectionné n'est pas une image."
        );
    }

    if (!base64Data) {

        throw new Error(
            "Les données de l'image sont absentes."
        );
    }

    const buffer =
        Buffer.from(
            base64Data,
            "base64"
        );

    // Limite de 10 Mo
    if (
        buffer.length >
        10 * 1024 * 1024
    ) {

        throw new Error(
            "L'image est trop volumineuse. " +
            "La taille maximale est de 10 Mo."
        );
    }

    const imagePath =
        await findAvailableImagePath(
            fileName
        );

    const result =
        await saveGithubFile(
            imagePath,
            base64Data,
            `Ajout de l'image ${fileName}`
        );

    console.log(
        "Image envoyée sur GitHub :",
        imagePath
    );

    return {

        path: imagePath,

        url:
            `https://raw.githubusercontent.com/` +
            `${GITHUB_OWNER}/` +
            `${GITHUB_REPO}/` +
            `${GITHUB_BRANCH}/` +
            imagePath,

        github: result
    };
}

// ======================================================
// OUTILS AMAZON AFFILIATION
// ======================================================

function createAmazonAffiliateUrl(
    url
) {

    if (!url) {
        return url;
    }

    const originalUrl =
        String(url).trim();

    if (!originalUrl) {
        return originalUrl;
    }

    const lowerUrl =
        originalUrl.toLowerCase();

    if (
        !lowerUrl.includes("amazon.fr") &&
        !lowerUrl.includes("amzn.eu") &&
        !lowerUrl.includes("amzn.to") &&
        !lowerUrl.includes("link.amazon")
    ) {

        return originalUrl;
    }

    let asin = null;

    const dpMatch =
        originalUrl.match(
            /\/dp\/([A-Z0-9]{10})/i
        );

    if (dpMatch) {
        asin = dpMatch[1];
    }

    if (!asin) {

        const gpProductMatch =
            originalUrl.match(
                /\/gp\/product\/([A-Z0-9]{10})/i
            );

        if (gpProductMatch) {
            asin = gpProductMatch[1];
        }
    }

    if (!asin) {

        const productMatch =
            originalUrl.match(
                /\/product\/([A-Z0-9]{10})/i
            );

        if (productMatch) {
            asin = productMatch[1];
        }
    }

    if (!asin) {

        console.warn(
            "Impossible de trouver l'ASIN Amazon dans :",
            originalUrl
        );

        return originalUrl;
    }

    return (
        "https://www.amazon.fr/dp/" +
        asin +
        "?tag=" +
        encodeURIComponent(
            AMAZON_ASSOCIATE_TAG
        )
    );
}

function processAmazonOffers(
    product
) {

    if (
        !product ||
        !Array.isArray(
            product.offers
        )
    ) {

        return product;
    }

    product.offers =
        product.offers.map(
            function (offer) {

                if (
                    !offer ||
                    typeof offer !== "object"
                ) {

                    return offer;
                }

                const updatedOffer = {
                    ...offer
                };

                const merchant =
                    String(
                        updatedOffer.merchant ||
                        updatedOffer.store ||
                        updatedOffer.shop ||
                        ""
                    ).toLowerCase();

                const url =
                    String(
                        updatedOffer.url ||
                        updatedOffer.link ||
                        ""
                    );

                const isAmazon =
                    merchant.includes(
                        "amazon"
                    ) ||
                    url.toLowerCase()
                        .includes(
                            "amazon.fr"
                        ) ||
                    url.toLowerCase()
                        .includes(
                            "amzn.eu"
                        ) ||
                    url.toLowerCase()
                        .includes(
                            "amzn.to"
                        ) ||
                    url.toLowerCase()
                        .includes(
                            "link.amazon"
                        );

                if (
                    isAmazon &&
                    url
                ) {

                    const affiliateUrl =
                        createAmazonAffiliateUrl(
                            url
                        );

                    if (
                        updatedOffer.url !==
                        undefined
                    ) {

                        updatedOffer.url =
                            affiliateUrl;
                    }

                    if (
                        updatedOffer.link !==
                        undefined
                    ) {

                        updatedOffer.link =
                            affiliateUrl;
                    }

                    if (
                        updatedOffer.url ===
                            undefined &&
                        updatedOffer.link ===
                            undefined
                    ) {

                        updatedOffer.url =
                            affiliateUrl;
                    }
                }

                return updatedOffer;
            }
        );

    return product;
}

// ======================================================
// OUTILS DE CALCUL DES SCORES
// ======================================================

function extractNumber(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return 0;
    }

    const match =
        String(value)
            .replace(",", ".")
            .match(
                /[\d.]+/
            );

    if (!match) {
        return 0;
    }

    return Number(
        match[0]
    );
}

function clamp(
    value,
    min,
    max
) {

    return Math.max(
        min,
        Math.min(
            max,
            value
        )
    );
}

// ======================================================
// SCORE GPU
// ======================================================

function getGpuScore(
    gpu
) {

    const value =
        String(
            gpu || ""
        ).toLowerCase();

    if (
        value.includes("5090")
    ) return 10;

    if (
        value.includes("5080")
    ) return 9.8;

    if (
        value.includes("5070 ti")
    ) return 9.5;

    if (
        value.includes("5070")
    ) return 9.2;

    if (
        value.includes("5060")
    ) return 8.8;

    if (
        value.includes("5050")
    ) return 8.1;

    if (
        value.includes("4090")
    ) return 10;

    if (
        value.includes("4080")
    ) return 9.7;

    if (
        value.includes("4070 ti")
    ) return 9.2;

    if (
        value.includes("4070")
    ) return 8.8;

    if (
        value.includes("4060")
    ) return 8.0;

    if (
        value.includes("4050")
    ) return 7.0;

    if (
        value.includes("3090")
    ) return 9.5;

    if (
        value.includes("3080")
    ) return 9.0;

    if (
        value.includes("3070")
    ) return 8.0;

    if (
        value.includes("3060")
    ) return 7.0;

    if (
        value.includes("3050")
    ) return 5.8;

    if (
        value.includes("rx 7900")
    ) return 9.5;

    if (
        value.includes("rx 7800")
    ) return 8.8;

    if (
        value.includes("rx 7700")
    ) return 8.2;

    if (
        value.includes("rx 7600")
    ) return 7.2;

    if (
        value.includes("arc b580")
    ) return 8.0;

    if (
        value.includes("arc a770")
    ) return 7.5;

    if (
        value.includes("arc a750")
    ) return 7.0;

    return 5;
}

// ======================================================
// SCORE CPU
// ======================================================

function getCpuScore(
    cpu
) {

    const value =
        String(
            cpu || ""
        ).toLowerCase();

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

    if (
        value.includes("7800x3d")
    ) return 9.5;

    if (
        value.includes("7700") ||
        value.includes("7700x")
    ) return 8.9;

    if (
        value.includes("7600") ||
        value.includes("7600x")
    ) return 8.1;

    if (
        value.includes("ryzen 7 260")
    ) return 8.8;

    if (
        value.includes("ryzen 9")
    ) return 9.2;

    if (
        value.includes("ryzen 7 8")
    ) return 8.7;

    if (
        value.includes("ryzen 7 7")
    ) return 8.0;

    if (
        value.includes("ryzen 7")
    ) return 7.8;

    if (
        value.includes("ryzen 5 7")
    ) return 6.9;

    if (
        value.includes("ryzen 5")
    ) return 6.5;

    if (
        value.includes("ultra 9")
    ) return 9.3;

    if (
        value.includes("ultra 7")
    ) return 8.7;

    if (
        value.includes("ultra 5")
    ) return 7.8;

    if (
        value.includes("i9")
    ) return 9.5;

    if (
        value.includes("i7")
    ) return 8.3;

    if (
        value.includes("i5-14") ||
        value.includes("i5-13")
    ) return 7.8;

    if (
        value.includes("i5-12")
    ) return 6.8;

    if (
        value.includes("i5")
    ) return 6.8;

    if (
        value.includes("i3")
    ) return 4.5;

    return 5;
}

// ======================================================
// SCORE RAM
// ======================================================

function getRamScore(
    ram
) {

    const amount =
        extractNumber(
            ram
        );

    if (
        amount >= 64
    ) return 10;

    if (
        amount >= 48
    ) return 9.5;

    if (
        amount >= 32
    ) return 9;

    if (
        amount >= 24
    ) return 8;

    if (
        amount >= 16
    ) return 7;

    if (
        amount >= 12
    ) return 5.5;

    if (
        amount >= 8
    ) return 4;

    if (
        amount >= 4
    ) return 2.5;

    return 3;
}

// ======================================================
// SCORE STOCKAGE
// ======================================================

function getStorageScore(
    storage
) {

    const value =
        String(
            storage || ""
        ).toLowerCase();

    const amount =
        extractNumber(
            value
        );

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

    if (
        amount >= 2000
    ) return 10;

    if (
        amount >= 1000
    ) return 8.5;

    if (
        amount >= 512
    ) return 6.5;

    if (
        amount >= 256
    ) return 5;

    if (
        amount >= 128
    ) return 3.5;

    return 4;
}

// ======================================================
// SCORE ÉCRAN
// ======================================================

function getScreenScore(
    product
) {

    let score = 5;

    const brightness =
        extractNumber(
            product.brightness
        );

    const refresh =
        Number(
            product.refreshRate ||
            extractNumber(
                product.refresh
            )
        );

    const screenSize =
        Number(
            product.screenSize
        ) ||
        extractNumber(
            product.screen
        );

    const resolution =
        String(
            product.resolution || ""
        ).toLowerCase();

    const gamut =
        String(
            product.colorGamut || ""
        ).toLowerCase();

    const screenType =
        String(
            product.screenType || ""
        ).toLowerCase();

    if (
        screenType.includes("oled")
    ) {

        score += 1.2;

    } else if (
        screenType.includes("mini")
    ) {

        score += 1;

    } else if (
        screenType.includes("ips")
    ) {

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
        resolution.includes(
            "1920 × 1200"
        ) ||
        resolution.includes(
            "1920x1200"
        )
    ) {

        score += 0.4;
    }

    if (
        gamut.includes("100% srgb")
    ) {

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

    } else if (
        gamut.includes("45% ntsc")
    ) {

        score -= 0.5;
    }

    if (
        brightness >= 500
    ) {

        score += 1;

    } else if (
        brightness >= 400
    ) {

        score += 0.7;

    } else if (
        brightness >= 300
    ) {

        score += 0.3;

    } else if (
        brightness >= 250
    ) {

        score -= 0.2;

    } else if (
        brightness > 0
    ) {

        score -= 0.6;
    }

    if (
        refresh >= 240
    ) {

        score += 0.8;

    } else if (
        refresh >= 180
    ) {

        score += 0.6;

    } else if (
        refresh >= 165
    ) {

        score += 0.5;

    } else if (
        refresh >= 144
    ) {

        score += 0.3;
    }

    if (
        screenSize >= 16
    ) {

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

function getBatteryScore(
    product
) {

    const battery =
        extractNumber(
            product.battery
        );

    const weight =
        extractNumber(
            product.weight
        );

    const cpuScore =
        getCpuScore(
            product.cpu
        );

    let score = 4;

    if (
        battery >= 90
    ) {

        score += 3;

    } else if (
        battery >= 80
    ) {

        score += 2.5;

    } else if (
        battery >= 75
    ) {

        score += 2;

    } else if (
        battery >= 65
    ) {

        score += 1.5;

    } else if (
        battery >= 60
    ) {

        score += 1;

    } else if (
        battery >= 55
    ) {

        score += 0.5;

    } else if (
        battery > 0
    ) {

        score -= 0.2;
    }

    if (
        weight > 0
    ) {

        if (
            weight <= 1.5
        ) {

            score += 1;

        } else if (
            weight <= 1.8
        ) {

            score += 0.7;

        } else if (
            weight <= 2
        ) {

            score += 0.4;

        } else if (
            weight <= 2.3
        ) {

            score += 0.1;

        } else if (
            weight >= 2.7
        ) {

            score -= 0.6;
        }
    }

    if (
        cpuScore >= 8.5
    ) {

        score += 0.4;

    } else if (
        cpuScore >= 7.5
    ) {

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

function calculateScores(
    product
) {

    const gpu =
        getGpuScore(
            product.gpu
        );

    const cpu =
        getCpuScore(
            product.cpu
        );

    const ram =
        getRamScore(
            product.ram
        );

    const storage =
        getStorageScore(
            product.storage
        );

    const screen =
        getScreenScore(
            product
        );

    const battery =
        getBatteryScore(
            product
        );

    const gaming =
        clamp(
            Math.round(
                gpu * 0.60 +
                cpu * 0.25 +
                ram * 0.15
            ),
            1,
            10
        );

    const montage =
        clamp(
            Math.round(
                cpu * 0.35 +
                gpu * 0.35 +
                ram * 0.20 +
                storage * 0.10
            ),
            1,
            10
        );

    const creation =
        clamp(
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

    const performance =
        clamp(
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

function applyScoreOverrides(
    scores,
    overrides
) {

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

    allowedScores.forEach(
        function (key) {

            if (
                overrides[key] !==
                    undefined &&
                overrides[key] !==
                    null &&
                overrides[key] !== ""
            ) {

                const value =
                    Number(
                        overrides[key]
                    );

                if (
                    Number.isFinite(
                        value
                    ) &&
                    value >= 1 &&
                    value <= 10
                ) {

                    scores[key] =
                        Math.round(
                            value
                        );
                }
            }
        }
    );

    return scores;
}

// ======================================================
// RECALCULER TOUS LES SCORES
// ======================================================

async function recalculateAllScores() {

    const products =
        await getProducts();

    let changed = false;

    products.forEach(
        function (product) {

            const automaticScores =
                calculateScores(
                    product
                );

            const finalScores =
                applyScoreOverrides(
                    automaticScores,
                    product.scoreOverrides
                );

            const oldScores =
                product.scores || {};

            if (
                JSON.stringify(
                    oldScores
                ) !==
                JSON.stringify(
                    finalScores
                )
            ) {

                product.scores =
                    finalScores;

                changed = true;
            }

            processAmazonOffers(
                product
            );
        }
    );

    if (changed) {

        const saved =
            await saveProducts(
                products
            );

        if (saved) {

            console.log(
                "Scores recalculés pour " +
                products.length +
                " produit(s)."
            );
        }
    }
}

// ======================================================
// ROUTE PRINCIPALE
// ======================================================

app.get(
    "/",
    (req, res) => {

        res.json({

            name: "PCFinder API",

            version: "1.0.0",

            status: "online"
        });
    }
);

// ======================================================
// RÉCUPÉRER TOUS LES PRODUITS
// ======================================================

app.get(
    "/api/products",
    async (req, res) => {

        try {

            const products =
                await getProducts();

            res.json(
                products
            );

        } catch (error) {

            console.error(
                "Erreur API produits :",
                error
            );

            res.status(500).json({

                error:
                    "Impossible de récupérer les produits"
            });
        }
    }
);

// ======================================================
// RÉCUPÉRER UN PRODUIT
// ======================================================

app.get(
    "/api/products/:id",
    async (req, res) => {

        try {

            const products =
                await getProducts();

            const id =
                Number(
                    req.params.id
                );

            const product =
                products.find(
                    product =>
                        Number(
                            product.id
                        ) === id
                );

            if (!product) {

                return res.status(404).json({

                    error:
                        "Produit introuvable"
                });
            }

            res.json(
                product
            );

        } catch (error) {

            console.error(
                "Erreur API produit :",
                error
            );

            res.status(500).json({

                error:
                    "Impossible de récupérer le produit"
            });
        }
    }
);

// ======================================================
// UPLOAD IMAGE
// ======================================================

app.post(
    "/api/upload-image",
    requireAdmin,
    async (req, res) => {

        try {

            if (
                !isGithubConfigured()
            ) {

                return res.status(500).json({

                    error:
                        "GitHub n'est pas configuré sur le serveur."
                });
            }

            const imageFile =
                req.body.imageFile;

            const result =
                await uploadImageToGithub(
                    imageFile
                );

            res.json({

                success: true,

                path:
                    result.path,

                url:
                    result.url
            });

        } catch (error) {

            console.error(
                "Erreur upload image :",
                error
            );

            res.status(500).json({

                error:
                    error.message ||
                    "Impossible d'envoyer l'image sur GitHub."
            });
        }
    }
);

// ======================================================
// AJOUTER UN PRODUIT
// ======================================================

app.post(
    "/api/products",
    requireAdmin,
    async (req, res) => {

        try {

            const products =
                await getProducts();

            let newProduct = {
                ...req.body
            };

            delete newProduct.imageFile;

            if (
                !newProduct.name
            ) {

                return res.status(400).json({

                    error:
                        "Le nom du produit est obligatoire"
                });
            }

            // ------------------------------------------
            // IMAGE LOCALE
            // ------------------------------------------

            if (
                req.body.imageFile
            ) {

                const imageResult =
                    await uploadImageToGithub(
                        req.body.imageFile
                    );

                newProduct.image =
                    imageResult.path;
            }

            // ------------------------------------------
            // AMAZON
            // ------------------------------------------

            newProduct =
                processAmazonOffers(
                    newProduct
                );

            // ------------------------------------------
            // ID
            // ------------------------------------------

            const newId =
                products.length > 0
                    ? Math.max(
                        ...products.map(
                            product =>
                                Number(
                                    product.id
                                ) || 0
                        )
                    ) + 1
                    : 1;

            newProduct.id =
                newId;

            // ------------------------------------------
            // SCORES
            // ------------------------------------------

            const automaticScores =
                calculateScores(
                    newProduct
                );

            newProduct.scores =
                applyScoreOverrides(
                    automaticScores,
                    newProduct.scoreOverrides
                );

            if (
                !newProduct.scoreOverrides ||
                Object.keys(
                    newProduct.scoreOverrides
                ).length === 0
            ) {

                delete newProduct.scoreOverrides;
            }

            // ------------------------------------------
            // SAUVEGARDE
            // ------------------------------------------

            products.push(
                newProduct
            );

            const saved =
                await saveProducts(
                    products
                );

            if (!saved) {

                return res.status(500).json({

                    error:
                        "Impossible d'enregistrer le produit"
                });
            }

            res.status(201).json(
                newProduct
            );

        } catch (error) {

            console.error(
                "Erreur lors de l'ajout du produit :",
                error
            );

            res.status(500).json({

                error:
                    error.message ||
                    "Impossible d'ajouter le produit"
            });
        }
    }
);

// ======================================================
// MODIFIER UN PRODUIT
// ======================================================

app.put(
    "/api/products/:id",
    requireAdmin,
    async (req, res) => {

        try {

            const products =
                await getProducts();

            const id =
                Number(
                    req.params.id
                );

            const index =
                products.findIndex(
                    product =>
                        Number(
                            product.id
                        ) === id
                );

            if (
                index === -1
            ) {

                return res.status(404).json({

                    error:
                        "Produit introuvable"
                });
            }

            const oldProduct =
                products[index];

            let newProduct = {

                ...oldProduct,

                ...req.body,

                id: id
            };

            delete newProduct.imageFile;

            // ------------------------------------------
            // IMAGE LOCALE
            // ------------------------------------------

            if (
                req.body.imageFile
            ) {

                const imageResult =
                    await uploadImageToGithub(
                        req.body.imageFile
                    );

                newProduct.image =
                    imageResult.path;
            }

            // ------------------------------------------
            // SCORES MANUELS
            // ------------------------------------------

            const oldOverrides =
                oldProduct.scoreOverrides ||
                {};

            const newOverrides =
                req.body.scoreOverrides ||
                {};

            newProduct.scoreOverrides = {

                ...oldOverrides,

                ...newOverrides
            };

            // ------------------------------------------
            // AMAZON
            // ------------------------------------------

            newProduct =
                processAmazonOffers(
                    newProduct
                );

            // ------------------------------------------
            // SCORES
            // ------------------------------------------

            const automaticScores =
                calculateScores(
                    newProduct
                );

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

            products[index] =
                newProduct;

            // ------------------------------------------
            // SAUVEGARDE
            // ------------------------------------------

            const saved =
                await saveProducts(
                    products
                );

            if (!saved) {

                return res.status(500).json({

                    error:
                        "Impossible de modifier le produit"
                });
            }

            res.json(
                newProduct
            );

        } catch (error) {

            console.error(
                "Erreur lors de la modification du produit :",
                error
            );

            res.status(500).json({

                error:
                    error.message ||
                    "Impossible de modifier le produit"
            });
        }
    }
);

// ======================================================
// SUPPRIMER UN PRODUIT
// ======================================================

app.delete(
    "/api/products/:id",
    requireAdmin,
    async (req, res) => {

        try {

            const products =
                await getProducts();

            const id =
                Number(
                    req.params.id
                );

            const newProducts =
                products.filter(
                    product =>
                        Number(
                            product.id
                        ) !== id
                );

            if (
                newProducts.length ===
                products.length
            ) {

                return res.status(404).json({

                    error:
                        "Produit introuvable"
                });
            }

            const saved =
                await saveProducts(
                    newProducts
                );

            if (!saved) {

                return res.status(500).json({

                    error:
                        "Impossible de supprimer le produit"
                });
            }

            res.json({

                success: true,

                message:
                    "Produit supprimé"
            });

        } catch (error) {

            console.error(
                "Erreur lors de la suppression du produit :",
                error
            );

            res.status(500).json({

                error:
                    error.message ||
                    "Impossible de supprimer le produit"
            });
        }
    }
);

// ======================================================
// DÉMARRER LE SERVEUR
// ======================================================

async function startServer() {

    try {

        console.log(
            "Vérification du catalogue..."
        );

        if (
            isGithubConfigured()
        ) {

            console.log(
                "GitHub est configuré."
            );

        } else {

            console.warn(
                "GitHub n'est pas encore configuré."
            );
        }

        await recalculateAllScores();

    } catch (error) {

        console.error(
            "Erreur lors de l'initialisation :",
            error
        );
    }

    app.listen(
        PORT,
        "0.0.0.0",
        () => {

            console.log("");
            console.log(
                "======================================"
            );
            console.log(
                "          PCFinder Backend"
            );
            console.log(
                "======================================"
            );
            console.log("");
            console.log(
                `Serveur lancé sur le port ${PORT}`
            );
            console.log("");
            console.log(
                "Tag Amazon utilisé : " +
                AMAZON_ASSOCIATE_TAG
            );
            console.log(
                "GitHub : " +
                (
                    isGithubConfigured()
                        ? "CONFIGURÉ"
                        : "NON CONFIGURÉ"
                )
            );
            console.log("");
        }
    );
}

startServer();
