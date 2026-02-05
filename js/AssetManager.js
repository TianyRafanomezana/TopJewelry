import { Config } from "./Config.js";

export class AssetManager {
    constructor(scene, sceneManager) {
        this.scene = scene;
        this.sceneManager = sceneManager;
    }

    async load() {
        return new Promise((resolve, reject) => {
            BABYLON.SceneLoader.ImportMesh("", Config.assets.modelPath, Config.assets.modelFile, this.scene, (meshes) => {
                console.log("AssetManager: Modèle chargé.");
                this.setupScene();
                resolve(meshes);
            }, null, (scene, message) => {
                reject(message);
            });
        });
    }

    setupScene() {
        this.createScreenHitbox();
        this.createZoneHitbox();
        this.initializeScreenMaterial();
    }

    initializeScreenMaterial() {
        // Init Screen Material (Black by default)
        const screenMesh = this.scene.getMeshByName(Config.meshes.screenSurface);
        if (screenMesh) {
            this.sceneManager.screenMaterial = new BABYLON.StandardMaterial("screenMat", this.scene);
            this.sceneManager.screenMaterial.diffuseColor = BABYLON.Color3.Black();
            this.sceneManager.screenMaterial.emissiveColor = BABYLON.Color3.Black();
            screenMesh.material = this.sceneManager.screenMaterial;
        }
    }

    createScreenHitbox() {
        const screenNode = this.scene.getNodeByName(Config.meshes.screenMonitor);
        if (screenNode) {
            const { min, max } = screenNode.getHierarchyBoundingVectors();
            const width = max.x - min.x;
            const height = max.y - min.y;
            const depth = max.z - min.z;
            const center = min.add(max).scale(0.5);

            const box = this.createHitbox(Config.meshes.hitboxScreen, BABYLON.Vector3.Zero(), new BABYLON.Vector3(width, height, depth + 0.05));
            box.position = center;
            box.setParent(screenNode);
            box.visibility = 0; // Invisible
            box.isPickable = true;
        }
    }

    createZoneHitbox() {
        let minPC = new BABYLON.Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        let maxPC = new BABYLON.Vector3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
        let foundAny = false;

        Config.meshes.pcComponents.forEach(name => {
            const node = this.scene.getNodeByName(name);
            if (node) {
                foundAny = true;
                const { min, max } = node.getHierarchyBoundingVectors();
                minPC = BABYLON.Vector3.Minimize(minPC, min);
                maxPC = BABYLON.Vector3.Maximize(maxPC, max);
            }
        });

        if (foundAny) {
            const widthPC = maxPC.x - minPC.x;
            const heightPC = maxPC.y - minPC.y;
            const depthPC = maxPC.z - minPC.z;
            const centerPC = minPC.add(maxPC).scale(0.5);

            this.createHitbox(Config.meshes.hitboxZonePC, centerPC, new BABYLON.Vector3(widthPC * 1.2, heightPC * 1.2, depthPC * 1.2));
        }
    }

    createHitbox(name, position, size) {
        const box = BABYLON.MeshBuilder.CreateBox(name, {
            width: size.x,
            height: size.y,
            depth: size.z
        }, this.scene);

        box.position = position;

        const material = new BABYLON.StandardMaterial(name + "_mat", this.scene);
        material.alpha = 0; // Invisible
        material.diffuseColor = new BABYLON.Color3(1, 0, 0);
        box.material = material;
        box.visibility = 0; // Purely invisible but pickable

        return box;
    }
}
