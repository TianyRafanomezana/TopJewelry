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
 * @param {Object} stones - Objet stones depuis identifyStones()
 * @param {Object} metals - Objet metals depuis identifyStones()
 * @param {Function} onSelectionChange - Callback (mesh, type) => void
 * @returns {Object} - Objet avec les highlight layers et état de sélection
 */
export function setupStoneInteraction(scene, stones, metals, onSelectionChange, onDoubleClick) {
    const state = {
        selectedStone: null,
        selectedMetal: null,
        extractedStone: null,
        originalPosition: null,
        originalRotation: null,
        stoneHighlight: new BABYLON.HighlightLayer("stoneHighlight", scene),
        metalHighlight: new BABYLON.HighlightLayer("metalHighlight", scene),
        enabled: false, // Désactivé par défaut

        deselectAll: (suppressCallback = false) => {
            console.log("🧹 deselectAll called (suppressCallback:", suppressCallback, ")");
            // Remettre la pierre à sa place si extraite
            if (state.extractedStone && state.originalPosition) {
                state.extractedStone.position.copyFrom(state.originalPosition);
                state.extractedStone = null;
                state.originalPosition = null;
            }

            if (state.selectedStone) {
                state.stoneHighlight.removeMesh(state.selectedStone);
                state.selectedStone = null;
            }
            if (state.selectedMetal) {
                state.metalHighlight.removeMesh(state.selectedMetal);
                state.selectedMetal = null;
            }
            // Retirer TOUS les meshes de TOUS les layers (crucial pour le vrac)
            state.stoneHighlight.removeAllMeshes();
            state.metalHighlight.removeAllMeshes();

            if (!suppressCallback && onSelectionChange) onSelectionChange(null, null);
        },

        selectAllStones: () => {
            // Nettoyer d'abord sans fermer la modale
            state.deselectAll(true);

            // Ajouter toutes les pierres au highlight
            stones.all.forEach(stone => {
                state.stoneHighlight.addMesh(stone, BABYLON.Color3.Green());
            });

            // Trigger callback with 'all_stones'
            if (onSelectionChange) onSelectionChange(null, 'all_stones');
            console.log("💎 Toutes les pierres sélectionnées");
        },

        selectAllMetals: () => {
            console.log("🔩 selectAllMetals triggered");
            // Nettoyer d'abord sans fermer la modale
            state.deselectAll(true);

            // Ajouter tous les métaux au highlight
            metals.all.forEach(metal => {
                state.metalHighlight.addMesh(metal, BABYLON.Color3.Blue());
            });

            // Trigger callback with 'all_metals'
            if (onSelectionChange) onSelectionChange(null, 'all_metals');
            console.log(`🔩 ${metals.all.length} métaux sélectionnés`);
        },

        selectMetalsByCategory: (category) => {
            // Nettoyer d'abord sans fermer la modale
            state.deselectAll(true);

            let targetList = metals[category] || [];

            // Si on demande les griffes, on inclut aussi les têtes de griffes
            if (category === 'prong') {
                targetList = [...targetList, ...(metals.head_prong || [])];
            }

            // Ajouter tous les métaux de cette catégorie au highlight
            targetList.forEach(m => {
                state.metalHighlight.addMesh(m, BABYLON.Color3.Blue());
            });

            // Trigger callback
            if (onSelectionChange) onSelectionChange(null, `all_${category}`);
            console.log(`🔩 Tous les éléments de type ${category} sélectionnés`);
        },

        setStonesVisibility: (visible) => {
            if (!visible) {
                // Si on cache, on déselectionne tout d'abord
                state.deselectAll();
            }

            stones.all.forEach(stone => {
                stone.isVisible = visible;
                stone.isPickable = visible;
            });
            console.log(`💎 Visibilité des pierres : ${visible ? "Affichées" : "Masquées"}`);
        },

        extractStone: (isExtracting) => {
            if (!state.selectedStone) return;

            const mesh = state.selectedStone;

            if (isExtracting) {
                if (!state.extractedStone) {
                    state.extractedStone = mesh;
                    state.originalPosition = mesh.position.clone();

                    // Sauvegarder la rotation pour remise en place
                    if (mesh.rotationQuaternion) {
                        state.originalRotation = mesh.rotationQuaternion.clone();
                        mesh.rotationQuaternion = BABYLON.Quaternion.Identity();
                    } else {
                        state.originalRotation = mesh.rotation.clone();
                        mesh.rotation = new BABYLON.Vector3(0, 0, 0);
                    }

                    // Mode Studio : On déplace la pierre pour que son CENTRE visuel soit à (0, 5, 0)
                    mesh.computeWorldMatrix(true);
                    const currentCenter = mesh.getBoundingInfo().boundingBox.centerWorld;
                    const spot = new BABYLON.Vector3(0, 5, 0);
                    const delta = spot.subtract(currentCenter);

                    // On applique l'offset à la position absolue actuelle
                    const newPos = mesh.getAbsolutePosition().add(delta);
                    mesh.setAbsolutePosition(newPos);

                    console.log("💎 Pierre extraite -> Centrée au Studio Spot (0, 5, 0) + Rotation Reset");
                }
            } else {
                // Remettre en place
                if (state.extractedStone && state.originalPosition) {
                    state.extractedStone.position.copyFrom(state.originalPosition);

                    // Restaurer la rotation
                    if (state.originalRotation) {
                        if (state.extractedStone.rotationQuaternion) {
                            state.extractedStone.rotationQuaternion.copyFrom(state.originalRotation);
                        } else {
                            state.extractedStone.rotation.copyFrom(state.originalRotation);
                        }
                    }

                    state.extractedStone = null;
                    state.originalPosition = null;
                    state.originalRotation = null;
                    console.log("💎 Pierre remise en place + Rotation Restaurée");
                }
            }
        }
    };

    // --- DOUBLE CLIC (Vue Studio) ---
    if (onDoubleClick) {
        stones.all.forEach(stone => {
            if (!stone.actionManager) stone.actionManager = new BABYLON.ActionManager(scene);

            stone.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnDoublePickTrigger,
                () => {
                    // Uniquement si c'est la pierre déjà sélectionnée
                    if (state.enabled && state.selectedStone === stone) {
                        console.log("🖱️ Double-clic sur pierre sélectionnée -> Vue Détail");
                        onDoubleClick();
                    }
                }
            ));
        });
    }

    // Gestion des clics
    scene.onPointerDown = (evt, pickInfo) => {
        // Ignorer si interactions désactivées
        if (!state.enabled) return;

        // CRITIQUE : Ignorer si le clic vient d'une interface HTML (Modal, etc.)
        // On utilise elementFromPoint qui est plus précis que evt.target
        const element = document.elementFromPoint(evt.clientX, evt.clientY);
        if (element && element.tagName !== 'CANVAS') {
            const isUIPart = element.closest('.pointer-events-auto') || element.closest('button') || element.closest('.modal');
            if (isUIPart) {
                console.log("🖱️ Clic UI bloqué (elementFromPoint:", element.tagName, ")");
                return;
            }
        }

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
                    if (onSelectionChange) onSelectionChange(null, null);
                    console.log("💎 Pierre désélectionnée");
                } else {
                    // Sélectionner nouvelle pierre
                    // IMPORTANT : On nettoie tout le layer (cas Select All précédent)
                    state.stoneHighlight.removeAllMeshes();

                    state.selectedStone = mesh;
                    state.stoneHighlight.addMesh(mesh, BABYLON.Color3.Green());

                    // Déterminer le type
                    const name = mesh.name.toLowerCase();
                    let type = 'diamond'; // Defaut
                    if (name.includes('gem')) type = 'gem';

                    if (onSelectionChange) onSelectionChange(mesh, type);
                    console.log(`💎 Pierre sélectionnée: ${mesh.name} (${type})`);
                }
            } else if (isMetal) {
                // Désélectionner la pierre si sélectionnée (ou le groupe de pierres)
                state.stoneHighlight.removeAllMeshes();
                state.selectedStone = null;

                // Sélection de métal
                if (state.selectedMetal === mesh) {
                    // Désélectionner
                    state.metalHighlight.removeMesh(mesh);
                    state.selectedMetal = null;
                    if (onSelectionChange) onSelectionChange(null, null);
                    console.log("🔩 Métal désélectionné");
                } else {
                    // Sélectionner nouveau métal
                    if (state.selectedMetal) {
                        state.metalHighlight.removeMesh(state.selectedMetal);
                    }
                    state.selectedMetal = mesh;
                    state.metalHighlight.addMesh(mesh, BABYLON.Color3.Blue());

                    // Déterminer le sous-type de métal
                    const name = mesh.name.toLowerCase();
                    let metalType = 'metal';
                    if (name.includes('bezel')) metalType = 'bezel';
                    if (name.includes('prong')) metalType = 'prong';

                    if (onSelectionChange) onSelectionChange(mesh, metalType);
                    console.log(`🔩 Métal sélectionné: ${mesh.name} (${metalType})`);
                }
            } else {
                // Clic sur un autre objet (décor, etc.) -> Tout désélectionner
                state.deselectAll();
            }
        } else {
            // Clic dans le vide -> Tout désélectionner
            state.deselectAll();
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
