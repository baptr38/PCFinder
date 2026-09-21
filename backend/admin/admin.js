var productsContainer =
    document.getElementById("productsContainer");

var productCount =
    document.getElementById("productCount");

var statusMessage =
    document.getElementById("statusMessage");

var refreshButton =
    document.getElementById("refreshButton");


var editSection =
    document.getElementById("editSection");

var editForm =
    document.getElementById("editForm");

var editTitle =
    document.getElementById("editTitle");

var cancelEditButton =
    document.getElementById("cancelEditButton");

var cancelEditButtonBottom =
    document.getElementById("cancelEditButtonBottom");


var editName =
    document.getElementById("editName");

var editBrand =
    document.getElementById("editBrand");

var editCpu =
    document.getElementById("editCpu");

var editGpu =
    document.getElementById("editGpu");

var editRam =
    document.getElementById("editRam");

var editStorage =
    document.getElementById("editStorage");

var editScreen =
    document.getElementById("editScreen");

var editWeight =
    document.getElementById("editWeight");

var editBatteryWh =
    document.getElementById("editBatteryWh");


/* ================================= */
/* SCORES */
/* ================================= */

var editGaming =
    document.getElementById("editGaming");

var editMontage =
    document.getElementById("editMontage");

var editCreation =
    document.getElementById("editCreation");

var editPerformance =
    document.getElementById("editPerformance");

var editScoreScreen =
    document.getElementById("editScreenScore");

var editBattery =
    document.getElementById("editBattery");


var editOffersContainer =
    document.getElementById("editOffersContainer");

var addOfferEditButton =
    document.getElementById("addOfferEditButton");


var addSection =
    document.getElementById("addSection");

var addProductButton =
    document.getElementById("addProductButton");

var addForm =
    document.getElementById("addForm");

var cancelAddButton =
    document.getElementById("cancelAddButton");

var cancelAddButtonBottom =
    document.getElementById("cancelAddButtonBottom");


var addName =
    document.getElementById("addName");

var addBrand =
    document.getElementById("addBrand");

var addCpu =
    document.getElementById("addCpu");

var addGpu =
    document.getElementById("addGpu");

var addRam =
    document.getElementById("addRam");

var addStorage =
    document.getElementById("addStorage");

var addScreen =
    document.getElementById("addScreen");

var addWeight =
    document.getElementById("addWeight");

var addBatteryWh =
    document.getElementById("addBatteryWh");


/* ================================= */
/* SCORES AJOUT */
/* ================================= */

var addGaming =
    document.getElementById("addGaming");

var addMontage =
    document.getElementById("addMontage");

var addCreation =
    document.getElementById("addCreation");

var addPerformance =
    document.getElementById("addPerformance");

var addScoreScreen =
    document.getElementById("addScreenScore");

var addBattery =
    document.getElementById("addBattery");


var addOffersContainer =
    document.getElementById("addOffersContainer");

var addOfferAddButton =
    document.getElementById("addOfferAddButton");


var currentProductId = null;


/* ================================= */
/* SUIVI DES MODIFICATIONS MANUELLES */
/* ================================= */

var manuallyEditedEditScores = {

    gaming: false,

    montage: false,

    creation: false,

    performance: false,

    screen: false,

    battery: false

};


var manuallyEditedAddScores = {

    gaming: false,

    montage: false,

    creation: false,

    performance: false,

    screen: false,

    battery: false

};


/* ================================= */
/* SUIVI DES CHANGEMENTS */
/* ================================= */

