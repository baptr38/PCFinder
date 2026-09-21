/* ==========================================
PCFINDER - PAGE PRODUIT
========================================== */


/* ==========================================
ELEMENTS
========================================== */

var loadingElement =
    document.getElementById("product-loading");

var errorElement =
    document.getElementById("product-error");

var productElement =
    document.getElementById("product-detail");


/* ==========================================
UTILITAIRES
========================================== */

function getProductId() {

    var params =
        new URLSearchParams(
            window.location.search
        );

    var id =
        Number(
            params.get("id")
        );

    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {

        return null;

    }

    return id;
}


function scoreTo100(value) {

    var score =
        Number(value);

    if (!Number.isFinite(score)) {

        return 0;

    }

    if (score <= 10) {

        return Math.max(
            0,
            Math.min(
                100,
                score * 10
            )
        );

    }

    return Math.max(
        0,
        Math.min(
            100,
            score
        )
    );

}


function getBestOffer(product) {

    if (
        !product.offers ||
        product.offers.length === 0
    ) {

        return {

            merchant: "",
            price: 0,
            url: "#",
            affiliate: false

        };

    }


    var bestOffer =
        product.offers[0];


    for (
        var i = 1;
        i < product.offers.length;
        i++
    ) {

        if (
            Number(product.offers[i].price) <
            Number(bestOffer.price)
        ) {

            bestOffer =
                product.offers[i];

        }

    }


    return bestOffer;

}


/* ==========================================
ECHAPPEMENT HTML
========================================== */

function escapeHTML(value) {

    var div =
        document.createElement("div");

    div.textContent =
        value === undefined ||
        value === null
            ? ""
            : String(value);

    return div.innerHTML;

}


/* ==========================================
EXPLICATION
========================================== */

function generateExplanation(product) {

    var scores =
        product.scores || {};


    var gaming =
        scoreTo100(scores.gaming);

    var montage =
        scoreTo100(scores.montage);

    var creation =
        scoreTo100(scores.creation);

    var performance =
        scoreTo100(scores.performance);

    var screen =
        scoreTo100(scores.screen);

    var battery =
        scoreTo100(scores.battery);


    var bestScore =
        Math.max(
            gaming,
            montage,
            creation,
            performance,
            screen,
            battery
        );


    var explanation = "";


    if (
        bestScore === gaming &&
        gaming >= 80
    ) {

        explanation =
            "Ce PC est particulièrement intéressant pour le gaming grâce à ses performances graphiques et à son niveau de puissance.";

    }

    else if (
        bestScore === montage &&
        montage >= 80
    ) {

        explanation =
            "Ce PC constitue une bonne solution pour le montage vidéo grâce à son équilibre entre processeur, carte graphique et mémoire.";

    }

    else if (
        bestScore === creation &&
        creation >= 80
    ) {

        explanation =
            "Ce PC est adapté aux usages créatifs et offre un bon équilibre pour les logiciels de création.";

    }

    else if (
        bestScore === screen &&
        screen >= 80
    ) {

        explanation =
            "Son écran constitue l'un de ses principaux atouts, notamment pour les utilisateurs qui accordent beaucoup d'importance à l'affichage.";

    }

    else if (
        bestScore === battery &&
        battery >= 80
    ) {

        explanation =
            "Son autonomie fait partie de ses points forts et le rend intéressant pour une utilisation plus mobile.";

    }

    else if (
        performance >= 80
    ) {

        explanation =
            "Ce PC propose un bon niveau de performances générales et peut convenir à plusieurs usages exigeants.";

    }

    else {

        explanation =
            "Ce PC propose un ensemble équilibré de caractéristiques pour son positionnement.";

    }


    return explanation;

}


/* ==========================================
AFFICHAGE DES SCORES
========================================== */

function displayScore(
    scoreElementId,
    barElementId,
    value
) {

    var score =
        scoreTo100(value);


    var scoreElement =
        document.getElementById(
            scoreElementId
        );

    var barElement =
        document.getElementById(
            barElementId
        );


    if (scoreElement) {

        scoreElement.textContent =
            Math.round(score) + "/100";

    }


    if (barElement) {

        barElement.style.width =
            score + "%";

    }

}


/* ==========================================
AFFICHAGE PRODUIT
========================================== */

