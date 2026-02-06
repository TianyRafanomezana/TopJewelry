// ========================================
// CAD HELPER - Fonctions utilitaires (IA)
// ========================================
// Contient toute la logique complexe de la scène CAD

import { Config } from './Config.js';
import { applyRenderMode, saveOriginalMaterials } from './RenderHelper.js';
import { identifyStones, setupStoneInteraction, applyStoneColors } from './StoneHelper.js';
import { zoomToMesh, resetCameraZoom } from './CameraHelper.js';

/**
 * Créer la caméra pour la scène CAD
 */
export function createCADCamera(scene, canvas) {
    const camera = new BABYLON.ArcRotateCamera(
        "cadCamera",
        Math.PI / 4,
        Math.PI / 3,
        15,
        new BABYLON.Vector3(0, 2, 0),
        scene
    );

    camera.wheelPrecision = 10;
    camera.pinchPrecision = 50;
    camera.lowerRadiusLimit = 2;
    camera.upperRadiusLimit = 50;
    camera.angularSensibilityX = 1000;
    camera.angularSensibilityY = 1000;

    // Empêcher le zoom de la page
    if (canvas) {
        canvas.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
    }

    console.log("📷 Caméra CAD créée");
    return camera;
}

/**
 * Créer les lumières pour la scène CAD
 */
export function createCADLights(scene) {
    const hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
    hemiLight.intensity = 0.7;

    const dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), scene);
    dirLight.intensity = 0.5;

    console.log("💡 Lumières CAD créées");
}

/**
 * Créer l'environnement (sol + grille)
 */
export function createCADEnvironment(scene) {
    // Sol
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 20, height: 20 }, scene);
    const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
    groundMat.diffuseColor = new BABYLON.Color3(0.95, 0.95, 0.95);
    groundMat.specularColor = new BABYLON.Color3(0, 0, 0);
    ground.material = groundMat;

    // Grille
    createGridLines(scene);
    console.log("🌍 Environnement CAD créé");
}

function createGridLines(scene) {
    const size = 20;
    const step = 2;
    const lines = [];

    for (let z = -size / 2; z <= size / 2; z += step) {
        lines.push([new BABYLON.Vector3(-size / 2, 0.01, z), new BABYLON.Vector3(size / 2, 0.01, z)]);
    }
    for (let x = -size / 2; x <= size / 2; x += step) {
        lines.push([new BABYLON.Vector3(x, 0.01, -size / 2), new BABYLON.Vector3(x, 0.01, size / 2)]);
    }

    const gridLines = BABYLON.MeshBuilder.CreateLineSystem("gridLines", { lines: lines }, scene);
    gridLines.color = new BABYLON.Color3(0.4, 0.5, 0.6);
    gridLines.alpha = 0.3;
}

/**
 * Charger et configurer la bague
 */
export async function loadCADModel(scene) {
    try {
        const result = await BABYLON.SceneLoader.ImportMeshAsync("", "object/", "ring_CAO_bigCe.glb", scene);
        const root = result.meshes[0];
        root.position = new BABYLON.Vector3(0, 2, 0);
        root.scaling = new BABYLON.Vector3(100, 100, 100);

        const meshes = result.meshes;
        const originalMaterials = saveOriginalMaterials(meshes);

        // Créer une hitbox invisible pour faciliter le clic
        const ringHitbox = BABYLON.MeshBuilder.CreateBox("ringHitbox", { size: 1 }, scene);
        // Positionner au même endroit que le root (0, 2, 0)
        ringHitbox.position = new BABYLON.Vector3(0, 2, 0);
        // Taille fixe en world unit (env 5x5x5 pour couvrir la bague qui est scale 100 mais petite de base ?)
        // Si le model est scale 100, il est probable qu'il soit petit de base.
        // On teste une taille de 5.
        ringHitbox.scaling = new BABYLON.Vector3(5, 5, 5);

        // Invisible pour la prod
        ringHitbox.visibility = 0;
        ringHitbox.isPickable = true;

        // NE PAS PARENTER pour l'instant pour éviter les soucis de scale du root
        // ringHitbox.parent = root; 

        console.log("💍 Modèle bague chargé + Hitbox (Active)");

        return { root, meshes, originalMaterials, ringHitbox };
    } catch (error) {
        console.error("❌ Erreur chargement bague:", error);
        return null;
    }
}

/**
 * Gérer le mode analyse (zoom)
 */