function setupScoreTracking() {

    if (editGaming) {

        editGaming.addEventListener(
            "input",
            function () {

                manuallyEditedEditScores.gaming = true;

            }
        );

    }


    if (editMontage) {

        editMontage.addEventListener(
            "input",
            function () {

                manuallyEditedEditScores.montage = true;

            }
        );

    }


    if (editCreation) {

        editCreation.addEventListener(
            "input",
            function () {

                manuallyEditedEditScores.creation = true;

            }
        );

    }


    if (editPerformance) {

        editPerformance.addEventListener(
            "input",
            function () {

                manuallyEditedEditScores.performance = true;

            }
        );

    }


    if (editScoreScreen) {

        editScoreScreen.addEventListener(
            "input",
            function () {

                manuallyEditedEditScores.screen = true;

            }
        );

    }


    if (editBattery) {

        editBattery.addEventListener(
            "input",
            function () {

                manuallyEditedEditScores.battery = true;

            }
        );

    }


    if (addGaming) {

        addGaming.addEventListener(
            "input",
            function () {

                manuallyEditedAddScores.gaming = true;

            }
        );

    }


    if (addMontage) {

        addMontage.addEventListener(
            "input",
            function () {

                manuallyEditedAddScores.montage = true;

            }
        );

    }


    if (addCreation) {

        addCreation.addEventListener(
            "input",
            function () {

                manuallyEditedAddScores.creation = true;

            }
        );

    }


    if (addPerformance) {

        addPerformance.addEventListener(
            "input",
            function () {

                manuallyEditedAddScores.performance = true;

            }
        );

    }


    if (addScoreScreen) {

        addScoreScreen.addEventListener(
            "input",
            function () {

                manuallyEditedAddScores.screen = true;

            }
        );

    }


    if (addBattery) {

        addBattery.addEventListener(
            "input",
            function () {

                manuallyEditedAddScores.battery = true;

            }
        );

    }

}


function resetEditScoreTracking() {

    manuallyEditedEditScores = {

        gaming: false,

        montage: false,

        creation: false,

        performance: false,

        screen: false,

        battery: false

    };

}


function resetAddScoreTracking() {

    manuallyEditedAddScores = {

        gaming: false,

        montage: false,

        creation: false,

        performance: false,

        screen: false,

        battery: false

    };

}


/* ================================= */
/* RÉCUPÉRER LES SCORES MANUELS */
/* ================================= */

function collectManualEditScores() {

    var overrides = {};


    if (
        manuallyEditedEditScores.gaming &&
        editGaming &&
        editGaming.value !== ""
    ) {

        overrides.gaming =
            Number(editGaming.value);

    }


    if (
        manuallyEditedEditScores.montage &&
        editMontage &&
        editMontage.value !== ""
    ) {

        overrides.montage =
            Number(editMontage.value);

    }


    if (
        manuallyEditedEditScores.creation &&
        editCreation &&
        editCreation.value !== ""
    ) {

        overrides.creation =
            Number(editCreation.value);

    }


    if (
        manuallyEditedEditScores.performance &&
        editPerformance &&
        editPerformance.value !== ""
    ) {

        overrides.performance =
            Number(editPerformance.value);

    }


    if (
        manuallyEditedEditScores.screen &&
        editScoreScreen &&
        editScoreScreen.value !== ""
    ) {

        overrides.screen =
            Number(editScoreScreen.value);

    }


    if (
        manuallyEditedEditScores.battery &&
        editBattery &&
        editBattery.value !== ""
    ) {

        overrides.battery =
            Number(editBattery.value);

    }


    return overrides;

}


function collectManualAddScores() {

    var overrides = {};


    if (
        manuallyEditedAddScores.gaming &&
        addGaming &&
        addGaming.value !== ""
    ) {

        overrides.gaming =
            Number(addGaming.value);

    }


    if (
        manuallyEditedAddScores.montage &&
        addMontage &&
        addMontage.value !== ""
    ) {

        overrides.montage =
            Number(addMontage.value);

    }


    if (
        manuallyEditedAddScores.creation &&
        addCreation &&
        addCreation.value !== ""
    ) {

        overrides.creation =
            Number(addCreation.value);

    }


    if (
        manuallyEditedAddScores.performance &&
        addPerformance &&
        addPerformance.value !== ""
    ) {

        overrides.performance =
            Number(addPerformance.value);

    }


    if (
        manuallyEditedAddScores.screen &&
        addScoreScreen &&
        addScoreScreen.value !== ""
    ) {

        overrides.screen =
            Number(addScoreScreen.value);

    }


    if (
        manuallyEditedAddScores.battery &&
        addBattery &&
        addBattery.value !== ""
    ) {

        overrides.battery =
            Number(addBattery.value);

    }


    return overrides;

}


/* ================================= */
/* CHARGEMENT */
/* ================================= */

