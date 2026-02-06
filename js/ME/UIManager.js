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
        this.caoInfoModal = document.getElementById('caoInfoModal');
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
    // HIDE ALL
    // ========================================
    hideAll() {
        this.hideStatusModal();
        this.hideBackButton();
        this.hideTooltip();
        this.hideCaoInfoModal();
    }
}
