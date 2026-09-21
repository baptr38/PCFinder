/* ==========================================
PCFINDER - SCRIPT PRINCIPAL
========================================== */

/* ==========================================
PAGE RECHERCHE
========================================== */

var budgetSlider = document.getElementById("budget");
var budgetDisplay = document.getElementById("budgetDisplay");
var choiceButtons = document.querySelectorAll(".choice");
var searchButton = document.getElementById("search-button");

/* ==========================================
BUDGET
========================================== */

if (budgetSlider && budgetDisplay) {


budgetDisplay.textContent =
    budgetSlider.value + " €";

budgetSlider.addEventListener("input", function () {

    budgetDisplay.textContent =
        this.value + " €";

});


}

/* ==========================================
CHOIX DU QUESTIONNAIRE
========================================== */

var selectedUsage = null;
var selectedSize = "all";
var selectedPriority = "balanced";

for (var i = 0; i < choiceButtons.length; i++) {


choiceButtons[i].addEventListener("click", function () {

    var type =
        this.getAttribute("data-type");

    var value =
        this.getAttribute("data-value");

    /* UTILISATION */

    if (type === "usage") {

        var usageButtons =
            document.querySelectorAll(
                '[data-type="usage"]'
            );

        for (
            var u = 0;
            u < usageButtons.length;
            u++
        ) {

            usageButtons[u].classList.remove(
                "selected"
            );

        }

        this.classList.add("selected");

        selectedUsage = value;

    }

    /* TAILLE */

    if (type === "size") {

        var sizeButtons =
            document.querySelectorAll(
                '[data-type="size"]'
            );

        for (
            var s = 0;
            s < sizeButtons.length;
            s++
        ) {

            sizeButtons[s].classList.remove(
                "selected"
            );

        }

        this.classList.add("selected");

        selectedSize = value;

    }

    /* PRIORITE */

    if (type === "priority") {

        var priorityButtons =
            document.querySelectorAll(
                '[data-type="priority"]'
            );

        for (
            var p = 0;
            p < priorityButtons.length;
            p++
        ) {

            priorityButtons[p].classList.remove(
                "selected"
            );

        }

        this.classList.add("selected");

        selectedPriority = value;

    }

});


}

/* ==========================================
LANCER LA RECHERCHE
========================================== */

if (searchButton) {


searchButton.addEventListener("click", function () {

    if (!selectedUsage) {

        alert(
            "Choisis d'abord l'utilisation principale de ton PC."
        );

        return;

    }

    var budget = budgetSlider
        ? Number(budgetSlider.value)
        : 1000;

    var searchData = {

        budget: budget,

        usage: selectedUsage,

        size: selectedSize,

        priority: selectedPriority

    };

    try {

        sessionStorage.setItem(
            "pcfinderSearch",
            JSON.stringify(searchData)
        );

        var savedSearch =
            sessionStorage.getItem("pcfinderSearch");

        if (!savedSearch) {

            alert(
                "Impossible d'enregistrer ta recherche."
            );

            return;

        }

        window.location.href =
            "./resultats.html";

    }

    catch (error) {

        console.error(
            "Erreur lors de l'enregistrement de la recherche :",
            error
        );

        alert(
            "Impossible d'enregistrer ta recherche."
        );

    }

});


}

/* ==========================================
PAGE RESULTATS
========================================== */

var resultsContainer =
document.getElementById("results");

var noResults =
document.getElementById("no-results");

var searchSummary =
document.getElementById("searchSummary");

var sortResults =
document.getElementById("sortResults");

var currentSearch = null;

/* ==========================================
PRODUITS
========================================== */

var products = [];

/* ==========================================
CHARGEMENT DES PRODUITS DEPUIS L'API
========================================== */

function loadProductsFromAPI(callback) {


fetch("https://pcfinder-api.onrender.com/api/products")

    .then(function (response) {

        if (!response.ok) {

            throw new Error(
                "Erreur HTTP " +
                response.status
            );

        }

        return response.json();

    })

    .then(function (data) {

        if (!Array.isArray(data)) {

            throw new Error(
                "Les données reçues sont invalides."
            );

        }

        products = data;

        callback();

    })

    .catch(function (error) {

        console.error(
            "Erreur lors du chargement des produits depuis l'API :",
            error
        );

        if (resultsContainer) {

            resultsContainer.innerHTML =

                '<div class="no-results">' +

                    '<div class="no-results-icon">⚠️</div>' +

                    '<h2>Impossible de charger les PC</h2>' +

                    '<p>Le serveur PCFinder ne semble pas être disponible.</p>' +

                '</div>';

        }

    });


}

/* ==========================================
CHARGEMENT DES RESULTATS
========================================== */

