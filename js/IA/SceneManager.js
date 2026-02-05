import { InteractionManager } from "./InteractionManager.js";
import { AssetManager } from "./AssetManager.js";
import { Config } from "./Config.js";

export class SceneManager {
    constructor(engine) {
        this.engine = engine;
        this.scene = null;
        this.hl = null;
        this.pulseObserver = null;
        this.echoParticleSystem = null;
        this.screenMaterial = null;
    }

    createScene() {
        this.scene = new BABYLON.Scene(this.engine);

        // 1. Caméra
        const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2, 5, BABYLON.Vector3.Zero(), this.scene);

        // Bloquer le zoom (rayon fixe)
        camera.lowerRadiusLimit = 5;
        camera.upperRadiusLimit = 5;

        // Désactiver le déplacement (pan)
        camera.panningSensibility = 0;

        camera.attachControl(this.engine.getRenderingCanvas(), true);

        // 2. Lumière
        new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), this.scene);

        // 3. Debug
        this.scene.debugLayer.show();

        // 4. Highlight Layer
        this.hl = new BABYLON.HighlightLayer("hl1", this.scene);

        return this.scene;
    }

    async loadAssets() {
        this.assetManager = new AssetManager(this.scene, this);

        try {
            await this.assetManager.load();
            // Une fois chargé, on initialise les méta-données d'interaction
            this.setupInteractions();
            // InteractionManager is managed in Game.js
        } catch (error) {
            console.error("Erreur chargement assets:", error);
        }
    }

    setupInteractions() {
        this.scene.meshes.forEach(mesh => {
            // On vérifie si ce mesh correspond à une config d'interaction
            const interactionConfig = Config.interactionMap.find(cfg => mesh.name.includes(cfg.pattern));

            if (interactionConfig) {
                mesh.metadata = mesh.metadata || {};
                mesh.metadata.interaction = interactionConfig;
                // On peut aussi initier des choses ici si besoin (visibilité etc)
            }
        });
    }

    changeScreenContent(imagePath) {
        if (this.screenMaterial) {
            if (imagePath) {
                const texture = new BABYLON.Texture(imagePath, this.scene);
                this.screenMaterial.diffuseTexture = texture;
                this.screenMaterial.emissiveTexture = texture;
                this.screenMaterial.emissiveColor = BABYLON.Color3.White();
            } else {
                // Retour au noir
                this.screenMaterial.diffuseTexture = null;
                this.screenMaterial.emissiveTexture = null;
                this.screenMaterial.emissiveColor = BABYLON.Color3.Black();
            }
        }
    }

    /**
     * Active ou désactive le highlight sur un Mesh ou un Node (et ses enfants)
     */
    updateHighlight(name, active, color = BABYLON.Color3.White()) {
        if (!this.hl) return;

        const node = this.scene.getNodeByName(name);
        if (!node) return;

        const processMesh = (n) => {
            if (n instanceof BABYLON.Mesh) {
                if (active) {
                    this.hl.addMesh(n, color);
                } else {
                    this.hl.removeMesh(n);
                }
            }
            const children = n.getChildren();
            if (children && children.length > 0) {
                children.forEach(child => processMesh(child));
            }
        };

        processMesh(node);
    }

    /**
     * Lance une animation de pulsation sur le highlight
     */
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

    /**
     * Crée un système de particules "Echo" simple
     */
    createEchoParticles(emitterName, active) {
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

        // Couleurs depuis Config
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

        particleSystem.minEmitBox = new BABYLON.Vector3(-0.5, 0, -0.5);
        particleSystem.maxEmitBox = new BABYLON.Vector3(0.5, 0.5, 0.5);

        particleSystem.minEmitPower = 0.1;
        particleSystem.maxEmitPower = 0.3;
        particleSystem.updateSpeed = 0.01;
        particleSystem.gravity = new BABYLON.Vector3(0, 0.1, 0);

        particleSystem.start();

        this.echoParticleSystem = particleSystem;
    }
}