function displayProduct(product) {

    var bestOffer =
        getBestOffer(product);


    /* ======================================
       PAGE
       ====================================== */

    document.title =
        "PCFinder - " +
        product.name;


    /* ======================================
       HERO
       ====================================== */

    var image =
        document.getElementById(
            "productImage"
        );

    var imagePlaceholder =
        document.getElementById(
            "productImagePlaceholder"
        );


    if (image) {

        image.alt =
            product.name || "";

        if (product.image) {

            image.src =
                product.image;

            image.style.display =
                "block";

        }

        else {

            image.style.display =
                "none";

            if (imagePlaceholder) {

                imagePlaceholder.style.display =
                    "flex";

                imagePlaceholder.textContent =
                    product.brand || "PC";

            }

        }


        image.addEventListener(
            "error",
            function () {

                image.style.display =
                    "none";

                if (imagePlaceholder) {

                    imagePlaceholder.style.display =
                        "flex";

                    imagePlaceholder.textContent =
                        product.brand || "PC";

                }

            }
        );

    }


    var brand =
        document.getElementById(
            "productBrand"
        );

    var name =
        document.getElementById(
            "productName"
        );

    var intro =
        document.getElementById(
            "productIntro"
        );


    if (brand) {

        brand.textContent =
            product.brand || "";

    }


    if (name) {

        name.textContent =
            product.name || "";

    }


    if (intro) {

        intro.textContent =
            product.cpu +
            " • " +
            product.gpu +
            " • " +
            product.ram +
            " • " +
            product.storage;

    }


    /* ======================================
       PRIX
       ====================================== */

    var price =
        document.getElementById(
            "productPrice"
        );

    var merchant =
        document.getElementById(
            "productMerchant"
        );

    var offerButton =
        document.getElementById(
            "productOfferButton"
        );


    if (price) {

        price.textContent =
            bestOffer.price +
            " €";

    }


    if (merchant) {

        merchant.textContent =
            bestOffer.merchant ||
            "Vendeur non précisé";

    }


    if (offerButton) {

        if (bestOffer.url && bestOffer.url !== "#") {

            offerButton.href =
                bestOffer.url;

        }

        else {

            offerButton.style.display =
                "none";

        }

    }


    /* ======================================
       SCORE GLOBAL
       ====================================== */

    var globalScore =
        product.score !== undefined
            ? scoreTo100(product.score)
            : calculateSimpleGlobalScore(product);


    var productScore =
        document.getElementById(
            "productScore"
        );

    var productScoreBar =
        document.getElementById(
            "productScoreBar"
        );


    if (productScore) {

        productScore.textContent =
            Math.round(globalScore);

    }


    if (productScoreBar) {

        productScoreBar.style.width =
            globalScore + "%";

    }


    /* ======================================
       SCORES DETAILLES
       ====================================== */

    var scores =
        product.scores || {};


    displayScore(
        "scoreGaming",
        "barGaming",
        scores.gaming
    );


    displayScore(
        "scoreMontage",
        "barMontage",
        scores.montage
    );


    displayScore(
        "scoreCreation",
        "barCreation",
        scores.creation
    );


    displayScore(
        "scorePerformance",
        "barPerformance",
        scores.performance
    );


    displayScore(
        "scoreScreen",
        "barScreen",
        scores.screen
    );


    displayScore(
        "scoreBattery",
        "barBattery",
        scores.battery
    );


    /* ======================================
       CARACTERISTIQUES
       ====================================== */

    setText(
        "detailCpu",
        product.cpu
    );

    setText(
        "detailGpu",
        product.gpu
    );

    setText(
        "detailRam",
        product.ram
    );

    setText(
        "detailStorage",
        product.storage
    );

    setText(
        "detailScreen",
        product.screen
    );

    setText(
        "detailScreenType",
        product.screenType
    );

    setText(
        "detailResolution",
        product.resolution
    );

    setText(
        "detailRefresh",
        product.refresh
    );

    setText(
        "detailBrightness",
        product.brightness
    );

    setText(
        "detailColorGamut",
        product.colorGamut
    );

    setText(
        "detailWeight",
        product.weight
    );

    setText(
        "detailBattery",
        product.battery
    );


    /* ======================================
       EXPLICATION
       ====================================== */

    var explanation =
        document.getElementById(
            "productExplanation"
        );


    if (explanation) {

        explanation.textContent =
            generateExplanation(product);

    }


    /* ======================================
       POINTS FORTS
       ====================================== */

    displayList(
        "productStrengths",
        product.strengths,
        "Aucun point fort renseigné."
    );


    displayList(
        "productWeaknesses",
        product.weaknesses,
        "Aucun point faible renseigné."
    );


    /* ======================================
       OFFRES
       ====================================== */

    displayOffers(
        product.offers
    );


    /* ======================================
       AFFICHAGE
       ====================================== */

    if (loadingElement) {

        loadingElement.style.display =
            "none";

    }


    if (errorElement) {

        errorElement.style.display =
            "none";

    }


    if (productElement) {

        productElement.style.display =
            "block";

    }

}


/* ==========================================
SCORE GLOBAL DE SECOURS
========================================== */