if (resultsContainer) {


var savedSearch =
    sessionStorage.getItem(
        "pcfinderSearch"
    );

if (!savedSearch) {

    if (noResults) {

        noResults.style.display =
            "flex";

    }

    resultsContainer.style.display =
        "none";

    if (sortResults) {

        sortResults.style.display =
            "none";

    }

}

else {

    try {

        currentSearch =
            JSON.parse(savedSearch);

        if (noResults) {

            noResults.style.display =
                "none";

        }

        resultsContainer.style.display =
            "block";

        if (sortResults) {

            sortResults.style.display =
                "block";

        }

        updateSearchSummary(
            currentSearch,
            searchSummary
        );

        loadProductsFromAPI(
            function () {

                displayResults(
                    currentSearch,
                    resultsContainer
                );

                if (sortResults) {

                    sortResults.addEventListener(
                        "change",
                        function () {

                            displayResults(
                                currentSearch,
                                resultsContainer
                            );

                        }
                    );

                }

            }
        );

    }

    catch (error) {

        console.error(
            "Erreur lors de la lecture de la recherche :",
            error
        );

        if (noResults) {

            noResults.style.display =
                "flex";

        }

        resultsContainer.style.display =
            "none";

    }

}


}

/* ==========================================
RESUME DE LA RECHERCHE
========================================== */

function updateSearchSummary(
search,
element
) {


if (!element) {
    return;
}

var usageNames = {

    gaming: "Gaming",
    montage: "Montage vidéo",
    creation: "Création",
    mix: "Gaming + création"

};

var priorityNames = {

    performance: "Performances",
    screen: "Écran",
    battery: "Autonomie",
    balanced: "Équilibre"

};

var usage =
    usageNames[search.usage] ||
    "Utilisation polyvalente";

var priority =
    priorityNames[search.priority] ||
    "Équilibre";

var size =
    search.size === "all"
        ? "Taille d'écran : peu importe"
        : 'Écran : ' +
          search.size +
          '"';

element.innerHTML =

    "Budget maximum : <strong>" +
    search.budget +
    " €</strong>" +

    " · Utilisation : <strong>" +
    usage +
    "</strong>" +

    " · Priorité : <strong>" +
    priority +
    "</strong>" +

    " · " +
    size;


}

/* ==========================================
OUTIL SCORE /10 VERS /100
========================================== */

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

/* ==========================================
OFFRE PRINCIPALE
========================================== */

function getBestOffer(laptop) {


if (
    !laptop.offers ||
    laptop.offers.length === 0
) {

    return {

        merchant: "",
        price: 0,
        url: "#",
        affiliate: false

    };

}

var bestOffer =
    laptop.offers[0];

for (
    var i = 1;
    i < laptop.offers.length;
    i++
) {

    if (
        Number(laptop.offers[i].price) <
        Number(bestOffer.price)
    ) {

        bestOffer =
            laptop.offers[i];

    }

}

return bestOffer;


}

/* ==========================================
SCORE BUDGET
========================================== */

function calculateBudgetScore(
laptop,
budget
) {


var offer =
    getBestOffer(laptop);

var price =
    Number(offer.price);

budget =
    Number(budget);

if (
    !Number.isFinite(price) ||
    price <= 0 ||
    !Number.isFinite(budget) ||
    budget <= 0
) {

    return 0;

}

if (price <= budget) {

    var difference =
        budget - price;

    var percentage =
        difference / budget;

    if (percentage <= 0.05) {
        return 100;
    }

    if (percentage <= 0.10) {
        return 98;
    }

    if (percentage <= 0.15) {
        return 96;
    }

    if (percentage <= 0.20) {
        return 94;
    }

    if (percentage <= 0.30) {
        return 91;
    }

    if (percentage <= 0.40) {
        return 87;
    }

    if (percentage <= 0.50) {
        return 82;
    }

    return 76;

}

var overDifference =
    price - budget;

var overPercentage =
    overDifference / budget;

if (overPercentage <= 0.03) {
    return 82;
}

if (overPercentage <= 0.05) {
    return 78;
}

if (overPercentage <= 0.10) {
    return 70;
}

if (overPercentage <= 0.15) {
    return 58;
}

if (overPercentage <= 0.20) {
    return 45;
}

return 25;


}

/* ==========================================
SCORE TAILLE ECRAN
========================================== */

function calculateSizeScore(
laptop,
search
) {


if (
    !search.size ||
    search.size === "all"
) {

    return 100;

}

var wantedSize =
    Number(search.size);

var laptopSize =
    Number(laptop.screenSize);

if (
    !Number.isFinite(wantedSize) ||
    !Number.isFinite(laptopSize)
) {

    return 50;

}

var difference =
    Math.abs(
        laptopSize -
        wantedSize
    );

if (difference <= 0.2) {
    return 100;
}

if (difference <= 0.4) {
    return 96;
}

if (difference <= 0.6) {
    return 90;
}

if (difference <= 0.9) {
    return 78;
}

if (difference <= 1.2) {
    return 62;
}

return 40;


}

/* ==========================================
SCORE UTILISATION
========================================== */

