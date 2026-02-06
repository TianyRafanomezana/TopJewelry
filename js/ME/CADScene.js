// ========================================
// CAD SCENE - Votre Classe de Scène
// ========================================
// VOUS écrivez la structure et orchestrez
// Les fonctions complexes viennent de IA/

import { applyRenderMode, saveOriginalMaterials, cycleRenderMode } from '../IA/RenderHelper.js';
import { identifyStones, setupStoneInteraction, applyStoneColors } from '../IA/StoneHelper.js';
import { zoomToMesh, resetCameraZoom, toggleAutoRotation, stopAutoRotation, setFocusLevel } from '../IA/CameraHelper.js';
import { Config } from '../IA/Config.js';

export class CADScene {
    constructor(engine) {
        this.engine = engine;
        this.scene = null;
        this.ringMesh = null;
        this.allRingMeshes = [];
        this.currentRenderMode = 'BLUEPRINT';
        this.originalMaterials = new Map();
        this.keydownHandler = null;
        this.rotationFunction = null; // Pour stocker la fonction de rotation auto
        this.isAnalysisMode = false;  // Mode analyse actif ou non
    }

    // ========================================
    // INITIALISATION - Créer la scène
    // ========================================
    async init() {
        console.log("🎬 Initialisation scène CAD...");

        // Créer la scène Babylon
        this.scene = new BABYLON.Scene(this.engine);

        // Fond blanc de départ
        this.scene.clearColor = new BABYLON.Color4(1, 1, 1, 1);

        // TODO: Créer la caméra
        this.createCamera();

        // TODO: Créer les lumières
        this.createLights();

        // TODO: Créer le sol et la grille
        this.createGround();

        // TODO: Charger la bague
        await this.loadRing();

        console.log("✅ Scène CAD initialisée");
    }

    // ========================================
    // CRÉATION CAMÉRA
    // ========================================
    createCamera() {
        const camera = new BABYLON.ArcRotateCamera(
            "cadCamera",
            Math.PI / 4,    // angle horizontal
            Math.PI / 3,    // angle vertical
            15,             // distance
            BABYLON.Vector3.Zero(),
            this.scene
        );

        // Configuration pour trackpad
        camera.wheelPrecision = 10;
        camera.pinchPrecision = 50;
        camera.lowerRadiusLimit = 2;
        camera.upperRadiusLimit = 50;
        camera.angularSensibilityX = 1000;
        camera.angularSensibilityY = 1000;

        // Empêcher le zoom de la page
        const canvas = this.engine.getRenderingCanvas();
        canvas.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
    }

    // ========================================
    // CRÉATION LUMIÈRES
    // ========================================
    createLights() {
        // Lumière ambiante
        const hemiLight = new BABYLON.HemisphericLight(
            "hemiLight",
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );
        hemiLight.intensity = 0.7;

        // Lumière directionnelle
        const dirLight = new BABYLON.DirectionalLight(
            "dirLight",
            new BABYLON.Vector3(-1, -2, -1),
            this.scene
        );
        dirLight.intensity = 0.5;
    }

    // ========================================
    // CRÉATION SOL ET GRILLE
    // ========================================
    createGround() {
        // Sol
        const ground = BABYLON.MeshBuilder.CreateGround(
            "ground",
            { width: 20, height: 20 },
            this.scene
        );
        const groundMat = new BABYLON.StandardMaterial("groundMat", this.scene);
        groundMat.diffuseColor = new BABYLON.Color3(0.95, 0.95, 0.95);
        groundMat.specularColor = new BABYLON.Color3(0, 0, 0);
        ground.material = groundMat;

        // TODO: Créer les lignes de grille
        this.createGridLines();
    }

    createGridLines() { // IA
        const size = 20;
        const step = 2;
        const lines = [];

        // Lignes parallèles à X
        for (let z = -size / 2; z <= size / 2; z += step) {
            lines.push([
                new BABYLON.Vector3(-size / 2, 0.01, z),
                new BABYLON.Vector3(size / 2, 0.01, z)
            ]);
        }

        // Lignes parallèles à Z
        for (let x = -size / 2; x <= size / 2; x += step) {
            lines.push([
                new BABYLON.Vector3(x, 0.01, -size / 2),
                new BABYLON.Vector3(x, 0.01, size / 2)
            ]);
        }

        const gridLines = BABYLON.MeshBuilder.CreateLineSystem(
            "gridLines",
            { lines: lines },
            this.scene
        );
        gridLines.color = new BABYLON.Color3(0.4, 0.5, 0.6);
        gridLines.alpha = 0.3;
    }