export function toggleAnalysisMode(scene, isActive, ringMesh, interactionState, hitbox) {
    const camera = scene.getCameraByName("cadCamera");
    if (!camera || !ringMesh) return;

    if (isActive) { // Activer -> Zoom In
        zoomToMesh(camera, ringMesh, 5, undefined, () => {
            console.log("🔍 Analyse activée");
            if (interactionState) {
                interactionState.enabled = true; // Activer interactions pierres
            }
            if (hitbox) {
                hitbox.isPickable = false; // Désactiver hitbox
            }
        });
    } else { // Désactiver -> Zoom Out (Reset)
        resetCameraZoom(camera, ringMesh.position, 15, undefined, () => { // Reset à 15
            console.log("🔍 Analyse désactivée");
            if (interactionState) {
                interactionState.enabled = false; // Désactiver interactions pierres
                interactionState.deselectAll();
            }
            if (hitbox) {
                hitbox.isPickable = true; // Réactiver hitbox
            }
        });
    }
}

/**
 * Identifier et configurer les pierres
 */
/**
 * Identifier et configurer les pierres
 */
export function setupCADStones(scene, meshes, onSelectionChange, onDoubleClick) {
    const { stones, metals } = identifyStones(meshes);
    applyStoneColors(stones, Config.stoneColors);
    const interactionState = setupStoneInteraction(scene, stones, metals, onSelectionChange, onDoubleClick);

    return { stones, metals, interactionState };
}

/**
 * Gérer la rotation automatique
 */
export function setupAutoRotation(scene, mesh) {
    if (!mesh) return null;

    const observer = scene.registerBeforeRender(() => {
        mesh.rotation.y += 0.01;
    });
    console.log("🔄 Rotation auto configurée");
    return observer;
}

/**
 * Gérer les entrées (Clavier + Clic sur bague)
 */
export function setupCADInputs(scene, cadScene, ringMesh, interactionState, hitbox) {
    // 1. Clavier
    const keyHandler = (e) => {
        if (e.key === 'i' || e.key === 'I') {
            scene.debugLayer.isVisible() ? scene.debugLayer.hide() : scene.debugLayer.show();
        }
        if (e.key === 'r' || e.key === 'R') {
            cadScene.handleRenderModeCycle();
        }
        // Restaurer Z comme fallback
        if (e.key === 'z' || e.key === 'Z') {
            console.log("⌨️ Touche Z pressée -> Toggle Analyse");
            cadScene.toggleAnalysisMode();
        }
        // Touche Espace pour la rotation
        if (e.key === ' ') {
            e.preventDefault(); // Empêcher le scroll de la page
            console.log("⌨️ Touche Espace pressée -> Toggle Rotation");
            cadScene.handleRotationToggle();
        }
        // Touche P pour les pierres
        if (e.key.toLowerCase() === 'p') {
            console.log("⌨️ Touche P pressée -> Toggle Visibilité Pierres");
            if (cadScene.toggleStonesVisibility) {
                cadScene.toggleStonesVisibility();
            }
        }
        // Touche D pour le détail (Extraction)
        if (e.key.toLowerCase() === 'd') {
            console.log("⌨️ Touche D pressée -> Toggle Extraction Detail");
            if (cadScene.toggleExtraction) {
                cadScene.toggleExtraction();
            }
        }
    };
    window.addEventListener('keydown', keyHandler);

    // 2. Clic sur la bague (Zoom In) via ActionManager (Plus fiable)
    const toggleZoomAction = new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPickTrigger,
        (evt) => {
            // Uniquement clic gauche
            if (evt.sourceEvent && evt.sourceEvent.button !== 0) return;

            console.log("⚡ ActionManager déclenché sur :", evt.meshUnderPointer ? evt.meshUnderPointer.name : "unknown");

            // SÉCURITÉ : Ignorer si on a cliqué sur de l'UI HTML au-dessus
            const event = evt.sourceEvent;
            if (event && event.clientX !== undefined) {
                const element = document.elementFromPoint(event.clientX, event.clientY);
                if (element && element.tagName !== 'CANVAS') {
                    console.log("🖱️ ActionManager bloqué par l'UI");
                    return;
                }
            }

            // Vérifier l'état de l'interaction
            const isInteractionsDisabled = !interactionState || !interactionState.enabled;

            if (isInteractionsDisabled) {
                console.log("💍 Action Validée -> Zoom !");
                cadScene.toggleAnalysisMode();
            } else {
                console.log("⚠️ Déjà zoomé, clic ignoré par le gestionnaire de zoom.");
            }
        }
    );

    // Attacher l'action à la Hitbox
    if (hitbox) {
        if (!hitbox.actionManager) hitbox.actionManager = new BABYLON.ActionManager(scene);
        hitbox.actionManager.registerAction(toggleZoomAction);
        console.log("✅ ActionManager attaché à la Hitbox");
    }

    // Attacher aussi aux meshes de la bague (au cas où la hitbox foire)
    // On parcourt les meshes racines ou importants
    if (ringMesh) {
        // Fonction récursive pour attacher action
        const attachToChildren = (mesh) => {
            if (!mesh.actionManager) mesh.actionManager = new BABYLON.ActionManager(scene);
            mesh.actionManager.registerAction(toggleZoomAction);

            mesh.getChildren().forEach(child => attachToChildren(child));
        };
        // On l'attache juste au root et ses enfants directs pour pas surcharger ?
        // Mieux vaut cibler les meshes avec géométrie.
        const allMeshes = ringMesh.getChildMeshes(false); // false = direct descendants only? No, all.
        allMeshes.forEach(m => {
            if (m.isVisible && m.isPickable) {
                if (!m.actionManager) m.actionManager = new BABYLON.ActionManager(scene);
                m.actionManager.registerAction(toggleZoomAction);
            }
        });
        console.log("✅ ActionManager attaché aux meshes de la bague");
    }

    // Cleanup function? 
    // ActionManagers sont attachés aux meshes, ils seront nettoyés quand les meshes seront disposés.
    // Mais on peut vouloir les détacher explicitement si on change de scene sans dispose.

    return { keyHandler, pointerHandler: null }; // PointerHandler supprimé
}

