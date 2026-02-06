// ========================================
// UI MANAGER - Version ME (Orchestrateur)
// ========================================
// ULTRA SIMPLE : centralise les éléments et délègue au Helper IA !

import { Config } from '../IA/Config.js';
import {
    updateComponentInfoHelper,
    updateExtractionUIHelper,
    updateZoomButtonUIHelper,
    updateRenderModeUIHelper,
    updateRotationButtonHelper,
    updateProgressHelper,
    showTooltipHelper,
    hideTooltipHelper,
    updateStonesVisibilityUIHelper
} from '../IA/UIHelper.js';

export class UIManager {
    constructor() {
        // Liste des éléments principaux
        this.leftControlModal = document.getElementById('leftControlModal');
        this.caoInfoModal = document.getElementById('caoInfoModal');
        this.stoneInfoModal = document.getElementById('stoneInfoModal');
        this.statusModal = document.getElementById('statusModal');
        this.backButton = document.getElementById('backButton');
        this.infoBulle = document.getElementById('infoBulle');
        this.infoTitle = document.getElementById('infoTitle');
        this.statusText = document.getElementById('statusText');
        this.modeStatusTitle = document.getElementById('modeStatusTitle');
    }

    // ========================================
    // LOGIQUE DE PRESENTATION (Appels IA)
    // ========================================

    showTooltip(text) {
        showTooltipHelper(this.infoBulle, this.infoTitle, text);
    }

    hideTooltip() {
        hideTooltipHelper(this.infoBulle);
    }

    onBackClick(callback) {
        if (this.backButton) {
            this.backButton.addEventListener('click', callback);
        }
    }

    onStatusModalClick(callback) {
        if (this.statusModal) {
            this.statusModal.addEventListener('click', callback);
        }
    }

    updateComponentInfo(type) {
        const details = type ? Config.componentDetails[type] : null;
        const introText = Config.componentDetails.intro;

        updateComponentInfoHelper(type, details, introText, {
            stoneInfoModal: this.stoneInfoModal,
            caoInfoModal: this.caoInfoModal
        });
    }

    updateExtractionUI(isExtracted) {
        const btn = document.getElementById('btnExtractStone');
        updateExtractionUIHelper(btn, isExtracted);
    }

    updateZoomButtonUI(isAnalysisMode) {
        const btn = document.getElementById('btnZoomToggle');
        updateZoomButtonUIHelper(btn, isAnalysisMode);
    }

    updateRenderModeUI(activeMode) {
        updateRenderModeUIHelper(activeMode);
    }

    updateRotationButton(isRotating) {
        const btn = document.getElementById('btnRotationToggle');
        updateRotationButtonHelper(btn, isRotating);
    }

    updateProgress(step) {
        updateProgressHelper(step);
    }

    updateStonesVisibilityUI(isVisible) {
        updateStonesVisibilityUIHelper(isVisible);
    }

    // ========================================
    // AFFICHAGE ANALYSE / CAO
    // ========================================

    updateModeTitle(modeName) {
        const titleContainer = this.modeStatusTitle;
        if (!titleContainer) return;

        const h2 = titleContainer.querySelector('h2');
        const bar = titleContainer.querySelector('div');

        if (h2) h2.innerText = modeName;

        // Style dynamique
        if (bar) {
            bar.className = modeName.includes("ANALYSE")
                ? "h-1 w-24 bg-green-500 ml-auto mt-2 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)]"
                : "h-1 w-24 bg-blue-500 ml-auto mt-2 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]";
        }
    }

    // ========================================
    // VISIBILITÉ (Simple orchestration)
    // ========================================

    showLeftControls() {
        if (this.leftControlModal) {
            this.leftControlModal.classList.remove('hidden');
            this.leftControlModal.style.display = 'block';
        }
        if (this.modeStatusTitle) {
            this.modeStatusTitle.classList.remove('hidden');
            this.modeStatusTitle.style.display = 'block';
        }
    }

    hideLeftControls() {
        if (this.leftControlModal) {
            this.leftControlModal.classList.add('hidden');
            this.leftControlModal.style.display = 'none';
        }
        if (this.modeStatusTitle) {
            this.modeStatusTitle.classList.add('hidden');
            this.modeStatusTitle.style.display = 'none';
        }
    }

    showCaoInfoModal() {
        if (this.caoInfoModal) {
            this.caoInfoModal.classList.remove('hidden');
            this.caoInfoModal.style.display = 'block';
        }
    }

    hideCaoInfoModal() {
        if (this.caoInfoModal) {
            this.caoInfoModal.classList.add('hidden');
            this.caoInfoModal.style.display = 'none';
        }
    }

    showBackButton() { if (this.backButton) this.backButton.classList.remove('hidden'); }
    hideBackButton() { if (this.backButton) this.backButton.classList.add('hidden'); }

    showStatusModal(isPowerOn) {
        if (!this.statusModal || !this.statusText) return;
        this.statusText.textContent = isPowerOn ? "PC allumé - Cliquez sur l'écran" : "Allumez le PC (clic sur la tour)";
        this.statusModal.classList.remove('hidden');
    }
    hideStatusModal() { if (this.statusModal) this.statusModal.classList.add('hidden'); }

    hideAll() {
        this.hideStatusModal();
        this.hideBackButton();
        this.hideCaoInfoModal();
        this.hideLeftControls();
        if (this.infoBulle) this.infoBulle.classList.add('hidden');
        if (this.stoneInfoModal) {
            this.stoneInfoModal.classList.add('hidden');
            this.stoneInfoModal.style.display = 'none';
        }
    }
}
