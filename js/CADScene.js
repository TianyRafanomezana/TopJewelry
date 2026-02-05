export class CADScene {
    constructor(engine, game) {
        this.engine = engine;
        this.game = game;
        this.scene = null;
        this.ringMesh = null; // Reference to the ring model
    }

    async init() {
        this.scene = new BABYLON.Scene(this.engine);

        // 1. Fond blanc (Blueprint style)
        this.scene.clearColor = new BABYLON.Color4(1, 1, 1, 1); // Blanc pur

        // 2. Caméra Orbitale avec zoom activé - Optimisé pour trackpad
        const camera = new BABYLON.ArcRotateCamera("cadCamera", Math.PI / 4, Math.PI / 3, 15, BABYLON.Vector3.Zero(), this.scene);

        // Zoom adapté au trackpad
        camera.wheelPrecision = 10; // Plus petit = zoom plus rapide (meilleur pour trackpad)
        camera.pinchPrecision = 50; // Geste pinch sur trackpad tactile

        // Limites de zoom
        camera.lowerRadiusLimit = 2;  // Très proche
        camera.upperRadiusLimit = 50; // Très loin

        // Sensibilité de rotation
        camera.angularSensibilityX = 1000; // Plus rapide pour trackpad
        camera.angularSensibilityY = 1000;

        camera.attachControl(this.engine.getRenderingCanvas(), true);

        // Empêcher le zoom de la page web sur le canvas
        const canvas = this.engine.getRenderingCanvas();
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault(); // Empêche le zoom du navigateur
        }, { passive: false });

        // Pour Safari/iOS
        canvas.addEventListener('gesturestart', (e) => {
            e.preventDefault();
        });
        canvas.addEventListener('gesturechange', (e) => {
            e.preventDefault();
        });
        canvas.addEventListener('gestureend', (e) => {
            e.preventDefault();
        });

        // 3. Lumières
        const hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), this.scene);
        hemiLight.intensity = 0.7;

        const dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), this.scene);
        dirLight.intensity = 0.5;

        // 4. Sol avec grille simple
        const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 20, height: 20 }, this.scene);
        const groundMat = new BABYLON.StandardMaterial("groundMat", this.scene);
        groundMat.diffuseColor = new BABYLON.Color3(0.95, 0.95, 0.95); // Gris très clair
        groundMat.specularColor = new BABYLON.Color3(0, 0, 0);
        ground.material = groundMat;

        // Grille visuelle avec des lignes
        this.createGridLines();

        // 5. Charger la bague 3D
        await this.loadRingModel();

        return this.scene;
    }

    async loadRingModel() {
        try {
            const result = await BABYLON.SceneLoader.ImportMeshAsync(
                "",
                "object/",
                "ring_CAO_bigCe.glb",
                this.scene
            );

            console.log("✅ Bague chargée :", result);
            console.log("📦 Nombre de meshes :", result.meshes.length);

            // Log tous les meshes
            result.meshes.forEach((mesh, index) => {
                console.log(`Mesh ${index}:`, {
                    name: mesh.name,
                    position: mesh.position,
                    scaling: mesh.scaling,
                    isVisible: mesh.isVisible,
                    isEnabled: mesh.isEnabled(),
                    material: mesh.material ? mesh.material.name : "none",
                    boundingBox: mesh.getBoundingInfo()
                });
            });

            // Récupérer le root/parent mesh
            let ring = result.meshes[0];

            // Si le premier mesh est un parent vide, chercher les enfants
            if (result.meshes.length > 1) {
                // Prendre le deuxième mesh s'il existe
                ring = result.meshes[1] || result.meshes[0];
            }

            if (ring) {
                // S'assurer que le mesh est visible
                result.meshes.forEach(mesh => {
                    mesh.isVisible = true;
                    mesh.setEnabled(true);

                    // Si le mesh a un matériau, s'assurer qu'il est visible
                    if (mesh.material) {
                        mesh.material.alpha = 1.0;
                        if (mesh.material.wireframe !== undefined) {
                            mesh.material.wireframe = false;
                        }
                    }
                });

                // Utiliser le root pour positionner tout le modèle
                const root = result.meshes[0];

                // Positionner au-dessus du sol
                root.position = new BABYLON.Vector3(0, 3, 0);

                // AGRANDIR LE MODÈLE - probablement trop petit
                // Commencer avec une échelle x100
                root.scaling = new BABYLON.Vector3(100, 100, 100);

                console.log("📏 Échelle appliquée: 100x");
                console.log("📍 Position:", root.position);

                // Animation de rotation sur le root
                this.scene.registerBeforeRender(() => {
                    root.rotation.y += 0.01;
                });

                // Log des animations si présentes
                if (this.scene.animationGroups && this.scene.animationGroups.length > 0) {
                    console.log("🎬 Animations trouvées :", this.scene.animationGroups.map(ag => ag.name));
                }

                this.ringMesh = root;
                this.allRingMeshes = result.meshes; // Stocker TOUS les meshes

                // Ajuster la caméra pour être sûr de voir l'objet
                const camera = this.scene.getCameraByName("cadCamera");
                if (camera) {
                    camera.target = new BABYLON.Vector3(0, 3, 0);
                    camera.radius = 15; // Distance de la caméra
                    console.log("🎥 Caméra ciblant:", camera.target, "Distance:", camera.radius);
                }

                // Activer les interactions sur la bague
                this.setupRingInteraction();

                // Activer l'effet blueprint/wireframe
                this.enableBlueprintMode();

                // Identifier et stocker les pierres
                this.identifyStones();

                console.log("✅ Bague configurée avec échelle 100x");
            }
        } catch (error) {
            console.error("❌ Erreur chargement bague :", error);
            // Fallback : créer un torus simple
            this.createFallbackRing();
        }
    }

    createFallbackRing() {
        const torus = BABYLON.MeshBuilder.CreateTorus("ring", { diameter: 2, thickness: 0.3, tessellation: 32 }, this.scene);
        torus.position.y = 2;
        const ringMat = new BABYLON.StandardMaterial("ringMat", this.scene);
        ringMat.diffuseColor = new BABYLON.Color3(1, 0.8, 0.2); // Or
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
                // Vérifier si on a cliqué sur la bague (root ou enfants)
                let mesh = pickInfo.pickedMesh;
                let isRingMesh = false;

                // Vérifier si c'est un enfant de ringMesh
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
                        // ZOOM IN - Vue de face centrée
                        console.log("🔍 Zoom sur la bague - Centre");

                        // Angles de vue de face
                        const frontAlpha = Math.PI / 2;     // 90° - vue de côté
                        const frontBeta = Math.PI / 2.5;    // Légèrement de dessus

                        // Animation : angles + distance (pas de décalage)
                        BABYLON.Animation.CreateAndStartAnimation(
                            "zoomInAlpha",
                            camera,
                            "alpha",
                            60,
                            45, // 0.75 secondes
                            camera.alpha,
                            frontAlpha,
                            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
                        );

                        BABYLON.Animation.CreateAndStartAnimation(
                            "zoomInBeta",
                            camera,
                            "beta",
                            60,
                            45,
                            camera.beta,
                            frontBeta,
                            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
                        );

                        BABYLON.Animation.CreateAndStartAnimation(
                            "zoomInRadius",
                            camera,
                            "radius",
                            60,
                            45,
                            camera.radius,
                            6, // Distance proche
                            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
                        );

                        isZoomed = true;
                    } else {
                        // ZOOM OUT - Retour à la vue initiale
                        console.log("🔙 Retour vue normale");

                        const defaultAlpha = Math.PI / 4;
                        const defaultBeta = Math.PI / 3;

                        BABYLON.Animation.CreateAndStartAnimation(
                            "zoomOutTarget",
                            camera,
                            "target",
                            60,
                            45,
                            camera.target,
                            new BABYLON.Vector3(0, 3, 0),
                            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
                        );

                        BABYLON.Animation.CreateAndStartAnimation(
                            "zoomOutAlpha",
                            camera,
                            "alpha",
                            60,
                            45,
                            camera.alpha,
                            defaultAlpha,
                            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
                        );

                        BABYLON.Animation.CreateAndStartAnimation(
                            "zoomOutBeta",
                            camera,
                            "beta",
                            60,
                            45,
                            camera.beta,
                            defaultBeta,
                            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
                        );

                        BABYLON.Animation.CreateAndStartAnimation(
                            "zoomOutRadius",
                            camera,
                            "radius",
                            60,
                            45,
                            camera.radius,
                            15, // Vue normale
                            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
                        );

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

        // Lignes parallèles à X
        for (let z = -size / 2; z <= size / 2; z += step) {
            lines.push([
                new BABYLON.Vector3(-size / 2, 0.01, z),
                new BABYLON.Vector3(size / 2, 0.01, z)
            ]);
        }

        // Lignes parallèles à Z
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

    enableBlueprintMode() {
        if (!this.allRingMeshes || this.allRingMeshes.length === 0) {
            console.error("❌ Pas de meshes à modifier");
            return;
        }

        console.log("🎨 Activation mode blueprint sur", this.allRingMeshes.length, "meshes");

        let modifiedCount = 0;

        this.allRingMeshes.forEach((mesh, index) => {
            // Ignorer le root node vide
            if (mesh.getTotalVertices() === 0) {
                console.log(`Mesh ${index} (${mesh.name}) ignoré - pas de vertices`);
                return;
            }

            try {
                // 1. WIREFRAME MODE
                if (mesh.material) {
                    mesh.material.wireframe = true;
                    mesh.material.alpha = 1.0; // Opaque

                    // Noir mat sans reflets
                    if (mesh.material.albedoColor) {
                        mesh.material.albedoColor = new BABYLON.Color3(0, 0, 0);
                        mesh.material.metallic = 0;
                        mesh.material.roughness = 1;
                    } else if (mesh.material.diffuseColor) {
                        mesh.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
                        mesh.material.specularColor = new BABYLON.Color3(0, 0, 0); // Pas de reflets
                        mesh.material.emissiveColor = new BABYLON.Color3(0, 0, 0); // Pas d'émission
                    }

                    console.log(`✅ Mesh ${index} (${mesh.name}) - wireframe activé`);
                    modifiedCount++;
                } else {
                    // Créer un matériau wireframe noir mat
                    const wireMat = new BABYLON.StandardMaterial(`wire_${mesh.name}`, this.scene);
                    wireMat.wireframe = true;
                    wireMat.diffuseColor = new BABYLON.Color3(0, 0, 0); // Noir
                    wireMat.specularColor = new BABYLON.Color3(0, 0, 0); // Pas de reflets
                    wireMat.emissiveColor = new BABYLON.Color3(0, 0, 0); // Pas d'émission
                    wireMat.alpha = 1.0;
                    mesh.material = wireMat;

                    console.log(`✅ Mesh ${index} (${mesh.name}) - nouveau matériau wireframe`);
                    modifiedCount++;
                }
            } catch (error) {
                console.error(`❌ Erreur sur mesh ${index}:`, error);
            }
        });

        console.log(`✅ Mode blueprint activé sur ${modifiedCount} meshes`);
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
            all: []
        };

        console.log("📋 ANALYSE DE TOUS LES MESHES:");
        console.log("═".repeat(50));

        this.allRingMeshes.forEach((mesh, index) => {
            const name = mesh.name.toLowerCase();
            const vertices = mesh.getTotalVertices();

            // Log détaillé de chaque mesh
            console.log(`[${index}] ${mesh.name}`, {
                vertices: vertices,
                hasParent: !!mesh.parent,
                hasMaterial: !!mesh.material,
                position: mesh.position
            });

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
            if (name.includes('metal') || name.includes('bezel')) {
                this.metals.all.push(mesh);

                if (name.includes('metal')) {
                    this.metals.metal.push(mesh);
                } else if (name.includes('bezel')) {
                    this.metals.bezel.push(mesh);
                }
            }
        });

        console.log("═".repeat(50));
        console.log("💎 PIERRES IDENTIFIÉES:", {
            marquise: this.stones.marquise.length,
            oval: this.stones.oval.length,
            round: this.stones.round.length,
            total: this.stones.all.length
        });

        console.log("🔩 MÉTAL IDENTIFIÉ:", {
            metal: this.metals.metal.length,
            bezel: this.metals.bezel.length,
            total: this.metals.all.length
        });
        console.log("═".repeat(50));

        // Activer la sélection des pierres et métaux
        this.setupStoneInteraction();
    }

    setupStoneInteraction() {
        this.selectedStone = null;
        this.selectedMetal = null;

        // Créer des highlight layers pour la sélection
        this.stoneHighlight = new BABYLON.HighlightLayer("stoneHighlight", this.scene);
        this.metalHighlight = new BABYLON.HighlightLayer("metalHighlight", this.scene);

        // Override du click pour sélectionner pierres et métaux
        this.scene.onPointerDown = (evt, pickInfo) => {
            if (pickInfo.hit && pickInfo.pickedMesh) {
                let mesh = pickInfo.pickedMesh;

                // Vérifier si c'est une pierre
                const isStone = this.stones.all.includes(mesh);
                const isMetal = this.metals.all.includes(mesh);

                if (isStone) {
                    // Désélectionner le métal si sélectionné
                    if (this.selectedMetal) {
                        this.metalHighlight.removeMesh(this.selectedMetal);
                        this.selectedMetal = null;
                    }

                    // Sélection de pierre
                    if (this.selectedStone === mesh) {
                        // Désélectionner
                        this.stoneHighlight.removeMesh(mesh);
                        this.selectedStone = null;
                        console.log("💎 Pierre désélectionnée");
                    } else {
                        // Sélectionner nouvelle pierre
                        if (this.selectedStone) {
                            this.stoneHighlight.removeMesh(this.selectedStone);
                        }
                        this.selectedStone = mesh;
                        this.stoneHighlight.addMesh(mesh, BABYLON.Color3.Green());
                        console.log(`💎 Pierre sélectionnée: ${mesh.name}`);
                        this.displayStoneInfo(mesh);
                    }
                } else if (isMetal) {
                    // Désélectionner la pierre si sélectionnée
                    if (this.selectedStone) {
                        this.stoneHighlight.removeMesh(this.selectedStone);
                        this.selectedStone = null;
                    }

                    // Sélection de métal
                    if (this.selectedMetal === mesh) {
                        // Désélectionner
                        this.metalHighlight.removeMesh(mesh);
                        this.selectedMetal = null;
                        console.log("🔩 Métal désélectionné");
                    } else {
                        // Sélectionner nouveau métal
                        if (this.selectedMetal) {
                            this.metalHighlight.removeMesh(this.selectedMetal);
                        }
                        this.selectedMetal = mesh;
                        this.metalHighlight.addMesh(mesh, BABYLON.Color3.Blue());
                        console.log(`🔩 Métal sélectionné: ${mesh.name}`);
                        this.displayMetalInfo(mesh);
                    }
                } else {
                    // Vérifier si c'est un clic sur la bague pour le zoom
                    let isRingMesh = false;
                    let checkMesh = mesh;
                    while (checkMesh) {
                        if (checkMesh === this.ringMesh) {
                            isRingMesh = true;
                            break;
                        }
                        checkMesh = checkMesh.parent;
                    }

                    if (isRingMesh && !isStone && !isMetal) {
                        // Code de zoom existant (simplifié)
                        this.handleRingZoom();
                    }
                }
            }
        };
    }

    displayStoneInfo(stone) {
        console.log("═══════════════════════════════");
        console.log("💎 INFORMATIONS PIERRE");
        console.log("═══════════════════════════════");
        console.log("Nom:", stone.name);
        console.log("Position:", stone.position);
        console.log("Rotation:", stone.rotation);
        console.log("Échelle:", stone.scaling);
        if (stone.material) {
            console.log("Matériau:", stone.material.name);
        }
        console.log("═══════════════════════════════");
    }

    displayMetalInfo(metal) {
        console.log("═══════════════════════════════");
        console.log("🔩 INFORMATIONS MÉTAL");
        console.log("═══════════════════════════════");
        console.log("Nom:", metal.name);
        console.log("Position:", metal.position);
        console.log("Rotation:", metal.rotation);
        console.log("Échelle:", metal.scaling);
        if (metal.material) {
            console.log("Matériau:", metal.material.name);
            console.log("Type:", metal.material.getClassName());
        }
        console.log("═══════════════════════════════");
    }

    handleRingZoom() {
        // Logic de zoom existante (à implémenter si nécessaire)
        console.log("🔍 Zoom sur la bague");
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

        // Activer l'inspecteur avec la touche 'i'
        window.addEventListener('keydown', (e) => {
            if (e.key === 'i' || e.key === 'I') {
                if (this.scene.debugLayer.isVisible()) {
                    this.scene.debugLayer.hide();
                } else {
                    this.scene.debugLayer.show();
                }
            }
        });
    }

    exit() {
        const camera = this.scene.getCameraByName("cadCamera");
        if (camera) camera.detachControl();
    }
}