    // ========================================
    // CHARGEMENT DE LA BAGUE
    // ========================================
    async loadRing() {
        try {
            const result = await BABYLON.SceneLoader.ImportMeshAsync(
                "",
                "object/",
                "ring_CAO_bigCe.glb",
                this.scene
            );

            console.log("✅ Bague chargée:", result.meshes.length, "meshes");

            const root = result.meshes[0];
            root.position = new BABYLON.Vector3(0, 3, 0);
            root.scaling = new BABYLON.Vector3(100, 100, 100);

            // Sauvegarder les matériaux originaux (fonction IA)
            this.allRingMeshes = result.meshes;
            this.originalMaterials = saveOriginalMaterials(result.meshes);

            // Animation de rotation simple - chaque frame
            this.scene.registerBeforeRender(() => {
                root.rotation.y += 0.01;
            });

            // Ajuster la caméra
            const camera = this.scene.getCameraByName("cadCamera");
            if (camera) {
                camera.target = new BABYLON.Vector3(0, 3, 0);
                camera.radius = 15;
            }

            this.ringMesh = root;

            // Identifier les pierres et métaux
            this.identifyStones();

            // Activer le mode blueprint de départ
            this.enableBlueprintMode();

            console.log("✅ Bague configurée");
        } catch (error) {
            console.error("❌ Erreur chargement bague:", error);
        }
    }

    // ========================================
    // MODES DE RENDU (utilisent les helpers IA)
    // ========================================
    enableBlueprintMode() {
        const config = Config.renderModes.BLUEPRINT;
        applyRenderMode(this.allRingMeshes, config, this.originalMaterials, this.scene);

        // Réappliquer les couleurs aux pierres APRÈS pour garder wireframe + couleurs
        applyStoneColors(this.stones, Config.stoneColors);

        this.currentRenderMode = 'BLUEPRINT';
        console.log("📐 Mode Blueprint activé");
    }

    enableRealisticMode() {
        const config = Config.renderModes.REALISTIC;
        applyRenderMode(this.allRingMeshes, config, this.originalMaterials, this.scene);

        // Réappliquer les couleurs aux pierres
        applyStoneColors(this.stones, Config.stoneColors);

        this.currentRenderMode = 'REALISTIC';
        console.log("🎨 Mode Réaliste activé");
    }

    enableXRayMode() {
        const config = Config.renderModes.XRAY;
        applyRenderMode(this.allRingMeshes, config, this.originalMaterials, this.scene);

        // Réappliquer les couleurs aux pierres
        applyStoneColors(this.stones, Config.stoneColors);

        this.currentRenderMode = 'XRAY';
        console.log("🔍 Mode X-Ray activé");
    }

    // ========================================
    // CYCLE DES MODES (utilise helper IA)
    // ========================================
    handleRenderModeCycle() {
        this.currentRenderMode = cycleRenderMode(this.currentRenderMode, {
            BLUEPRINT: () => this.enableBlueprintMode(),
            REALISTIC: () => this.enableRealisticMode(),
            XRAY: () => this.enableXRayMode()
        });
    }

