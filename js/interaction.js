scene.onPointerMove = function (evt) { // Fonction d'écoute d'interaction
    // On lance un "rayon" depuis la souris
    const pickResult = scene.pick(scene.pointerX, scene.pointerY); // On créer une variable qui stocke une fonction qui prend la scene et lui applique une fonction qui prend en entrée un point x et un point y => cette fonction renvoie une réponse ? => oui elle renvoie un json de ce qu'elle à touché i guess

    if (pickResult.hit && pickResult.pickedMesh) {
        const mesh = pickResult.pickedMesh;

        // Si on survole un NOUVEL objet
        if (lastHoveredMesh !== mesh) {
            lastHoveredMesh = mesh;

            // IDENTIFICATION : On affiche le nom dans la console
            // C'est ici que tu découvriras que ton écran s'appelle "Cube_001" par exemple
            console.log("Objet survolé :", mesh.name);

            // LOGIQUE DE TEXTE :
            if (mesh.name === "NomDeTonEcran") {
                afficherInfo("Ceci est l'écran OLED haute résolution.");
            } else {
                masquerInfo();
            }
        }
    } else {
        // On ne survole rien
        lastHoveredMesh = null;
        masquerInfo();
    }
};

const bulle = document.getElementById("infoBulle");

function afficherInfo(texte) {
    bulle.innerText = texte;
    bulle.classList.remove("hidden");

    // Optionnel : faire suivre la souris
    window.onmousemove = function (e) {
        bulle.style.left = (e.clientX + 15) + 'px';
        bulle.style.top = (e.clientY + 15) + 'px';
    };
}

function masquerInfo() {
    bulle.classList.add("hidden");
}

// 1. Détection du clic sur l'écran
scene.onPointerDown = function (evt, pickResult) {
    // Si l'utilisateur clique sur quelque chose
    if (pickResult.hit && pickResult.pickedMesh.name === "NomDeTonEcran") {

        // 2. Animation du Zoom
        // On rapproche la caméra de l'écran
        const animationZoom = new BABYLON.Animation("zoom", "radius", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT);
        // ... (config de l'animation)

        // 3. Changement de l'opacité
        // On rend l'écran transparent pour voir l'intérieur
        pickResult.pickedMesh.material.alpha = 0.3;
    }
};