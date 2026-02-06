// ========================================
// CAD SCENE - Version ME (Orchestrateur)
// ========================================
// ULTRA SIMPLE : que des appels de fonctions IA !

import { UIManager } from './UIManager.js';
import {
    createCADCamera,
    createCADLights,
    createCADEnvironment,
    loadCADModel,
    setupCADStones,
    enterCADScene,
    exitCADScene,
    toggleAnalysisMode,
    setCADRenderMode,
    toggleAutoRotation,
    setupCompleteCADInteractions,
    toggleExtractionHelper
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
        this.isRotating = true;
        this.stonesVisible = true;
        this.isExtracted = false;
        this.wasRotatingBeforeExtraction = false;

        // References Helper
        this.rotationFunction = null;
        this.interactions = null; // Contiendra le cleanup des bindings
        this.interactionState = null;

        // Données pierres/métaux
        this.stones = [];
        this.metals = [];
        this.ringHitbox = null;
        this.uiManager = null;
    }

    // ========================================
    // LOGIQUE NAVIGATION (Appels IA)
    // ========================================

    handleRotationToggle() {
        this.rotationFunction = toggleAutoRotation(this.scene, this.ringMesh, this.rotationFunction);
        this.isRotating = !!this.rotationFunction;
        if (this.uiManager) this.uiManager.updateRotationButton(this.isRotating);
    }

    toggleStonesVisibility() {
        this.stonesVisible = !this.stonesVisible;
        if (this.interactionState) this.interactionState.setStonesVisibility(this.stonesVisible);
        if (this.uiManager) this.uiManager.updateStonesVisibilityUI(this.stonesVisible);
    }

    toggleExtraction() {
        toggleExtractionHelper(this);
    }

    toggleAnalysisMode() {
        this.isAnalysisMode = !this.isAnalysisMode;
        toggleAnalysisMode(this.scene, this.isAnalysisMode, this.ringMesh, this.interactionState, this.ringHitbox);

        if (this.uiManager) {
            this.uiManager.updateZoomButtonUI(this.isAnalysisMode);
            this.uiManager.updateModeTitle(this.isAnalysisMode ? "MODE ANALYSE" : "MODE PRÉSENTATION");
            if (!this.isAnalysisMode) {
                this.isExtracted = false;
                this.uiManager.updateExtractionUI(false);
            }
        }
    }

    // Modes de rendu simplifiés
    enableBlueprintMode() {
        this.currentRenderMode = setCADRenderMode('BLUEPRINT', this.allRingMeshes, this.originalMaterials, this.stones, this.scene);
        if (this.uiManager) this.uiManager.updateRenderModeUI('BLUEPRINT');
    }

    enableRealisticMode() {
        this.currentRenderMode = setCADRenderMode('REALISTIC', this.allRingMeshes, this.originalMaterials, this.stones, this.scene);
        if (this.uiManager) this.uiManager.updateRenderModeUI('REALISTIC');
    }

    enableXRayMode() {
        this.currentRenderMode = setCADRenderMode('XRAY', this.allRingMeshes, this.originalMaterials, this.stones, this.scene);
        if (this.uiManager) this.uiManager.updateRenderModeUI('XRAY');
    }

    // ========================================
    // INITIALISATION
    // ========================================
    async init() {
        console.log("Initialisation scène CAD...");
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = new BABYLON.Color4(1, 1, 1, 1);

        // Helpers IA
        createCADCamera(this.scene, this.engine.getRenderingCanvas());
        createCADLights(this.scene);
        createCADEnvironment(this.scene);

        this.uiManager = new UIManager();

        const modelData = await loadCADModel(this.scene);
        if (modelData) {
            this.ringMesh = modelData.root;
            this.allRingMeshes = modelData.meshes;
            this.originalMaterials = modelData.originalMaterials;
            this.ringHitbox = modelData.ringHitbox;

            const stoneData = setupCADStones(this.scene, this.allRingMeshes,
                (mesh, type) => this.uiManager?.updateComponentInfo(type),
                () => this.toggleExtraction()
            );
            this.stones = stoneData.stones;
            this.metals = stoneData.metals;
            this.interactionState = stoneData.interactionState;

            this.enableBlueprintMode();
        }

        console.log("Scène CAD initialisée");
        return this.scene;
    }

    // ========================================
    // ACTIVER / DÉSACTIVER SCÈNE
    // ========================================
    enter() {
        // Nettoyage UI précédent
        if (this.uiManager) this.uiManager.hideAll();

        // Setup Interactions & UI en 1 appel helper
        this.interactions = setupCompleteCADInteractions(this.scene, this, this.uiManager);

        // Enter Logic (Camera reset, etc.)
        enterCADScene(this.scene, this.engine, this.uiManager, this.ringMesh, this.interactionState, this.ringHitbox, this.isAnalysisMode);

        // Start rotation auto par défaut
        if (!this.rotationFunction) {
            this.handleRotationToggle();
        }
    }

    exit() {
        // Cleanup via helpere
        if (this.interactions) {
            this.interactions(); // Appel de la fonction de cleanup retournée par setupCompleteCADInteractions
            this.interactions = null;
        }

        exitCADScene(this.scene, this.rotationFunction, null);
        this.rotationFunction = null;
    }
}