function loadProducts() {

    statusMessage.className =
        "status-message";

    statusMessage.textContent =
        "Chargement des produits...";

    productsContainer.innerHTML = "";

    fetch("http://localhost:3000/api/products")

        .then(function (response) {

            if (!response.ok) {

                throw new Error(
                    "Erreur HTTP " +
                    response.status
                );

            }

            return response.json();

        })

        .then(function (products) {

            productCount.textContent =
                products.length;

            if (products.length === 0) {

                productsContainer.innerHTML =
                    '<div class="empty">' +
                        "<h2>Aucun produit</h2>" +
                        "<p>Aucun produit dans la base de données.</p>" +
                    "</div>";

                statusMessage.className =
                    "status-message";

                statusMessage.textContent =
                    "La base de données ne contient aucun produit.";

                return;
            }

            products.forEach(function (product) {

                createProductCard(product);

            });

            statusMessage.className =
                "status-message success";

            statusMessage.textContent =
                products.length +
                " produit(s) chargé(s) depuis l'API.";

        })

        .catch(function (error) {

            console.error(
                "Erreur chargement produits :",
                error
            );

            productCount.textContent =
                "0";

            statusMessage.className =
                "status-message error";

            statusMessage.textContent =
                "Impossible de contacter le serveur PCFinder.";

            productsContainer.innerHTML =

                '<div class="empty">' +

                    "<h2>Serveur inaccessible</h2>" +

                    "<p>" +

                        "Vérifie que le backend est lancé avec " +

                        "<strong>npm.cmd start</strong> " +

                        "dans le dossier backend." +

                    "</p>" +

                "</div>";

        });

}


/* ================================= */
/* CARTE PRODUIT */
/* ================================= */

function createProductCard(product) {

    var card =
        document.createElement("article");

    card.className =
        "product-card";

    var offers =
        product.offers || [];

    var cheapestOffer =
        getCheapestOffer(offers);

    var price =
        cheapestOffer &&
        typeof cheapestOffer.price === "number"
            ? cheapestOffer.price + " €"
            : "Prix inconnu";

    var merchant =
        cheapestOffer &&
        cheapestOffer.merchant
            ? cheapestOffer.merchant
            : "Aucune offre";

    card.innerHTML =

        '<div class="product-top">' +

            "<div>" +

                '<div class="product-id">' +
                    "ID #" +
                    product.id +
                "</div>" +

                "<h2>" +
                    escapeHTML(product.name) +
                "</h2>" +

                '<div class="product-brand">' +
                    escapeHTML(
                        product.brand ||
                        "Marque inconnue"
                    ) +
                "</div>" +

            "</div>" +

            '<div class="product-price">' +
                escapeHTML(price) +
            "</div>" +

        "</div>" +

        '<div class="product-info">' +

            createInfoItem(
                "Processeur",
                product.cpu
            ) +

            createInfoItem(
                "Carte graphique",
                product.gpu
            ) +

            createInfoItem(
                "RAM",
                product.ram
            ) +

            createInfoItem(
                "Stockage",
                product.storage
            ) +

            createInfoItem(
                "Écran",
                product.screen
            ) +

            createInfoItem(
                "Poids",
                product.weight
            ) +

        "</div>" +

        '<div class="product-offer">' +

            "<span>" +

                offers.length +

                (
                    offers.length > 1
                        ? " offres"
                        : " offre"
                ) +

            "</span>" +

            "<strong>" +

                escapeHTML(merchant) +

            "</strong>" +

        "</div>" +

        '<div class="card-actions">' +

            '<button type="button" class="edit-button">' +
                "✏️ Modifier" +
            "</button>" +

            '<button type="button" class="delete-button">' +
                "🗑️ Supprimer" +
            "</button>" +

        "</div>";


    var editButton =
        card.querySelector(".edit-button");

    if (editButton) {

        editButton.addEventListener(
            "click",
            function () {

                openEditForm(product);

            }
        );

    }


    var deleteButton =
        card.querySelector(".delete-button");

    if (deleteButton) {

        deleteButton.addEventListener(
            "click",
            function () {

                deleteProduct(product);

            }
        );

    }


    productsContainer.appendChild(card);

}


/* ================================= */
/* INFORMATIONS */
/* ================================= */

function createInfoItem(
    label,
    value
) {

    return (

        '<div class="info-item">' +

            "<span>" +
                escapeHTML(label) +
            "</span>" +

            "<strong>" +
                escapeHTML(
                    value ||
                    "Non renseigné"
                ) +
            "</strong>" +

        "</div>"

    );

}


/* ================================= */
/* OFFRE LA MOINS CHERE */
/* ================================= */

