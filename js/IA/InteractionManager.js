import { Config } from "./Config.js";
import { changeScreenContent, setLEDPower, updateHighlight } from "./OfficeHelper.js";

export class InteractionManager {
    constructor(scene, uiManager, highlightLayer, onScreenEnter) {
        this.scene = scene;
        this.uiManager = uiManager;
        this.hl = highlightLayer; // HighlightLayer pour les effets
        this.onScreenEnter = onScreenEnter;
        this.lastHoveredMesh = null;
        this.isZoomed = false;
        this.isScreenOn = false;
        this.enabled = true;

        this.setupPointerMove();
        this.setupPointerDown();

        this.uiManager.onBackClick(() => this.resetCamera());

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

    setupPointerMove() {
        this.scene.onPointerMove = (evt) => {
            if (!this.enabled) return;

            const pickResult = this.scene.multiPick(this.scene.pointerX, this.scene.pointerY);
            let bestCandidate = null;

            if (pickResult) {
                let interactables = pickResult
                    .map(p => p.pickedMesh)
                    .filter(mesh => mesh.metadata && mesh.metadata.interaction);

                interactables = interactables.filter(mesh => {
                    const config = mesh.metadata.interaction;
                    if (config.zoomRequired === true && !this.isZoomed) return false;
                    if (config.zoomRequired === false && this.isZoomed) return false;
                    if (config.type === "screen_action" && !this.isScreenOn) return false;
                    return true;
                });

                if (interactables.length > 0) {
                    interactables.sort((a, b) => b.metadata.interaction.priority - a.metadata.interaction.priority);
                    bestCandidate = interactables[0];
                }
            }

            if (bestCandidate) {
                if (this.lastHoveredMesh !== bestCandidate) {
                    this.resetVisuals();
                    this.lastHoveredMesh = bestCandidate;
                    const config = bestCandidate.metadata.interaction;

                    let tooltipText = config.tooltip;
                    let cursorStyle = config.cursor;

                    if (config.type === "screen_action") {
                        if (this.isZoomed) {
                            if (this.isScreenOn) {
                                tooltipText = "💻 Cliquez pour découvrir la CAO";
                                cursorStyle = "pointer";
                            } else {
                                tooltipText = "";
                                cursorStyle = "default";
                            }
                        } else {
                            tooltipText = "🔍 Cliquez pour s'approcher";
                        }
                    }
                    else if (config.type === "power_switch") {
                        tooltipText = this.isScreenOn ? "🔴 Éteindre" : "🟢 Allumer";
                        cursorStyle = "pointer";
                    }

                    if (cursorStyle) document.body.style.cursor = cursorStyle;

                    if (tooltipText) this.uiManager.showTooltip(tooltipText);
                    else this.uiManager.hideTooltip();

                    // 🤖 Appel direct helper IA (plus de sceneManager)
                    if (config.highlight && !this.isScreenOn) {
                        const targetName = config.highlight.target || bestCandidate.name;
                        const colorDef = Config.visuals[config.highlight.color] || { r: 1, g: 1, b: 1 };
                        updateHighlight(this.scene, this.hl, targetName, true, new BABYLON.Color3(colorDef.r, colorDef.g, colorDef.b));
                    }
                }
            } else {
                this.resetVisuals();
            }
        };
    }

    resetVisuals() {
        if (!this.lastHoveredMesh) return;

        this.lastHoveredMesh = null;
        this.uiManager.hideTooltip();
        document.body.style.cursor = "default";

        // 🤖 Appel direct helper IA
        updateHighlight(this.scene, this.hl, Config.meshes.pcComponents, false);

        const ecran = this.scene.getMeshByName(Config.meshes.hitboxScreen);
        if (ecran && ecran.material) ecran.material.alpha = 0.5;
    }

    setupPointerDown() {
        this.scene.onPointerDown = (evt, pickResult) => {
            if (!this.enabled) return;

            const picks = this.scene.multiPick(this.scene.pointerX, this.scene.pointerY);
            let clickedMesh = null;

            if (picks) {
                let interactables = picks
                    .map(p => p.pickedMesh)
                    .filter(mesh => mesh.metadata && mesh.metadata.interaction);

                interactables = interactables.filter(mesh => {
                    const config = mesh.metadata.interaction;
                    if (config.zoomRequired === true && !this.isZoomed) return false;
                    if (config.zoomRequired === false && this.isZoomed) return false;
                    if (config.type === "screen_action" && !this.isScreenOn) return false;
                    return true;
                });

                if (interactables.length > 0) {
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
                        this.uiManager.updateProgress(2);
                        if (this.onScreenEnter) this.onScreenEnter();
                    }
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
            this.isZoomed = true;
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
                this.uiManager.showStatusModal(this.isScreenOn);
            });
        }
    }

    turnOnScreen() {
        if (this.isScreenOn) return;
        this.isScreenOn = true;

        // 🤖 Appel direct helper IA
        setLEDPower(this.scene, true);

        if (this.isZoomed) {
            this.uiManager.showStatusModal(true);
        }

        setTimeout(() => {
            // 🤖 Appel direct helper IA
            changeScreenContent(this.scene, Config.assets.screenPlaceholder, true);
        }, 800);

        this.resetVisuals();
    }

    turnOffScreen() {
        if (!this.isScreenOn) return;
        this.isScreenOn = false;

        // 🤖 Appel direct helper IA
        setLEDPower(this.scene, false);

        if (this.isZoomed) {
            this.uiManager.showStatusModal(false);
        }

        // 🤖 Appel direct helper IA
        changeScreenContent(this.scene, null);
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

            if (this.isScreenOn) {
                this.isScreenOn = false;
                // 🤖 Appel direct helper IA
                setLEDPower(this.scene, false);
            }
            // 🤖 Appel direct helper IA
            changeScreenContent(this.scene, null);

            setTimeout(() => {
                const initialTarget = BABYLON.Vector3.Zero();

                BABYLON.Animation.CreateAndStartAnimation("animTargetBack", camera, "target", 60, 60, camera.target, initialTarget, 2, new BABYLON.SineEase());
                BABYLON.Animation.CreateAndStartAnimation("animBetaBack", camera, "beta", 60, 60, camera.beta, Math.PI / 2, 2, new BABYLON.SineEase());
                BABYLON.Animation.CreateAndStartAnimation("animAlphaBack", camera, "alpha", 60, 60, camera.alpha, Math.PI / 2, 2, new BABYLON.SineEase());

                BABYLON.Animation.CreateAndStartAnimation("animRadiusBack", camera, "radius", 60, 60, camera.radius, 5, 2, new BABYLON.SineEase(), () => {
                    camera.lowerRadiusLimit = 5;
                    camera.upperRadiusLimit = 5;
                    camera.panningSensibility = 0;
                    this.isZoomed = false;
                });
            }, 500);
        }
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
        this.resetVisuals();
        this.uiManager.hideTooltip();
    }
}
