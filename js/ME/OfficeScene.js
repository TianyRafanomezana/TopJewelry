// ========================================
// OFFICE SCENE - Version ME
// ========================================
// ULTRA SIMPLE : que des appels de fonctions IA !

import { AssetManager } from '../IA/AssetManager.js';
import { UIManager } from './UIManager.js';
import {
    createOfficeCamera,
    createOfficeLights,
    enterOfficeScene,
    exitOfficeScene,
    setupCompleteOfficeInteractions
} from '../IA/OfficeHelper.js';

export class OfficeScene {
    constructor(engine, sceneManager) {
        this.engine = engine;
        this.sceneManager = sceneManager;
        this.scene = null;
        this.interactions = null;
        this.uiManager = null;
        this.hl = null;
    }

    // ========================================
    // INITIALISATION - Que des appels !
    // ========================================
    async init() {
        console.log("🏢 Initialisation scène Bureau...");

        // Créer la scène
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = new BABYLON.Color4(0.2, 0.2, 0.25, 1);

        // 🤖 Appels helpers IA
        createOfficeCamera(this.scene);
        createOfficeLights(this.scene);

        // Highlight Layer
        this.hl = new BABYLON.HighlightLayer("hl1", this.scene);

        // 🤖 AssetManager charge le PC
        this.assetManager = new AssetManager(this.scene, this);
        await this.assetManager.load();

        // UIManager
        this.uiManager = new UIManager();

        // 🤖 Config TOUTES les interactions en 1 ligne
        this.interactions = await setupCompleteOfficeInteractions(
            this.scene,
            this.hl,
            this.uiManager,
            () => this.sceneManager.goToScene('CAD')
        );

        console.log("✅ Scène Bureau initialisée");
        return this.scene;
    }

    // ========================================
    // ACTIVER / DÉSACTIVER
    // ========================================
    enter() {
        enterOfficeScene(this.scene, this.engine, this.interactions);
    }

    exit() {
        exitOfficeScene(this.scene, this.interactions);
    }
}