function getCheapestOffer(offers) {

    if (
        !offers ||
        offers.length === 0
    ) {

        return null;

    }


    var validOffers =
        offers.filter(function (offer) {

            return (
                offer &&
                typeof offer.price === "number"
            );

        });


    if (validOffers.length === 0) {

        return offers[0];

    }


    return validOffers.reduce(
        function (cheapest, offer) {

            return offer.price < cheapest.price
                ? offer
                : cheapest;

        }
    );

}


/* ================================= */
/* AFFICHER LES SCORES */
/* ================================= */

function displayScores(scores) {

    if (!scores) {
        return;
    }


    if (editGaming) {

        editGaming.value =
            scores.gaming !== undefined
                ? scores.gaming
                : "";

    }


    if (editMontage) {

        editMontage.value =
            scores.montage !== undefined
                ? scores.montage
                : "";

    }


    if (editCreation) {

        editCreation.value =
            scores.creation !== undefined
                ? scores.creation
                : "";

    }


    if (editPerformance) {

        editPerformance.value =
            scores.performance !== undefined
                ? scores.performance
                : "";

    }


    if (editScoreScreen) {

        editScoreScreen.value =
            scores.screen !== undefined
                ? scores.screen
                : "";

    }


    if (editBattery) {

        editBattery.value =
            scores.battery !== undefined
                ? scores.battery
                : "";

    }


    if (addGaming) {

        addGaming.value =
            scores.gaming !== undefined
                ? scores.gaming
                : "";

    }


    if (addMontage) {

        addMontage.value =
            scores.montage !== undefined
                ? scores.montage
                : "";

    }


    if (addCreation) {

        addCreation.value =
            scores.creation !== undefined
                ? scores.creation
                : "";

    }


    if (addPerformance) {

        addPerformance.value =
            scores.performance !== undefined
                ? scores.performance
                : "";

    }


    if (addScoreScreen) {

        addScoreScreen.value =
            scores.screen !== undefined
                ? scores.screen
                : "";

    }


    if (addBattery) {

        addBattery.value =
            scores.battery !== undefined
                ? scores.battery
                : "";

    }

}


/* ================================= */
/* FORMULAIRE MODIFICATION */
/* ================================= */

