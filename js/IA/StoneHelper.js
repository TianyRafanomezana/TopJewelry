// ========================================
// STONE HELPER - Fonctions Complexes IA
// ========================================
// Gestion de l'identification et de la sélection
// des pierres et métaux dans la bague

/**
 * Identifie et classe les pierres et métaux dans les meshes
 * @param {Array} allMeshes - Tous les meshes de la bague
 * @returns {Object} - Objet avec stones et metals classés
 */
export function identifyStones(allMeshes) {
    const stones = {
        marquise: [],
        oval: [],
        round: [],
        all: []
    };

    const metals = {
        metal: [],
        bezel: [],
        prong: [],
        head_prong: [],
        object: [],
        all: []
    };

    console.log("📋 Analyse des meshes pour identification...");

    allMeshes.forEach((mesh) => {
        const name = mesh.name.toLowerCase();

        // Identification des pierres
        if (name.includes('diamond') || name.includes('gem')) {
            stones.all.push(mesh);

            if (name.includes('marquise')) {
                stones.marquise.push(mesh);
            } else if (name.includes('oval')) {
                stones.oval.push(mesh);
            } else if (name.includes('round')) {
                stones.round.push(mesh);
            }
        }

        // Identification du métal
        if (name.includes('metal') || name.includes('bezel') || name.includes('prong') || name.includes('object')) {
            metals.all.push(mesh);

            if (name.includes('metal')) {
                metals.metal.push(mesh);
            } else if (name.includes('bezel')) {
                metals.bezel.push(mesh);
            } else if (name.includes('prong')) {
                if (name.includes('head')) {
                    metals.head_prong.push(mesh);
                } else {
                    metals.prong.push(mesh);
                }
            } else if (name.includes('object')) {
                metals.object.push(mesh);
            }
        }
    });

    console.log("💎 Pierres:", stones.all.length);
    console.log("🔩 Métaux:", metals.all.length);

    return { stones, metals };
}

/**
 * Configure l'interaction (clic) sur les pierres et métaux
 * @param {BABYLON.Scene} scene - La scène Babylon
 * @param {Object} stones - Objet stones depuis identifyStones()
 * @param {Object} metals - Objet metals depuis identifyStones()
 * @returns {Object} - Objet avec les highlight layers et état de sélection
 */
export function setupStoneInteraction(scene, stones, metals) {
    const state = {
        selectedStone: null,
        selectedMetal: null,
        stoneHighlight: new BABYLON.HighlightLayer("stoneHighlight", scene),
        metalHighlight: new BABYLON.HighlightLayer("metalHighlight", scene)
    };

    // Gestion des clics
    scene.onPointerDown = (evt, pickInfo) => {
        if (pickInfo.hit && pickInfo.pickedMesh) {
            let mesh = pickInfo.pickedMesh;

            const isStone = stones.all.includes(mesh);
            const isMetal = metals.all.includes(mesh);

            if (isStone) {
                // Désélectionner le métal si sélectionné
                if (state.selectedMetal) {
                    state.metalHighlight.removeMesh(state.selectedMetal);
                    state.selectedMetal = null;
                }

                // Sélection de pierre
                if (state.selectedStone === mesh) {
                    // Désélectionner
                    state.stoneHighlight.removeMesh(mesh);
                    state.selectedStone = null;
                    console.log("💎 Pierre désélectionnée");
                } else {
                    // Sélectionner nouvelle pierre
                    if (state.selectedStone) {
                        state.stoneHighlight.removeMesh(state.selectedStone);
                    }
                    state.selectedStone = mesh;
                    state.stoneHighlight.addMesh(mesh, BABYLON.Color3.Green());
                    console.log(`💎 Pierre sélectionnée: ${mesh.name}`);
                }
            } else if (isMetal) {
                // Désélectionner la pierre si sélectionnée
                if (state.selectedStone) {
                    state.stoneHighlight.removeMesh(state.selectedStone);
                    state.selectedStone = null;
                }

                // Sélection de métal
                if (state.selectedMetal === mesh) {
                    // Désélectionner
                    state.metalHighlight.removeMesh(mesh);
                    state.selectedMetal = null;
                    console.log("🔩 Métal désélectionné");
                } else {
                    // Sélectionner nouveau métal
                    if (state.selectedMetal) {
                        state.metalHighlight.removeMesh(state.selectedMetal);
                    }
                    state.selectedMetal = mesh;
                    state.metalHighlight.addMesh(mesh, BABYLON.Color3.Blue());
                    console.log(`🔩 Métal sélectionné: ${mesh.name}`);
                }
            }
        }
    };

    return state;
}

/**
 * Applique les couleurs configurées aux pierres
 * @param {Object} stones - Objet stones depuis identifyStones()
 * @param {Object} stoneColorsConfig - Configuration des couleurs (depuis Config.stoneColors)
 */
export function applyStoneColors(stones, stoneColorsConfig) {
    console.log("💎 Application des couleurs aux pierres...");

    let coloredCount = 0;

    stones.all.forEach(stone => {
        if (!stone.material) return;

        const name = stone.name.toLowerCase();
        let colorConfig = null;

        // Déterminer quelle configuration appliquer
        if (name.includes('diamond')) {
            colorConfig = stoneColorsConfig.diamond;
        } else if (name.includes('gem')) {
            colorConfig = stoneColorsConfig.gem;
        }

        if (colorConfig) {
            const mat = stone.material;

            // Appliquer la couleur
            const color = new BABYLON.Color3(colorConfig.color.r, colorConfig.color.g, colorConfig.color.b);
            if (mat.albedoColor) {
                mat.albedoColor = color;
            }
            if (mat.diffuseColor) {
                mat.diffuseColor = color;
            }

            // Appliquer l'émissivité (lueur)
            if (colorConfig.emissive) {
                const emissive = new BABYLON.Color3(
                    colorConfig.emissive.r,
                    colorConfig.emissive.g,
                    colorConfig.emissive.b
                );
                mat.emissiveColor = emissive;
            }

            // Appliquer la transparence
            if (colorConfig.alpha !== undefined) {
                mat.alpha = colorConfig.alpha;
                mat.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
            }

            // Appliquer les propriétés PBR
            if (colorConfig.metallic !== undefined && mat.metallic !== undefined) {
                mat.metallic = colorConfig.metallic;
            }
            if (colorConfig.roughness !== undefined && mat.roughness !== undefined) {
                mat.roughness = colorConfig.roughness;
            }

            coloredCount++;
        }
    });

    console.log(`✅ ${coloredCount} pierres colorées`);
}
