// ========================================
// CAMERA HELPER - Fonctions Complexes IA
// ========================================
// Gestion du zoom, focus et animations caméra

/**
 * Zoom smooth vers un mesh
 * @param {BABYLON.ArcRotateCamera} camera - La caméra
 * @param {BABYLON.Mesh} targetMesh - Le mesh ciblé
 * @param {number} distance - Distance finale (optionnel)
 * @param {number} duration - Durée de l'animation en ms (défaut: 1000)
 * @param {Function} onComplete - Callback à la fin (optionnel)
 */
export function zoomToMesh(camera, targetMesh, distance = 8, duration = 1500, onComplete = null) {
    console.log(`Zoom vers ${targetMesh.name}...`);

    // Utiliser la position ABSOLUE (Monde) si c'est un mesh, 
    // sinon utiliser .position (pour les objets fake comme dans resetCameraZoom)
    const targetPosition = (targetMesh.getAbsolutePosition ? targetMesh.getAbsolutePosition() : targetMesh.position) || BABYLON.Vector3.Zero();

    // Animation du radius (distance)
    const radiusAnimation = new BABYLON.Animation(
        "zoomRadius",
        "radius",
        60,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    radiusAnimation.setKeys([
        { frame: 0, value: camera.radius },
        { frame: 60, value: distance }
    ]);

    // Animation du target (position)
    const targetAnimation = new BABYLON.Animation(
        "zoomTarget",
        "target",
        60,
        BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    targetAnimation.setKeys([
        { frame: 0, value: camera.target.clone() },
        { frame: 60, value: targetPosition.clone() }
    ]);

    // Easing pour un mouvement fluide (SineEase est le plus doux)
    const easingFunction = new BABYLON.SineEase();
    easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

    radiusAnimation.setEasingFunction(easingFunction);
    targetAnimation.setEasingFunction(easingFunction);

    // Lancer les animations
    camera.animations = [radiusAnimation, targetAnimation];

    const animatable = camera.getScene().beginAnimation(
        camera,
        0,
        60,
        false,
        1 / (duration / 1000) // Correction: SpeedRatio = 1 / dur(s) pour base 60fps
    );

    // Callback à la fin
    if (onComplete) {
        animatable.onAnimationEnd = onComplete;
    }

    console.log(`Zoom lancé (${duration}ms)`);
}

/**
 * Retour au zoom par défaut
 * @param {BABYLON.ArcRotateCamera} camera - La caméra
 * @param {BABYLON.Vector3} defaultTarget - Position cible par défaut
 * @param {number} defaultRadius - Distance par défaut
 * @param {number} duration - Durée de l'animation
 * @param {Function} onComplete - Callback
 */
export function resetCameraZoom(camera, defaultTarget, defaultRadius = 15, duration = 1500, onComplete = null) {
    console.log("Retour vue globale...");
    zoomToMesh(
        camera,
        { position: defaultTarget },
        defaultRadius,
        duration,
        onComplete
    );
}

/**
 * Active/désactive la rotation automatique
 * @param {BABYLON.Scene} scene - La scène
 * @param {BABYLON.Mesh} meshToRotate - Le mesh à faire tourner
 * @param {boolean} enable - Activer (true) ou désactiver (false)
 * @param {number} rotationSpeed - Vitesse de rotation (défaut: 0.01)
 * @returns {Function|null} - La fonction de rotation à stocker (ou null)
 */
export function toggleAutoRotation(scene, meshToRotate, enable, rotationSpeed = 0.01) {
    if (enable) {
        console.log("Rotation automatique activée");

        let frameCount = 0; // Pour debug
        const rotationFunction = () => {
            meshToRotate.rotation.y += rotationSpeed;

            // Log seulement toutes les 60 frames (1 seconde à 60 FPS)
            if (frameCount % 60 === 0) {
                console.log(`Frame ${frameCount}: rotation.y = ${meshToRotate.rotation.y.toFixed(2)}`);
            }
            frameCount++;
        };

        scene.registerBeforeRender(rotationFunction);

        return rotationFunction; // Retourner pour pouvoir désactiver plus tard
    } else {
        console.log("Rotation automatique désactivée");
        return null;
    }
}

/**
 * Arrête la rotation automatique
 * @param {BABYLON.Scene} scene - La scène
 * @param {Function} rotationFunction - La fonction de rotation à arrêter
 */
export function stopAutoRotation(scene, rotationFunction) {
    if (rotationFunction) {
        scene.unregisterBeforeRender(rotationFunction);
        console.log("Rotation arrêtée");
    }
}

/**
 * Système de focus à 3 niveaux
 * @param {string} level - 'global', 'analysis', 'detail'
 * @param {BABYLON.ArcRotateCamera} camera - La caméra
 * @param {Object} targets - Objet avec {global, ring, stone}
 * @param {Function} onComplete - Callback
 */
export function setFocusLevel(level, camera, targets, onComplete = null) {
    const levels = {
        global: { target: targets.global, radius: 20 },
        analysis: { target: targets.ring, radius: 8 },
        detail: { target: targets.stone, radius: 3 }
    };

    const config = levels[level];

    if (!config) {
        console.error(`Niveau de focus inconnu: ${level}`);
        return;
    }

    console.log(`Focus: ${level}`);

    zoomToMesh(
        camera,
        { position: config.target },
        config.radius,
        1000,
        onComplete
    );
}