function openEditForm(product) {

    currentProductId =
        product.id;


    resetEditScoreTracking();


    editTitle.textContent =
        "Modifier : " +
        product.name;

    editName.value =
        product.name || "";

    editBrand.value =
        product.brand || "";

    editCpu.value =
        product.cpu || "";

    editGpu.value =
        product.gpu || "";

    editRam.value =
        product.ram || "";

    editStorage.value =
        product.storage || "";

    editScreen.value =
        product.screen || "";

    editWeight.value =
        product.weight || "";

    editBatteryWh.value =
        product.battery || "";


    displayScores(
        product.scores || {}
    );


    renderOffers(
        editOffersContainer,
        product.offers || []
    );


    addSection.classList.add("hidden");

    editSection.classList.remove("hidden");


    editSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* ================================= */
/* FERMER MODIFICATION */
/* ================================= */

function closeEditForm() {

    currentProductId =
        null;

    editSection.classList.add("hidden");

}


/* ================================= */
/* ENREGISTRER MODIFICATION */
/* ================================= */

function saveProduct(event) {

    event.preventDefault();

    if (!currentProductId) {

        return;

    }


    statusMessage.className =
        "status-message";

    statusMessage.textContent =
        "Enregistrement des modifications...";


    var manualScores =
        collectManualEditScores();


    var updatedProduct = {

        name:
            editName.value,

        brand:
            editBrand.value,

        cpu:
            editCpu.value,

        gpu:
            editGpu.value,

        ram:
            editRam.value,

        storage:
            editStorage.value,

        screen:
            editScreen.value,

        weight:
            editWeight.value,

        battery:
            editBatteryWh.value,

        offers:
            collectOffers(
                editOffersContainer
            ),

        scoreOverrides:
            manualScores

    };


    fetch(
        "http://localhost:3000/api/products/" +
        currentProductId,
        {

            method: "PUT",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body:
                JSON.stringify(
                    updatedProduct
                )

        }
    )

        .then(function (response) {

            if (!response.ok) {

                throw new Error(
                    "Erreur HTTP " +
                    response.status
                );

            }

            return response.json();

        })

        .then(function (product) {

            displayScores(
                product.scores
            );

            closeEditForm();

            statusMessage.className =
                "status-message success";

            statusMessage.textContent =
                "Produit modifié avec succès.";

            loadProducts();

        })

        .catch(function (error) {

            console.error(error);

            statusMessage.className =
                "status-message error";

            statusMessage.textContent =
                "Impossible d'enregistrer les modifications.";

        });

}


/* ================================= */
/* AFFICHAGE DES OFFRES */
/* ================================= */

function renderOffers(
    container,
    offers
) {

    container.innerHTML = "";

    if (
        !offers ||
        offers.length === 0
    ) {

        showNoOffers(container);

        return;

    }


    offers.forEach(function (offer) {

        addOfferRow(
            container,
            offer
        );

    });

}


/* ================================= */
/* AJOUT D'UNE LIGNE OFFRE */
/* ================================= */

function addOfferRow(
    container,
    offer
) {

    var row =
        document.createElement("div");

    row.className =
        "offer-row";


    row.innerHTML =

        '<input ' +
            'type="text" ' +
            'class="offer-merchant" ' +
            'placeholder="Vendeur" ' +
            'value="' +
                escapeAttribute(
                    offer &&
                    offer.merchant
                        ? offer.merchant
                        : ""
                ) +
        '">' +

        '<input ' +
            'type="number" ' +
            'class="offer-price" ' +
            'placeholder="Prix (€)" ' +
            'min="0" ' +
            'step="0.01" ' +
            'value="' +
                (
                    offer &&
                    offer.price !== undefined &&
                    offer.price !== null
                        ? offer.price
                        : ""
                ) +
        '">' +

        '<input ' +
            'type="text" ' +
            'class="offer-url" ' +
            'placeholder="Lien du produit" ' +
            'value="' +
                escapeAttribute(
                    offer &&
                    offer.url
                        ? offer.url
                        : ""
                ) +
        '">' +

        '<button ' +
            'type="button" ' +
            'class="remove-offer-button" ' +
            'title="Supprimer cette offre"' +
        '>' +
            "✕" +
        "</button>";


    var removeButton =
        row.querySelector(
            ".remove-offer-button"
        );


    if (removeButton) {

        removeButton.addEventListener(
            "click",
            function () {

                row.remove();

                if (
                    container.querySelectorAll(
                        ".offer-row"
                    ).length === 0
                ) {

                    showNoOffers(
                        container
                    );

                }

            }
        );

    }


    container.appendChild(row);

}


/* ================================= */
/* MESSAGE AUCUNE OFFRE */
/* ================================= */

function showNoOffers(container) {

    container.innerHTML =

        '<div class="no-offers">' +

            "Aucune offre. Clique sur « + Ajouter une offre » pour commencer." +

        "</div>";

}


/* ================================= */
/* COLLECTE DES OFFRES */
/* ================================= */

function collectOffers(container) {

    var rows =
        container.querySelectorAll(
            ".offer-row"
        );

    var offers = [];


    rows.forEach(function (row) {

        var merchantElement =
            row.querySelector(
                ".offer-merchant"
            );

        var priceElement =
            row.querySelector(
                ".offer-price"
            );

        var urlElement =
            row.querySelector(
                ".offer-url"
            );


        if (
            !merchantElement ||
            !priceElement ||
            !urlElement
        ) {

            return;

        }


        var merchant =
            merchantElement.value.trim();

        var price =
            priceElement.value;

        var url =
            urlElement.value.trim();


        if (
            merchant ||
            price ||
            url
        ) {

            offers.push({

                merchant:
                    merchant,

                price:
                    price === ""
                        ? null
                        : Number(price),

                url:
                    url

            });

        }

    });


    return offers;

}


/* ================================= */
/* AJOUT PRODUIT */
/* ================================= */

function openAddForm() {

    editSection.classList.add("hidden");

    addForm.reset();

    resetAddScoreTracking();

    addOffersContainer.innerHTML = "";


    addOfferRow(
        addOffersContainer,
        {
            merchant: "",
            price: "",
            url: ""
        }
    );


    /*
     * Les scores restent vides au départ.
     * Le backend les calculera automatiquement.
     * Si l'utilisateur modifie un score,
     * celui-ci sera enregistré manuellement.
     */

    displayScores({});


    addSection.classList.remove("hidden");


    addSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* ================================= */
/* FERMER AJOUT */
/* ================================= */

function closeAddForm() {

    addSection.classList.add("hidden");

}


/* ================================= */
/* AJOUTER PRODUIT */
/* ================================= */

function addProduct(event) {

    event.preventDefault();


    statusMessage.className =
        "status-message";

    statusMessage.textContent =
        "Ajout du nouveau PC...";


    var manualScores =
        collectManualAddScores();


    var newProduct = {

        name:
            addName.value,

        brand:
            addBrand.value,

        cpu:
            addCpu.value,

        gpu:
            addGpu.value,

        ram:
            addRam.value,

        storage:
            addStorage.value,

        screen:
            addScreen.value,

        weight:
            addWeight.value,

        battery:
            addBatteryWh.value,

        offers:
            collectOffers(
                addOffersContainer
            ),

        scoreOverrides:
            manualScores

    };


    fetch(
        "http://localhost:3000/api/products",
        {

            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body:
                JSON.stringify(
                    newProduct
                )

        }
    )

        .then(function (response) {

            if (!response.ok) {

                throw new Error(
                    "Erreur HTTP " +
                    response.status
                );

            }

            return response.json();

        })

        .then(function () {

            closeAddForm();

            statusMessage.className =
                "status-message success";

            statusMessage.textContent =
                "PC ajouté avec succès.";

            loadProducts();

        })

        .catch(function (error) {

            console.error(error);

            statusMessage.className =
                "status-message error";

            statusMessage.textContent =
                "Impossible d'ajouter le PC.";

        });

}


/* ================================= */
/* SUPPRESSION */
/* ================================= */

function deleteProduct(product) {

    var confirmed =
        confirm(

            "Voulez-vous vraiment supprimer :\n\n" +

            product.name +

            "\n\nCette action est définitive."

        );


    if (!confirmed) {

        return;

    }


    statusMessage.className =
        "status-message";

    statusMessage.textContent =
        "Suppression du produit...";


    fetch(
        "http://localhost:3000/api/products/" +
        product.id,
        {
            method: "DELETE"
        }
    )

        .then(function (response) {

            if (!response.ok) {

                throw new Error(
                    "Erreur HTTP " +
                    response.status
                );

            }

            return response.json();

        })

        .then(function () {

            statusMessage.className =
                "status-message success";

            statusMessage.textContent =
                "Produit supprimé avec succès.";

            loadProducts();

        })

        .catch(function (error) {

            console.error(error);

            statusMessage.className =
                "status-message error";

            statusMessage.textContent =
                "Impossible de supprimer le produit.";

        });

}


/* ================================= */
/* UTILITAIRES */
/* ================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


function escapeAttribute(value) {

    return escapeHTML(value);

}


/* ================================= */
/* EVENEMENTS */
/* ================================= */

if (refreshButton) {

    refreshButton.addEventListener(
        "click",
        loadProducts
    );

}


if (addProductButton) {

    addProductButton.addEventListener(
        "click",
        openAddForm
    );

}


if (cancelEditButton) {

    cancelEditButton.addEventListener(
        "click",
        closeEditForm
    );

}


if (cancelEditButtonBottom) {

    cancelEditButtonBottom.addEventListener(
        "click",
        closeEditForm
    );

}


if (cancelAddButton) {

    cancelAddButton.addEventListener(
        "click",
        closeAddForm
    );

}


if (cancelAddButtonBottom) {

    cancelAddButtonBottom.addEventListener(
        "click",
        closeAddForm
    );

}


if (editForm) {

    editForm.addEventListener(
        "submit",
        saveProduct
    );

}


if (addForm) {

    addForm.addEventListener(
        "submit",
        addProduct
    );

}


if (addOfferEditButton) {

    addOfferEditButton.addEventListener(
        "click",
        function () {

            var noOffers =
                editOffersContainer.querySelector(
                    ".no-offers"
                );


            if (noOffers) {

                noOffers.remove();

            }


            addOfferRow(
                editOffersContainer,
                {
                    merchant: "",
                    price: "",
                    url: ""
                }
            );

        }
    );

}


if (addOfferAddButton) {

    addOfferAddButton.addEventListener(
        "click",
        function () {

            var noOffers =
                addOffersContainer.querySelector(
                    ".no-offers"
                );


            if (noOffers) {

                noOffers.remove();

            }


            addOfferRow(
                addOffersContainer,
                {
                    merchant: "",
                    price: "",
                    url: ""
                }
            );

        }
    );

}


/* ================================= */
/* DÉMARRAGE */
/* ================================= */

setupScoreTracking();

loadProducts();