// ========================================
// CAD SCENE - Votre Classe de Scène
// ========================================
// VOUS écrivez la structure et orchestrez
// Les fonctions complexes viennent de IA/

import { applyRenderMode, saveOriginalMaterials, cycleRenderMode } from '../IA/RenderHelper.js';
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

    createGridLines() {
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

            // Animation de rotation
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
        this.currentRenderMode = 'BLUEPRINT';
        console.log("📐 Mode Blueprint activé");
    }

    enableRealisticMode() {
        const config = Config.renderModes.REALISTIC;
        applyRenderMode(this.allRingMeshes, config, this.originalMaterials, this.scene);
        this.currentRenderMode = 'REALISTIC';
        console.log("🎨 Mode Réaliste activé");
    }

    enableXRayMode() {
        const config = Config.renderModes.XRAY;
        applyRenderMode(this.allRingMeshes, config, this.originalMaterials, this.scene);
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

        // Nettoyer event listener
        if (this.keydownHandler) {
            window.removeEventListener('keydown', this.keydownHandler);
            this.keydownHandler = null;
        }
    }
}