function calculateUsageScore(
laptop,
search
) {


var scores =
    laptop.scores || {};

if (search.usage === "gaming") {

    return scoreTo100(
        scores.gaming
    );

}

if (search.usage === "montage") {

    return scoreTo100(
        scores.montage
    );

}

if (search.usage === "creation") {

    return scoreTo100(
        scores.creation
    );

}

if (search.usage === "mix") {

    return (

        scoreTo100(scores.gaming) * 0.40 +

        scoreTo100(scores.montage) * 0.35 +

        scoreTo100(scores.creation) * 0.25

    );

}

return 50;


}

/* ==========================================
SCORE PRIORITE
========================================== */

function calculatePriorityScore(
laptop,
search
) {


var scores =
    laptop.scores || {};

if (search.priority === "performance") {

    return scoreTo100(
        scores.performance
    );

}

if (search.priority === "screen") {

    return scoreTo100(
        scores.screen
    );

}

if (search.priority === "battery") {

    return scoreTo100(
        scores.battery
    );

}

return (

    scoreTo100(scores.performance) * 0.45 +

    scoreTo100(scores.screen) * 0.30 +

    scoreTo100(scores.battery) * 0.25

);


}

/* ==========================================
SCORE QUALITE / VALEUR
========================================== */

function calculateValueScore(
laptop,
search
) {


var usageScore =
    calculateUsageScore(
        laptop,
        search
    );

var priorityScore =
    calculatePriorityScore(
        laptop,
        search
    );

var quality =
    usageScore * 0.55 +
    priorityScore * 0.45;

var budgetScore =
    calculateBudgetScore(
        laptop,
        search.budget
    );

return (

    quality * 0.70 +

    budgetScore * 0.30

);


}

/* ==========================================
BONUS CARACTERISTIQUES
========================================== */

function calculateFeatureBonus(
laptop,
search
) {


var bonus = 0;

var scores =
    laptop.scores || {};

var screenScore =
    scoreTo100(
        scores.screen
    );

var performanceScore =
    scoreTo100(
        scores.performance
    );

var batteryScore =
    scoreTo100(
        scores.battery
    );

var gamingScore =
    scoreTo100(
        scores.gaming
    );

var montageScore =
    scoreTo100(
        scores.montage
    );

var creationScore =
    scoreTo100(
        scores.creation
    );

/* MONTAGE */

if (
    search.usage === "montage"
) {

    if (
        laptop.colorGamut ===
        "100% sRGB"
    ) {

        bonus += 4;

    }

    if (
        laptop.storage &&
        laptop.storage.toLowerCase().indexOf("1 to") !== -1
    ) {

        bonus += 2;

    }

    if (
        montageScore >= 90
    ) {

        bonus += 2;

    }

}

/* CREATION */

if (
    search.usage === "creation"
) {

    if (
        laptop.colorGamut ===
        "100% sRGB"
    ) {

        bonus += 5;

    }

    if (
        screenScore >= 90
    ) {

        bonus += 2;

    }

    if (
        creationScore >= 90
    ) {

        bonus += 2;

    }

}

/* GAMING */

if (
    search.usage === "gaming"
) {

    if (
        laptop.refreshRate &&
        Number(laptop.refreshRate) >= 165
    ) {

        bonus += 3;

    }

    if (
        gamingScore >= 90
    ) {

        bonus += 2;

    }

    if (
        performanceScore >= 90
    ) {

        bonus += 2;

    }

}

/* MIX */

if (
    search.usage === "mix"
) {

    if (
        gamingScore >= 85 &&
        montageScore >= 80
    ) {

        bonus += 3;

    }

    if (
        laptop.colorGamut ===
        "100% sRGB"
    ) {

        bonus += 2;

    }

}

/* PRIORITE ECRAN */

if (
    search.priority === "screen"
) {

    if (
        screenScore >= 90
    ) {

        bonus += 4;

    }

    else if (
        screenScore >= 80
    ) {

        bonus += 2;

    }

}

/* PRIORITE PERFORMANCE */

if (
    search.priority === "performance"
) {

    if (
        performanceScore >= 90
    ) {

        bonus += 4;

    }

    else if (
        performanceScore >= 80
    ) {

        bonus += 2;

    }

}

/* PRIORITE AUTONOMIE */

if (
    search.priority === "battery"
) {

    if (
        batteryScore >= 85
    ) {

        bonus += 4;

    }

    else if (
        batteryScore >= 75
    ) {

        bonus += 2;

    }

}

/* EQUILIBRE */

if (
    search.priority === "balanced"
) {

    if (
        performanceScore >= 85 &&
        screenScore >= 80 &&
        batteryScore >= 70
    ) {

        bonus += 4;

    }

}

return bonus;


}

/* ==========================================
SCORE FINAL
========================================== */

