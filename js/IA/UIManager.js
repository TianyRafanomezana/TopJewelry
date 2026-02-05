export class UIManager {
    constructor(onStepClick = null) {
        this.infoBulle = document.getElementById("infoBulle");
        this.backButton = document.getElementById("backButton");
        this.statusModal = document.getElementById("statusModal");
        this.statusText = document.getElementById("statusText");

        // Progress timeline
        this.steps = [
            document.getElementById("step1"),
            document.getElementById("step2"),
            document.getElementById("step3"),
            document.getElementById("step4")
        ];
        this.currentStep = 1;

        this.onStepClick = onStepClick; // Callback for scene navigation
        this.setupTimelineClicks();

        this.setupFollowMouse();
    }

    // ... rest of class logic ...

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

    showStatusModal(isScreenOn) {
        if (!this.statusModal || !this.statusText) return;

        // Update text and color based on state
        if (isScreenOn) {
            this.statusText.innerText = "🟢 PC Allumé";
            this.statusModal.style.borderColor = "rgba(0, 255, 100, 0.5)"; // Green border
        } else {
            this.statusText.innerText = "🔴 PC Éteint";
            this.statusModal.style.borderColor = "rgba(255, 50, 50, 0.5)"; // Red border
        }

        this.statusModal.classList.remove("hidden");
    }

    hideStatusModal() {
        if (this.statusModal) {
            this.statusModal.classList.add("hidden");
        }
    }

    onStatusModalClick(callback) {
        if (this.statusModal) {
            this.statusModal.addEventListener("click", () => callback());
            // Make modal clickable
            this.statusModal.style.pointerEvents = "auto";
            this.statusModal.style.cursor = "pointer";
        }
    }

    setupTimelineClicks() {
        this.steps.forEach((step, index) => {
            if (!step) return;

            const stepNumber = index + 1;
            const li = step.closest('li');

            if (li) {
                // Make step clickable with hover effect
                li.style.cursor = 'pointer';
                li.style.transition = 'transform 0.2s';

                li.addEventListener('mouseenter', () => {
                    if (stepNumber !== this.currentStep) {
                        li.style.transform = 'scale(1.05)';
                    }
                });

                li.addEventListener('mouseleave', () => {
                    li.style.transform = 'scale(1)';
                });

                li.addEventListener('click', () => {
                    if (this.onStepClick) {
                        this.onStepClick(stepNumber);
                    }
                });
            }
        });
    }

    updateProgress(step) {
        if (step < 1 || step > 4) return;
        this.currentStep = step;

        this.steps.forEach((stepEl, index) => {
            const stepNum = index + 1;
            const li = stepEl.closest('li');
            const label = li ? li.querySelector('div.mt-2 span') : null;

            if (stepNum < step) {
                // Completed step - green with checkmark
                stepEl.className = "size-7 flex justify-center items-center shrink-0 bg-green-400 text-white font-medium rounded-full";
                stepEl.classList.remove("step-active");
                stepEl.innerText = "✓";
                if (label) label.className = "block text-xs font-medium text-green-400";
            } else if (stepNum === step) {
                // Active step - blue with pulse
                stepEl.className = "size-7 flex justify-center items-center shrink-0 bg-blue-400 text-white font-medium rounded-full shadow-lg shadow-blue-400/50 step-active";
                stepEl.innerText = stepNum;
                if (label) label.className = "block text-xs font-medium text-white whitespace-nowrap";
            } else {
                // Inactive step - gray
                stepEl.className = "size-7 flex justify-center items-center shrink-0 bg-gray-400/50 text-gray-400 font-medium rounded-full";
                stepEl.classList.remove("step-active");
                stepEl.innerText = stepNum;
                if (label) label.className = "block text-xs font-medium text-gray-400";
            }
        });
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
