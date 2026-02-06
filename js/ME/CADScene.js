// ========================================
// CAD SCENE - Version ME (Orchestrateur)
// ========================================
// Structure simplifiée qui appelle les fonctions IA

import { UIManager } from './UIManager.js';
import {
    createCADCamera,
    createCADLights,
    createCADEnvironment,
    loadCADModel,
    setupCADStones,
    enterCADScene,
    exitCADScene,
    setupCADInputs,
    toggleAnalysisMode,
    setCADRenderMode,
    cycleCADRenderMode
} from '../IA/CADHelper.js';

export class CADScene {
    constructor(engine) {
        this.engine = engine;
        this.scene = null;
        this.ringMesh = null;
        this.allRingMeshes = [];
        this.originalMaterials = new Map();

        // État
        this.currentRenderMode = 'BLUEPRINT';
        this.isAnalysisMode = false;

        // Handlers et Callbacks
        this.rotationFunction = null;
        this.inputHandler = null;

        // Données pierres/métaux
        // Hitbox
        this.ringHitbox = null;
        this.stones = [];
        this.metals = [];
        this.interactionState = null;

        // UI
        this.uiManager = null;
    }

    // ========================================
    // INITIALISATION
    // ========================================
    async init() {
        console.log("🎬 Initialisation scène CAD...");
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = new BABYLON.Color4(1, 1, 1, 1);

        // 🤖 Création Environnement (Appels IA)
        createCADCamera(this.scene, this.engine.getRenderingCanvas());
        createCADLights(this.scene);
        createCADEnvironment(this.scene);

        // 🤖 UIManager
        this.uiManager = new UIManager();

        // 🤖 Chargement Modèle (Appel IA)
        const modelData = await loadCADModel(this.scene);

        if (modelData) {
            this.ringMesh = modelData.root;
            this.allRingMeshes = modelData.meshes;
            this.originalMaterials = modelData.originalMaterials;
            this.ringHitbox = modelData.ringHitbox; // Récupérer la hitbox

            // 🤖 Configuration Pierres (Appel IA)
            const stoneData = setupCADStones(this.scene, this.allRingMeshes);
            this.stones = stoneData.stones;
            this.metals = stoneData.metals;
            this.interactionState = stoneData.interactionState;

            // Mode de départ
            this.enableBlueprintMode();
        }

        console.log("✅ Scène CAD initialisée");
        return this.scene;
    }

    // ========================================
    // GESTION DES MODES (Orchestration)
    // ========================================
    enableBlueprintMode() {
        this.currentRenderMode = setCADRenderMode('BLUEPRINT', this.allRingMeshes, this.originalMaterials, this.stones, this.scene);
    }

    enableRealisticMode() {
        this.currentRenderMode = setCADRenderMode('REALISTIC', this.allRingMeshes, this.originalMaterials, this.stones, this.scene);
    }

    enableXRayMode() {
        this.currentRenderMode = setCADRenderMode('XRAY', this.allRingMeshes, this.originalMaterials, this.stones, this.scene);
    }

    handleRenderModeCycle() {
        this.currentRenderMode = cycleCADRenderMode(this.currentRenderMode, this.allRingMeshes, this.originalMaterials, this.stones, this.scene);
    }

    toggleAnalysisMode() {
        this.isAnalysisMode = !this.isAnalysisMode;
        // Passer state ET hitbox pour gérer leurs interactions
        toggleAnalysisMode(this.scene, this.isAnalysisMode, this.ringMesh, this.interactionState, this.ringHitbox);
    }

    // ========================================
    // ACTIVER / DÉSACTIVER SCÈNE
    // ========================================
    enter() {
        // 🤖 Appel Helper pour tout gérer (caméra, rotation, UI cleaning)
        // On passe this.uiManager pour qu'il puisse cacher les modales
        this.rotationFunction = enterCADScene(this.scene, this.engine, this.uiManager, this.ringMesh, this.rotationFunction);

        // 🤖 Setup Inputs (clavier + clic bague)
        // Passer interactionState pour détecter mode zoom
        // Passer hitbox pour détection clic facile
        this.inputHandler = setupCADInputs(this.scene, this, this.ringMesh, this.interactionState, this.ringHitbox);
    }

    exit() {
        // 🤖 Appel Helper pour nettoyer
        exitCADScene(this.scene, this.rotationFunction, this.inputHandler);

        this.rotationFunction = null;
        this.inputHandler = null;
    }
}
