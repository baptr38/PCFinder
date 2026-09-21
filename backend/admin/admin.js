/* =========================================================
   PCFINDER - ADMINISTRATION
   Gestion des produits + import automatique depuis une URL
   ========================================================= */

(function () {
    "use strict";

    /* ===================================================== */
    /* CONFIGURATION */
    /* ===================================================== */

    function getApiBase() {
        var host = window.location.hostname || "";

        if (host === "localhost" || host === "127.0.0.1") {
            return "http://localhost:3000";
        }

        if (host === "pcfinder-api.onrender.com") {
            return "";
        }

        return "https://pcfinder-api.onrender.com";
    }

    var API_BASE = getApiBase();

    function apiUrl(path) {
        return API_BASE + path;
    }

    /* ===================================================== */
    /* DOM */
    /* ===================================================== */

    var productsContainer = document.getElementById("productsContainer");
    var productCount = document.getElementById("productCount");
    var statusMessage = document.getElementById("statusMessage");
    var refreshButton = document.getElementById("refreshButton");

    var editSection = document.getElementById("editSection");
    var editForm = document.getElementById("editForm");
    var editTitle = document.getElementById("editTitle");
    var cancelEditButton = document.getElementById("cancelEditButton");
    var cancelEditButtonBottom = document.getElementById("cancelEditButtonBottom");

    var editName = document.getElementById("editName");
    var editBrand = document.getElementById("editBrand");
    var editCpu = document.getElementById("editCpu");
    var editGpu = document.getElementById("editGpu");
    var editRam = document.getElementById("editRam");
    var editStorage = document.getElementById("editStorage");
    var editScreen = document.getElementById("editScreen");
    var editWeight = document.getElementById("editWeight");
    var editBatteryWh = document.getElementById("editBatteryWh");

    var editGaming = document.getElementById("editGaming");
    var editMontage = document.getElementById("editMontage");
    var editCreation = document.getElementById("editCreation");
    var editPerformance = document.getElementById("editPerformance");
    var editScoreScreen = document.getElementById("editScreenScore");
    var editBattery = document.getElementById("editBattery");

    var editOffersContainer = document.getElementById("editOffersContainer");
    var addOfferEditButton = document.getElementById("addOfferEditButton");

    var addSection = document.getElementById("addSection");
    var addProductButton = document.getElementById("addProductButton");
    var addForm = document.getElementById("addForm");

    var addName = document.getElementById("addName");
    var addBrand = document.getElementById("addBrand");
    var addCpu = document.getElementById("addCpu");
    var addGpu = document.getElementById("addGpu");
    var addRam = document.getElementById("addRam");
    var addStorage = document.getElementById("addStorage");
    var addScreen = document.getElementById("addScreen");
    var addWeight = document.getElementById("addWeight");
    var addBatteryWh = document.getElementById("addBatteryWh");

    var addGaming = document.getElementById("addGaming");
    var addMontage = document.getElementById("addMontage");
    var addCreation = document.getElementById("addCreation");
    var addPerformance = document.getElementById("addPerformance");
    var addScoreScreen = document.getElementById("addScreenScore");
    var addBattery = document.getElementById("addBattery");

    var addOffersContainer = document.getElementById("addOffersContainer");
    var addOfferAddButton = document.getElementById("addOfferAddButton");

    var cancelAddButton = document.getElementById("cancelAddButton");
    var cancelAddButtonBottom = document.getElementById("cancelAddButtonBottom");

    var currentProductId = null;

    var manuallyEditedAddScores = {
        gaming: false,
        montage: false,
        creation: false,
        performance: false,
        screen: false,
        battery: false
    };

    var manuallyEditedEditScores = {
        gaming: false,
        montage: false,
        creation: false,
        performance: false,
        screen: false,
        battery: false
    };

    /* ===================================================== */
    /* OUTILS */
    /* ===================================================== */

    function escapeHTML(value) {
        return String(value === undefined || value === null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function escapeAttribute(value) {
        return escapeHTML(value);
    }

    function setStatus(type, message) {
        statusMessage.className = "status-message" + (type ? " " + type : "");
        statusMessage.textContent = message;
    }

    function safeNumber(value) {
        if (value === "" || value === null || value === undefined) {
            return null;
        }

        var n = Number(String(value).replace(",", "."));
        return Number.isFinite(n) ? n : null;
    }

    function isValidHttpUrl(value) {
        try {
            var url = new URL(value);
            return url.protocol === "http:" || url.protocol === "https:";
        } catch (error) {
            return false;
        }
    }

    function getCheapestOffer(offers) {
        if (!Array.isArray(offers) || offers.length === 0) {
            return null;
        }

        var validOffers = offers.filter(function (offer) {
            return offer && typeof offer.price === "number";
        });

        if (validOffers.length === 0) {
            return offers[0];
        }

        return validOffers.reduce(function (cheapest, offer) {
            return offer.price < cheapest.price ? offer : cheapest;
        });
    }

    function createInfoItem(label, value) {
        return (
            '<div class="info-item">' +
                "<span>" + escapeHTML(label) + "</span>" +
                "<strong>" +
                    escapeHTML(value || "Non renseigné") +
                "</strong>" +
            "</div>"
        );
    }

    /* ===================================================== */
    /* SCORE TRACKING */
    /* ===================================================== */

    function resetAddScoreTracking() {
        Object.keys(manuallyEditedAddScores).forEach(function (key) {
            manuallyEditedAddScores[key] = false;
        });
    }

    function resetEditScoreTracking() {
        Object.keys(manuallyEditedEditScores).forEach(function (key) {
            manuallyEditedEditScores[key] = false;
        });
    }

    function watchScoreInput(input, store, key) {
        if (!input) {
            return;
        }

        input.addEventListener("input", function () {
            store[key] = true;
        });
    }

    function collectManualScores(inputs, tracking) {
        var overrides = {};

        Object.keys(tracking).forEach(function (key) {
            if (!tracking[key]) {
                return;
            }

            var input = inputs[key];

            if (input && input.value !== "") {
                var value = safeNumber(input.value);

                if (value !== null) {
                    overrides[key] = Math.max(0, Math.min(10, value));
                }
            }
        });

        return overrides;
    }

    function displayScores(scores) {
        scores = scores || {};

        if (editGaming) editGaming.value = scores.gaming !== undefined ? scores.gaming : "";
        if (editMontage) editMontage.value = scores.montage !== undefined ? scores.montage : "";
        if (editCreation) editCreation.value = scores.creation !== undefined ? scores.creation : "";
        if (editPerformance) editPerformance.value = scores.performance !== undefined ? scores.performance : "";
        if (editScoreScreen) editScoreScreen.value = scores.screen !== undefined ? scores.screen : "";
        if (editBattery) editBattery.value = scores.battery !== undefined ? scores.battery : "";

        if (addGaming) addGaming.value = scores.gaming !== undefined ? scores.gaming : "";
        if (addMontage) addMontage.value = scores.montage !== undefined ? scores.montage : "";
        if (addCreation) addCreation.value = scores.creation !== undefined ? scores.creation : "";
        if (addPerformance) addPerformance.value = scores.performance !== undefined ? scores.performance : "";
        if (addScoreScreen) addScoreScreen.value = scores.screen !== undefined ? scores.screen : "";
        if (addBattery) addBattery.value = scores.battery !== undefined ? scores.battery : "";
    }

    /* ===================================================== */
    /* CHAMPS IMAGE */
    /* ===================================================== */

    function ensureImageField(formType) {
        var isAdd = formType === "add";
        var form = isAdd ? addForm : editForm;
        if (!form) return null;

        var id = isAdd ? "addImage" : "editImage";
        var existing = document.getElementById(id);

        if (existing) {
            return existing;
        }

        var formGrid = form.querySelector(".form-grid");

        if (!formGrid) {
            return null;
        }

        var group = document.createElement("div");
        group.className = "form-group";

        group.innerHTML =
            '<label for="' + id + '">Image du produit</label>' +
            '<input type="text" id="' + id + '" ' +
            'placeholder="Ex : images/lenovo-loq.jpg ou URL de l’image">';

        formGrid.appendChild(group);

        return document.getElementById(id);
    }

    /* ===================================================== */
    /* OFFRES */
    /* ===================================================== */

    function showNoOffers(container) {
        if (!container) return;

        container.innerHTML =
            '<div class="no-offers">' +
                "Aucune offre. Clique sur « + Ajouter une offre » pour commencer." +
            "</div>";
    }

    function ensureOfferAffiliateControls(row, offer) {
        if (!row || row.querySelector(".offer-affiliate")) {
            return;
        }

        var wrapper = document.createElement("label");
        wrapper.className = "offer-affiliate-wrap";
        wrapper.style.display = "inline-flex";
        wrapper.style.alignItems = "center";
        wrapper.style.gap = "7px";
        wrapper.style.minHeight = "42px";
        wrapper.style.padding = "8px 10px";
        wrapper.style.border = "1px solid rgba(139, 92, 246, 0.25)";
        wrapper.style.borderRadius = "8px";
        wrapper.style.background = "rgba(139, 92, 246, 0.06)";
        wrapper.style.color = "var(--text)";
        wrapper.style.fontSize = "12px";
        wrapper.style.cursor = "pointer";
        wrapper.style.whiteSpace = "nowrap";

        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "offer-affiliate";
        checkbox.checked = !!(offer && offer.affiliate);

        var text = document.createElement("span");
        text.textContent = "Affiliée";

        wrapper.appendChild(checkbox);
        wrapper.appendChild(text);
        row.insertBefore(wrapper, row.lastElementChild);
    }

    function addOfferRow(container, offer) {
        if (!container) return;

        offer = offer || {};

        var row = document.createElement("div");
        row.className = "offer-row";

        row.style.display = "grid";
        row.style.gridTemplateColumns = "minmax(120px, 1fr) minmax(90px, 130px) minmax(180px, 2fr) auto auto";
        row.style.gap = "10px";
        row.style.alignItems = "center";
        row.style.marginBottom = "10px";

        row.innerHTML =
            '<input type="text" class="offer-merchant" placeholder="Vendeur" value="' +
                escapeAttribute(offer.merchant || "") +
            '">' +
            '<input type="number" class="offer-price" placeholder="Prix (€)" min="0" step="0.01" value="' +
                (offer.price !== undefined && offer.price !== null ? escapeAttribute(offer.price) : "") +
            '">' +
            '<input type="text" class="offer-url" placeholder="Lien du produit" value="' +
                escapeAttribute(offer.url || "") +
            '">' +
            '<label class="offer-affiliate-wrap" style="display:inline-flex;align-items:center;gap:7px;min-height:42px;padding:8px 10px;border:1px solid rgba(139,92,246,.25);border-radius:8px;background:rgba(139,92,246,.06);color:var(--text);font-size:12px;cursor:pointer;white-space:nowrap;">' +
                '<input type="checkbox" class="offer-affiliate" ' +
                    (offer.affiliate ? "checked" : "") +
                '>' +
                '<span>Affiliée</span>' +
            '</label>' +
            '<button type="button" class="remove-offer-button" title="Supprimer cette offre">✕</button>';

        var removeButton = row.querySelector(".remove-offer-button");

        if (removeButton) {
            removeButton.addEventListener("click", function () {
                row.remove();

                if (container.querySelectorAll(".offer-row").length === 0) {
                    showNoOffers(container);
                }
            });
        }

        container.appendChild(row);
    }

    function renderOffers(container, offers) {
        if (!container) return;

        container.innerHTML = "";

        if (!Array.isArray(offers) || offers.length === 0) {
            showNoOffers(container);
            return;
        }

        offers.forEach(function (offer) {
            addOfferRow(container, offer);
        });
    }

    function collectOffers(container) {
        var rows = container
            ? container.querySelectorAll(".offer-row")
            : [];

        var offers = [];

        rows.forEach(function (row) {
            var merchantElement = row.querySelector(".offer-merchant");
            var priceElement = row.querySelector(".offer-price");
            var urlElement = row.querySelector(".offer-url");
            var affiliateElement = row.querySelector(".offer-affiliate");

            if (!merchantElement || !priceElement || !urlElement) {
                return;
            }

            var merchant = merchantElement.value.trim();
            var price = priceElement.value;
            var url = urlElement.value.trim();
            var affiliate = affiliateElement ? affiliateElement.checked : false;

            if (merchant || price || url) {
                offers.push({
                    merchant: merchant,
                    price: price === "" ? null : Number(price),
                    url: url,
                    affiliate: affiliate
                });
            }
        });

        return offers;
    }

    /* ===================================================== */
    /* PRODUITS */
    /* ===================================================== */

    function loadProducts() {
        setStatus("", "Chargement des produits...");
        productsContainer.innerHTML = "";

        fetch(apiUrl("/api/products"))
            .then(function (response) {
                if (!response.ok) {
                    throw new Error("Erreur HTTP " + response.status);
                }

                return response.json();
            })
            .then(function (products) {
                productCount.textContent = products.length;

                if (!products.length) {
                    productsContainer.innerHTML =
                        '<div class="empty">' +
                            "<h2>Aucun produit</h2>" +
                            "<p>Aucun produit dans la base de données.</p>" +
                        "</div>";

                    setStatus("", "La base de données ne contient aucun produit.");
                    return;
                }

                products.forEach(function (product) {
                    createProductCard(product);
                });

                setStatus("success", products.length + " produit(s) chargé(s) depuis l’API.");
            })
            .catch(function (error) {
                console.error(error);

                productCount.textContent = "0";
                setStatus("error", "Impossible de contacter le serveur PCFinder.");

                productsContainer.innerHTML =
                    '<div class="empty">' +
                        "<h2>Serveur inaccessible</h2>" +
                        "<p>Vérifie que le backend PCFinder est disponible.</p>" +
                    "</div>";
            });
    }

    function createProductCard(product) {
        var card = document.createElement("article");
        card.className = "product-card";

        var offers = product.offers || [];
        var cheapestOffer = getCheapestOffer(offers);

        var price =
            cheapestOffer && typeof cheapestOffer.price === "number"
                ? cheapestOffer.price + " €"
                : "Prix inconnu";

        var merchant =
            cheapestOffer && cheapestOffer.merchant
                ? cheapestOffer.merchant
                : "Aucune offre";

        card.innerHTML =
            '<div class="product-top">' +
                "<div>" +
                    '<div class="product-id">ID #' +
                        escapeHTML(product.id) +
                    "</div>" +
                    "<h2>" +
                        escapeHTML(product.name) +
                    "</h2>" +
                    '<div class="product-brand">' +
                        escapeHTML(product.brand || "Marque inconnue") +
                    "</div>" +
                "</div>" +
                '<div class="product-price">' +
                    escapeHTML(price) +
                "</div>" +
            "</div>" +

            '<div class="product-info">' +
                createInfoItem("Processeur", product.cpu) +
                createInfoItem("Carte graphique", product.gpu) +
                createInfoItem("RAM", product.ram) +
                createInfoItem("Stockage", product.storage) +
                createInfoItem("Écran", product.screen) +
                createInfoItem("Poids", product.weight) +
            "</div>" +

            '<div class="product-offer">' +
                "<span>" +
                    offers.length +
                    (offers.length > 1 ? " offres" : " offre") +
                "</span>" +
                "<strong>" +
                    escapeHTML(merchant) +
                "</strong>" +
            "</div>" +

            '<div class="card-actions">' +
                '<button type="button" class="edit-button">✏️ Modifier</button>' +
                '<button type="button" class="delete-button">🗑️ Supprimer</button>' +
            "</div>";

        var editButton = card.querySelector(".edit-button");
        if (editButton) {
            editButton.addEventListener("click", function () {
                openEditForm(product);
            });
        }

        var deleteButton = card.querySelector(".delete-button");
        if (deleteButton) {
            deleteButton.addEventListener("click", function () {
                deleteProduct(product);
            });
        }

        productsContainer.appendChild(card);
    }

    /* ===================================================== */
    /* MODIFICATION */
    /* ===================================================== */

    function openEditForm(product) {
        currentProductId = product.id;

        resetEditScoreTracking();

        editTitle.textContent = "Modifier : " + product.name;

        editName.value = product.name || "";
        editBrand.value = product.brand || "";
        editCpu.value = product.cpu || "";
        editGpu.value = product.gpu || "";
        editRam.value = product.ram || "";
        editStorage.value = product.storage || "";
        editScreen.value = product.screen || "";
        editWeight.value = product.weight || "";
        editBatteryWh.value = product.battery || "";

        var editImage = ensureImageField("edit");
        if (editImage) {
            editImage.value = product.image || "";
        }

        displayScores(product.scores || {});
        renderOffers(editOffersContainer, product.offers || []);

        addSection.classList.add("hidden");
        editSection.classList.remove("hidden");

        editSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    function closeEditForm() {
        currentProductId = null;
        editSection.classList.add("hidden");
    }

    function saveProduct(event) {
        event.preventDefault();

        if (!currentProductId) {
            return;
        }

        setStatus("", "Enregistrement des modifications...");

        var manualScores = collectManualScores(
            {
                gaming: editGaming,
                montage: editMontage,
                creation: editCreation,
                performance: editPerformance,
                screen: editScoreScreen,
                battery: editBattery
            },
            manuallyEditedEditScores
        );

        var editImage = ensureImageField("edit");

        var updatedProduct = {
            name: editName.value.trim(),
            brand: editBrand.value.trim(),
            cpu: editCpu.value.trim(),
            gpu: editGpu.value.trim(),
            ram: editRam.value.trim(),
            storage: editStorage.value.trim(),
            screen: editScreen.value.trim(),
            weight: editWeight.value.trim(),
            battery: editBatteryWh.value.trim(),
            image: editImage ? editImage.value.trim() : "",
            offers: collectOffers(editOffersContainer),
            scoreOverrides: manualScores
        };

        fetch(apiUrl("/api/products/" + currentProductId), {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedProduct)
        })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error("Erreur HTTP " + response.status);
                }

                return response.json();
            })
            .then(function (product) {
                closeEditForm();

                setStatus("success", "Produit modifié avec succès.");
                displayScores(product.scores || {});
                loadProducts();
            })
            .catch(function (error) {
                console.error(error);
                setStatus("error", "Impossible d’enregistrer les modifications.");
            });
    }

    /* ===================================================== */
    /* AJOUT */
    /* ===================================================== */

    function openAddForm() {
        editSection.classList.add("hidden");

        addForm.reset();
        resetAddScoreTracking();

        var addImage = ensureImageField("add");
        if (addImage) {
            addImage.value = "";
        }

        addOffersContainer.innerHTML = "";

        addOfferRow(addOffersContainer, {
            merchant: "",
            price: "",
            url: "",
            affiliate: false
        });

        displayScores({});

        addSection.classList.remove("hidden");

        addSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        injectImportPanel();
    }

    function closeAddForm() {
        addSection.classList.add("hidden");
    }

    function addProduct(event) {
        event.preventDefault();

        setStatus("", "Ajout du nouveau PC...");

        var manualScores = collectManualScores(
            {
                gaming: addGaming,
                montage: addMontage,
                creation: addCreation,
                performance: addPerformance,
                screen: addScoreScreen,
                battery: addBattery
            },
            manuallyEditedAddScores
        );

        var addImage = ensureImageField("add");

        var newProduct = {
            name: addName.value.trim(),
            brand: addBrand.value.trim(),
            cpu: addCpu.value.trim(),
            gpu: addGpu.value.trim(),
            ram: addRam.value.trim(),
            storage: addStorage.value.trim(),
            screen: addScreen.value.trim(),
            weight: addWeight.value.trim(),
            battery: addBatteryWh.value.trim(),
            image: addImage ? addImage.value.trim() : "",
            offers: collectOffers(addOffersContainer),
            scoreOverrides: manualScores
        };

        if (!newProduct.name) {
            setStatus("error", "Le nom du produit est obligatoire.");
            return;
        }

        fetch(apiUrl("/api/products"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newProduct)
        })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error("Erreur HTTP " + response.status);
                }

                return response.json();
            })
            .then(function () {
                closeAddForm();

                setStatus("success", "PC ajouté avec succès.");
                loadProducts();
            })
            .catch(function (error) {
                console.error(error);
                setStatus("error", "Impossible d’ajouter le PC.");
            });
    }

    /* ===================================================== */
    /* SUPPRESSION */
    /* ===================================================== */

    function deleteProduct(product) {
        var confirmed = confirm(
            "Voulez-vous vraiment supprimer :\n\n" +
            product.name +
            "\n\nCette action est définitive."
        );

        if (!confirmed) {
            return;
        }

        setStatus("", "Suppression du produit...");

        fetch(apiUrl("/api/products/" + product.id), {
            method: "DELETE"
        })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error("Erreur HTTP " + response.status);
                }

                return response.json();
            })
            .then(function () {
                setStatus("success", "Produit supprimé avec succès.");
                loadProducts();
            })
            .catch(function (error) {
                console.error(error);
                setStatus("error", "Impossible de supprimer le produit.");
            });
    }

    /* ===================================================== */
    /* IMPORT AUTOMATIQUE */
    /* ===================================================== */

    function injectImportStyles() {
        if (document.getElementById("pcfinder-import-styles")) {
            return;
        }

        var style = document.createElement("style");
        style.id = "pcfinder-import-styles";

        style.textContent = [
            ".pcfinder-import-box{margin:0 0 26px;padding:18px;border:1px solid var(--border);border-radius:12px;background:linear-gradient(180deg,rgba(139,92,246,.08),rgba(17,20,25,.96));}",
            ".pcfinder-import-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:12px;}",
            ".pcfinder-import-title{font-size:16px;font-weight:800;}",
            ".pcfinder-import-help{margin-top:5px;color:var(--text-secondary);font-size:12px;line-height:1.5;}",
            ".pcfinder-import-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;}",
            ".pcfinder-import-row input{width:100%;}",
            ".pcfinder-import-status{margin-top:10px;min-height:18px;color:var(--text-secondary);font-size:12px;line-height:1.4;}",
            ".pcfinder-import-status.success{color:var(--success);}",
            ".pcfinder-import-status.error{color:var(--danger);}",
            ".pcfinder-import-preview{display:none;margin-top:12px;padding:12px;border:1px solid var(--border);border-radius:9px;background:rgba(9,11,15,.55);font-size:12px;line-height:1.5;}",
            ".pcfinder-import-preview strong{display:block;margin-bottom:4px;color:var(--text);}",
            "@media(max-width:700px){.pcfinder-import-row{grid-template-columns:1fr}.pcfinder-import-header{display:block}}",
            "@media(max-width:900px){.offer-row{grid-template-columns:1fr!important}.offer-row .remove-offer-button{width:100%}}"
        ].join("");

        document.head.appendChild(style);
    }

    function injectImportPanel() {
        injectImportStyles();

        if (!addForm || document.getElementById("pcfinderImportBox")) {
            return;
        }

        var formGrid = addForm.querySelector(".form-grid");

        if (!formGrid) {
            return;
        }

        var box = document.createElement("div");
        box.id = "pcfinderImportBox";
        box.className = "pcfinder-import-box";

        box.innerHTML =
            '<div class="pcfinder-import-header">' +
                '<div>' +
                    '<div class="pcfinder-import-title">🔎 Importer un PC depuis une URL</div>' +
                    '<div class="pcfinder-import-help">Colle le lien de la fiche produit. PCFinder va essayer de récupérer automatiquement le nom, la marque, le processeur, le GPU, la RAM, le stockage, l’écran, le poids, la batterie, l’image, le vendeur et le prix.</div>' +
                '</div>' +
            '</div>' +
            '<div class="pcfinder-import-row">' +
                '<input type="url" id="pcfinderImportUrl" placeholder="https://www.amazon.fr/...">' +
                '<button type="button" id="pcfinderImportButton" class="secondary-button">🔎 Analyser</button>' +
            '</div>' +
            '<div id="pcfinderImportStatus" class="pcfinder-import-status"></div>' +
            '<div id="pcfinderImportPreview" class="pcfinder-import-preview"></div>';

        addForm.insertBefore(box, formGrid);

        var button = document.getElementById("pcfinderImportButton");

        button.addEventListener("click", importProductFromURL);

        var input = document.getElementById("pcfinderImportUrl");

        input.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                importProductFromURL();
            }
        });
    }

    function normalizeImportedData(payload, originalUrl) {
        var data = payload && payload.data ? payload.data : payload || {};
        var content = String(data.content || payload.content || "");
        var title = String(data.title || payload.title || "");

        var combined = (title + "\n" + content).replace(/\u00a0/g, " ");

        function firstMatch(patterns, source) {
            for (var i = 0; i < patterns.length; i++) {
                var match = source.match(patterns[i]);
                if (match && match[1]) {
                    return match[1].trim();
                }
            }

            return "";
        }

        function cleanValue(value) {
            return String(value || "")
                .replace(/\s+/g, " ")
                .replace(/\s+\|/g, " |")
                .trim();
        }

        var name = title || firstMatch(
            [
                /^#\s+(.+)$/m,
                /^\*\*(.+?)\*\*\s*$/m
            ],
            combined
        );

        var brand = firstMatch(
            [
                /(?:^|\n)(?:Marque|Brand)\s*[:|]\s*([^\n|]+)/i,
                /\b(Lenovo|Acer|ASUS|Asus|MSI|HP|Dell|Alienware|Gigabyte|Razer|Apple)\b/i
            ],
            combined
        );

        var cpu = firstMatch(
            [
                /\b((?:AMD\s+)?Ryzen\s+[3579][^|\n,;]*)/i,
                /\b((?:Intel\s+)?Core\s+(?:Ultra\s+\d+|i[3579][^|\n,;]*))/i,
                /\b((?:Intel\s+)?Celeron[^|\n,;]*)/i
            ],
            combined
        );

        var gpu = firstMatch(
            [
                /\b((?:NVIDIA\s+)?GeForce\s+RTX\s+\d{4}(?:\s*Ti)?(?:\s+\d+\s*GB)?)\b/i,
                /\b(RTX\s+\d{4}(?:\s*Ti)?(?:\s+\d+\s*GB)?)\b/i,
                /\b((?:AMD\s+)?Radeon\s+(?:RX\s+)?[A-Z0-9][^|\n,;]*)/i
            ],
            combined
        );

        var ram = firstMatch(
            [
                /(?:RAM|mémoire vive|memory)[^0-9]{0,20}(\d{1,3}\s*Go)/i,
                /\b(\d{1,3}\s*Go)\s*(?:DDR\d|RAM|mémoire)/i
            ],
            combined
        );

        if (!ram) {
            var ramFallback = combined.match(/\b(8|12|16|24|32|64|128)\s*Go\b/i);
            ram = ramFallback ? ramFallback[0] : "";
        }

        var storage = firstMatch(
            [
                /(?:SSD|NVMe|stockage|storage)[^0-9]{0,25}(\d+(?:[.,]\d+)?\s*(?:Go|GB|To|TB))/i,
                /\b(\d+(?:[.,]\d+)?\s*(?:Go|GB|To|TB))\s*(?:SSD|NVMe)/i
            ],
            combined
        );

        var screenSize = firstMatch(
            [
                /\b(\d{2}(?:[.,]\d)?)\s*(?:pouces|inch|inches|["″])/i,
                /\b(\d{2}(?:[.,]\d)?)["″]\b/i
            ],
            combined
        );

        var resolution = firstMatch(
            [
                /\b(\d{3,4}\s*[x×]\s*\d{3,4})\b/i,
                /\b(FHD|Full HD|WUXGA|QHD|2\.5K|3\.2K|UHD)\b/i
            ],
            combined
        );

        var refresh = firstMatch(
            [
                /\b(\d{2,3}\s*Hz)\b/i
            ],
            combined
        );

        var screen = [screenSize, resolution, refresh]
            .filter(Boolean)
            .join(" ");

        var weight = firstMatch(
            [
                /(?:poids|weight)[^0-9]{0,20}(\d+(?:[.,]\d+)?\s*kg)/i,
                /\b(\d+(?:[.,]\d+)?\s*kg)\b/i
            ],
            combined
        );

        var battery = firstMatch(
            [
                /(?:batterie|battery|capacité)[^0-9]{0,30}(\d+(?:[.,]\d+)?\s*Wh)/i,
                /\b(\d+(?:[.,]\d+)?\s*Wh)\b/i
            ],
            combined
        );

        var price = firstMatch(
            [
                /(?:prix|price|à partir de|from)[^0-9€]{0,30}(\d[\d\s.,]{1,10})\s*€/i,
                /(\d[\d\s.,]{1,10})\s*€/
            ],
            combined
        );

        var numericPrice = price
            ? Number(
                price
                    .replace(/\s/g, "")
                    .replace(",", ".")
              )
            : null;

        var merchant = "";
        try {
            merchant = new URL(originalUrl).hostname
                .replace(/^www\./i, "")
                .split(".")[0];
        } catch (error) {
            merchant = "";
        }

        var merchantMap = {
            amazon: "Amazon",
            fnac: "Fnac",
            darty: "Darty",
            boulanger: "Boulanger",
            cdiscount: "Cdiscount",
            ldlc: "LDLC",
            materiel: "Materiel.net",
            rueducommerce: "Rue du Commerce",
            carrefour: "Carrefour",
            auchan: "Auchan"
        };

        if (merchantMap[merchant.toLowerCase()]) {
            merchant = merchantMap[merchant.toLowerCase()];
        } else {
            merchant =
                merchant.charAt(0).toUpperCase() +
                merchant.slice(1);
        }

        var image = "";

        if (Array.isArray(data.images) && data.images.length) {
            image = data.images.find(function (item) {
                return typeof item === "string" && isValidHttpUrl(item);
            }) || "";
        }

        if (!image) {
            var imageMatch = content.match(/!\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/i);
            image = imageMatch ? imageMatch[1] : "";
        }

        var imported = {
            name: cleanValue(name),
            brand: cleanValue(brand),
            cpu: cleanValue(cpu),
            gpu: cleanValue(gpu),
            ram: cleanValue(ram),
            storage: cleanValue(storage),
            screen: cleanValue(screen),
            weight: cleanValue(weight),
            battery: cleanValue(battery),
            image: cleanValue(image),
            merchant: cleanValue(merchant),
            price: Number.isFinite(numericPrice) ? numericPrice : null,
            url: originalUrl,
            sourceUrl: data.url || originalUrl,
            importedContent: content
        };

        return imported;
    }

    function setImportStatus(type, message) {
        var element = document.getElementById("pcfinderImportStatus");

        if (!element) {
            return;
        }

        element.className = "pcfinder-import-status" + (type ? " " + type : "");
        element.textContent = message;
    }

    function showImportPreview(product) {
        var preview = document.getElementById("pcfinderImportPreview");

        if (!preview) {
            return;
        }

        var detected = [
            product.cpu,
            product.gpu,
            product.ram,
            product.storage,
            product.screen
        ].filter(Boolean).length;

        preview.style.display = "block";
        preview.innerHTML =
            "<strong>" +
                escapeHTML(product.name || "Produit détecté") +
            "</strong>" +
            escapeHTML(
                "Informations détectées : " +
                detected +
                "/5 caractéristiques principales. Vérifie les champs avant publication."
            );
    }

    function fillImportedProduct(product) {
        if (product.name) addName.value = product.name;
        if (product.brand) addBrand.value = product.brand;
        if (product.cpu) addCpu.value = product.cpu;
        if (product.gpu) addGpu.value = product.gpu;
        if (product.ram) addRam.value = product.ram;
        if (product.storage) addStorage.value = product.storage;
        if (product.screen) addScreen.value = product.screen;
        if (product.weight) addWeight.value = product.weight;
        if (product.battery) addBatteryWh.value = product.battery;

        var addImage = ensureImageField("add");
        if (addImage && product.image) {
            addImage.value = product.image;
        }

        if (product.merchant || product.price !== null) {
            var rows = addOffersContainer.querySelectorAll(".offer-row");

            if (rows.length === 0) {
                addOfferRow(addOffersContainer, {
                    merchant: product.merchant || "",
                    price: product.price,
                    url: product.url || "",
                    affiliate: false
                });
            } else {
                var row = rows[0];
                var merchant = row.querySelector(".offer-merchant");
                var price = row.querySelector(".offer-price");
                var url = row.querySelector(".offer-url");

                if (merchant) merchant.value = product.merchant || "";
                if (price && product.price !== null) price.value = product.price;
                if (url) url.value = product.url || "";
            }
        }

        showImportPreview(product);
    }

    function importProductFromURL() {
        var input = document.getElementById("pcfinderImportUrl");
        var button = document.getElementById("pcfinderImportButton");

        if (!input || !button) {
            return;
        }

        var rawUrl = input.value.trim();

        if (!isValidHttpUrl(rawUrl)) {
            setImportStatus("error", "Entre une URL complète commençant par http:// ou https://.");
            return;
        }

        button.disabled = true;
        button.textContent = "⏳ Analyse...";

        setImportStatus("", "Lecture de la page produit...");

        var readerUrl =
            "https://r.jina.ai/" +
            encodeURI(rawUrl);

        fetch(readerUrl, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error("Lecture impossible (" + response.status + ")");
                }

                return response.text();
            })
            .then(function (text) {
                var payload;

                try {
                    payload = JSON.parse(text);
                } catch (error) {
                    payload = {
                        content: text
                    };
                }

                var imported = normalizeImportedData(payload, rawUrl);

                if (!imported.name) {
                    throw new Error("Le produit n’a pas pu être identifié.");
                }

                fillImportedProduct(imported);

                setImportStatus(
                    "success",
                    "Produit détecté. Vérifie les informations puis complète ce qui manque avant de publier."
                );
            })
            .catch(function (error) {
                console.error("Import produit :", error);

                setImportStatus(
                    "error",
                    "Impossible d’analyser cette page. Essaie avec l’URL directe de la fiche produit."
                );
            })
            .finally(function () {
                button.disabled = false;
                button.textContent = "🔎 Analyser";
            });
    }

    /* ===================================================== */
    /* ÉVÉNEMENTS */
    /* ===================================================== */

    function bindEvents() {
        watchScoreInput(addGaming, manuallyEditedAddScores, "gaming");
        watchScoreInput(addMontage, manuallyEditedAddScores, "montage");
        watchScoreInput(addCreation, manuallyEditedAddScores, "creation");
        watchScoreInput(addPerformance, manuallyEditedAddScores, "performance");
        watchScoreInput(addScoreScreen, manuallyEditedAddScores, "screen");
        watchScoreInput(addBattery, manuallyEditedAddScores, "battery");

        watchScoreInput(editGaming, manuallyEditedEditScores, "gaming");
        watchScoreInput(editMontage, manuallyEditedEditScores, "montage");
        watchScoreInput(editCreation, manuallyEditedEditScores, "creation");
        watchScoreInput(editPerformance, manuallyEditedEditScores, "performance");
        watchScoreInput(editScoreScreen, manuallyEditedEditScores, "screen");
        watchScoreInput(editBattery, manuallyEditedEditScores, "battery");

        if (refreshButton) {
            refreshButton.addEventListener("click", loadProducts);
        }

        if (addProductButton) {
            addProductButton.addEventListener("click", openAddForm);
        }

        if (addForm) {
            addForm.addEventListener("submit", addProduct);
        }

        if (editForm) {
            editForm.addEventListener("submit", saveProduct);
        }

        if (cancelEditButton) {
            cancelEditButton.addEventListener("click", closeEditForm);
        }

        if (cancelEditButtonBottom) {
            cancelEditButtonBottom.addEventListener("click", closeEditForm);
        }

        if (cancelAddButton) {
            cancelAddButton.addEventListener("click", closeAddForm);
        }

        if (cancelAddButtonBottom) {
            cancelAddButtonBottom.addEventListener("click", closeAddForm);
        }

        if (addOfferEditButton) {
            addOfferEditButton.addEventListener("click", function () {
                var hasNoOffers =
                    editOffersContainer.querySelector(".no-offers");

                if (hasNoOffers) {
                    editOffersContainer.innerHTML = "";
                }

                addOfferRow(editOffersContainer, {
                    merchant: "",
                    price: "",
                    url: "",
                    affiliate: false
                });
            });
        }

        if (addOfferAddButton) {
            addOfferAddButton.addEventListener("click", function () {
                var hasNoOffers =
                    addOffersContainer.querySelector(".no-offers");

                if (hasNoOffers) {
                    addOffersContainer.innerHTML = "";
                }

                addOfferRow(addOffersContainer, {
                    merchant: "",
                    price: "",
                    url: "",
                    affiliate: false
                });
            });
        }
    }

    /* ===================================================== */
    /* DÉMARRAGE */
    /* ===================================================== */

    document.addEventListener("DOMContentLoaded", function () {
        ensureImageField("add");
        ensureImageField("edit");
        bindEvents();
        loadProducts();
    });

})();
