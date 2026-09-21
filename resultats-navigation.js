/* ==========================================
PCFINDER - NAVIGATION VERS LES PAGES PRODUITS
========================================== */

(function () {

```
var resultsContainer =
    document.getElementById("results");


if (!resultsContainer) {

    return;

}


function connectProductLinks() {

    var links =
        resultsContainer.querySelectorAll(
            ".product-bottom a"
        );


    if (
        links.length === 0
    ) {

        return;

    }


    fetch(
        "https://pcfinder-api-liwg.onrender.com/api/products"
    )

        .then(
            function (response) {

                if (!response.ok) {

                    throw new Error(
                        "Erreur API"
                    );

                }

                return response.json();

            }
        )

        .then(
            function (products) {

                for (
                    var i = 0;
                    i < links.length;
                    i++
                ) {

                    var link =
                        links[i];

                    var originalUrl =
                        link.href;


                    for (
                        var p = 0;
                        p < products.length;
                        p++
                    ) {

                        var product =
                            products[p];


                        if (
                            !product.offers
                        ) {

                            continue;

                        }


                        var found =
                            product.offers.some(
                                function (offer) {

                                    return (
                                        offer.url ===
                                        originalUrl
                                    );

                                }
                            );


                        if (found) {

                            link.href =
                                "produit.html?id=" +
                                product.id;

                            link.removeAttribute(
                                "target"
                            );

                            link.removeAttribute(
                                "rel"
                            );

                            link.textContent =
                                "Voir le PC →";

                            break;

                        }

                    }

                }

            }
        )

        .catch(
            function (error) {

                console.error(
                    "Impossible de connecter les pages produits :",
                    error
                );

            }
        );

}


var observer =
    new MutationObserver(
        function () {

            connectProductLinks();

        }
    );


observer.observe(
    resultsContainer,
    {
        childList: true,
        subtree: true
    }
);


connectProductLinks();
```

})();
