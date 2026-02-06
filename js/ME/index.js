
import { CADScene } from './CADScene.js';
import { OfficeScene } from './OfficeScene.js';

const canvas = document.getElementById("renderCanvas"); // Je cherche mon canvas
const engine = new BABYLON.Engine(canvas, true); // Je créer un moteur babylon - canvas SANS guillemets (c'est la variable, pas du texte !)

let currentScene = null; // je créer une variable currentscene qui contiendra les data de ma scene actuelle (ca sera un objet plus tard)
let scenes = {}; // je stocke la liste de mes scenes
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
    const officeScene = new OfficeScene(engine, { goToScene });
    await officeScene.init();
    scenes.OFFICE = officeScene;

    // Démarrer avec OFFICE
    goToScene('OFFICE');

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
