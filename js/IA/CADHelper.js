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
export function setupCADStones(scene, meshes, onSelectionChange) {
    const { stones, metals } = identifyStones(meshes);
    applyStoneColors(stones, Config.stoneColors);
    const interactionState = setupStoneInteraction(scene, stones, metals, onSelectionChange);

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
export function enterCADScene(scene, engine, uiManager, ringMesh, rotationCallback) {
    console.log("📐 Scène CAD activée - Helper");

    const camera = scene.getCameraByName("cadCamera");
    if (camera) camera.attachControl(engine.getRenderingCanvas(), true);

    if (uiManager) uiManager.hideAll();

    // Démarrer rotation si pas déjà active
    let newRotationCallback = rotationCallback;
    if (ringMesh && !rotationCallback) {
        // IMPORTANT: Désactiver le quaternion pour permettre la rotation Euler (x,y,z)
        if (ringMesh.rotationQuaternion) {
            ringMesh.rotationQuaternion = null;
        }

        let frame = 0;
        const rotateFunc = () => {
            ringMesh.rotation.y += 0.005;
            frame++;
            if (frame % 60 === 0) console.log("🔄 Rotating...", ringMesh.rotation.y.toFixed(2));
        };
        scene.registerBeforeRender(rotateFunc);
        console.log("▶️ Rotation démarrée (Helper). Func:", rotateFunc);
        return rotateFunc;
    }

    return newRotationCallback;
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
export function exitCADScene(scene, rotationCallback, inputHandler) {
    console.log("👋 Scène CAD désactivée - Helper");

    const camera = scene.getCameraByName("cadCamera");
    if (camera) camera.detachControl();

    if (rotationCallback) {
        scene.unregisterBeforeRender(rotationCallback);
    }

    if (inputHandler) {
        // Nettoyage Clavier
        if (inputHandler.keyHandler) {
            window.removeEventListener('keydown', inputHandler.keyHandler);
        }
        // Nettoyage Souris (PointerObserver)
        if (inputHandler.pointerHandler) {
            scene.onPointerObservable.removeCallback(inputHandler.pointerHandler);
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


