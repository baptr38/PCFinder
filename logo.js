(function () {

    const logos = {
        fnac: "images/logos/fnac-logo.jpg",
        darty: "images/logos/darty-logo.jpg"
    };

    function ajouterLesLogos() {

        document.querySelectorAll(".product-merchant").forEach(function (element) {

            if (element.dataset.logoAjoute === "true") {
                return;
            }

            const vendeur = element.textContent.trim().toLowerCase();

            if (!logos[vendeur]) {
                return;
            }

            element.innerHTML = "";

            const image = document.createElement("img");
            image.src = logos[vendeur];
            image.alt = vendeur;
            image.className = "merchant-logo";

            const texte = document.createElement("span");
            texte.textContent =
                vendeur.charAt(0).toUpperCase() + vendeur.slice(1);

            element.appendChild(image);
            element.appendChild(texte);


            element.style.position = "absolute";
            element.style.bottom = "-5px";
            element.style.left = "-20px";
            element.style.top = "auto";
            element.style.right = "auto";
            element.style.display = "flex";
            element.style.alignItems = "center";
            element.style.gap = "0px";
            element.style.padding = "1px 20px";
            element.style.background = "rgba(35, 35, 35, 0.75)";
            element.style.borderRadius = "7px";
            element.style.border = "1px solid rgba(120, 120, 120, 0.6)";
            element.style.zIndex = "10";

            image.style.width = "60px";
            image.style.height = "35px";
            image.style.objectFit = "contain";

            texte.style.fontSize = "13px";
            texte.style.lineHeight = "0";
            texte.style.color = "#fff";

            element.dataset.logoAjoute = "true";
        });
    }

    ajouterLesLogos();

    const observer = new MutationObserver(function () {
        ajouterLesLogos();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();