function calculateScore(
laptop,
search
) {


var usageScore =
    calculateUsageScore(
        laptop,
        search
    );

var priorityScore =
    calculatePriorityScore(
        laptop,
        search
    );

var budgetScore =
    calculateBudgetScore(
        laptop,
        search.budget
    );

var sizeScore =
    calculateSizeScore(
        laptop,
        search
    );

var valueScore =
    calculateValueScore(
        laptop,
        search
    );

var featureBonus =
    calculateFeatureBonus(
        laptop,
        search
    );

var usageWeight = 0.40;
var priorityWeight = 0.20;
var budgetWeight = 0.25;
var sizeWeight = 0.10;

if (
    search.priority === "performance"
) {

    usageWeight = 0.42;
    priorityWeight = 0.32;
    budgetWeight = 0.20;
    sizeWeight = 0.06;

}

else if (
    search.priority === "screen"
) {

    usageWeight = 0.40;
    priorityWeight = 0.32;
    budgetWeight = 0.20;
    sizeWeight = 0.08;

}

else if (
    search.priority === "battery"
) {

    usageWeight = 0.40;
    priorityWeight = 0.32;
    budgetWeight = 0.22;
    sizeWeight = 0.06;

}

else {

    usageWeight = 0.42;
    priorityWeight = 0.23;
    budgetWeight = 0.25;
    sizeWeight = 0.10;

}

var score =

    usageScore * usageWeight +

    priorityScore * priorityWeight +

    budgetScore * budgetWeight +

    sizeScore * sizeWeight;

score =
    score * 0.90 +
    valueScore * 0.10;

score +=
    featureBonus;

var offer =
    getBestOffer(laptop);

var price =
    Number(offer.price);

var budget =
    Number(search.budget);

var difference =
    price -
    budget;

if (
    difference > 250
) {

    score -= 20;

}

else if (
    difference > 200
) {

    score -= 15;

}

else if (
    difference > 150
) {

    score -= 10;

}

else if (
    difference > 100
) {

    score -= 5;

}

if (
    price > 0 &&
    price <= budget
) {

    var budgetMargin =
        budget -
        price;

    if (
        budgetMargin >= 0 &&
        budgetMargin <= 100
    ) {

        score += 2;

    }

}

return Math.max(
    0,
    Math.min(
        100,
        Math.round(score)
    )
);


}

/* ==========================================
FILTRAGE
========================================== */

function filterProducts(
search
) {


var compatibleProducts =
    products.filter(
        function (laptop) {

            var offer =
                getBestOffer(laptop);

            var price =
                Number(offer.price);

            var maximumPrice =
                Number(search.budget) * 1.15;

            var budgetCompatible =
                price <=
                maximumPrice;

            var sizeCompatible = true;

            if (
                search.size &&
                search.size !== "all"
            ) {

                var selectedSize =
                    Number(search.size);

                var laptopSize =
                    Number(
                        laptop.screenSize
                    );

                if (
                    Number.isFinite(
                        laptopSize
                    )
                ) {

                    sizeCompatible =
                        Math.abs(
                            laptopSize -
                            selectedSize
                        ) <= 0.9;

                }

            }

            return (
                budgetCompatible &&
                sizeCompatible
            );

        }
    );

if (
    compatibleProducts.length === 0
) {

    compatibleProducts =
        products.slice();

}

return compatibleProducts;


}

/* ==========================================
TRI
========================================== */

function sortProducts(
productsList,
search
) {


var sorted =
    productsList.slice();

var sortType =
    sortResults
        ? sortResults.value
        : "score";

if (
    sortType === "price-low"
) {

    sorted.sort(
        function (a, b) {

            return (
                Number(
                    getBestOffer(a).price
                ) -
                Number(
                    getBestOffer(b).price
                )
            );

        }
    );

}

else if (
    sortType === "price-high"
) {

    sorted.sort(
        function (a, b) {

            return (
                Number(
                    getBestOffer(b).price
                ) -
                Number(
                    getBestOffer(a).price
                )
            );

        }
    );

}

else if (
    sortType === "gaming"
) {

    sorted.sort(
        function (a, b) {

            return (
                scoreTo100(
                    b.scores &&
                    b.scores.gaming
                ) -
                scoreTo100(
                    a.scores &&
                    a.scores.gaming
                )
            );

        }
    );

}

else if (
    sortType === "montage"
) {

    sorted.sort(
        function (a, b) {

            return (
                scoreTo100(
                    b.scores &&
                    b.scores.montage
                ) -
                scoreTo100(
                    a.scores &&
                    a.scores.montage
                )
            );

        }
    );

}

else if (
    sortType === "screen"
) {

    sorted.sort(
        function (a, b) {

            return (
                scoreTo100(
                    b.scores &&
                    b.scores.screen
                ) -
                scoreTo100(
                    a.scores &&
                    a.scores.screen
                )
            );

        }
    );

}

else if (
    sortType === "battery"
) {

    sorted.sort(
        function (a, b) {

            return (
                scoreTo100(
                    b.scores &&
                    b.scores.battery
                ) -
                scoreTo100(
                    a.scores &&
                    a.scores.battery
                )
            );

        }
    );

}

else {

    sorted.sort(
        function (a, b) {

            return (
                b.score -
                a.score
            );

        }
    );

}

return sorted;


}