/**
 * Entrer dans la scène CAD
 */
export function enterCADScene(scene, engine, uiManager, ringMesh, interactionState, ringHitbox, isAnalysisMode) {
    console.log("📐 Scène CAD activée - Helper");

    const camera = scene.getCameraByName("cadCamera");
    if (camera) camera.attachControl(engine.getRenderingCanvas(), true);

    // FORCAGE ZOOM INITIAL (Sécurité)
    if (ringMesh && !isAnalysisMode) {
        if (camera) {
            camera.radius = 15;
            camera.target = new BABYLON.Vector3(0, 2, 0);
        }
        if (interactionState) {
            interactionState.enabled = false;
            interactionState.deselectAll();
        }
        if (ringHitbox) {
            ringHitbox.isPickable = true;
        }
    }

    return null; // On laisse le caller gérer la rotation initialement ou via toggleAutoRotation
}

/**
 * Toggle la rotation automatique
 */
export function toggleAutoRotation(scene, ringMesh, currentCallback) {
    if (currentCallback) {
        // Stop
        scene.unregisterBeforeRender(currentCallback);
        console.log("⏸️ Rotation stoppée");
        return null;
    } else {
        // Start
        if (!ringMesh) return null;

        // S'assurer que le quaternion est off
        if (ringMesh.rotationQuaternion) ringMesh.rotationQuaternion = null;

        const rotateFunc = () => {
            ringMesh.rotation.y += 0.005;
        };
        scene.registerBeforeRender(rotateFunc);
        console.log("▶️ Rotation redémarrée");
        return rotateFunc;
    }
}

/**
 * Sortir de la scène CAD
 */
export function exitCADScene(scene, rotationFunction, inputHandler) {
    console.log("👋 Scène CAD désactivée - Helper");

    const camera = scene.getCameraByName("cadCamera");
    if (camera) camera.detachControl();

    if (rotationFunction) {
        scene.unregisterBeforeRender(rotationFunction);
    }

    if (inputHandler) {
        if (inputHandler.keyHandler) {
            window.removeEventListener('keydown', inputHandler.keyHandler);
        }
    }
}

/**
 * Gérer l'extraction (Studio View)
 */
export function toggleExtractionHelper(cadScene) {
    if (!cadScene.isAnalysisMode) return;

    cadScene.isExtracted = !cadScene.isExtracted;

    // 1. Rotation de la bague
    if (cadScene.isExtracted) {
        cadScene.wasRotatingBeforeExtraction = cadScene.isRotating;
        if (cadScene.ringMesh) {
            cadScene.originalRingRotation = cadScene.ringMesh.rotation.clone();
            cadScene.ringMesh.rotation = new BABYLON.Vector3(0, 0, 0);
        }
        if (cadScene.isRotating) {
            cadScene.handleRotationToggle();
        }
    } else {
        if (cadScene.originalRingRotation && cadScene.ringMesh) {
            cadScene.ringMesh.rotation.copyFrom(cadScene.originalRingRotation);
            cadScene.originalRingRotation = null;
        }
        if (cadScene.wasRotatingBeforeExtraction && !cadScene.isRotating) {
            cadScene.handleRotationToggle();
        }
    }

    // 2. Translocation pierre
    if (cadScene.interactionState) {
        cadScene.interactionState.extractStone(cadScene.isExtracted);
    }

    // 3. UI
    if (cadScene.uiManager) {
        cadScene.uiManager.updateExtractionUI(cadScene.isExtracted);
    }

    // 4. Zoom Caméra
    const camera = cadScene.scene.getCameraByName("cadCamera");
    if (camera) {
        if (cadScene.isExtracted) {
            zoomToMesh(camera, { getAbsolutePosition: () => new BABYLON.Vector3(0, 5, 0) }, 3, 1000);
        } else {
            resetCameraZoom(camera, new BABYLON.Vector3(0, 2, 0), 8, 1000);
        }
    }
}

