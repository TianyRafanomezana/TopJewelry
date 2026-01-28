const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

// CE FICHIER CREER MA SCENE ET SOCKE MES OBJETS MESH DANS DES VARIABLES => comment je gère les intéraction

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
        monEcran = scene.getMeshByName("monitor_3"); // Je connais pas le nom des fichiers => a si c'est bon j'ai trouvé grace au scene explorer

    }) // La j'ai créé ma scene avec mes objects que j'ai affiché dans ma scene



    scene.debugLayer.show();

    return scene;
};

const scene = createScene();

// Boucle de rendu pour l'animation
engine.runRenderLoop(function () {
    scene.render(); // Affiche ma scene
});

// Gérer le redimensionnement de la fenêtre
window.addEventListener("resize", function () { // Je detecte le resize et je met a jour la taille
    engine.resize();
});



// Gestionnaire de zones
const SceneManager = {
    currentZone: "DESKTOP",

    // Passer d'une zone à l'autre
    goToZone: function(zoneName) {
        console.log("Transition vers :", zoneName);
        this.currentZone = zoneName;

        switch(zoneName) {
            case "INSIDE":
                this.setupInsideView();
                break;
            case "DESKTOP":
                this.setupDesktopView();
                break;
        }
    },

    setupInsideView: function() {
        // 1. Animation de la caméra pour entrer
        // 2. Rendre l'écran invisible ou très transparent
        // 3. Afficher les étiquettes des composants internes
    }
};