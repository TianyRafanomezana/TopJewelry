import { Config } from "./Config.js";

export class InteractionManager {
    constructor(scene, uiManager, sceneManager, onScreenEnter) {
        this.scene = scene;
        this.uiManager = uiManager;
        this.sceneManager = sceneManager;
        this.onScreenEnter = onScreenEnter; // Callback pour changer de scène
        this.lastHoveredMesh = null;
        this.isZoomed = false; // État 1 : Focus caméra
        this.isScreenOn = false; // État 2 : Ordi allumé
        this.enabled = true; // Interaction enabled by default

        this.setupPointerMove();
        this.setupPointerDown();

        this.uiManager.onBackClick(() => this.resetCamera());

        // Allow clicking on status modal to toggle power
        this.uiManager.onStatusModalClick(() => {
            if (this.isZoomed) {
                this.togglePower();
            }
        });

        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                this.resetCamera();
            }
        });
    }

    // ... (rest of methods until focusOnScreen)

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

                // Déclencher la transition vers la scène CAO après le zoom
                if (this.onScreenEnter) {
                    // Petit délai pour l'effet dramatique
                    setTimeout(() => {
                        this.onScreenEnter();
                    }, 500);
                }
            });
        }
    }

    setupPointerMove() {
        this.scene.onPointerMove = (evt) => {
            if (!this.enabled) return; // Skip if interactions disabled

            const pickResult = this.scene.multiPick(this.scene.pointerX, this.scene.pointerY);
            let bestCandidate = null;

            if (pickResult) {
                // Filter meshes that have interaction metadata
                let interactables = pickResult
                    .map(p => p.pickedMesh)
                    .filter(mesh => mesh.metadata && mesh.metadata.interaction);

                // Filter by zoom state
                interactables = interactables.filter(mesh => {
                    const config = mesh.metadata.interaction;
                    // If interaction requires zoom but we're not zoomed, exclude it
                    if (config.zoomRequired === true && !this.isZoomed) return false;
                    // If interaction requires NO zoom but we ARE zoomed, exclude it
                    if (config.zoomRequired === false && this.isZoomed) return false;

                    // Screen interaction only available when PC is on
                    if (config.type === "screen_action" && !this.isScreenOn) return false;

                    return true;
                });

                // Sort by priority (Highest first)
                if (interactables.length > 0) {
                    interactables.sort((a, b) => b.metadata.interaction.priority - a.metadata.interaction.priority);
                    bestCandidate = interactables[0];
                }
            }

            if (bestCandidate) {
                if (this.lastHoveredMesh !== bestCandidate) {
                    this.resetVisuals(); // Ensure previous state is cleaned up
                    this.lastHoveredMesh = bestCandidate;
                    const config = bestCandidate.metadata.interaction;

                    // Adapts tooltip based on State
                    let tooltipText = config.tooltip;
                    let cursorStyle = config.cursor;

                    // Special Case: Screen
                    if (config.type === "screen_action") {
                        if (this.isZoomed) {
                            if (this.isScreenOn) {
                                // PC is on - screen is clickable
                                tooltipText = "💻 Cliquez pour découvrir la CAO";
                                cursorStyle = "pointer";
                            } else {
                                // PC is off - screen not interactive
                                tooltipText = "";
                                cursorStyle = "default";
                            }
                        } else {
                            tooltipText = "🔍 Cliquez pour s'approcher"; // Far away
                        }
                    }
                    else if (config.type === "power_switch") {
                        tooltipText = this.isScreenOn ? "🔴 Éteindre" : "🟢 Allumer";
                        cursorStyle = "pointer";
                    }

                    // Apply Cursor
                    if (cursorStyle) document.body.style.cursor = cursorStyle;

                    // Apply Tooltip
                    if (tooltipText) this.uiManager.showTooltip(tooltipText);
                    else this.uiManager.hideTooltip();

                    // Apply Visuals (Highlight)
                    if (config.highlight && !this.isScreenOn) { // Don't highlight if screen is on (clean look)
                        const targetName = config.highlight.target || bestCandidate.name;
                        const colorDef = Config.visuals[config.highlight.color] || { r: 1, g: 1, b: 1 };
                        this.sceneManager.updateHighlight(targetName, true, new BABYLON.Color3(colorDef.r, colorDef.g, colorDef.b));
                    }

                    // Apply Specific Visuals
                    if (config.visuals && config.visuals.includes("pulse") && !this.isZoomed) {
                        this.sceneManager.startPulse(true);
                    }
                }
            } else {
                this.resetVisuals();
            }
        };
    }

    resetVisuals() {
        if (!this.lastHoveredMesh) return; // Déjà reset

        const config = this.lastHoveredMesh.metadata ? this.lastHoveredMesh.metadata.interaction : null;
        this.lastHoveredMesh = null;
        this.uiManager.hideTooltip();
        document.body.style.cursor = "default";

        // Global Reset (Safe)
        this.sceneManager.updateHighlight(Config.meshes.pcComponents, false);
        this.sceneManager.startPulse(false);
        this.sceneManager.createEchoParticles(Config.meshes.hitboxZonePC, false);

        // Reset specific alpha if needed (naive approach or store original alpha)
        const ecran = this.scene.getMeshByName(Config.meshes.hitboxScreen);
        if (ecran) ecran.material.alpha = 0.5;
    }

    setupPointerDown() {
        this.scene.onPointerDown = (evt, pickResult) => {
            if (!this.enabled) return; // Skip if interactions disabled

            const picks = this.scene.multiPick(this.scene.pointerX, this.scene.pointerY);
            let clickedMesh = null;

            if (picks) {
                let interactables = picks
                    .map(p => p.pickedMesh)
                    .filter(mesh => mesh.metadata && mesh.metadata.interaction);

                // Filter by zoom state
                interactables = interactables.filter(mesh => {
                    const config = mesh.metadata.interaction;
                    if (config.zoomRequired === true && !this.isZoomed) return false;
                    if (config.zoomRequired === false && this.isZoomed) return false;

                    // Screen interaction only available when PC is on
                    if (config.type === "screen_action" && !this.isScreenOn) return false;

                    return true;
                });

                if (interactables.length > 0) {
                    // Sort by priority
                    interactables.sort((a, b) => b.metadata.interaction.priority - a.metadata.interaction.priority);
                    clickedMesh = interactables[0];
                }
            }

            if (clickedMesh) {
                const config = clickedMesh.metadata.interaction;

                if (config.type === "focus") {
                    if (!this.isZoomed) this.focusOnScreen();
                }
                else if (config.type === "screen_action") {
                    if (!this.isZoomed) {
                        this.focusOnScreen();
                    } else if (this.isScreenOn) {
                        // When zoomed and PC is on, go to CAD scene
                        this.uiManager.updateProgress(2); // Move to CAO step
                        if (this.onScreenEnter) this.onScreenEnter();
                    }
                    // When zoomed but PC is off, do nothing
                }
                else if (config.type === "power_switch") {
                    this.togglePower();
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
                // Animation finished - show status modal
                this.uiManager.showStatusModal(this.isScreenOn);
            });
        }
    }

    turnOnScreen() {
        if (this.isScreenOn) return;
        this.isScreenOn = true;

        // Turn on power LED
        this.sceneManager.setPowerLED(true);

        // Update status modal if zoomed
        if (this.isZoomed) {
            this.uiManager.showStatusModal(true);
        }

        // Simulate boot delay with fade-in
        setTimeout(() => {
            this.sceneManager.changeScreenContent(Config.assets.screenPlaceholder, true);
        }, 800); // 800ms boot delay

        this.resetVisuals(); // Clean highlights
    }

    turnOffScreen() {
        if (!this.isScreenOn) return;
        this.isScreenOn = false;

        // Turn off power LED
        this.sceneManager.setPowerLED(false);

        // Update status modal if zoomed
        if (this.isZoomed) {
            this.uiManager.showStatusModal(false);
        }

        // Immediate fade-out
        this.sceneManager.changeScreenContent(null);
    }

    togglePower() {
        if (this.isScreenOn) {
            this.turnOffScreen();
        } else {
            this.turnOnScreen();
        }
    }

    resetCamera() {
        const camera = this.scene.activeCamera;
        if (camera) {
            this.uiManager.hideBackButton();
            this.uiManager.hideStatusModal();

            // Turn off screen and LED
            if (this.isScreenOn) {
                this.isScreenOn = false;
                this.sceneManager.setPowerLED(false);
            }
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

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
        this.resetVisuals(); // Clean up any active hover effects
        this.uiManager.hideTooltip();
    }
}