/**
 * Appliquer un mode de rendu (Blueprint, Realistic, XRay)
 */
export function setCADRenderMode(modeName, allMeshes, originalMaterials, stones, scene) {
    let config;
    let displayName;

    switch (modeName) {
        case 'BLUEPRINT':
            config = Config.renderModes.BLUEPRINT;
            displayName = "📐 Mode Blueprint";
            break;
        case 'REALISTIC':
            config = Config.renderModes.REALISTIC;
            displayName = "🎨 Mode Réaliste";
            break;
        case 'XRAY':
            config = Config.renderModes.XRAY;
            displayName = "🔍 Mode X-Ray";
            break;
        default:
            console.warn("Mode inconnu:", modeName);
            return modeName;
    }

    applyRenderMode(allMeshes, config, originalMaterials, scene);
    applyStoneColors(stones, Config.stoneColors);

    console.log(`${displayName} activé`);
    return modeName;
}

/**
 * Cycler entre les modes de rendu
 */
export function cycleCADRenderMode(currentMode, allMeshes, originalMaterials, stones, scene) {
    const modes = ['BLUEPRINT', 'REALISTIC', 'XRAY'];
    const currentIndex = modes.indexOf(currentMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    const nextMode = modes[nextIndex];

    return setCADRenderMode(nextMode, allMeshes, originalMaterials, stones, scene);
}

/**
 * Binds complet de l'UI CAD
 */
export function setupCompleteCADInteractions(scene, cadScene, uiManager) {
    console.log("🛠️ Binding complet de l'UI CAD...");

    // 1. Boutons Bas Gauche / Droite
    const bindings = {
        'btnZoomToggle': (e) => { e.stopPropagation(); cadScene.toggleAnalysisMode(); },
        'btnRotationToggle': (e) => { e.stopPropagation(); cadScene.handleRotationToggle(); },
        'btnStonesVisibility': (e) => { e.stopPropagation(); cadScene.toggleStonesVisibility(); },
        'btnModeRealistic': (e) => { e.stopPropagation(); cadScene.enableRealisticMode(); },
        'btnModeBlueprint': (e) => { e.stopPropagation(); cadScene.enableBlueprintMode(); },
        'btnModeXRay': (e) => { e.stopPropagation(); cadScene.enableXRayMode(); },
        'btnSelectAllStones': (e) => {
            e.stopPropagation();
            cadScene.interactionState?.selectAllStones();
        },
        'btnSelectAllMetals': (e) => {
            e.stopPropagation();
            const cat = e.currentTarget.dataset.currentCategory;
            if (cat && cadScene.interactionState) {
                cadScene.interactionState.selectMetalsByCategory(cat);
            } else {
                cadScene.interactionState?.selectAllMetals();
            }
        },
        'btnStonesVisibilityModal': (e) => { e.stopPropagation(); cadScene.toggleStonesVisibility(); },
        'btnExtractStone': (e) => { e.stopPropagation(); cadScene.toggleExtraction(); }
    };

    Object.entries(bindings).forEach(([id, func]) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.onpointerdown = (e) => {
                e.preventDefault();
                func(e);
            };
        }
    });

    // 2. UI Refresh
    uiManager.showLeftControls();
    uiManager.updateModeTitle(cadScene.isAnalysisMode ? "MODE ANALYSE" : "MODE PRÉSENTATION");
    uiManager.updateZoomButtonUI(cadScene.isAnalysisMode);
    uiManager.updateRenderModeUI(cadScene.currentRenderMode);
    uiManager.updateRotationButton(cadScene.isRotating);

    // 3. Inputs (Keyboard + Click)
    let inputHandler = null;
    setTimeout(() => {
        if (scene) {
            inputHandler = setupCADInputs(scene, cadScene, cadScene.ringMesh, cadScene.interactionState, cadScene.ringHitbox);
        }
    }, 500);

    // Return cleanup
    return () => {
        Object.keys(bindings).forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.onclick = null;
        });
        uiManager.hideLeftControls();
        if (inputHandler && inputHandler.keyHandler) {
            window.removeEventListener('keydown', inputHandler.keyHandler);
        }
    };
}
