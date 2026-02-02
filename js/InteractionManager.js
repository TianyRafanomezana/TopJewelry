import { Config } from "./Config.js";

export class InteractionManager {
    constructor(scene, uiManager, sceneManager) {
        this.scene = scene;
        this.uiManager = uiManager;
        this.sceneManager = sceneManager;
        this.lastHoveredMesh = null;
        this.isZoomed = false; // État pour savoir si on est en focus

        this.setupPointerMove();
        this.setupPointerDown();

        this.uiManager.onBackClick(() => this.resetCamera());

        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                this.resetCamera();
            }
        });
    }

    setupPointerMove() {
        this.scene.onPointerMove = (evt) => {
            // Si on est zoomé, on désactive les interactions de survol
            if (this.isZoomed) {
                this.scene.getEngine().getRenderingCanvas().style.cursor = "default";
                return;
            }

            const pickResult = this.scene.multiPick(this.scene.pointerX, this.scene.pointerY);
            let bestCandidate = null;
            // ... (rest of function) ...


            if (pickResult) {
                for (let i = 0; i < pickResult.length; i++) {
                    const mesh = pickResult[i].pickedMesh;

                    if (mesh.name.includes(Config.meshes.hitboxScreen)) {
                        bestCandidate = mesh;
                        break;
                    }

                    if (mesh.name.includes(Config.meshes.hitboxZonePC) && !bestCandidate) {
                        bestCandidate = mesh;
                    }
                }
            }

            if (bestCandidate) {
                if (this.lastHoveredMesh !== bestCandidate) {
                    this.lastHoveredMesh = bestCandidate;

                    if (bestCandidate.name.includes(Config.meshes.hitboxScreen)) {
                        this.uiManager.showTooltip(Config.ui.tooltipScreen);
                        document.body.style.cursor = "pointer";
                        bestCandidate.material.alpha = 0.8;
                    }
                    else if (bestCandidate.name.includes(Config.meshes.hitboxZonePC)) {
                        this.uiManager.showTooltip(Config.ui.tooltipEcho);

                        // 1. Highlight Config Color (Seulement l'écran)
                        const c = Config.visuals.echoHighlightColor;
                        this.sceneManager.updateHighlight(Config.meshes.screenMonitor, true, new BABYLON.Color3(c.r, c.g, c.b));

                        // 2. Pulsation
                        this.sceneManager.startPulse(true);

                        // 3. Particules
                        this.sceneManager.createEchoParticles(Config.meshes.hitboxZonePC, true);

                        document.body.style.cursor = "help";

                        // Reset de la hitbox écran
                        const ecran = this.scene.getMeshByName(Config.meshes.hitboxScreen);
                        if (ecran) ecran.material.alpha = 0.5;
                    }
                }
            } else {
                this.lastHoveredMesh = null;
                this.uiManager.hideTooltip();
                document.body.style.cursor = "default";

                // Reset visuel
                this.sceneManager.updateHighlight(Config.meshes.screenMonitor, false);
                // On nettoie aussi les autres au cas où (si on change de logique plus tard)
                Config.meshes.pcComponents.forEach(name => {
                    this.sceneManager.updateHighlight(name, false);
                });
                this.sceneManager.startPulse(false);
                this.sceneManager.createEchoParticles(Config.meshes.hitboxZonePC, false);

                const ecran = this.scene.getMeshByName(Config.meshes.hitboxScreen);
                if (ecran) ecran.material.alpha = 0.5;
            }
        };
    }

    setupPointerDown() {
        this.scene.onPointerDown = (evt, pickResult) => {
            const picks = this.scene.multiPick(this.scene.pointerX, this.scene.pointerY);
            let clickedMesh = null;

            if (picks) {
                for (let i = 0; i < picks.length; i++) {
                    const mesh = picks[i].pickedMesh;
                    if (this.lastHoveredMesh) {
                        // On arrête les effets de zone si on clique/focus
                        this.sceneManager.startPulse(false);
                        this.sceneManager.createEchoParticles(Config.meshes.hitboxZonePC, false);

                        this.sceneManager.updateHighlight(Config.meshes.screenMonitor, false);
                        Config.meshes.pcComponents.forEach(name => {
                            this.sceneManager.updateHighlight(name, false);
                        });
                    }
                    if (mesh.name === (Config.meshes.hitboxScreen)) {
                        clickedMesh = mesh;
                        break;
                    }
                    if (mesh.name === (Config.meshes.hitboxZonePC) && !clickedMesh) {
                        clickedMesh = mesh;
                    }
                }
            }

            if (clickedMesh) {
                if (clickedMesh.name === Config.meshes.hitboxScreen || clickedMesh.name === Config.meshes.hitboxZonePC) {
                    this.focusOnScreen();
                }
            }
        };
    }

    focusOnScreen() {
        const camera = this.scene.activeCamera;
        const targetMesh = this.scene.getMeshByName(Config.meshes.hitboxScreen);

        if (camera && targetMesh) {
            this.isZoomed = true; // On verrouille les interactions
            this.uiManager.showBackButton();

            camera.lowerRadiusLimit = null;
            camera.upperRadiusLimit = null;

            const targetPosition = targetMesh.getAbsolutePosition();

            BABYLON.Animation.CreateAndStartAnimation("animTarget", camera, "target", 60, 60, camera.target, targetPosition, 2, new BABYLON.SineEase());
            BABYLON.Animation.CreateAndStartAnimation("animRadius", camera, "radius", 60, 60, camera.radius, 1.5, 2, new BABYLON.SineEase());

            let targetAlpha = Math.PI / 2;
            if (Math.abs(targetAlpha - camera.alpha) > Math.PI) {
                if (camera.alpha > targetAlpha) {
                    camera.alpha -= 2 * Math.PI;
                } else {
                    camera.alpha += 2 * Math.PI;
                }
            }

            BABYLON.Animation.CreateAndStartAnimation("animBeta", camera, "beta", 60, 60, camera.beta, Math.PI / 2, 2, new BABYLON.SineEase());

            BABYLON.Animation.CreateAndStartAnimation("animAlpha", camera, "alpha", 60, 60, camera.alpha, targetAlpha, 2, new BABYLON.SineEase(), () => {
                this.sceneManager.changeScreenContent(Config.assets.screenPlaceholder);
            });
        }
    }

    resetCamera() {
        const camera = this.scene.activeCamera;
        if (camera) {
            this.uiManager.hideBackButton();
            this.sceneManager.changeScreenContent(null);

            setTimeout(() => {
                const initialTarget = BABYLON.Vector3.Zero();

                BABYLON.Animation.CreateAndStartAnimation("animTargetBack", camera, "target", 60, 60, camera.target, initialTarget, 2, new BABYLON.SineEase());
                BABYLON.Animation.CreateAndStartAnimation("animBetaBack", camera, "beta", 60, 60, camera.beta, Math.PI / 2, 2, new BABYLON.SineEase());
                BABYLON.Animation.CreateAndStartAnimation("animAlphaBack", camera, "alpha", 60, 60, camera.alpha, Math.PI / 2, 2, new BABYLON.SineEase());

                BABYLON.Animation.CreateAndStartAnimation("animRadiusBack", camera, "radius", 60, 60, camera.radius, 5, 2, new BABYLON.SineEase(), () => {
                    camera.lowerRadiusLimit = 5;
                    camera.upperRadiusLimit = 5;
                    camera.panningSensibility = 0;
                    this.isZoomed = false; // On ne déverrouille qu'à la fin complète du retour
                });
            }, 500);
        }
    }
}