/* ==========================================
EXPLICATION
========================================== */

function generateExplanation(
laptop,
search
) {


var usageText = "";
var priorityText = "";
var budgetText = "";

var scores =
    laptop.scores || {};

/* UTILISATION */

if (
    search.usage === "gaming"
) {

    var gamingScore =
        scoreTo100(
            scores.gaming
        );

    if (
        gamingScore >= 90
    ) {

        usageText =
            "d'excellentes performances en gaming";

    }

    else if (
        gamingScore >= 80
    ) {

        usageText =
            "de très bonnes performances en gaming";

    }

    else {

        usageText =
            "de bonnes performances en gaming";

    }

}

else if (
    search.usage === "montage"
) {

    var montageScore =
        scoreTo100(
            scores.montage
        );

    if (
        montageScore >= 90
    ) {

        usageText =
            "d'excellentes performances en montage vidéo";

    }

    else if (
        montageScore >= 80
    ) {

        usageText =
            "de très bonnes performances en montage vidéo";

    }

    else {

        usageText =
            "de bonnes performances en montage vidéo";

    }

}

else if (
    search.usage === "creation"
) {

    var creationScore =
        scoreTo100(
            scores.creation
        );

    if (
        creationScore >= 90
    ) {

        usageText =
            "d'excellentes performances pour la création";

    }

    else if (
        creationScore >= 80
    ) {

        usageText =
            "de très bonnes performances pour la création";

    }

    else {

        usageText =
            "de bonnes performances pour la création";

    }

}

else if (
    search.usage === "mix"
) {

    usageText =
        "un très bon équilibre entre gaming et création";

}

/* PRIORITE */

if (
    search.priority === "performance"
) {

    var performanceScore =
        scoreTo100(
            scores.performance
        );

    if (
        performanceScore >= 90
    ) {

        priorityText =
            "un excellent niveau de performances";

    }

    else if (
        performanceScore >= 80
    ) {

        priorityText =
            "un très bon niveau de performances";

    }

    else {

        priorityText =
            "un niveau de performances correct";

    }

}

else if (
    search.priority === "screen"
) {

    var screenScore =
        scoreTo100(
            scores.screen
        );

    if (
        screenScore >= 90
    ) {

        priorityText =
            "un excellent écran";

    }

    else if (
        screenScore >= 80
    ) {

        priorityText =
            "un écran particulièrement intéressant";

    }

    else {

        priorityText =
            "un écran correct";

    }

}

else if (
    search.priority === "battery"
) {

    var batteryScore =
        scoreTo100(
            scores.battery
        );

    if (
        batteryScore >= 85
    ) {

        priorityText =
            "une très bonne autonomie";

    }

    else if (
        batteryScore >= 75
    ) {

        priorityText =
            "une bonne autonomie";

    }

    else if (
        batteryScore >= 65
    ) {

        priorityText =
            "une autonomie correcte";

    }

    else {

        priorityText =
            "une autonomie plutôt limitée";

    }

}

else {

    priorityText =
        "un bon équilibre général";

}

/* BUDGET */

var offer =
    getBestOffer(laptop);

var price =
    Number(offer.price);

var budget =
    Number(search.budget);

if (
    price <= budget
) {

    var difference =
        budget -
        price;

    if (
        difference >= 200
    ) {

        budgetText =
            "Il reste également une bonne marge dans ton budget.";

    }

    else if (
        difference >= 75
    ) {

        budgetText =
            "Il reste encore une marge intéressante dans ton budget.";

    }

    else if (
        difference > 0
    ) {

        budgetText =
            "Il reste peu de marge dans ton budget.";

    }

    else {

        budgetText =
            "Il correspond exactement à ton budget.";

    }

}

else {

    var overBudget =
        price -
        budget;

    budgetText =
        "Il dépasse toutefois ton budget de " +
        overBudget +
        " €.";

}

return (
    "Ce PC offre " +
    usageText +
    ", avec " +
    priorityText +
    ". " +
    budgetText
);


}

/* ==========================================
LOGOS DES VENDEURS
========================================== */

function getMerchantLogo(merchant) {


if (!merchant) {
    return "";
}

var name =
    merchant
        .toLowerCase()
        .trim();

var logos = {

    "fnac":
        "images/logos/fnac.svg",

    "darty":
        "images/logos/darty.svg"

};

return logos[name] || "";


}

/* ==========================================
AFFICHAGE VENDEUR PRINCIPAL
========================================== */

