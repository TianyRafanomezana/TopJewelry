# TopJewelry
Projet BabylonJS de bijouterie

Difficulté :
Trouver comment afficher un matériaux et voir si il est séparable => Gemini ma donné le site 

Trouver une idée qui me correspond, j'avais du mal à commencer => j'ai organisé mes taches dans un bloc note

J'arrive pas a créer mes hitbox au bon endroit, je sais pas si c'était pertinent d'en utiliser poiur des formes simples

Je n'arrive pas à sélectionner mon écran et donc à créer une hitbox au bon endroit : 
    =>Le problème venait du fait que monitor_3 (mon écran) n'est pas un "Mesh" (objet géométrique) mais un "Node"

J'ai galéré à faire la barre en bas avec les lignes => j'ai demander à l'IA


### Rotation : Le Problème du Quaternion
Les modèles 3D importés (.glb) ont souvent une propriété `rotationQuaternion` qui bloque la rotation simple `rotation.y`.
**Solution :** J'ai forcé `mesh.rotationQuaternion = null;` pour reprendre le contrôle manuel de la rotation.

### Clic Bague : Le Problème du Raycasting
Cliquer précisément sur les parties fines de la bague (ou à travers des calques invisibles) était difficile avec le système global `scene.onPointerObservable`.
**Solutions :**
1. **Hitbox Invisible :** J'ai créé un cube invisible autour de la bague pour avoir une zone de clic plus large et fiable.
2. **ActionManager :** J'ai remplacé l'écouteur global par un `BABYLON.ActionManager` attaché directement à cette Hitbox. C'est le système natif de BabylonJS pour gérer les clics sur les objets, beaucoup plus robuste.

### Transition : Le "Ghost Click" (Zoom Immédiat)
En passant du Bureau à la Bague, la scène zoomait instantanément.
**Cause :** Le clic effectué sur l'écran du PC (pour changer de scène) était détecté *aussi* par la scène suivante dès son chargement.
**Solution :** J'ai ajouté une sécurité (Debounce) de 500ms dans `CADScene.enter()`. On attend une demi-seconde avant d'activer les interactions de la bague, le temps que le clic précédent soit oublié.

Je n'arrivais pas à pouvoir cliquer sur la bague et que ca zoom avec la souris


### Rotation : Le bouton qui accélère
Le bouton "Rotation" ne mettait pas en pause mais semblait accélérer la rotation à chaque clic.
**Causes :**
1. **Perte de Référence :** Quand on lançait la rotation, la fonction créée (`scene.registerBeforeRender`) n'était pas correctement stockée. La variable censée la retenir valait `undefined`.
2. **Accumulation :** À chaque clic sur "Play", au lieu de relancer l'ancienne, on créait une *nouvelle* boucle de rotation qui s'ajoutait à la précédente. 3 clics = 3 moteurs qui tournent en même temps = vitesse x3.
**Solution :**
J'ai réécrit la logique dans `CADHelper.js` pour créer une fonction nommée (`rotateFunc`), l'enregistrer, et surtout **retourner cette fonction précise**. Ainsi, quand on clique sur Pause, le système sait exactement quelle fonction arrêter.
