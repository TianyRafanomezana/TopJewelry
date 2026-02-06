export const Config = {
    // 3D Objects & Meshes
    meshes: {
        screenMonitor: "monitor_3",
        screenSurface: "Object_7", // The actual screen mesh
        pcComponents: ["monitor_3", "keyboard_4", "mouse_5", "cpu_6"],
        hitboxScreen: "Hitbox_Ecran",
        hitboxZonePC: "Hitbox_Zone_PC",
        powerLED: "Object_18" // Blue LED on tower
    },

    // Resources & Assets
    assets: {
        modelPath: "./object/",
        modelFile: "pc.glb",
        screenPlaceholder: "./img/bague screen.png",
        particleTexture: "https://www.babylonjs.com/assets/Flare.png"
    },

    // Visual Effects
    visuals: {
        // Echo Effect
        echoHighlightColor: { r: 0.2, g: 0.8, b: 1 }, // Cyan
        echoPulseSpeed: 0.05,

        // Particles
        particles: {
            color1: { r: 0.2, g: 0.8, b: 1, a: 1.0 }, // Cyan
            color2: { r: 0.5, g: 0.2, b: 1, a: 1.0 }, // Violet
            colorDead: { r: 0, g: 0, b: 0.2, a: 0.0 },
            count: 200,
            emitRate: 30
        }
    },

    // UI Texts
    ui: {
        tooltipEcho: "L'Écho du Système",
        tooltipScreen: "Écran : Cliquez pour allumer",
        cadWelcome: "Bienvenue dans l'Atelier",
        cadSubtitle: "Cliquez sur la bague pour commencer l'analyse"
    },

    // CAD Scene
    cad: {
        backgroundColor: { r: 0.1, g: 0.15, b: 0.2, a: 1 }
    },

    // Stone Colors (default appearance)
    stoneColors: {
        diamond: {
            color: { r: 0.9, g: 0.95, b: 1.0 },      // Bleu clair glacé
            emissive: { r: 0.3, g: 0.4, b: 0.5 },     // Légère émission bleue
            alpha: 0.85,                               // Légèrement transparent
            metallic: 0.1,
            roughness: 0.1
        },
        gem: {
            color: { r: 1.0, g: 0.3, b: 0.5 },        // Rose/Rouge (rubis)
            emissive: { r: 0.4, g: 0.1, b: 0.2 },     // Légère émission rouge
            alpha: 0.9,
            metallic: 0.05,
            roughness: 0.15
        }
    },

    // Info Details (Technical CAD Workflow)
    componentDetails: {
        intro: "Découvrez les coulisses de la création : chaque étape technique en 3D assure la solidité et la brillance du bijou final.",
        diamond: {
            title: "Booleens (Découpe)",
            description: "En 3D, on utilise le volume du diamant comme un 'emporte-pièce'. On enlève précisément de la matière au métal pour créer un trou parfait (l'assise) où la pierre viendra se loger après la fabrication."
        },
        gem: {
            title: "Le Chaton (Support)",
            description: "On modélise ici les 'griffes' qui retiendront la pierre. Le défi est de les dessiner assez fines pour l'élégance, mais assez robustes pour que la pierre reste solidement fixée toute une vie."
        },
        metal: {
            title: "Le Corps (Anneau)",
            description: "C'est la base du bijou ! On applique un 'facteur de retrait' (Shrinkage) : on agrandit la bague de +2% en 3D car le métal précieux rétrécit légèrement en refroidissant lors de la fonte."
        },
        bezel: {
            title: "Le Chaton (Serti)",
            description: "Cette structure entoure la pierre pour la maintenir. En CAO, on modélise un 'siège' ultra-précis. S'il est trop lâche, la pierre bougera ; trop serré, elle risque de casser au moment du sertissage."
        },
        prong: {
            title: "Les Griffes",
            description: "Ces fils de métal assurent le maintien final. En 3D, on les prévoit 10% plus longs (marges de sertissage) pour donner au joaillier assez de matière à rabattre sur la pierre lors de la finition."
        },
        all_stones: {
            title: "Pavage & Optimisation",
            description: "Le positionnement des 43 pierres suit une courbe mathématique. Sous chaque pierre, un 'nid d'abeille' est modélisé pour permettre le passage de la lumière et faciliter le nettoyage futur de la pièce."
        },
        all_metals: {
            title: "Architecture Joaillière",
            description: "Voici l'ossature complète du bijou : l'anneau (corps), les chatons (supports) et les griffes (maintien). Chaque pièce est imbriquée numériquement pour garantir une solidité structurelle maximale après la fonte."
        },
        all_metal: {
            title: "Tous les Corps",
            description: "Sélectionner tous les profils d'anneaux. C'est ici que l'on vérifie la cohérence des largeurs et des épaisseurs sur l'ensemble du bijou pour assurer un confort optimal."
        },
        all_bezel: {
            title: "Tous les Chatons",
            description: "Vue d'ensemble de tous les berceaux de pierres. On vérifie ici que chaque serti respecte la même inclinaison et la même profondeur pour un rendu visuel harmonieux."
        },
        all_prong: {
            title: "Toutes les Griffes",
            description: "Extraction de l'ensemble des griffes de maintien. Cette vue permet de contrôler que chaque pierre est sécurisée par le même nombre de points d'appui."
        }
    },

    // Scene Specific default info content
    sceneDetails: {
        OFFICE: {
            title: "Espace de Travail",
            intro: "Bienvenue dans votre atelier virtuel. Ici, la conception joaillière commence par l'allumage du poste de travail et le chargement du projet numérique.",
            steps: [
                { num: 1, label: "Poste de travail", desc: "Allumez la tour PC pour activer le système." },
                { num: 2, label: "Écran CAO", desc: "Cliquez sur l'écran pour charger la bague." },
                { num: 3, label: "Exploration", desc: "Utilisez la souris pour explorer l'atelier." }
            ],
            footer: "Allumez le PC pour commencer l'expérience"
        },
        CAD: {
            title: "Workflow Numérique",
            intro: "La CAO Joaillière consiste à créer un jumeau numérique parfait. Ce fichier sera ensuite imprimé en cire pour la Fonte à cire perdue.",
            steps: [
                { num: 1, label: "Le Corps", desc: "Dessin de l'anneau principal." },
                { num: 2, label: "Les Chatons", desc: "Ajout des supports de pierres." },
                { num: 3, label: "L'Ajourage", desc: "Perçage pour la lumière." },
                { num: 4, label: "La Finition", desc: "Préparation pour l'impression 3D." }
            ],
            footer: "Cliquez sur un élement de la bague pour commencer l'analyse"
        }
    },

    // Render Modes for CAD Scene
    renderModes: {
        BLUEPRINT: {
            name: 'blueprint',
            background: { r: 1, g: 1, b: 1, a: 1 }, // Blanc
            material: {
                wireframe: true,
                alpha: 0.6,
                color: { r: 0, g: 0, b: 0 }, // Noir
                emissive: { r: 0, g: 0, b: 0 },
                specular: { r: 0, g: 0, b: 0 },
                metallic: 0,
                roughness: 1
            }
        },
        REALISTIC: {
            name: 'realistic',
            background: { r: 0.1, g: 0.15, b: 0.2, a: 1 }, // Sombre
            restoreOriginal: true // Flag pour restaurer les matériaux originaux
        },
        XRAY: {
            name: 'xray',
            background: { r: 0.3, g: 0.3, b: 0.35, a: 1 }, // Gris
            material: {
                wireframe: false,
                alpha: 0.3,
                color: { r: 0.2, g: 0.6, b: 0.8 }, // Bleu
                emissive: { r: 0.1, g: 0.3, b: 0.4 } // Cyan émissif
            }
        }
    },

    // Interaction Map ( Metadata & Priority )
    interactionMap: [
        {
            id: "screen",
            pattern: "Hitbox_Ecran",
            type: "screen_action",
            priority: 10,
            cursor: "pointer",
            tooltip: "Écran : Cliquez pour découvrir la CAO",
            highlight: { target: "monitor_3", color: "echoHighlightColor" },
            visuals: ["pulse"],
            zoomRequired: true // Only visible when zoomed
        },
        {
            id: "zone_pc",
            pattern: "Hitbox_Zone_PC",
            type: "focus",
            priority: 1,
            cursor: "pointer",
            tooltip: "Voir la production CAO",
            highlight: { target: ["monitor_3", "keyboard_4", "mouse_5", "cpu_6"], color: "echoHighlightColor" },
            visuals: ["pulse"],
            zoomRequired: false // Only visible when NOT zoomed
        },
        {
            id: "tower",
            pattern: "cpu_6",
            type: "power_switch",
            priority: 20,
            cursor: "pointer",
            tooltip: "Power",
            highlight: { target: "cpu_6", color: "echoHighlightColor" },
            zoomRequired: true // Only visible when zoomed
        }
    ]
};