function createMerchantHTML(offer) {


if (!offer) {
    return "";
}

var merchant =
    offer.merchant || "";

var logo =
    getMerchantLogo(merchant);

if (!logo) {

    return (
        '<div class="product-merchant">' +
            merchant +
        "</div>"
    );

}

return (
    '<div class="product-merchant">' +
        '<img src="' +
            logo +
        '" alt="' +
            merchant +
        '" class="merchant-logo">' +
        '<span class="merchant-name">' +
            merchant +
        '</span>' +
    '</div>'
);


}

/* ==========================================
AUTRES OFFRES
========================================== */

function createOtherOffersHTML(
laptop,
bestOffer
) {


if (
    !laptop.offers ||
    laptop.offers.length <= 1
) {

    return "";

}

var otherOffers =
    [];

for (
    var i = 0;
    i < laptop.offers.length;
    i++
) {

    var offer =
        laptop.offers[i];

    if (
        offer === bestOffer
    ) {

        continue;

    }

    otherOffers.push(
        offer
    );

}

otherOffers.sort(
    function (a, b) {

        return (
            Number(a.price) -
            Number(b.price)
        );

    }
);

if (
    otherOffers.length === 0
) {

    return "";

}

var offersHTML =
    "";

for (
    var j = 0;
    j < otherOffers.length;
    j++
) {

    var otherOffer =
        otherOffers[j];

    var merchant =
        otherOffer.merchant || "Vendeur";

    var price =
        Number(otherOffer.price);

    var affiliateLabel =
        otherOffer.affiliate
            ? " · Offre partenaire"
            : "";

    offersHTML +=

        '<div style="' +
            'display:flex;' +
            'align-items:center;' +
            'justify-content:space-between;' +
            'gap:10px;' +
            'padding:7px 0;' +
            'border-top:1px solid var(--border);' +
        '">' +

            '<span style="' +
                'font-size:12px;' +
                'color:var(--text-secondary);' +
            '">' +

                merchant +

                '<span style="color:var(--text-muted);">' +
                    affiliateLabel +
                '</span>' +

            '</span>' +

            '<a href="' +
                (otherOffer.url || "#") +
                '" target="_blank" rel="noopener noreferrer" style="' +
                    'font-size:12px;' +
                    'font-weight:600;' +
                    'color:var(--accent-light);' +
                    'text-decoration:none;' +
                    'white-space:nowrap;' +
                '">' +

                (
                    Number.isFinite(price)
                        ? price + " €"
                        : "Voir l'offre"
                ) +

                " →" +

            "</a>" +

        "</div>";

}

return (
    '<div style="' +
        'margin-top:10px;' +
        'padding-top:2px;' +
    '">' +

        '<div style="' +
            'font-size:12px;' +
            'font-weight:600;' +
            'color:var(--text-secondary);' +
            'margin-bottom:2px;' +
        '">' +

            "Autres offres" +

        "</div>" +

        offersHTML +

    "</div>"
);


}

/* ==========================================
CREATION CARTE PRODUIT
========================================== */

