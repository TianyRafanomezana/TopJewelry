import { Config } from './Config.js';

export class CADScene {
    constructor(engine) {
        this.engine = engine;
        this.scene = null;
        this.ringMesh = null;
        this.allRingMeshes = [];
        this.currentRenderMode = 'BLUEPRINT'; // BLUEPRINT, REALISTIC, XRAY
        this.originalMaterials = new Map(); // Stocker les matériaux originaux
        this.keydownHandler = null; // Pour cleanup event listener
    }

    async init() {
        this.scene = new BABYLON.Scene(this.engine);

        // 1. Fond blanc (Blueprint style)
        this.scene.clearColor = new BABYLON.Color4(1, 1, 1, 1);

        // 2. Caméra Orbitale
        const camera = new BABYLON.ArcRotateCamera("cadCamera", Math.PI / 4, Math.PI / 3, 15, BABYLON.Vector3.Zero(), this.scene);
        camera.wheelPrecision = 10;
        camera.pinchPrecision = 50;
        camera.lowerRadiusLimit = 2;
        camera.upperRadiusLimit = 50;
        camera.angularSensibilityX = 1000;
        camera.angularSensibilityY = 1000;
        camera.attachControl(this.engine.getRenderingCanvas(), true);

        // Empêcher le zoom de la page web
        const canvas = this.engine.getRenderingCanvas();
        canvas.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });

        // 3. Lumières
        const hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), this.scene);
        hemiLight.intensity = 0.7;

        const dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), this.scene);
        dirLight.intensity = 0.5;

        // 4. Sol avec grille
        const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 20, height: 20 }, this.scene);
        const groundMat = new BABYLON.StandardMaterial("groundMat", this.scene);
        groundMat.diffuseColor = new BABYLON.Color3(0.95, 0.95, 0.95);
        groundMat.specularColor = new BABYLON.Color3(0, 0, 0);
        ground.material = groundMat;

        this.createGridLines();

        // 5. Charger la bague 3D
        await this.loadRingModel();

        return this.scene;
    }

    async loadRingModel() {
        try {
            const result = await BABYLON.SceneLoader.ImportMeshAsync("", "object/", "ring_CAO_bigCe.glb", this.scene);

            console.log("✅ Bague chargée:", result.meshes.length, "meshes");

            const root = result.meshes[0];
            root.position = new BABYLON.Vector3(0, 3, 0);
            root.scaling = new BABYLON.Vector3(100, 100, 100);

            // Sauvegarder les matériaux originaux
            result.meshes.forEach(mesh => {
                if (mesh.material && mesh.getTotalVertices() > 0) {
                    this.originalMaterials.set(mesh, mesh.material.clone(`original_${mesh.name}`));
                }
            });

            // Animation de rotation
            this.scene.registerBeforeRender(() => {
                root.rotation.y += 0.01;
            });

            const camera = this.scene.getCameraByName("cadCamera");
            if (camera) {
                camera.target = new BABYLON.Vector3(0, 3, 0);
                camera.radius = 15;
            }

            this.ringMesh = root;
            this.allRingMeshes = result.meshes;

            this.setupRingInteraction();
            this.enableBlueprintMode();
            this.identifyStones();

            console.log("✅ Bague configurée");
        } catch (error) {
            console.error("❌ Erreur chargement bague:", error);
            this.createFallbackRing();
        }
    }

    createFallbackRing() {
        const torus = BABYLON.MeshBuilder.CreateTorus("ring", { diameter: 2, thickness: 0.3, tessellation: 32 }, this.scene);
        torus.position.y = 2;
        const ringMat = new BABYLON.StandardMaterial("ringMat", this.scene);
        ringMat.diffuseColor = new BABYLON.Color3(1, 0.8, 0.2);
        ringMat.specularColor = new BABYLON.Color3(1, 1, 1);
        ringMat.specularPower = 32;
        torus.material = ringMat;

        this.scene.registerBeforeRender(() => {
            torus.rotation.y += 0.01;
        });

        this.ringMesh = torus;
    }

    setupRingInteraction() {
        let isZoomed = false;

        this.scene.onPointerDown = (evt, pickInfo) => {
            if (pickInfo.hit && pickInfo.pickedMesh) {
                let mesh = pickInfo.pickedMesh;
                let isRingMesh = false;

                while (mesh) {
                    if (mesh === this.ringMesh) {
                        isRingMesh = true;
                        break;
                    }
                    mesh = mesh.parent;
                }

                if (isRingMesh) {
                    const camera = this.scene.getCameraByName("cadCamera");
                    if (!camera) return;

                    if (!isZoomed) {
                        console.log("🔍 Zoom sur la bague");
                        const frontAlpha = Math.PI / 2;
                        const frontBeta = Math.PI / 2.5;

                        BABYLON.Animation.CreateAndStartAnimation("zoomInAlpha", camera, "alpha", 60, 45, camera.alpha, frontAlpha, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                        BABYLON.Animation.CreateAndStartAnimation("zoomInBeta", camera, "beta", 60, 45, camera.beta, frontBeta, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                        BABYLON.Animation.CreateAndStartAnimation("zoomInRadius", camera, "radius", 60, 45, camera.radius, 6, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

                        isZoomed = true;
                    } else {
                        console.log("🔙 Retour vue normale");
                        const defaultAlpha = Math.PI / 4;
                        const defaultBeta = Math.PI / 3;

                        BABYLON.Animation.CreateAndStartAnimation("zoomOutTarget", camera, "target", 60, 45, camera.target, new BABYLON.Vector3(0, 3, 0), BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                        BABYLON.Animation.CreateAndStartAnimation("zoomOutAlpha", camera, "alpha", 60, 45, camera.alpha, defaultAlpha, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                        BABYLON.Animation.CreateAndStartAnimation("zoomOutBeta", camera, "beta", 60, 45, camera.beta, defaultBeta, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                        BABYLON.Animation.CreateAndStartAnimation("zoomOutRadius", camera, "radius", 60, 45, camera.radius, 15, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

                        isZoomed = false;
                    }
                }
            }
        };
    }

    createGridLines() {
        const size = 20;
        const step = 2;
        const lines = [];

        for (let z = -size / 2; z <= size / 2; z += step) {
            lines.push([
                new BABYLON.Vector3(-size / 2, 0.01, z),
                new BABYLON.Vector3(size / 2, 0.01, z)
            ]);
        }

        for (let x = -size / 2; x <= size / 2; x += step) {
            lines.push([
                new BABYLON.Vector3(x, 0.01, -size / 2),
                new BABYLON.Vector3(x, 0.01, size / 2)
            ]);
        }

        const gridLines = BABYLON.MeshBuilder.CreateLineSystem("gridLines", { lines: lines }, this.scene);
        gridLines.color = new BABYLON.Color3(0.4, 0.5, 0.6);
        gridLines.alpha = 0.3;
    }

    // ========== MATERIAL APPLICATOR (pure, config-driven) ==========
    applyMaterialStyle(mesh, modeConfig) {
        const original = this.originalMaterials.get(mesh);

        // Si on doit restaurer l'original tel quel
        if (modeConfig.restoreOriginal) {
            if (!original) {
                console.warn(`⚠️ Pas de matériau original pour ${mesh.name}, ignoré`);
                return;
            }
            mesh.material = original.clone(`${modeConfig.name}_${mesh.name}`);
            mesh.material.wireframe = false;
            mesh.material.alpha = 1.0;
            return;
        }

        // Pour les autres modes, on a besoin de matériau
        if (!original && !mesh.material) {
            console.warn(`⚠️ Pas de matériau pour ${mesh.name}, ignoré`);
            return;
        }

        // Sinon, appliquer le style configuré
        const mat = original ? original.clone(`${modeConfig.name}_${mesh.name}`) : mesh.material;
        const cfg = modeConfig.material;

        mat.wireframe = cfg.wireframe ?? false;
        mat.alpha = cfg.alpha ?? 1.0;
        mat.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;

        // Appliquer les couleurs
        if (cfg.color) {
            const color = new BABYLON.Color3(cfg.color.r, cfg.color.g, cfg.color.b);
            if (mat.albedoColor) {
                mat.albedoColor = color;
            }
            if (mat.diffuseColor) {
                mat.diffuseColor = color;
            }
        }

        if (cfg.emissive) {
            const emissive = new BABYLON.Color3(cfg.emissive.r, cfg.emissive.g, cfg.emissive.b);
            mat.emissiveColor = emissive;
        }

        if (cfg.specular) {
            const specular = new BABYLON.Color3(cfg.specular.r, cfg.specular.g, cfg.specular.b);
            if (mat.specularColor) {
                mat.specularColor = specular;
            }
        }

        if (cfg.metallic !== undefined && mat.metallic !== undefined) {
            mat.metallic = cfg.metallic;
        }

        if (cfg.roughness !== undefined && mat.roughness !== undefined) {
            mat.roughness = cfg.roughness;
        }

        mesh.material = mat;
    }

    // ========== RENDER MODE COORDINATORS ==========
    enableBlueprintMode() {
        console.log("🎨 Activation mode blueprint");

        const config = Config.renderModes.BLUEPRINT;

        // Appliquer le fond
        const bg = config.background;
        this.scene.clearColor = new BABYLON.Color4(bg.r, bg.g, bg.b, bg.a);

        // Appliquer le style à tous les meshes
        this.allRingMeshes.forEach(mesh => {
            if (mesh.getTotalVertices() === 0) return;
            this.applyMaterialStyle(mesh, config);
        });

        console.log(`✅ Mode blueprint activé`);
        this.currentRenderMode = 'BLUEPRINT';
    }

    enableRealisticMode() {
        console.log("🎨 Activation mode réaliste");

        const config = Config.renderModes.REALISTIC;

        // Appliquer le fond
        const bg = config.background;
        this.scene.clearColor = new BABYLON.Color4(bg.r, bg.g, bg.b, bg.a);

        // Restaurer les matériaux originaux
        this.allRingMeshes.forEach(mesh => {
            if (mesh.getTotalVertices() === 0) return;
            this.applyMaterialStyle(mesh, config);
        });

        console.log("✅ Mode réaliste activé");
        this.currentRenderMode = 'REALISTIC';
    }

    enableXRayMode() {
        console.log("🎨 Activation mode X-Ray");

        const config = Config.renderModes.XRAY;

        // Appliquer le fond
        const bg = config.background;
        this.scene.clearColor = new BABYLON.Color4(bg.r, bg.g, bg.b, bg.a);

        // Appliquer le style X-Ray
        this.allRingMeshes.forEach(mesh => {
            if (mesh.getTotalVertices() === 0) return;
            this.applyMaterialStyle(mesh, config);
        });

        console.log("✅ Mode X-Ray activé");
        this.currentRenderMode = 'XRAY';
    }

    cycleRenderMode() {
        console.log(`🔄 Cycle demandé depuis mode: ${this.currentRenderMode}`);

        try {
            // Cycle: BLUEPRINT -> REALISTIC -> XRAY -> BLUEPRINT
            switch (this.currentRenderMode) {
                case 'BLUEPRINT':
                    this.enableRealisticMode();
                    console.log("📐 → 🎨 Passage en mode RÉALISTE");
                    break;
                case 'REALISTIC':
                    this.enableXRayMode();
                    console.log("🎨 → 🔍 Passage en mode X-RAY");
                    break;
                case 'XRAY':
                    this.enableBlueprintMode();
                    console.log("🔍 → 📐 Passage en mode BLUEPRINT");
                    break;
                default:
                    console.warn(`⚠️ Mode inconnu: ${this.currentRenderMode}, reset en BLUEPRINT`);
                    this.enableBlueprintMode();
            }

            console.log(`✅ Nouveau mode: ${this.currentRenderMode}`);
        } catch (error) {
            console.error("❌ Erreur lors du cycle de mode:", error);
        }
    }

    identifyStones() {
        this.stones = {
            marquise: [],
            oval: [],
            round: [],
            all: []
        };

        this.metals = {
            metal: [],
            bezel: [],
            prong: [],
            head_prong: [],
            object: [],
            all: []
        };

        console.log("📋 ANALYSE DE TOUS LES MESHES:");

        this.allRingMeshes.forEach((mesh, index) => {
            const name = mesh.name.toLowerCase();

            // Identification des pierres
            if (name.includes('diamond') || name.includes('gem')) {
                this.stones.all.push(mesh);

                if (name.includes('marquise')) {
                    this.stones.marquise.push(mesh);
                } else if (name.includes('oval')) {
                    this.stones.oval.push(mesh);
                } else if (name.includes('round')) {
                    this.stones.round.push(mesh);
                }
            }

            // Identification du métal
            if (name.includes('metal') || name.includes('bezel') || name.includes('prong') || name.includes('object')) {
                this.metals.all.push(mesh);

                if (name.includes('metal')) {
                    this.metals.metal.push(mesh);
                } else if (name.includes('bezel')) {
                    this.metals.bezel.push(mesh);
                } else if (name.includes('prong')) {
                    if (name.includes('head')) {
                        this.metals.head_prong.push(mesh);
                    } else {
                        this.metals.prong.push(mesh);
                    }
                } else if (name.includes('object')) {
                    this.metals.object.push(mesh);
                }
            }
        });

        console.log("💎 PIERRES:", this.stones.all.length);
        console.log("🔩 MÉTAL:", this.metals.all.length);

        this.setupStoneInteraction();
    }

    setupStoneInteraction() {
        this.selectedStone = null;
        this.selectedMetal = null;

        this.stoneHighlight = new BABYLON.HighlightLayer("stoneHighlight", this.scene);
        this.metalHighlight = new BABYLON.HighlightLayer("metalHighlight", this.scene);

        this.scene.onPointerDown = (evt, pickInfo) => {
            if (pickInfo.hit && pickInfo.pickedMesh) {
                let mesh = pickInfo.pickedMesh;

                const isStone = this.stones.all.includes(mesh);
                const isMetal = this.metals.all.includes(mesh);

                if (isStone) {
                    if (this.selectedMetal) {
                        this.metalHighlight.removeMesh(this.selectedMetal);
                        this.selectedMetal = null;
                    }

                    if (this.selectedStone === mesh) {
                        this.stoneHighlight.removeMesh(mesh);
                        this.selectedStone = null;
                        console.log("💎 Pierre désélectionnée");
                    } else {
                        if (this.selectedStone) {
                            this.stoneHighlight.removeMesh(this.selectedStone);
                        }
                        this.selectedStone = mesh;
                        this.stoneHighlight.addMesh(mesh, BABYLON.Color3.Green());
                        console.log(`💎 Pierre sélectionnée: ${mesh.name}`);
                        this.displayStoneInfo(mesh);
                    }
                } else if (isMetal) {
                    if (this.selectedStone) {
                        this.stoneHighlight.removeMesh(this.selectedStone);
                        this.selectedStone = null;
                    }

                    if (this.selectedMetal === mesh) {
                        this.metalHighlight.removeMesh(mesh);
                        this.selectedMetal = null;
                        console.log("🔩 Métal désélectionné");
                    } else {
                        if (this.selectedMetal) {
                            this.metalHighlight.removeMesh(this.selectedMetal);
                        }
                        this.selectedMetal = mesh;
                        this.metalHighlight.addMesh(mesh, BABYLON.Color3.Blue());
                        console.log(`🔩 Métal sélectionné: ${mesh.name}`);
                        this.displayMetalInfo(mesh);
                    }
                }
            }
        };
    }

    displayStoneInfo(stone) {
        console.log("═══════════════════════════════");
        console.log("💎 INFORMATIONS PIERRE");
        console.log("Nom:", stone.name);
        console.log("Position:", stone.position);
        console.log("═══════════════════════════════");
    }

    displayMetalInfo(metal) {
        console.log("═══════════════════════════════");
        console.log("🔩 INFORMATIONS MÉTAL");
        console.log("Nom:", metal.name);
        console.log("Position:", metal.position);
        console.log("═══════════════════════════════");
    }

    enter() {
        const camera = this.scene.getCameraByName("cadCamera");
        if (camera) camera.attachControl(this.engine.getRenderingCanvas(), true);

        // Hide all office UI elements
        const statusModal = document.getElementById("statusModal");
        const backButton = document.getElementById("backButton");
        const infoBulle = document.getElementById("infoBulle");

        if (statusModal) statusModal.classList.add("hidden");
        if (backButton) backButton.classList.add("hidden");
        if (infoBulle) infoBulle.classList.add("hidden");

        console.log("Scène CAO activée");

        // Supprimer l'ancien listener s'il existe
        if (this.keydownHandler) {
            window.removeEventListener('keydown', this.keydownHandler);
        }

        // Créer et stocker le handler
        this.keydownHandler = (e) => {
            if (e.key === 'i' || e.key === 'I') {
                if (this.scene.debugLayer.isVisible()) {
                    this.scene.debugLayer.hide();
                } else {
                    this.scene.debugLayer.show();
                }
            }

            // Cycle des modes de rendu avec 'R'
            if (e.key === 'r' || e.key === 'R') {
                this.cycleRenderMode();
            }
        };

        // Ajouter le listener
        window.addEventListener('keydown', this.keydownHandler);
    }

    exit() {
        const camera = this.scene.getCameraByName("cadCamera");
        if (camera) camera.detachControl();

        // Nettoyer l'event listener
        if (this.keydownHandler) {
            window.removeEventListener('keydown', this.keydownHandler);
            this.keydownHandler = null;
        }
    }
}