function calculateSimpleGlobalScore(product) {

    var scores =
        product.scores || {};


    var gaming =
        scoreTo100(scores.gaming);

    var montage =
        scoreTo100(scores.montage);

    var creation =
        scoreTo100(scores.creation);

    var performance =
        scoreTo100(scores.performance);

    var screen =
        scoreTo100(scores.screen);

    var battery =
        scoreTo100(scores.battery);


    return (

        gaming * 0.20 +
        montage * 0.18 +
        creation * 0.15 +
        performance * 0.22 +
        screen * 0.15 +
        battery * 0.10

    );

}


/* ==========================================
TEXTE
========================================== */

function setText(
elementId,
value
) {

    var element =
        document.getElementById(
            elementId
        );


    if (element) {

        element.textContent =
            value ||
            "-";

    }

}


/* ==========================================
LISTES
========================================== */

function displayList(
elementId,
items,
emptyText
) {

    var element =
        document.getElementById(
            elementId
        );


    if (!element) {

        return;

    }


    element.innerHTML =
        "";


    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {

        var emptyItem =
            document.createElement("li");

        emptyItem.textContent =
            emptyText;

        element.appendChild(
            emptyItem
        );

        return;

    }


    for (
        var i = 0;
        i < items.length;
        i++
    ) {

        var li =
            document.createElement("li");

        li.textContent =
            items[i];

        element.appendChild(
            li
        );

    }

}


/* ==========================================
OFFRES
========================================== */

function displayOffers(offers) {

    var container =
        document.getElementById(
            "productOffers"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    if (
        !Array.isArray(offers) ||
        offers.length === 0
    ) {

        container.innerHTML =

            '<div class="product-offer-card">' +

                '<div class="product-offer-info">' +

                    "<span>Disponibilité</span>" +

                    "<strong>Aucune offre disponible</strong>" +

                "</div>" +

            "</div>";

        return;

    }


    var sortedOffers =
        offers.slice().sort(
            function (a, b) {

                return (
                    Number(a.price) -
                    Number(b.price)
                );

            }
        );


    for (
        var i = 0;
        i < sortedOffers.length;
        i++
    ) {

        var offer =
            sortedOffers[i];


        var card =
            document.createElement(
                "div"
            );


        card.className =
            "product-offer-card";


        var info =
            document.createElement(
                "div"
            );


        info.className =
            "product-offer-info";


        var merchant =
            document.createElement(
                "span"
            );


        merchant.textContent =
            offer.merchant ||
            "Vendeur";


        var price =
            document.createElement(
                "strong"
            );


        price.textContent =
            Number(offer.price) +
            " €";


        info.appendChild(
            merchant
        );


        info.appendChild(
            price
        );


        if (
            offer.affiliate
        ) {

            var affiliate =
                document.createElement(
                    "span"
                );


            affiliate.className =
                "product-affiliate";


            affiliate.textContent =
                "✓ Offre affiliée";


            info.appendChild(
                affiliate
            );

        }


        var link =
            document.createElement(
                "a"
            );


        link.href =
            offer.url ||
            "#";


        link.target =
            "_blank";


        link.rel =
            "noopener noreferrer";


        link.textContent =
            "Voir l'offre →";


        card.appendChild(
            info
        );


        card.appendChild(
            link
        );


        container.appendChild(
            card
        );

    }

}


/* ==========================================
CHARGEMENT API
========================================== */

function loadProduct() {

    var productId =
        getProductId();


    if (!productId) {

        showError();

        return;

    }


    fetch(
        "http://localhost:3000/api/products"
    )

        .then(
            function (response) {

                if (!response.ok) {

                    throw new Error(
                        "Erreur HTTP " +
                        response.status
                    );

                }

                return response.json();

            }
        )

        .then(
            function (products) {

                if (
                    !Array.isArray(products)
                ) {

                    throw new Error(
                        "Données invalides."
                    );

                }


                var product =
                    products.find(
                        function (item) {

                            return Number(item.id) ===
                                productId;

                        }
                    );


                if (!product) {

                    throw new Error(
                        "Produit introuvable."
                    );

                }


                displayProduct(
                    product
                );

            }
        )

        .catch(
            function (error) {

                console.error(
                    "Erreur lors du chargement du produit :",
                    error
                );

                showError();

            }
        );

}


/* ==========================================
ERREUR
========================================== */

function showError() {

    if (loadingElement) {

        loadingElement.style.display =
            "none";

    }


    if (productElement) {

        productElement.style.display =
            "none";

    }


    if (errorElement) {

        errorElement.style.display =
            "block";

    }

}


/* ==========================================
LANCEMENT
========================================== */

loadProduct();