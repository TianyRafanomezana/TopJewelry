// ========================================
// UI MANAGER - Version ME
// ========================================
// Gère les éléments UI (modales, tooltips, boutons)

import { Config } from '../IA/Config.js';

export class UIManager {
    constructor() {
        this.statusModal = document.getElementById('statusModal');
        this.backButton = document.getElementById('backButton');
        this.infoBulle = document.getElementById('infoBulle');
        this.statusText = document.getElementById('statusText');
        this.infoTitle = document.getElementById('infoTitle');
        this.caoInfoModal = document.getElementById('caoInfoModal');
        this.stoneInfoModal = document.getElementById('stoneInfoModal');
        this.leftControlModal = document.getElementById('leftControlModal');
    }

    updateStonesVisibilityUI(isVisible) {
        const iconEl = document.getElementById('stonesVisibilityIcon');
        const textEl = document.querySelector('#btnStonesVisibility .font-medium');
        if (iconEl) {
            iconEl.textContent = isVisible ? '✅' : '❌';
        }
        if (textEl) {
            textEl.textContent = isVisible ? '👁️ Pierres Visibles' : '👁️‍🗨️ Pierres Masquées';
        }
    }

    // ========================================
    // TOOLTIPS
    // ========================================
    showTooltip(text) {
        if (!this.infoBulle) return;

        if (this.infoTitle) {
            this.infoTitle.textContent = text;
        } else {
            this.infoBulle.textContent = text;
        }

        this.infoBulle.classList.remove('hidden');
    }

    hideTooltip() {
        if (this.infoBulle) {
            this.infoBulle.classList.add('hidden');
        }
    }

    // ========================================
    // COMPONENT INFO MODAL (Stones/Metal)
    // ========================================
    updateComponentInfo(type) {
        if (!this.stoneInfoModal || !this.caoInfoModal) return;

        if (!type) {
            // Pas de sélection -> Retour au mode général
            this.stoneInfoModal.classList.add('hidden');
            this.stoneInfoModal.style.display = 'none';
            this.showCaoInfoModal();
            return;
        }

        // Sélection active -> Afficher détails
        this.hideCaoInfoModal();

        const details = Config.componentDetails[type];
        const introText = Config.componentDetails.intro;

        if (details) {
            // Update UI Elements
            const titleEl = this.stoneInfoModal.querySelector('#stoneInfoTitle');
            const introEl = this.stoneInfoModal.querySelector('#stoneInfoIntro');
            const detailTitleEl = this.stoneInfoModal.querySelector('#stoneDetailTitle');
            const detailDescEl = this.stoneInfoModal.querySelector('#stoneDetailDesc');
            const iconEl = this.stoneInfoModal.querySelector('#stoneInfoIcon');

            if (titleEl) titleEl.textContent = details.title; // "💎 Diamant"
            if (introEl) introEl.textContent = introText;
            if (detailTitleEl) detailTitleEl.textContent = "Spécificités";
            if (detailDescEl) detailDescEl.textContent = details.description;

            // Icon extraction (simple hack: first char)
            if (iconEl && details.title) {
                const iconChar = Array.from(details.title)[0]; // Handle emoji correctly
                iconEl.textContent = iconChar;
            }

            // Gestion de la visibilité des boutons
            const btnSelectAll = this.stoneInfoModal.querySelector('#btnSelectAllStones');
            const btnVisibilityModal = this.stoneInfoModal.querySelector('#btnStonesVisibilityModal');
            const btnExtract = this.stoneInfoModal.querySelector('#btnExtractStone');

            if (btnSelectAll && btnVisibilityModal && btnExtract) {
                // "Voir tout" seulement pour pierres individuelles
                const isSingleStone = (type === 'diamond' || type === 'gem');
                btnSelectAll.style.display = isSingleStone ? 'flex' : 'none';

                // "Masquer les pierres" seulement si on voit "all_stones"
                const isAllStones = (type === 'all_stones');
                btnVisibilityModal.style.display = isAllStones ? 'flex' : 'none';

                // "Détail / Extraction" seulement si pierre individuelle
                btnExtract.style.display = isSingleStone ? 'flex' : 'none';

                // Reset texte extraction si on change de pierre
                this.updateExtractionUI(false);
            }

            this.stoneInfoModal.classList.remove('hidden');
            this.stoneInfoModal.style.display = 'block';
        }
    }

