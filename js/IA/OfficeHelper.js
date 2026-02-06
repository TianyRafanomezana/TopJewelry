// ========================================
// OFFICE HELPER - Fonctions utilitaires
// ========================================
// Fonctions complexes pour gérer l'écran et la LED

import { Config } from './Config.js';

/**
 * Changer le contenu de l'écran (image ou noir)
 */
export function changeScreenContent(scene, imagePath, fadeIn = false) {
    const screenMesh = scene.getMeshByName(Config.meshes.screenSurface);

    if (!screenMesh) {
        console.warn("⚠️ Écran non trouvé");
        return;
    }

    const screenMaterial = new BABYLON.StandardMaterial("screenMat", scene);
    screenMesh.material = screenMaterial;

    if (imagePath) {
        const texture = new BABYLON.Texture(imagePath, scene);
        screenMaterial.diffuseTexture = texture;
        screenMaterial.emissiveTexture = texture;

        if (fadeIn) {
            screenMaterial.emissiveColor = BABYLON.Color3.Black();
            let alpha = 0;
            const fadeInterval = setInterval(() => {
                alpha += 0.05;
                if (alpha >= 1) {
                    alpha = 1;
                    clearInterval(fadeInterval);
                }
                screenMaterial.emissiveColor = new BABYLON.Color3(alpha, alpha, alpha);
            }, 30);
        } else {
            screenMaterial.emissiveColor = BABYLON.Color3.White();
        }
        console.log("📺 Écran allumé avec image");
    } else {
        screenMaterial.diffuseTexture = null;
        screenMaterial.emissiveTexture = null;
        screenMaterial.specularTexture = null;
        screenMaterial.diffuseColor = BABYLON.Color3.Black();
        screenMaterial.emissiveColor = BABYLON.Color3.Black();
        screenMaterial.specularColor = BABYLON.Color3.Black();
        console.log("📺 Écran éteint");
    }
}

/**
 * Éteindre/allumer la LED de la tour
 */
export function setLEDPower(scene, isOn) {
    let ledMesh = scene.getMeshByName(Config.meshes.powerLED);
    if (!ledMesh) {
        ledMesh = scene.meshes.find(m => m.name === Config.meshes.powerLED);
    }

    if (!ledMesh) {
        console.warn("⚠️ LED non trouvée");
        return;
    }

    if (isOn) {
        ledMesh.isVisible = true;
        if (ledMesh.material) {
            ledMesh.material.emissiveColor = new BABYLON.Color3(0, 0.5, 1);
            ledMesh.material.diffuseColor = new BABYLON.Color3(0, 0.5, 1);
        }
        console.log("💡 LED allumée");
    } else {
        ledMesh.isVisible = false;
        console.log("💡 LED éteinte");
    }
}

/**
 * Créer la caméra pour la scène bureau
 */
export function createOfficeCamera(scene) {
    const camera = new BABYLON.ArcRotateCamera(
        "officeCamera",
        Math.PI / 2,
        Math.PI / 2,
        5,
        BABYLON.Vector3.Zero(),
        scene
    );
    camera.lowerRadiusLimit = 5;
    camera.upperRadiusLimit = 5;
    camera.panningSensibility = 0;
    console.log("📷 Caméra créée");
    return camera;
}

/**
 * Créer les lumières pour la scène bureau
 */
export function createOfficeLights(scene) {
    const hemiLight = new BABYLON.HemisphericLight(
        "light",
        new BABYLON.Vector3(1, 1, 0),
        scene
    );
    hemiLight.intensity = 1;
    console.log("💡 Lumière créée");
    return hemiLight;
}

/**
 * Mettre à jour les highlights d'objets
 */
export function updateHighlight(scene, hl, nameOrArray, active, color = BABYLON.Color3.White()) {
    if (!hl) return;
    const targets = Array.isArray(nameOrArray) ? nameOrArray : [nameOrArray];
    targets.forEach(name => {
        const node = scene.getNodeByName(name);
        if (!node) return;
        const processMesh = (n) => {
            if (n instanceof BABYLON.Mesh) {
                if (active) hl.addMesh(n, color);
                else hl.removeMesh(n);
            }
            const children = n.getChildren();
            if (children && children.length > 0) children.forEach(child => processMesh(child));
        };
        processMesh(node);
    });
}

/**
 * Activer la scène bureau (attacher caméra)
 */
export function enterOfficeScene(scene, engine, interactions) {
    console.log("🏢 Scène Bureau activée");
    const camera = scene.getCameraByName("officeCamera");
    if (camera) {
        camera.attachControl(engine.getRenderingCanvas(), true);
    }
    if (interactions) {
        interactions.enable();
    }
}

/**
 * Désactiver la scène bureau (détacher caméra)
 */
export function exitOfficeScene(scene, interactions) {
    console.log("👋 Scène Bureau désactivée");
    const camera = scene.getCameraByName("officeCamera");
    if (camera) {
        camera.detachControl();
    }
    if (interactions) {
        interactions.disable();
    }
}

/**
 * 🤖 HELPER COMPLET : Configure tout en 1 appel !
 */
export async function setupCompleteOfficeInteractions(scene, hl, uiManager, onScreenClick) {
    console.log("🎮 Configuration COMPLÈTE des interactions bureau (IA)...");

    // 1. Setup metadata depuis Config
    const { Config } = await import('./Config.js');
    scene.meshes.forEach(mesh => {
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
    console.log("🎯 Metadata d'interactions configurés");

    // 2. 🔴 Éteindre LED et écran au démarrage
    setLEDPower(scene, false);
    changeScreenContent(scene, null);
    console.log("🔴 PC éteint au démarrage");

    // 3. Créer InteractionManager (avec highlightLayer, pas sceneManager)
    const { InteractionManager } = await import('./InteractionManager.js');

    const interactionManager = new InteractionManager(
        scene,
        uiManager,
        hl, // HighlightLayer au lieu de sceneManager
        onScreenClick
    );

    console.log("✅ Interactions complètes configurées");

    return {
        enable: () => interactionManager.enable(),
        disable: () => interactionManager.disable()
    };
}