function createProductCard(
laptop,
search,
rank
) {


var card =
    document.createElement("article");

card.className =
    "product-card";

if (
    rank === 1
) {

    card.classList.add(
        "product-card-best"
    );

}

var badge = "";

if (
    rank === 1
) {

    badge =
        '<div class="product-badge">🏆 Meilleur choix</div>';

}

else if (
    rank === 2
) {

    badge =
        '<div class="product-badge">🥈 Deuxième choix</div>';

}

else if (
    rank === 3
) {

    badge =
        '<div class="product-badge">🥉 Troisième choix</div>';

}

else {

    var badgeIcon =
        "💻";

    var badgeText =
        "Bon choix";

    var scores =
        laptop.scores || {};

    if (
        search.usage === "gaming" &&
        scoreTo100(scores.gaming) >= 90
    ) {

        badgeIcon =
            "🎮";

        badgeText =
            "Excellent pour le gaming";

    }

    else if (
        search.usage === "montage" &&
        scoreTo100(scores.montage) >= 90
    ) {

        badgeIcon =
            "🎬";

        badgeText =
            "Excellent pour le montage";

    }

    else if (
        search.usage === "creation" &&
        scoreTo100(scores.creation) >= 85
    ) {

        badgeIcon =
            "🎨";

        badgeText =
            "Très bon pour la création";

    }

    else if (
        search.priority === "screen" &&
        scoreTo100(scores.screen) >= 85
    ) {

        badgeIcon =
            "🖥️";

        badgeText =
            "Excellent écran";

    }

    else if (
        search.priority === "performance" &&
        scoreTo100(scores.performance) >= 90
    ) {

        badgeIcon =
            "⚡";

        badgeText =
            "Très performant";

    }

    else if (
        search.priority === "battery" &&
        scoreTo100(scores.battery) >= 75
    ) {

        badgeIcon =
            "🔋";

        badgeText =
            "Bonne autonomie";

    }

    else if (
        getBestOffer(laptop).price <=
        search.budget - 100
    ) {

        badgeIcon =
            "💰";

        badgeText =
            "Bon rapport qualité/prix";

    }

    badge =

        '<div class="product-badge">' +

        badgeIcon +

        " " +

        badgeText +

        "</div>";

}

/* IMAGE */

var imageHTML =
    "";

if (
    laptop.image
) {

    imageHTML =

        '<img src="' +
        laptop.image +
        '" alt="' +
        laptop.name +
        '">' +

        '<div class="image-placeholder" style="display:none;">' +
        laptop.brand +
        "</div>";

}

else {

    imageHTML =

        '<div class="image-placeholder">' +
        laptop.brand +
        "</div>";

}

/* OFFRE / BUDGET */

var bestOffer =
    getBestOffer(laptop);

var budgetText =
    "";

if (
    bestOffer.price <=
    search.budget
) {

    var remaining =
        search.budget -
        bestOffer.price;

    budgetText =

        '<span class="budget-good">' +

        "💰 " +

        remaining +

        " € sous ton budget" +

        "</span>";

}

else {

    var budgetDifference =
        bestOffer.price -
        search.budget;

    budgetText =

        '<span class="budget-over">' +

        "💰 " +

        budgetDifference +

        " € au-dessus du budget" +

        "</span>";

}

/* ECRAN */

var screenDetails =

    '<div class="detail-section">' +

        '<div class="detail-title">🖥️ ÉCRAN</div>' +

        '<div class="detail-grid">' +

            '<div>' +

                '<span>Taille</span>' +

                '<strong>' +

                    (laptop.screen || "") +

                '</strong>' +

            '</div>' +

            '<div>' +

                '<span>Type</span>' +

                '<strong>' +

                    (laptop.screenType || "") +

                '</strong>' +

            '</div>' +

            '<div>' +

                '<span>Fréquence</span>' +

                '<strong>' +

                    (laptop.refresh || "") +

                '</strong>' +

            '</div>' +

            '<div>' +

                '<span>Résolution</span>' +

                '<strong>' +

                    (laptop.resolution || "") +

                '</strong>' +

            '</div>' +

        '</div>' +

        '<div class="screen-extra">' +

            '<div class="detail-mini-grid">' +

                '<div>' +

                    '<span>🌈 Couleurs</span>' +

                    '<strong>' +

                        (laptop.colorGamut || "") +

                    '</strong>' +

                '</div>' +

                '<div>' +

                    '<span>☀️ Luminosité</span>' +

                    '<strong>' +

                        (laptop.brightness || "") +

                    '</strong>' +

                '</div>' +

            '</div>' +

        '</div>' +

    '</div>';

/* CARACTERISTIQUES */

var extraDetails =

    '<div class="detail-section extra-details">' +

        '<div class="detail-title">⚙️ CARACTÉRISTIQUES</div>' +

        '<div class="detail-mini-grid">' +

            '<div>' +

                '<span>⚖️ Poids</span>' +

                '<strong>' +

                    (laptop.weight || "") +

                '</strong>' +

            '</div>' +

            '<div>' +

                '<span>🔋 Batterie</span>' +

                '<strong>' +

                    (laptop.battery || "") +

                '</strong>' +

            '</div>' +

        '</div>' +

    '</div>';

/* POINTS FORTS / FAIBLES */

var strengthsHTML =
    "";

if (
    laptop.strengths &&
    laptop.strengths.length > 0
) {

    var strengthsList =
        "";

    var weaknessesList =
        "";

    var maxStrengths =
        Math.min(
            3,
            laptop.strengths.length
        );

    var maxWeaknesses =
        Math.min(
            3,
            laptop.weaknesses
                ? laptop.weaknesses.length
                : 0
        );

    for (
        var a = 0;
        a < maxStrengths;
        a++
    ) {

        strengthsList +=

            "<li>" +

            laptop.strengths[a] +

            "</li>";

    }

    for (
        var b = 0;
        b < maxWeaknesses;
        b++
    ) {

        weaknessesList +=

            "<li>" +

            laptop.weaknesses[b] +

            "</li>";

    }

    strengthsHTML =

        '<div class="pros-cons">' +

            '<div class="pros">' +

                '<h4 class="pros-title">👍 Points forts</h4>' +

                "<ul>" +

                    strengthsList +

                "</ul>" +

            "</div>" +

            '<div class="cons">' +

                '<h4 class="cons-title">⚠️ Points faibles</h4>' +

                "<ul>" +

                    weaknessesList +

                "</ul>" +

            "</div>" +

        "</div>";

}

/* AUTRES OFFRES */

var otherOffersHTML =
    createOtherOffersHTML(
        laptop,
        bestOffer
    );

/* CARTE COMPLETE */

card.innerHTML =

    badge +

    '<div class="product-image">' +

        imageHTML +

        '<div class="product-merchant">' +

            bestOffer.merchant +

        "</div>" +

    "</div>" +

    '<div class="product-info">' +

        '<span class="product-brand">' +

            (laptop.brand || "") +

        "</span>" +

        "<h3>" +

            (laptop.name || "") +

        "</h3>" +

        '<div class="product-specs">' +

            "<span>🧠 " +

                (laptop.cpu || "") +

            "</span>" +

            "<span>🎮 " +

                (laptop.gpu || "") +

            "</span>" +

            "<span>💾 " +

                (laptop.ram || "") +

            "</span>" +

            "<span>💿 " +

                (laptop.storage || "") +

            "</span>" +

        "</div>" +

        screenDetails +

        extraDetails +

        '<div class="product-score">' +

            '<div class="score-header">' +

                "<strong>" +

                    laptop.score +

                    "/100" +

                "</strong>" +

                "<span>Score PCFinder</span>" +

            "</div>" +

            '<div class="score-bar">' +

                '<div class="score-bar-fill" style="width:' +

                    laptop.score +

                    '%"></div>' +

            "</div>" +

        "</div>" +

        '<p class="product-explanation">' +

            "💡 " +

            generateExplanation(
                laptop,
                search
            ) +

        "</p>" +

        strengthsHTML +

        '<div class="product-budget">' +

            budgetText +

        "</div>" +

        '<div class="product-bottom">' +

            '<div>' +

                '<strong class="product-price">' +

                    bestOffer.price +

                    " €" +

                "</strong>" +

            "</div>" +

            '<a href="' +

                (bestOffer.url || "#") +

                '" target="_blank" rel="noopener noreferrer" class="btn-primary">' +

                "Voir le PC →" +

            "</a>" +

        "</div>" +

        otherOffersHTML +

    "</div>";

/* GESTION ERREUR IMAGE */

var image =
    card.querySelector(
        ".product-image img"
    );

if (image) {

    image.addEventListener(
        "error",
        function () {

            this.style.display =
                "none";

            var placeholder =
                this.nextElementSibling;

            if (placeholder) {

                placeholder.style.display =
                    "flex";

            }

        }
    );

}

return card;


}

