import { InteractionManager } from "./InteractionManager.js";
import { AssetManager } from "./AssetManager.js";
import { Config } from "./Config.js";

export class OfficeScene {
    constructor(engine, game) {
        this.engine = engine;
        this.game = game; // Reference to the main Game (Director)
        this.scene = null;
        this.hl = null;
        this.pulseObserver = null;
        this.echoParticleSystem = null;
        this.screenMaterial = null;
        this.interactionManager = null;
        this.ledAnimationInterval = null; // Track LED animation
    }

    async init() {
        this.scene = new BABYLON.Scene(this.engine);

        // 1. Caméra
        const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2, 5, BABYLON.Vector3.Zero(), this.scene);
        camera.lowerRadiusLimit = 5;
        camera.upperRadiusLimit = 5;
        camera.panningSensibility = 0;

        // 2. Lumière
        new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), this.scene);

        // 3. Highlight Layer
        this.hl = new BABYLON.HighlightLayer("hl1", this.scene);

        // 4. Load Assets
        this.assetManager = new AssetManager(this.scene, this);
        await this.assetManager.load();

        // 5. Log mesh names for debugging
        console.log("=== TOUS LES MESH ===");
        this.scene.meshes.forEach(m => console.log(m.name));
        console.log("\n=== MESH DE LA TOUR (cpu_6) ===");
        const towerMeshes = this.scene.meshes.filter(m =>
            m.name.includes('cpu') ||
            (m.parent && m.parent.name && m.parent.name.includes('cpu'))
        );
        towerMeshes.forEach(m => console.log(`- ${m.name} (parent: ${m.parent ? m.parent.name : 'none'})`));

        // 5b. Show Inspector
        try {
            await this.scene.debugLayer.show({
                embedMode: false,
                overlay: true
            });
            console.log("Inspector opened successfully!");
        } catch (error) {
            console.error("Failed to open inspector:", error);
        }

        // 6. Interactions
        this.setupInteractions();

        // On initialise l'InteractionManager spécifique à cette scène
        // Note: On passe une callback pour le changement de scène
        this.interactionManager = new InteractionManager(
            this.scene,
            this.game.uiManager,
            this,
            () => this.game.goToScene("CAD") // Callback onScreenEnter
        );

        // 7. Initialize LED to OFF state
        this.setPowerLED(false);

        return this.scene;
    }

    enter() {
        // Attacher les contrôles
        const camera = this.scene.getCameraByName("officeCamera");
        if (camera) camera.attachControl(this.engine.getRenderingCanvas(), true);

        // Re-enable interactions
        if (this.interactionManager) {
            this.interactionManager.enable();
        }
    }

    exit() {
        // Détacher les contrôles
        const camera = this.scene.getCameraByName("officeCamera");
        if (camera) camera.detachControl();

        // Disable interactions to prevent hover effects in other scenes
        if (this.interactionManager) {
            this.interactionManager.disable();
        }
    }

    setupInteractions() {
        this.scene.meshes.forEach(mesh => {
            // Find interaction config by checking mesh name AND hierarchy
            const interactionConfig = Config.interactionMap.find(cfg => {
                // 1. Direct match
                if (mesh.name.includes(cfg.pattern)) return true;

                // 2. Hierarchy match (Parents)
                let parent = mesh.parent;
                while (parent) {
                    if (parent.name && parent.name.includes(cfg.pattern)) return true;
                    parent = parent.parent;
                }
                return false;
            });

            if (interactionConfig) {
                mesh.metadata = mesh.metadata || {};
                mesh.metadata.interaction = interactionConfig;
            }
        });
    }

    changeScreenContent(imagePath, fadeIn = false) {
        if (this.screenMaterial) {
            if (imagePath) {
                const texture = new BABYLON.Texture(imagePath, this.scene);
                this.screenMaterial.diffuseTexture = texture;
                this.screenMaterial.emissiveTexture = texture;

                if (fadeIn) {
                    // Fade in animation
                    this.screenMaterial.emissiveColor = BABYLON.Color3.Black();
                    let alpha = 0;
                    const fadeInterval = setInterval(() => {
                        alpha += 0.05;
                        if (alpha >= 1) {
                            alpha = 1;
                            clearInterval(fadeInterval);
                        }
                        this.screenMaterial.emissiveColor = new BABYLON.Color3(alpha, alpha, alpha);
                    }, 30);
                } else {
                    this.screenMaterial.emissiveColor = BABYLON.Color3.White();
                }
            } else {
                // Fade out before clearing
                let alpha = 1;
                const fadeInterval = setInterval(() => {
                    alpha -= 0.1;
                    if (alpha <= 0) {
                        alpha = 0;
                        clearInterval(fadeInterval);
                        this.screenMaterial.diffuseTexture = null;
                        this.screenMaterial.emissiveTexture = null;
                        this.screenMaterial.emissiveColor = BABYLON.Color3.Black();
                    } else {
                        this.screenMaterial.emissiveColor = new BABYLON.Color3(alpha, alpha, alpha);
                    }
                }, 30);
            }
        }
    }

    setPowerLED(isOn) {
        // Search for LED mesh (it's a child of cpu_6)
        let ledMesh = this.scene.getMeshByName(Config.meshes.powerLED);

        // If not found directly, search through all meshes
        if (!ledMesh) {
            ledMesh = this.scene.meshes.find(m => m.name === Config.meshes.powerLED);
        }

        if (!ledMesh) {
            console.warn("Power LED mesh not found:", Config.meshes.powerLED);
            return;
        }

        // Clear any existing animation interval
        if (this.ledAnimationInterval) {
            clearInterval(this.ledAnimationInterval);
            this.ledAnimationInterval = null;
        }

        if (isOn) {
            // Turn LED ON with fade-in after delay
            ledMesh.isVisible = true;

            setTimeout(() => {
                let intensity = 0;
                this.ledAnimationInterval = setInterval(() => {
                    intensity += 0.05;
                    if (intensity >= 1) {
                        intensity = 1;
                        clearInterval(this.ledAnimationInterval);
                        this.ledAnimationInterval = null;
                    }
                    if (ledMesh.material) {
                        ledMesh.material.emissiveColor = new BABYLON.Color3(0, 0.5 * intensity, intensity);
                        ledMesh.material.diffuseColor = new BABYLON.Color3(0, 0.5 * intensity, intensity);
                    }
                }, 30);
            }, 200); // 200ms delay before fade-in starts
        } else {
            // Turn LED OFF with fade-out
            let intensity = 1;
            this.ledAnimationInterval = setInterval(() => {
                intensity -= 0.1;
                if (intensity <= 0) {
                    intensity = 0;
                    clearInterval(this.ledAnimationInterval);
                    this.ledAnimationInterval = null;
                    ledMesh.isVisible = false;
                }
                if (ledMesh.material) {
                    ledMesh.material.emissiveColor = new BABYLON.Color3(0, 0.5 * intensity, intensity);
                    ledMesh.material.diffuseColor = new BABYLON.Color3(0, 0.5 * intensity, intensity);
                }
            }, 30);
        }
    }

    updateHighlight(nameOrArray, active, color = BABYLON.Color3.White()) {
        if (!this.hl) return;

        const targets = Array.isArray(nameOrArray) ? nameOrArray : [nameOrArray];

        targets.forEach(name => {
            const node = this.scene.getNodeByName(name);
            if (!node) return;

            const processMesh = (n) => {
                if (n instanceof BABYLON.Mesh) {
                    if (active) this.hl.addMesh(n, color);
                    else this.hl.removeMesh(n);
                }
                const children = n.getChildren();
                if (children && children.length > 0) children.forEach(child => processMesh(child));
            };
            processMesh(node);
        });
    }

    startPulse(active) {
        if (!this.hl) return;
        if (active) {
            let alpha = 0;
            this.pulseObserver = this.scene.onBeforeRenderObservable.add(() => {
                alpha += Config.visuals.echoPulseSpeed;
                this.hl.blurHorizontalSize = 0.5 + Math.cos(alpha) * 0.5;
                this.hl.blurVerticalSize = 0.5 + Math.cos(alpha) * 0.5;
            });
        } else {
            if (this.pulseObserver) {
                this.scene.onBeforeRenderObservable.remove(this.pulseObserver);
                this.pulseObserver = null;
                this.hl.blurHorizontalSize = 1;
                this.hl.blurVerticalSize = 1;
            }
        }
    }

    createEchoParticles(emitterName, active) {
        // ... (Same particle logic, shortened for brevity if possible, keeping full logic)
        const node = this.scene.getNodeByName(emitterName);
        if (!node) return;

        if (!active) {
            if (this.echoParticleSystem) {
                this.echoParticleSystem.stop();
                this.echoParticleSystem.dispose();
                this.echoParticleSystem = null;
            }
            return;
        }

        if (this.echoParticleSystem) return;

        const particleSystem = new BABYLON.ParticleSystem("particles", Config.visuals.particles.count, this.scene);
        particleSystem.particleTexture = new BABYLON.Texture(Config.assets.particleTexture, this.scene);

        const emitterMesh = this.scene.getMeshByName(Config.meshes.hitboxZonePC);
        particleSystem.emitter = emitterMesh || node;

        const c1 = Config.visuals.particles.color1;
        const c2 = Config.visuals.particles.color2;
        const cDead = Config.visuals.particles.colorDead;

        particleSystem.color1 = new BABYLON.Color4(c1.r, c1.g, c1.b, c1.a);
        particleSystem.color2 = new BABYLON.Color4(c2.r, c2.g, c2.b, c2.a);
        particleSystem.colorDead = new BABYLON.Color4(cDead.r, cDead.g, cDead.b, cDead.a);

        particleSystem.minSize = 0.02;
        particleSystem.maxSize = 0.08;
        particleSystem.minLifeTime = 1;
        particleSystem.maxLifeTime = 3;
        particleSystem.emitRate = Config.visuals.particles.emitRate;
        particleSystem.gravity = new BABYLON.Vector3(0, 0.1, 0);

        particleSystem.start();
        this.echoParticleSystem = particleSystem;
    }
}
