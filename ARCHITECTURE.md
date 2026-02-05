# 📁 Architecture du Projet - Approche B

## 🎯 Principe de Séparation

Le code est séparé en deux dossiers selon la complexité :

### **`js/IA/`** = Fonctions Complexes (générées par l'IA)
Fonctions que vous n'avez pas besoin d'écrire vous-même car elles sont complexes ou techniques.

### **`js/ME/`** = Code Principal (que vous écrivez)
Structure de l'application, orchestration, et logique métier.

---

## 📂 Structure des Fichiers

```
js/
├── IA/                          # 🤖 Fonctions Complexes IA
│   ├── Config.js                # Configurations centralisées
│   ├── RenderHelper.js          # Fonctions de rendu de matériaux
│   ├── Game.js                  # (ancien) Scene manager complexe
│   ├── CADScene.js              # (ancien) Version complète
│   └── ...                      # Autres helpers complexes
│
└── ME/                          # ✍️ Votre Code Principal
    ├── index.js                 # 🎬 ORCHESTRATEUR PRINCIPAL (START HERE)
    ├── CADScene.js              # Classe scène CAD (structure simple)
    └── OfficeScene.js           # Classe scène Bureau (squelette)
```

---

## 🎬 Flux de l'Application

### **1. Point d'Entrée : `index.html`**
```html
<script type="module" src="js/ME/index.js"></script>
```

### **2. Orchestrateur : `js/ME/index.js`**

C'est **VOTRE fichier principal**. Il contrôle tout le flux :

```javascript
// 1️⃣ Initialiser Babylon.js
const engine = new BABYLON.Engine(canvas, true);

// 2️⃣ Créer les scènes
const cadScene = new CADScene(engine);
const officeScene = new OfficeScene(engine);

// 3️⃣ Fonction de changement de scène
function goToScene(sceneId) {
    currentScene.exit();        // Fermer l'ancienne
    currentScene = scenes[sceneId];
    currentScene.enter();       // Ouvrir la nouvelle
}

// 4️⃣ Render loop
engine.runRenderLoop(() => {
    currentScene.scene.render();
});

// 5️⃣ Écouter les événements
document.getElementById('backButton').addEventListener('click', () => {
    goToScene('OFFICE');
});
```

### **3. Classes de Scènes : `js/ME/CADScene.js` et `OfficeScene.js`**

Chaque scène a 3 méthodes principales :

```javascript
class CADScene {
    async init() {
        // Créer la scène Babylon
        // Créer caméra, lumières, objets
    }

    enter() {
        // Activer la scène
        // Attacher caméra, afficher UI
    }

    exit() {
        // Désactiver la scène
        // Détacher caméra, cacher UI
    }
}
```

### **4. Helpers IA : `js/IA/RenderHelper.js`**

Fonctions complexes que vous **appelez** mais ne devez pas écrire :

```javascript
// Dans CADScene.js
import { applyRenderMode } from '../IA/RenderHelper.js';

enableBlueprintMode() {
    applyRenderMode(
        this.allRingMeshes, 
        Config.renderModes.BLUEPRINT, 
        this.originalMaterials, 
        this.scene
    );
}
```

---

## 🔑 Fonctions Clés

### **Dans `index.js` (VOUS écrivez)**

| Fonction | Rôle |
|----------|------|
| `init()` | Créer toutes les scènes au démarrage |
| `goToScene(id)` | Changer de scène |
| Event listeners | Réagir aux clics, touches clavier |

### **Dans `CADScene.js` (VOUS écrivez la structure)**

| Méthode | Rôle |
|---------|------|
| `init()` | Créer la scène Babylon |
| `createCamera()` | Configurer la caméra |
| `createLights()` | Configurer les lumières |
| `loadRing()` | Charger le modèle 3D |
| `enableBlueprintMode()` | Activer le mode blueprint *(appelle helper IA)* |
| `enter()` | Activer la scène |
| `exit()` | Désactiver la scène |

### **Dans `RenderHelper.js` (IA écrit)**

| Fonction | Rôle |
|----------|------|
| `applyMaterialStyle(mesh, config, originals)` | Applique un style à un mesh |
| `applyRenderMode(meshes, config, originals, scene)` | Applique un mode à tous les meshes |
| `cycleRenderMode(currentMode, callbacks)` | Cycle entre les modes |
| `saveOriginalMaterials(meshes)` | Sauvegarde les matériaux originaux |

---

## 🎮 Utilisation

### **Démarrer l'application**

1. Ouvrir `index.html` dans le navigateur
2. `index.js` se charge automatiquement
3. Les scènes sont créées et la scène CAD démarre

### **Changer de scène**

```javascript
// Dans votre code
goToScene('OFFICE');  // Va au bureau
goToScene('CAD');     // Va à la scène CAD
```

### **Ajouter une nouvelle scène**

1. Créer `js/ME/NewScene.js` :
```javascript
export class NewScene {
    constructor(engine) {
        this.engine = engine;
        this.scene = null;
    }

    async init() {
        // Créer la scène
    }

    enter() {
        // Activer
    }

    exit() {
        // Désactiver
    }
}
```

2. Dans `index.js` :
```javascript
import { NewScene } from './NewScene.js';

// Dans init()
const newScene = new NewScene(engine);
await newScene.init();
scenes.NEW = newScene;
```

---

## 🔄 Cycle des Modes de Rendu

Appuyez sur **`R`** pour cycler :

```
BLUEPRINT → REALISTIC → XRAY → BLUEPRINT → ...
```

Le cycle est géré par `RenderHelper.cycleRenderMode()` (IA) appelé depuis `CADScene.handleRenderModeCycle()` (VOUS).

---

## 📊 Diagramme de Flux

```
┌─────────────────┐
│   index.html    │
└────────┬────────┘
         │ charge
         ▼
┌─────────────────┐
│  index.js (ME)  │◄────────────┐
└────────┬────────┘             │
         │ crée                 │ utilise
         ▼                      │
┌─────────────────┐             │
│ CADScene (ME)   │─────────────┤
└────────┬────────┘             │
         │ appelle              │
         ▼                      │
┌──────────────────┐            │
│ RenderHelper(IA) │────────────┘
└──────────────────┘
         │ lit
         ▼
┌──────────────────┐
│   Config (IA)    │
└──────────────────┘
```

---

## ✅ Avantages de cette Approche

1. **Visibilité** : Vous voyez TOUT le flux dans `index.js`
2. **Simplicité** : Pas de "magie cachée"
3. **Contrôle** : Vous décidez quand et comment changer de scène
4. **Apprentissage** : Vous comprenez chaque étape
5. **Séparation** : Code simple (VOUS) vs code complexe (IA)

---

## 🚀 Pour Commencer

**Fichier principal à modifier : `js/ME/index.js`**

C'est là que vous contrôlez tout ! 🎯
