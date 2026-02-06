/**
 * UI HELPER - Manipulation du DOM pour l'interface
 */

/**
 * Dictionnaire d'icônes SVG (Style Lucide)
 */
const ICONS = {
    diamond: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 12L2 9z"/><path d="M11 3 8 9l3 12"/><path d="m13 3 3 6-3 12"/><path d="M2 9h20"/></svg>`,
    selection: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>`,
    extract: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 21-6-6m6 6v-4.8m0 4.8h-4.8"/><path d="M3 16.2V21m0 0h4.8M3 21l6-6"/><path d="M21 7.8V3m0 0h-4.8M21 3l-6 6"/><path d="M3 7.8V3m0 0h4.8M3 3l6 6"/></svg>`,
    retract: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 15 6 6m-6-6v4.8m0-4.8h4.8"/><path d="M9 15.2 3 21m6-5.8V21m0-5.8H4.2"/><path d="M15 9.2 21 3m-6 5.8V3m0 5.8h4.8"/><path d="M9 9.2 3 3m6 5.8V3m0 5.8H4.2"/></svg>`,
    eye: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
    eyeOff: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>`,
    play: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
    pause: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`,
    search: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
    arrowRight: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
    x: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
    palette: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.688-1.688h1.938c3.105 0 5.625-2.52 5.625-5.625 0-4.62-4.62-8.75-10-8.75Z"/></svg>`,
    ruler: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.3 15.3 4.7 1.3"/><path d="m20.3 14.3-2.4-2.4"/><path d="m15.3 9.3-2.4-2.4"/><path d="m10.3 4.3-2.4-2.4"/><path d="m21 21-2.1-2.1"/><path d="m3 3 18 18"/></svg>`, // Hand-crafted simplified blueprint
    bone: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 10c.7-.7 1.69 0 2.5 0 1.5 0 2.5 1 2.5 2.5S21 15 19.5 15c-.81 0-1.8-.7-2.5 0"/><path d="M17 10c-.7-.7 0-1.69 0-2.5C17 6 16 5 14.5 5S12 6 12 7.5c0 .81.7 1.8 0 2.5"/><path d="M12 14c-.7.7-1.69 0-2.5 0-1.5 0-2.5-1-2.5-2.5S8 9 9.5 9c.81 0 1.8.7 2.5 0"/><path d="M7 14c.7.7 0 1.69 0 2.5C7 18 8 19 9.5 19S12 18 12 16.5c0-.81-.7-1.8 0-2.5"/><path d="m12 10 2 2-2 2-2-2z"/></svg>`, // Simplified x-ray
    cog: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`
};

/**
 * Récupérer un SVG par son nom
 */
export function getIconSVG(name) {
    return ICONS[name] || '';
}

/**
 * Mettre à jour les informations d'un composant (Pierre/Métal) dans la modale
 */
export function updateComponentInfoHelper(type, details, introText, uiElements) {
    const { stoneInfoModal, caoInfoModal } = uiElements;

    if (!type) {
        if (stoneInfoModal) {
            stoneInfoModal.classList.add('hidden');
            stoneInfoModal.style.display = 'none';
        }
        if (caoInfoModal) {
            caoInfoModal.classList.remove('hidden');
            caoInfoModal.style.display = 'block';
        }
        return;
    }

    if (caoInfoModal) {
        caoInfoModal.classList.add('hidden');
        caoInfoModal.style.display = 'none';
    }

    if (stoneInfoModal && details) {
        const titleEl = stoneInfoModal.querySelector('#stoneInfoTitle');
        const introEl = stoneInfoModal.querySelector('#stoneInfoIntro');
        const detailDescEl = stoneInfoModal.querySelector('#stoneDetailDesc');
        const iconEl = stoneInfoModal.querySelector('#stoneInfoIcon');

        if (titleEl) titleEl.textContent = details.title;
        if (introEl) introEl.textContent = introText;
        if (detailDescEl) detailDescEl.textContent = details.description;

        if (iconEl) {
            const isMetal = type === 'metal' || type === 'bezel' || type === 'prong';
            iconEl.innerHTML = isMetal ? getIconSVG('cog') : getIconSVG('diamond');
        }

        // Visibilité des boutons contextuels
        const btnSelectAll = stoneInfoModal.querySelector('#btnSelectAllStones');
        const btnSelectAllMetals = stoneInfoModal.querySelector('#btnSelectAllMetals');
        const btnVisibilityModal = stoneInfoModal.querySelector('#btnStonesVisibilityModal');
        const btnExtract = stoneInfoModal.querySelector('#btnExtractStone');

        const isStone = type === 'diamond' || type === 'gem';
        const isMetal = type === 'metal' || type === 'bezel' || type === 'prong';

        if (btnSelectAll) btnSelectAll.style.display = isStone ? 'flex' : 'none';
        if (btnSelectAllMetals) {
            btnSelectAllMetals.style.display = isMetal ? 'flex' : 'none';
            if (isMetal) {
                const textEl = btnSelectAllMetals.querySelector('span:nth-child(2)');
                let label = "Tout sélectionner";
                if (type === 'metal') label = "Sélectionner tous les corps";
                if (type === 'bezel') label = "Sélectionner tous les chatons";
                if (type === 'prong') label = "Sélectionner toutes les griffes";
                if (textEl) textEl.textContent = label;

                // On stocke le type actuel sur le bouton pour que CADHelper puisse le récupérer
                btnSelectAllMetals.dataset.currentCategory = type;
            }
        }

        if (btnVisibilityModal) btnVisibilityModal.style.display = (type === 'all_stones') ? 'flex' : 'none';
        if (btnExtract) btnExtract.style.display = isStone ? 'flex' : 'none';

        stoneInfoModal.classList.remove('hidden');
        stoneInfoModal.style.display = 'block';
    }
}

/**
 * Mise à jour visuelle du bouton d'extraction
 */
export function updateExtractionUIHelper(btn, isExtracted) {
    if (!btn) return;

    const textEl = btn.querySelector('span:nth-child(1)');
    const iconEl = btn.querySelector('#extractStoneIcon');

    if (textEl) textEl.textContent = isExtracted ? "Remettre en place" : "Voir le détail";
    if (iconEl) {
        iconEl.innerHTML = isExtracted ? getIconSVG('retract') : getIconSVG('extract');
    }

    if (isExtracted) {
        btn.classList.add('bg-blue-600/40', 'border-blue-400');
        btn.classList.remove('bg-blue-600/20', 'border-blue-500/30');
    } else {
        btn.classList.remove('bg-blue-600/40', 'border-blue-400');
        btn.classList.add('bg-blue-600/20', 'border-blue-500/30');
    }
}

/**
 * Mise à jour visuelle du bouton de zoom (Analyse)
 */
export function updateZoomButtonUIHelper(btn, isAnalysisMode) {
    if (!btn) return;

    const spanText = btn.querySelector('span:nth-child(1)');
    const iconEl = btn.querySelector('#zoomStatusIcon');

    if (isAnalysisMode) {
        if (spanText) spanText.innerText = "Sortir";
        if (iconEl) iconEl.innerHTML = getIconSVG('x');
        btn.classList.remove('bg-blue-500', 'hover:bg-blue-400', 'shadow-blue-500/30');
        btn.classList.add('bg-red-500', 'hover:bg-red-400', 'shadow-red-500/30');
    } else {
        if (spanText) spanText.innerText = "Mode Analyse";
        if (iconEl) iconEl.innerHTML = getIconSVG('arrowRight');
        btn.classList.remove('bg-red-500', 'hover:bg-red-400', 'shadow-red-500/30');
        btn.classList.add('bg-blue-500', 'hover:bg-blue-400', 'shadow-blue-500/30');
    }
}

/**
 * Mise à jour visuelle des boutons de mode de rendu
 */
export function updateRenderModeUIHelper(activeMode) {
    const modes = {
        'btnModeRealistic': 'bg-blue-500',
        'btnModeBlueprint': 'bg-purple-500',
        'btnModeXRay': 'bg-teal-500'
    };

    Object.entries(modes).forEach(([id, colorClass]) => {
        const btn = document.getElementById(id);
        if (!btn) return;

        const iconEl = btn.querySelector('span');

        const isActive = (id === 'btnModeRealistic' && activeMode === 'REALISTIC') ||
            (id === 'btnModeBlueprint' && activeMode === 'BLUEPRINT') ||
            (id === 'btnModeXRay' && activeMode === 'XRAY');

        if (isActive) {
            btn.classList.remove('bg-white/5');
            btn.classList.add(colorClass);
        } else {
            btn.classList.remove('bg-purple-500', 'bg-blue-500', 'bg-teal-500');
            btn.classList.add('bg-white/5');
        }
    });
}

/**
 * Mise à jour visuelle du bouton de rotation
 */
export function updateRotationButtonHelper(btn, isRotating) {
    if (!btn) return;

    const iconEl = document.getElementById('rotationStatusIcon');
    if (iconEl) {
        iconEl.innerHTML = isRotating ? getIconSVG('pause') : getIconSVG('play');
    }

    if (isRotating) {
        btn.classList.remove('bg-red-500/20', 'border-red-500/50');
        btn.classList.add('bg-slate-700');
    } else {
        btn.classList.remove('bg-slate-700');
        btn.classList.add('bg-red-500/20', 'border', 'border-red-500/50');
    }
}

/**
 * Mise à jour de la timeline de progression
 */
export function updateProgressHelper(step) {
    const steps = [
        document.getElementById("step1"),
        document.getElementById("step2"),
        document.getElementById("step3"),
        document.getElementById("step4")
    ];

    steps.forEach((stepElement, index) => {
        if (!stepElement) return;

        if (index < step) {
            stepElement.classList.remove("bg-gray-400/50", "text-gray-400", "bg-blue-400");
            stepElement.classList.add("bg-green-500", "text-white");
        } else if (index === step) {
            stepElement.classList.remove("bg-gray-400/50", "text-gray-400", "bg-green-500");
            stepElement.classList.add("bg-blue-400", "text-white");
        } else {
            stepElement.classList.remove("bg-blue-400", "bg-green-500", "text-white");
            stepElement.classList.add("bg-gray-400/50", "text-gray-400");
        }
    });
}

/**
 * Afficher une info-bulle (Tooltip)
 */
export function showTooltipHelper(infoBulle, infoTitle, text) {
    if (!infoBulle) return;
    if (infoTitle) {
        infoTitle.textContent = text;
    } else {
        infoBulle.textContent = text;
    }
    infoBulle.classList.remove('hidden');
}

/**
 * Masquer l'info-bulle
 */
export function hideTooltipHelper(infoBulle) {
    if (infoBulle) {
        infoBulle.classList.add('hidden');
    }
}
/**
 * Mise à jour de la visibilité des pierres (Icônes SVG)
 */
export function updateStonesVisibilityUIHelper(isVisible) {
    const iconEl = document.getElementById('stonesVisibilityIcon');
    const textEl = document.querySelector('#btnStonesVisibility .font-medium');
    const iconModalEl = document.getElementById('stonesVisibilityIconModal');
    const textModalEl = document.querySelector('#btnStonesVisibilityModal .font-medium');

    const svgOpen = getIconSVG('eye');
    const svgClosed = getIconSVG('eyeOff');

    if (iconEl) iconEl.innerHTML = isVisible ? svgOpen : svgClosed;
    if (textEl) textEl.textContent = isVisible ? 'Pierres Visibles' : 'Pierres Masquées';

    if (iconModalEl) iconModalEl.innerHTML = isVisible ? svgClosed : svgOpen; // Inverse logic: proposed action
    if (textModalEl) textModalEl.textContent = isVisible ? 'Masquer les pierres' : 'Afficher les pierres';
}