    updateExtractionUI(isExtracted) {
        const btn = document.getElementById('btnExtractStone');
        if (!btn) return;

        const textEl = btn.querySelector('span:nth-child(1)');
        const iconEl = btn.querySelector('#extractStoneIcon');

        if (textEl) textEl.textContent = isExtracted ? "🔙 Remettre en place" : "🔍 Voir le détail";
        if (iconEl) iconEl.textContent = isExtracted ? "⬇️" : "💎";

        if (isExtracted) {
            btn.classList.add('bg-blue-600/40', 'border-blue-400');
            btn.classList.remove('bg-blue-600/20', 'border-blue-500/30');
        } else {
            btn.classList.remove('bg-blue-600/40', 'border-blue-400');
            btn.classList.add('bg-blue-600/20', 'border-blue-500/30');
        }
    }

    // ... (showCaoInfoModal, hideCaoInfoModal ...)

    updateStonesVisibilityUI(isVisible) {
        // 1. Bouton Gauche
        const iconEl = document.getElementById('stonesVisibilityIcon');
        const textEl = document.querySelector('#btnStonesVisibility .font-medium');
        if (iconEl) iconEl.textContent = isVisible ? '✅' : '❌';
        if (textEl) textEl.textContent = isVisible ? '👁️ Pierres Visibles' : '👁️‍🗨️ Pierres Masquées';

        // 2. Bouton Modal (Droite)
        const iconModalEl = document.getElementById('stonesVisibilityIconModal');
        const textModalEl = document.querySelector('#btnStonesVisibilityModal .font-medium');
        if (iconModalEl) iconModalEl.textContent = isVisible ? '✅' : '❌';
        if (textModalEl) textModalEl.textContent = isVisible ? '👁️ Masquer les pierres' : '👁️ Afficher les pierres';
    }

    // ========================================
    // CAO INFO MODAL (Right Side)
    // ========================================
    showCaoInfoModal() {
        if (this.caoInfoModal) {
            this.caoInfoModal.classList.remove('hidden');

            // Forcer le masquage pour être sûr
            this.caoInfoModal.style.display = 'block';
        }
    }

    hideCaoInfoModal() {
        if (this.caoInfoModal) {
            this.caoInfoModal.classList.add('hidden');
            this.caoInfoModal.style.display = 'none'; // Sécurité additionnelle
        }
    }

    // ========================================
    // BACK BUTTON
    // ========================================
    showBackButton() {
        if (this.backButton) {
            this.backButton.classList.remove('hidden');
        }
    }

    hideBackButton() {
        if (this.backButton) {
            this.backButton.classList.add('hidden');
        }
    }

    onBackClick(callback) {
        if (this.backButton) {
            this.backButton.addEventListener('click', callback);
        }
    }

    // ========================================
    // STATUS MODAL
    // ========================================
    showStatusModal(isPowerOn) {
        if (!this.statusModal || !this.statusText) return;

        if (isPowerOn) {
            this.statusText.textContent = "💻 PC allumé - Cliquez sur l'écran";
        } else {
            this.statusText.textContent = "⚡ Allumez le PC (clic sur la tour)";
        }

        this.statusModal.classList.remove('hidden');
    }

    hideStatusModal() {
        if (this.statusModal) {
            this.statusModal.classList.add('hidden');
        }
    }

    onStatusModalClick(callback) {
        if (this.statusModal) {
            this.statusModal.addEventListener('click', callback);
        }
    }

