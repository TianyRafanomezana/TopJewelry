// ========================================
// RENDER HELPER - Fonctions Complexes IA
// ========================================
// Ces fonctions gèrent la logique complexe de rendu
// que vous n'avez pas besoin de comprendre en détail

/**
 * Applique un style de matériau à un mesh basé sur une configuration
 * @param {BABYLON.Mesh} mesh - Le mesh à modifier
 * @param {Object} modeConfig - Configuration du mode (depuis Config.renderModes)
 * @param {Map} originalMaterials - Map des matériaux originaux
 */
export function applyMaterialStyle(mesh, modeConfig, originalMaterials) {
    const original = originalMaterials.get(mesh);

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

/**
 * Applique un mode de rendu à une liste de meshes
 * @param {Array} meshes - Liste de meshes
 * @param {Object} modeConfig - Configuration du mode
 * @param {Map} originalMaterials - Map des matériaux originaux
 * @param {BABYLON.Scene} scene - La scène Babylon
 */
export function applyRenderMode(meshes, modeConfig, originalMaterials, scene) {
    // Appliquer le fond
    const bg = modeConfig.background;
    scene.clearColor = new BABYLON.Color4(bg.r, bg.g, bg.b, bg.a);

    // Appliquer le style à tous les meshes
    meshes.forEach(mesh => {
        if (mesh.getTotalVertices() === 0) return; // Ignorer les nodes vides
        applyMaterialStyle(mesh, modeConfig, originalMaterials);
    });

    console.log(`✅ Mode ${modeConfig.name} appliqué à ${meshes.length} meshes`);
}

/**
 * Cycle entre les modes de rendu
 * @param {string} currentMode - Mode actuel ('BLUEPRINT', 'REALISTIC', 'XRAY')
 * @param {Object} callbacks - Objet avec les fonctions pour chaque mode
 * @returns {string} - Le nouveau mode
 */
export function cycleRenderMode(currentMode, callbacks) {
    const modes = {
        'BLUEPRINT': 'REALISTIC',
        'REALISTIC': 'XRAY',
        'XRAY': 'BLUEPRINT'
    };

    const nextMode = modes[currentMode] || 'BLUEPRINT';

    // Appeler le callback correspondant
    if (callbacks[nextMode]) {
        callbacks[nextMode]();
    }

    return nextMode;
}

/**
 * Sauvegarde les matériaux originaux de tous les meshes
 * @param {Array} meshes - Liste de meshes
 * @returns {Map} - Map avec les matériaux originaux
 */
export function saveOriginalMaterials(meshes) {
    const originalMaterials = new Map();

    meshes.forEach(mesh => {
        if (mesh.material && mesh.getTotalVertices() > 0) {
            originalMaterials.set(mesh, mesh.material.clone(`original_${mesh.name}`));
        }
    });

    console.log(`💾 ${originalMaterials.size} matériaux originaux sauvegardés`);
    return originalMaterials;
}
