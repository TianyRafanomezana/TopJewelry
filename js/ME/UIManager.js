// ========================================
// UI MANAGER - Version ME
// ========================================
// Gère les éléments UI (modales, tooltips, boutons)

export class UIManager {
    constructor() {
        this.statusModal = document.getElementById('statusModal');
        this.backButton = document.getElementById('backButton');
        this.infoBulle = document.getElementById('infoBulle');
        this.statusText = document.getElementById('statusText');
        this.infoTitle = document.getElementById('infoTitle');
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
    // HIDE ALL
    // ========================================
    hideAll() {
        this.hideStatusModal();
        this.hideBackButton();
        this.hideTooltip();
    }
}
