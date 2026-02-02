export class UIManager {
    constructor() {
        this.bulle = document.getElementById("infoBulle");
        this.backBtn = document.getElementById("backButton");
        this.setupFollowMouse();
    }

    showTooltip(text) {
        if (!this.bulle) return;
        this.bulle.innerText = text;
        this.bulle.classList.remove("hidden");
    }

    hideTooltip() {
        if (!this.bulle) return;
        this.bulle.classList.add("hidden");
    }

    showBackButton() {
        if (this.backBtn) this.backBtn.classList.remove("hidden");
    }

    hideBackButton() {
        if (this.backBtn) this.backBtn.classList.add("hidden");
    }

    onBackClick(callback) {
        if (this.backBtn) {
            this.backBtn.addEventListener("click", callback);
        }
    }

    setupFollowMouse() {
        window.addEventListener('mousemove', (e) => {
            if (this.bulle && !this.bulle.classList.contains("hidden")) {
                this.bulle.style.left = (e.clientX + 15) + 'px';
                this.bulle.style.top = (e.clientY + 15) + 'px';
            }
        });
    }
}