/* ==========================================
CREATION D'UNE GRILLE
========================================== */

function createProductGrid(
productList,
search,
showRanks
) {


var grid =
    document.createElement(
        "div"
    );

if (
    showRanks
) {

    grid.className =
        "top-results-grid";

}

else {

    grid.className =
        "all-results-grid";

}

for (
    var i = 0;
    i < productList.length;
    i++
) {

    var rank =
        showRanks
            ? i + 1
            : 0;

    var card =
        createProductCard(
            productList[i],
            search,
            rank
        );

    grid.appendChild(
        card
    );

}

return grid;


}

/* ==========================================
AFFICHAGE DES RESULTATS
========================================== */

function displayResults(
search,
container
) {


if (!container) {
    return;
}

container.innerHTML =
    "";

/* PRODUITS COMPATIBLES */

var compatibleProducts =
    filterProducts(
        search
    );

/* CALCUL DU SCORE */

var scoredProducts =
    [];

for (
    var i = 0;
    i < compatibleProducts.length;
    i++
) {

    var original =
        compatibleProducts[i];

    var scoredLaptop =
        {};

    for (
        var property in original
    ) {

        if (
            Object.prototype.hasOwnProperty.call(
                original,
                property
            )
        ) {

            scoredLaptop[property] =
                original[property];

        }

    }

    scoredLaptop.score =
        calculateScore(
            original,
            search
        );

    scoredProducts.push(
        scoredLaptop
    );

}

/* CLASSEMENT */

var ranking =
    scoredProducts.slice();

ranking.sort(
    function (a, b) {

        return (
            b.score -
            a.score
        );

    }
);

/* TOP 3 */

var topProducts =
    ranking.slice(
        0,
        3
    );

var topGrid =
    createProductGrid(
        topProducts,
        search,
        true
    );

container.appendChild(
    topGrid
);

/* RETIRE LES 3 PC DU TOP */

var topIds =
    [];

for (
    var t = 0;
    t < topProducts.length;
    t++
) {

    topIds.push(
        topProducts[t].id
    );

}

var otherProducts =
    scoredProducts.filter(
        function (laptop) {

            return (
                topIds.indexOf(
                    laptop.id
                ) === -1
            );

        }
    );

/* TRI AUTRES RESULTATS */

var sortedOtherProducts =
    sortProducts(
        otherProducts,
        search
    );

/* TITRE */

if (
    sortedOtherProducts.length > 0
) {

    var allTitle =
        document.createElement(
            "div"
        );

    allTitle.className =
        "results-all-title";

    allTitle.innerHTML =

        "<h2>D'autres suggestions pour toi</h2>" +

        "<p>Voici d'autres PC qui pourraient également correspondre à ta recherche.</p>";

    container.appendChild(
        allTitle
    );

}

/* GRILLE */

var allGrid =
    createProductGrid(
        sortedOtherProducts,
        search,
        false
    );

container.appendChild(
    allGrid
);


}
