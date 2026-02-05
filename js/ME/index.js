// ========================================
// INDEX.JS - VOTRE ORCHESTRATEUR PRINCIPAL
// ========================================
// VOUS contrôlez tout le flux ici !

import { CADScene } from './CADScene.js';
import { OfficeScene } from './OfficeScene.js';

// ========================================
// 1️⃣ INITIALISATION BABYLON.JS
// ========================================
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

// Variables globales simples
let currentScene = null;  // Quelle scène est active ?
let scenes = {};          // Stockage de toutes mes scènes

// ========================================
// 2️⃣ CRÉER LES SCÈNES
// ========================================
async function init() {
    console.log("🚀 Démarrage de l'application...");

    // Créer la scène CAD
    const cadScene = new CADScene(engine);
    await cadScene.init();
    scenes.CAD = cadScene;

    // Créer la scène Office
    const officeScene = new OfficeScene(engine);
    await officeScene.init();
    scenes.OFFICE = officeScene;

    // Démarrer avec CAD
    goToScene('CAD');

    console.log("✅ Application démarrée");
}

// ========================================
// 3️⃣ CHANGER DE SCÈNE
// ========================================
function goToScene(sceneId) {
    console.log(`🎬 Changement vers scène: ${sceneId}`);

    // Sortir de l'ancienne scène
    if (currentScene) {
        currentScene.exit(); // Dire "au revoir"
    }

    // Entrer dans la nouvelle scène
    currentScene = scenes[sceneId];
    if (currentScene) {
        currentScene.enter(); // Dire "bonjour"
        console.log(`✅ Scène active: ${sceneId}`);
    } else {
        console.error(`❌ Scène ${sceneId} introuvable`);
    }
}

// ========================================
// 4️⃣ RENDER LOOP (dessiner en boucle)
// ========================================
engine.runRenderLoop(() => {
    if (currentScene && currentScene.scene) {
        currentScene.scene.render(); // Babylon dessine la scène active
    }
});

// ========================================
// 5️⃣ RESIZE (ajuster au redimensionnement)
// ========================================
window.addEventListener("resize", () => {
    engine.resize();
});

// ========================================
// 6️⃣ ÉVÉNEMENTS UI
// ========================================

// Bouton retour bureau (si existe)
const backButton = document.getElementById('backButton');
if (backButton) {
    backButton.addEventListener('click', () => {
        goToScene('OFFICE');
    });
}

// Timeline navigation (si existe)
document.querySelectorAll('.timeline-step').forEach((step, index) => {
    step.addEventListener('click', () => {
        const sceneMap = ['OFFICE', 'CAD', 'OFFICE', 'OFFICE'];
        const targetScene = sceneMap[index];

        if (targetScene) {
            goToScene(targetScene);

            // Update progress UI
            document.querySelectorAll('.timeline-step').forEach((s, i) => {
                if (i <= index) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        }
    });
});

// ========================================
// 🚀 LANCER L'APPLICATION
// ========================================
window.addEventListener('DOMContentLoaded', () => {
    init();
});