    // ========================================
    // ACTIVER LA SCÈNE
    // ========================================
    enter() {
        console.log("📐 Scène CAD activée");

        // Attacher la caméra
        const camera = this.scene.getCameraByName("cadCamera");
        if (camera) {
            camera.attachControl(this.engine.getRenderingCanvas(), true);
        }

        // Cacher les éléments UI du bureau
        const statusModal = document.getElementById("statusModal");
        const backButton = document.getElementById("backButton");
        const infoBulle = document.getElementById("infoBulle");

        if (statusModal) statusModal.classList.add("hidden");
        if (backButton) backButton.classList.add("hidden");
        if (infoBulle) infoBulle.classList.add("hidden");

        // ✨ Démarrer la rotation automatique de la bague
        if (this.ringMesh && !this.rotationFunction) {
            this.rotationFunction = this.scene.registerBeforeRender(() => {
                if (this.ringMesh) {
                    this.ringMesh.rotation.y += 0.01; // Vitesse de rotation
                }
            });
            console.log("🔄 Rotation automatique démarrée");
        }

        // Ajouter event listener pour la touche R
        if (this.keydownHandler) {
            window.removeEventListener('keydown', this.keydownHandler);
        }

        this.keydownHandler = (e) => {
            // Toggle inspector avec 'i'
            if (e.key === 'i' || e.key === 'I') {
                if (this.scene.debugLayer.isVisible()) {
                    this.scene.debugLayer.hide();
                } else {
                    this.scene.debugLayer.show();
                }
            }

            // Cycle des modes avec 'r'
            if (e.key === 'r' || e.key === 'R') {
                this.handleRenderModeCycle();
            }

            // Toggle mode analyse avec 'z'
            if (e.key === 'z' || e.key === 'Z') {
                this.toggleAnalysisMode();
            }
        };

        window.addEventListener('keydown', this.keydownHandler);
    }

    // ========================================
    // DÉSACTIVER LA SCÈNE
    // ========================================
    exit() {
        console.log("👋 Scène CAD désactivée");

        // Détacher la caméra
        const camera = this.scene.getCameraByName("cadCamera");
        if (camera) {
            camera.detachControl();
        }

        // ⏸️ Arrêter la rotation automatique
        if (this.rotationFunction) {
            this.scene.unregisterBeforeRender(this.rotationFunction);
            this.rotationFunction = null;
            console.log("⏸️ Rotation automatique arrêtée");
        }

        // Nettoyer event listener
        if (this.keydownHandler) {
            window.removeEventListener('keydown', this.keydownHandler);
            this.keydownHandler = null;
        }
    }

    // ========================================
    // IDENTIFICATION DES PIERRES (appelle helper IA)
    // ========================================
    identifyStones() {
        // Appeler la fonction IA pour identifier
        const { stones, metals } = identifyStones(this.allRingMeshes);

        // Stocker les résultats
        this.stones = stones;
        this.metals = metals;

        // Appliquer les couleurs aux pierres (fonction IA)
        applyStoneColors(this.stones, Config.stoneColors);

        // Activer la sélection (appelle aussi helper IA)
        this.setupStoneInteraction();
    }

    // ========================================
    // INTERACTION PIERRES (appelle helper IA)
    // ========================================
    setupStoneInteraction() {
        // Appeler la fonction IA pour configurer les clics
        const state = setupStoneInteraction(this.scene, this.stones, this.metals);

        // Stocker l'état retourné
        this.selectedStone = state.selectedStone;
        this.selectedMetal = state.selectedMetal;
        this.stoneHighlight = state.stoneHighlight;
        this.metalHighlight = state.metalHighlight;
    }

    // ========================================
    // MODE ANALYSE (gestion manuelle de la rotation)
    // ========================================
    enterAnalysisMode() {
        if (this.isAnalysisMode) return;

        console.log("🔍 Entrée en mode analyse");
        this.isAnalysisMode = true;

        // Zoom sur la bague
        const camera = this.scene.getCameraByName("cadCamera");
        if (camera && this.ringMesh) {
            zoomToMesh(camera, this.ringMesh, 8, 1000, () => {
                console.log("✅ Mode analyse activé");
            });
        }
    }

    exitAnalysisMode() {
        if (!this.isAnalysisMode) return;

        console.log("👋 Sortie du mode analyse");
        this.isAnalysisMode = false;

        // Retour à la vue globale
        const camera = this.scene.getCameraByName("cadCamera");
        if (camera && this.ringMesh) {
            resetCameraZoom(camera, this.ringMesh.position, 15, 1000, () => {
                console.log("✅ Vue globale restaurée");
            });
        }
    }

    toggleAnalysisMode() {
        if (this.isAnalysisMode) {
            this.exitAnalysisMode();
        } else {
            this.enterAnalysisMode();
        }
    }

    // Vérifier si un mesh fait partie de la bague
    isRingMesh(mesh) {
        return this.allRingMeshes.includes(mesh);
    }
}
