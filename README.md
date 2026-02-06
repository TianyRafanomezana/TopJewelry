# 💍 RingZ - TopJewelry

Projet BabylonJS pour l'exploration interactive d'un bijou en CAO (Conception Assistée par Ordinateur).

## 🚀 Concept
Ce projet permet de découvrir les étapes techniques de la création joaillière à travers deux environnements :
1. **Le Bureau (Office)** : Point de départ immersif où l'on allume le poste de travail.
2. **La Scène CAO (CAD)** : Mode d'analyse technique du bijou avec des outils de rendu et d'extraction de composants.

---

## 🎨 Architecture : ME / IA
Le projet utilise une architecture **Minimalist Engine (ME)** / **Assistant Helpers (IA)** :
- **ME (`js/ME/`)** : Orchestrateurs simplifiés qui gèrent le flux de l'application. Très lisible, ce code ne contient que la logique de haut niveau.
- **IA (`js/IA/`)** : Contient les "Helpers" techniques (Calculs Babylon, gestion des caméras, manipulation des matériaux). C'est le "moteur" complexe caché derrière l'interface simple.

---

## 🎮 Liste des Interactions

### Environnement Bureau (Office)
- **Survol (Hover)** : Les éléments interactifs (écran, tour, souris...) s'éclairent et affichent une info-bulle.
- **Power On** : Cliquez sur la **Tour PC** pour allumer la LED et l'écran (avec animation de fondu).
- **Entrer en CAO** : Un clic sur l'**Écran allumé** vous propulse dans le mode analyse.
- **Retour** : Le bouton "Back" permet de quitter le zoom écran.

### Environnement CAO (CAD)
- **Rotation Auto** : Bouton Play/Pause ou **[Espace]** pour stopper/lancer la rotation de la bague.
- **Zoom Analyse** : Cliquez sur la bague ou utilisez la touche **[Z]** pour zoomer et activer les outils de sélection.
- **Modes de Rendu** : Basculez entre 3 modes (Boutons ou touche **[R]**) :
    - **Réaliste** : Matériaux originaux.
    - **Blueprint** : Vue filaire technique sur fond blanc.
    - **X-Ray** : Vue transparente pour voir les structures internes.
- **Sélection Intelligente** : 
    - Cliquez sur n'importe quel mesh (gemme ou métal) pour l'isoler et voir ses spécificités techniques.
    - Boutons "Tout sélectionner" (Métaux, Pierres, Chatons, Griffes) pour voir des groupes de composants.
- **Vue Studio (Extraction)** : 
    - **Double-clic** sur une pierre sélectionnée ou touche **[D]** : La pierre est "extraite" et centrée exactement au milieu de l'écran avec un reset de sa rotation. Parfait pour vérifier la qualité d'une gemme.
- **Visibilité** : Touche **[P]** pour masquer/afficher toutes les pierres instantanément.

---

## 🛠️ Difficultés Rencontrées

### 1. Le "Studio Spot" (Extraction de pierre)
**Défi** : Sortir une pierre inclinée d'une bague qui tourne, sans qu'elle ne disparaisse de l'écran ou ne soit déformée par l'échelle (scale) de la bague.
**Solution** : Utilisation des coordonnées Monde absolues (`setAbsolutePosition`) à un point fixe `(0, 5, 0)` et calcul du centre géométrique réel (`boundingBox.centerWorld`) au lieu du pivot, pour que la caméra soit toujours parfaitement centrée sur la gemme.

### 2. Le Problème du Quaternion
**Défi** : Les modèles `.glb` refusent souvent de tourner avec `rotation.y`.
**Solution** : Forçage du `rotationQuaternion = null` dans le loader pour reprendre le contrôle manuel via les angles d'Euler.

### 3. Le "Ghost Click"
**Défi** : En cliquant sur l'écran pour entrer dans la scène, le clic traversait et zoomait instantanément sur la bague.
**Solution** : Mise en place d'une sécurité temporelle (debounce) de 500ms qui ignore les entrées souris lors de la transition de scène.

---

## ⏳ Ce qui a pris le plus de temps
1. **La Refactorisation (Architecture)** : Passer d'un code monolithique difficile à maintenir à une structure ME/IA modulaire a demandé une réorganisation complète des dépendances.
2. **Le système de sélection & Highlight** : Gérer les différents types de meshes (gemmes vs métaux) et s'assurer que les calques de surbrillance (`HighlightLayer`) se nettoient correctement lors des sélections multiples.
3. **La gestion des caméras** : Créer des transitions fluides (interpolations) entre les différentes vues tout en gardant des limites de zoom cohérentes.

---

## 🔍 Éléments clés pour l'évaluation
- **Structure Logicielle** : Clarté de la séparation entre `js/ME` (Orchestration) et `js/IA` (Logique technique).
- **UX (User Experience)** : Feedback visuel constant (highlights, curseurs, tooltips, modales intuitives).
- **Ressources** : Utilisation du fichier `Config.js` pour centraliser toutes les données (couleurs, chemins d'accès, textes).
- **Rendu** : Qualité des modes Blueprint et X-Ray qui démontrent une manipulation dynamique des matériaux Babylon.
