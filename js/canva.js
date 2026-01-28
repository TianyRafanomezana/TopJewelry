const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = function () {
    const scene = new BABYLON.Scene(engine);

    // 1. Caméra (ArcRotate pour tourner autour de l'ordinateur)
    const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2, 5, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);

    // 2. Lumière
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);

    // Si je veux insérer un objet GLB dans ma scene je la stocke dans une constante ou je créé un nouveau fichier js

    let Ordi = null;
    let lastHoverMesh =null;

    // Chargement de l'objet .glb
    BABYLON.SceneLoader.ImportMesh("", "./object/", "pc.glb", scene, function (meshes) { // Ca ca sépare mes objet dans mes variables ?
        // 'meshes' est un tableau de toutes les parties de ton objet 3D

        // On cherche l'écran par son nom défini dans le fichier 3D
        monEcran = scene.getMeshByName("Ecran_Mesh"); // Je connais pas le nom des fichiers

        // Configuration initiale (ex: activer la transparence)
        if (monEcran && monEcran.material) {
            monEcran.material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
            monEcran.material.alpha = 1.0; // Opaque au début
        }
    });


    scene.onPointerMove = function (evt) { // Fonction d'écoute d'interaction
        // On lance un "rayon" depuis la souris
        const pickResult = scene.pick(scene.pointerX, scene.pointerY);

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
    scene.debugLayer.show();

    return scene;
};

const scene = createScene();

// Boucle de rendu pour l'animation
engine.runRenderLoop(function () {
    scene.render();
});

// Gérer le redimensionnement de la fenêtre
window.addEventListener("resize", function () {
    engine.resize();
});

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