// ========================================
// OFFICE SCENE - Squelette Simple
// ========================================
// TODO: À remplir selon vos besoins

export class OfficeScene {
    constructor(engine) {
        this.engine = engine;
        this.scene = null;
    }

    // Initialiser la scène du bureau
    async init() {
        console.log("🏢 Initialisation scène Bureau...");

        this.scene = new BABYLON.Scene(this.engine);

        // TODO: Ajouter caméra, lumières, objets
        // ...

        console.log("✅ Scène Bureau initialisée");
    }

    // Activer la scène
    enter() {
        console.log("🏢 Scène Bureau activée");

        // TODO: Attacher caméra
        // TODO: Afficher UI du bureau
    }

    // Désactiver la scène
    exit() {
        console.log("👋 Scène Bureau désactivée");

        // TODO: Détacher caméra
    }
}
