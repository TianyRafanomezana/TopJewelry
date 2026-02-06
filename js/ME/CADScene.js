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
    cycleCADRenderMode,
    toggleAutoRotation
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
        this.isRotating = true; // Par défaut ça tourne
        this.stonesVisible = true; // Par défaut visibles
        this.isExtracted = false; // Par défaut pierres à leur place

        // Handlers et Callbacks
        this.rotationFunction = null;
        this.inputHandler = null;

        // Données pierres/métaux
        this.stones = [];
        this.metals = [];
        this.interactionState = null;

        // Hitbox
        this.ringHitbox = null;

        // UI
        this.uiManager = null;
    }

    handleRotationToggle() {
        this.rotationFunction = toggleAutoRotation(this.scene, this.ringMesh, this.rotationFunction);
        this.isRotating = !!this.rotationFunction;

        if (this.uiManager) {
            this.uiManager.updateRotationButton(this.isRotating);
        }
    }

    toggleStonesVisibility() {
        this.stonesVisible = !this.stonesVisible;
        if (this.interactionState) {
            this.interactionState.setStonesVisibility(this.stonesVisible);
        }
        if (this.uiManager) {
            this.uiManager.updateStonesVisibilityUI(this.stonesVisible);
        }
    }

    toggleExtraction() {
        if (!this.isAnalysisMode) return; // Seulement si zoomé

        this.isExtracted = !this.isExtracted;
        if (this.interactionState) {
            this.interactionState.extractStone(this.isExtracted);
        }
        if (this.uiManager) {
            this.uiManager.updateExtractionUI(this.isExtracted);
        }
    }

    toggleAnalysisMode() {
        this.isAnalysisMode = !this.isAnalysisMode;

        // 1. Logique 3D
        toggleAnalysisMode(this.scene, this.isAnalysisMode, this.ringMesh, this.interactionState, this.ringHitbox);

        // 2. Logique UI
        if (this.uiManager) {
            this.uiManager.updateZoomButtonUI(this.isAnalysisMode);
            this.uiManager.updateModeTitle(this.isAnalysisMode ? "MODE ANALYSE" : "MODE PRÉSENTATION");
        }
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
            const stoneData = setupCADStones(this.scene, this.allRingMeshes, (mesh, type) => {
                console.log("💎 MMI Interaction: Stone Selected ->", type);
                if (this.uiManager) {
                    this.uiManager.updateComponentInfo(type);
                }
            });
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

    // handleRenderModeCycle n'est plus utilisé via l'UI mais gardé en fallback si besoin
    handleRenderModeCycle() {
        this.currentRenderMode = cycleCADRenderMode(this.currentRenderMode, this.allRingMeshes, this.originalMaterials, this.stones, this.scene);
        if (this.uiManager) this.uiManager.updateRenderModeUI(this.currentRenderMode);
    }

    toggleAnalysisMode() {
        this.isAnalysisMode = !this.isAnalysisMode;

        // 1. Logique 3D
        toggleAnalysisMode(this.scene, this.isAnalysisMode, this.ringMesh, this.interactionState, this.ringHitbox);

        // 2. Logique UI
        if (this.uiManager) {
            this.uiManager.updateZoomButtonUI(this.isAnalysisMode);
            this.uiManager.updateModeTitle(this.isAnalysisMode ? "MODE ANALYSE" : "MODE PRÉSENTATION");
        }
    }

    // ========================================
    // ACTIVER / DÉSACTIVER SCÈNE
    // ========================================
    enter() {
        // 🤖 Appel Helper pour tout gérer (caméra, rotation, UI cleaning)
        this.rotationFunction = enterCADScene(this.scene, this.engine, this.uiManager, this.ringMesh, this.rotationFunction);
        this.isRotating = !!this.rotationFunction; // Sync initial boolean state

        // FORCAGE ZOOM INITIAL (Sécurité)
        // On s'assure d'arriver dézoomé
        if (this.ringMesh && !this.isAnalysisMode) {
            const camera = this.scene.getCameraByName("cadCamera");
            if (camera) {
                camera.radius = 15;
                camera.target = new BABYLON.Vector3(0, 2, 0);
            }
            if (this.interactionState) {
                this.interactionState.enabled = false;
                this.interactionState.deselectAll();
            }
            if (this.ringHitbox) {
                this.ringHitbox.isPickable = true;
            }
        }

        // 🤖 UI Controls (Gauche + Bas Droite)
        this.uiManager.showLeftControls();
        this.uiManager.updateModeTitle("MODE PRÉSENTATION"); // Etat initial
        this.uiManager.updateZoomButtonUI(false); // Reset bouton
        this.uiManager.updateRenderModeUI(this.currentRenderMode || 'BLUEPRINT'); // Sync mode rendu
        this.uiManager.updateRotationButton(this.isRotating); // Sync état rotation

        // Bindings Boutons
        const btnZoom = document.getElementById('btnZoomToggle');
        const btnRotation = document.getElementById('btnRotationToggle');

        // Nouveaux boutons de mode de rendu
        const btnRealistic = document.getElementById('btnModeRealistic');
        const btnBlueprint = document.getElementById('btnModeBlueprint');
        const btnXRay = document.getElementById('btnModeXRay');

        if (btnZoom) btnZoom.onclick = () => {
            console.log("🖱️ UI Zoom Click");
            this.toggleAnalysisMode();
        };

        if (btnRotation) btnRotation.onclick = () => {
            console.log("🔄 UI Rotation Toggle Click");
            this.handleRotationToggle();
        };

        const btnVisibility = document.getElementById('btnStonesVisibility');
        if (btnVisibility) btnVisibility.onclick = () => {
            console.log("👁️ UI Stones Visibility Toggle Click");
            this.toggleStonesVisibility();
        };

        const btnSelectAll = document.getElementById('btnSelectAllStones');
        if (btnSelectAll) {
            btnSelectAll.onclick = () => {
                console.log("💎 Select All Stones Clicked");
                if (this.interactionState && this.interactionState.selectAllStones) {
                    this.interactionState.selectAllStones();
                } else {
                    console.warn("⚠️ interactionState or selectAllStones missing");
                }
            };
        }

        const btnVisibilityModal = document.getElementById('btnStonesVisibilityModal');
        if (btnVisibilityModal) {
            btnVisibilityModal.onclick = () => {
                console.log("👁️ Modal Stones Visibility Toggle Click");
                this.toggleStonesVisibility();
            };
        }

        const btnExtract = document.getElementById('btnExtractStone');
        if (btnExtract) {
            btnExtract.onclick = () => {
                console.log("💎 Stone Extraction Click");
                this.toggleExtraction();
            };
        }

        if (btnRealistic) btnRealistic.onclick = () => {
            console.log("🎨 Mode Réaliste sélectionné");
            this.enableRealisticMode();
        };
        if (btnBlueprint) btnBlueprint.onclick = () => {
            console.log("📐 Mode Blueprint sélectionné");
            this.enableBlueprintMode();
        };
        if (btnXRay) btnXRay.onclick = () => {
            console.log("🔍 Mode X-Ray sélectionné");
            this.enableXRayMode();
        };

        // 🤖 Setup Inputs (clavier + clic bague + mouse)
        // Passer interactionState pour détecter mode zoom (et clic bague)
        // DELAI DE SÉCURITÉ : Attendre que la transition soit finie pour activer les clics
        // (Sinon le clic de l'écran Bureau déclenche le zoom ici)
        setTimeout(() => {
            if (this.scene) { // Vérifier que la scène existe encore
                this.inputHandler = setupCADInputs(this.scene, this, this.ringMesh, this.interactionState, this.ringHitbox);
                console.log("🎮 Inputs CAD activés");
            }
        }, 500);
    }

    exit() {
        // 🤖 Appel Helper pour nettoyer
        exitCADScene(this.scene, this.rotationFunction, this.inputHandler);

        // UI Cleaning
        this.uiManager.hideLeftControls();

        const btnZoom = document.getElementById('btnZoomToggle');
        if (btnZoom) btnZoom.onclick = null;

        const btnRotation = document.getElementById('btnRotationToggle');
        if (btnRotation) btnRotation.onclick = null;

        const btnVisibility = document.getElementById('btnStonesVisibility');
        if (btnVisibility) btnVisibility.onclick = null;

        const btnSelectAll = document.getElementById('btnSelectAllStones');
        if (btnSelectAll) btnSelectAll.onclick = null;

        const btnRealistic = document.getElementById('btnModeRealistic');
        const btnBlueprint = document.getElementById('btnModeBlueprint');
        const btnXRay = document.getElementById('btnModeXRay');

        if (btnRealistic) btnRealistic.onclick = null;
        if (btnBlueprint) btnBlueprint.onclick = null;
        if (btnXRay) btnXRay.onclick = null;

        this.rotationFunction = null;
        this.inputHandler = null;
    }
}
