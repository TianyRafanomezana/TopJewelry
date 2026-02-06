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
        screenPlaceholder: "https://placehold.co/600x400/000000/FFFFFF/png?text=SCREEN+ON",
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
        tooltipEcho: "✨ L'Écho du Système",
        tooltipScreen: "💻 Écran : Cliquez pour allumer"
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
            tooltip: "💻 Écran : Cliquez pour découvrir la CAO",
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
            tooltip: "🔴 Power",
            highlight: { target: "cpu_6", color: "echoHighlightColor" },
            zoomRequired: true // Only visible when zoomed
        }
    ]
};