    // ========================================
    // PROGRESS TIMELINE
    // ========================================
    updateProgress(step) {
        const steps = [
            document.getElementById("step1"),
            document.getElementById("step2"),
            document.getElementById("step3"),
            document.getElementById("step4")
        ];

        steps.forEach((stepElement, index) => {
            if (!stepElement) return;

            if (index < step) {
                stepElement.classList.remove("bg-gray-400/50", "text-gray-400");
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

    // ========================================
    // CAO INFO MODAL (Right Side)
    // ========================================
    showCaoInfoModal() {
        if (this.caoInfoModal) {
            this.caoInfoModal.classList.remove('hidden');
            // Réactiver les événements de pointeur si nécessaire (bien que le CSS ait pointer-events-none, on peut vouloir cliquer dessus ?)
            // Ah non, le modal est informatif "pointer-events-none" de base dans le HTML.
            // Si on veut qu'il bloque pas quand caché, c'est bon.
            // Mais s'il a disparu visuellement mais reste là...

            // Forcer le masquage pour être sûr
            this.caoInfoModal.style.display = 'block';
        }
    }

    hideCaoInfoModal() {
        if (this.caoInfoModal) {
            this.caoInfoModal.classList.add('hidden');
            this.caoInfoModal.style.display = 'none'; // Sécurité additionnelle
        }
    }

    // ========================================
    // LEFT CONTROL MODAL (CAD Controls)
    // ========================================
    showLeftControls() {
        if (this.leftControlModal) {
            this.leftControlModal.classList.remove('hidden');
            this.leftControlModal.style.display = 'block';
        }
        this.showModeTitle();
    }

    hideLeftControls() {
        if (this.leftControlModal) {
            this.leftControlModal.classList.add('hidden');
            this.leftControlModal.style.display = 'none';
        }
        this.hideModeTitle();
    }

    // Gestion du Titre de Mode (Bas Droite)
    showModeTitle() {
        const title = document.getElementById('modeStatusTitle');
        if (title) {
            title.classList.remove('hidden');
            title.style.display = 'block';
        }
    }

    hideModeTitle() {
        const title = document.getElementById('modeStatusTitle');
        if (title) {
            title.classList.add('hidden');
            title.style.display = 'none';
        }
    }

    updateModeTitle(modeName) {
        const titleContainer = document.getElementById('modeStatusTitle');
        if (titleContainer) {
            const h2 = titleContainer.querySelector('h2');
            const bar = titleContainer.querySelector('div');

            if (h2) h2.innerText = modeName;

            // Couleur dynamique selon le mode
            if (modeName.includes("ANALYSE")) {
                if (bar) bar.className = "h-1 w-24 bg-green-500 ml-auto mt-2 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)]";
            } else {
                if (bar) bar.className = "h-1 w-24 bg-blue-500 ml-auto mt-2 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]";
            }
        }
    }

    // Mise à jour du bouton Zoom (Texte + Icone)
    updateZoomButtonUI(isAnalysisMode) {
        const btn = document.getElementById('btnZoomToggle');
        if (!btn) return;

        const spanText = btn.querySelector('span:nth-child(1)');
        const spanIcon = btn.querySelector('span:nth-child(2)');

        if (isAnalysisMode) {
            // Mode Actif -> Proposer de SORTIR
            if (spanText) spanText.innerText = "🔙 Sortir";
            if (spanIcon) spanIcon.innerText = "❌";
            btn.classList.remove('bg-blue-500', 'hover:bg-blue-400', 'shadow-blue-500/30');
            btn.classList.add('bg-red-500', 'hover:bg-red-400', 'shadow-red-500/30');
        } else {
            // Mode Inactif -> Proposer d'ENTRER
            if (spanText) spanText.innerText = "🔍 Mode Analyse";
            if (spanIcon) spanIcon.innerText = "↦";
            btn.classList.remove('bg-red-500', 'hover:bg-red-400', 'shadow-red-500/30');
            btn.classList.add('bg-blue-500', 'hover:bg-blue-400', 'shadow-blue-500/30');
        }
    }

    // Mise à jour des boutons de mode de rendu
    updateRenderModeUI(activeMode) {
        const resetBtn = (id) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.classList.remove('bg-purple-500', 'bg-blue-500', 'bg-teal-500');
                btn.classList.add('bg-white/5');
            }
        };

        const activeBtn = (id, colorClass) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.classList.remove('bg-white/5');
                btn.classList.add(colorClass);
            }
        };

        // Reset all
        resetBtn('btnModeRealistic');
        resetBtn('btnModeBlueprint');
        resetBtn('btnModeXRay');

        // Activate active
        if (activeMode === 'XRAY') activeBtn('btnModeXRay', 'bg-teal-500');
    }

    // Mise à jour du bouton Rotation
    updateRotationButton(isRotating) {
        const btn = document.getElementById('btnRotationToggle');
        if (!btn) return;

        const iconEl = document.getElementById('rotationStatusIcon');
        if (iconEl) {
            iconEl.textContent = isRotating ? "⏸️" : "▶️";
        }

        // Optionnel : Changer couleur si stoppé
        if (isRotating) {
            btn.classList.remove('bg-red-500/20', 'border-red-500/50');
            btn.classList.add('bg-slate-700');
        } else {
            btn.classList.remove('bg-slate-700');
            btn.classList.add('bg-red-500/20', 'border', 'border-red-500/50');
        }
    }

    // ========================================
    // HIDE ALL
    // ========================================
    hideAll() {
        this.hideStatusModal();
        this.hideBackButton();
        this.hideTooltip();
        this.hideCaoInfoModal();
        this.hideLeftControls();
    }
}
