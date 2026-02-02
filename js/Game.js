import { SceneManager } from "./SceneManager.js";
import { InteractionManager } from "./InteractionManager.js";
import { UIManager } from "./UIManager.js";

export class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.engine = new BABYLON.Engine(this.canvas, true);

        this.sceneManager = new SceneManager(this.engine);
        this.uiManager = new UIManager();
        this.scene = null;
    }

    start() {
        // 1. Création de la scène
        this.scene = this.sceneManager.createScene();

        // 2. Chargement des assets
        this.sceneManager.loadAssets();

        // 3. Mise en place des interactions
        // On passe la scène, le UIManager et le SceneManager
        this.interactionManager = new InteractionManager(this.scene, this.uiManager, this.sceneManager);

        // 4. Boucle de rendu
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        // 5. Gestion du resize
        window.addEventListener("resize", () => {
            this.engine.resize();
        });
    }
}
