import { OfficeScene } from "./OfficeScene.js";
import { CADScene } from "./CADScene.js";
import { UIManager } from "./UIManager.js";

export class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.engine = new BABYLON.Engine(this.canvas, true);

        // UIManager with navigation callback
        this.uiManager = new UIManager((stepNumber) => this.onTimelineStepClick(stepNumber));

        // Scene Registry
        this.scenes = new Map();
        this.currentSceneId = null;
        this.currentSceneInstance = null;
    }

    async start() {
        // 1. Initialise & Register Scenes
        // Office (Start Scene)
        const office = new OfficeScene(this.engine, this);
        this.scenes.set("OFFICE", office);

        // CAD
        const cad = new CADScene(this.engine, this);
        this.scenes.set("CAD", cad);

        // 2. Launch Defaults
        await this.goToScene("CAD");

        // 3. Render Loop
        this.engine.runRenderLoop(() => {
            if (this.currentSceneInstance && this.currentSceneInstance.scene) {
                this.currentSceneInstance.scene.render();
            }
        });

        // 4. Resize
        window.addEventListener("resize", () => {
            this.engine.resize();
        });
    }

    async goToScene(sceneId) {
        if (!this.scenes.has(sceneId)) {
            console.error(`Scene ${sceneId} not found`);
            return;
        }

        // 1. Cleanup current scene
        if (this.currentSceneInstance) {
            this.currentSceneInstance.exit(); // Detach controls
            // Optional: Dipose if we want to save memory, or keep if we want to toggle fast
            // this.currentSceneInstance.scene.dispose(); 
        }

        // 2. Setup new scene
        this.currentSceneInstance = this.scenes.get(sceneId);
        this.currentSceneId = sceneId;

        console.log(`Switching to scene: ${sceneId}`);

        // Lazy initialization: create scene only if needed (or check if already created)
        if (!this.currentSceneInstance.scene) {
            await this.currentSceneInstance.init();
        }

        // 3. Enter (Attach controls)
        this.currentSceneInstance.enter();
    }

    onTimelineStepClick(stepNumber) {
        // Map step numbers to scene IDs
        const sceneMap = {
            1: "OFFICE",
            2: "CAD",
            3: "OFFICE", // Prototype - pas encore implémenté, retour au bureau
            4: "OFFICE"  // Présentation - pas encore implémenté, retour au bureau
        };

        const targetScene = sceneMap[stepNumber];
        if (targetScene && targetScene !== this.currentSceneId) {
            console.log(`🎯 Navigation timeline: Step ${stepNumber} → ${targetScene}`);
            this.goToScene(targetScene);
            this.uiManager.updateProgress(stepNumber);
        }
    }
}
