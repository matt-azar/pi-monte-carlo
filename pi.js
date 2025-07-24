/**
 * Monte Carlo simulation to estimate the value of π using random sampling
 * of points in a square.
 *
 * This class sets up a canvas, draws a square with an inscribed circle,
 * and places random dots to estimate π using the ratio of points inside
 * the circle to the total number of points in the square.
 */
class MonteCarloPi {
    // Geometry configuration
    squareSize = 500;
    offset = 50; // offset from canvas edges
    radius = this.squareSize / 2;
    centerX = this.offset + this.radius;
    centerY = this.offset + this.radius;

    // Stats
    total = 0;
    inside = 0;

    constructor(autoStart = true) {
        this.setupCanvas();
        this.drawBoard();
        this.setupSliderUI();

        // Automatically start the simulation if `auto` is true
        if (autoStart) {
            // this.drawStats();
            this.animate();
        }
    }

    // --- Setup methods ---

    /**
     * Set up a 600 × 600 canvas.
     */
    setupCanvas() {
        this.canvas = document.createElement("canvas");
        this.canvas.width = 600;
        this.canvas.height = 600;
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext("2d");
    }

    /**
     * Draw square and inscribed circle.
     */
    drawBoard() {
        const ctx = this.ctx;
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 3;
        ctx.strokeRect(
            this.offset,
            this.offset,
            this.squareSize,
            this.squareSize
        );
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI);
        ctx.strokeStyle = "#000000ff";
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    /**
     * Create slider UI for adjusting dot delay.
     */
    setupSliderUI() {
        this.sliderLabel = document.createElement("label");
        this.sliderLabel.textContent = "Dot delay: ";
        this.sliderLabel.style.font = "16px sans-serif";
        this.sliderLabel.style.marginRight = "8px";

        this.slider = document.createElement("input");
        this.slider.type = "range";
        this.slider.min = "0"; // no time delay
        this.slider.max = "1000"; // 1 dot per second
        this.slider.value = "500"; // default: 500 ms
        this.slider.style.verticalAlign = "middle";

        this.sliderValue = document.createElement("span");
        this.sliderValue.textContent = this.slider.value + " ms";
        this.sliderValue.style.marginLeft = "8px";

        this.slider.addEventListener("input", () => {
            this.sliderValue.textContent = this.slider.value + " ms";
        });

        this.controlsDiv = document.createElement("div");

        Object.assign(this.controlsDiv.style, {
            position: "fixed",
            bottom: "50px", // up from bottom edge
            left: "50px", // in from left edge
            padding: "8px",
            background: "rgba(255,255,255,0.8)",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            zIndex: "1000",
        });

        this.controlsDiv.appendChild(this.sliderLabel);
        this.controlsDiv.appendChild(this.slider);
        this.controlsDiv.appendChild(this.sliderValue);
        document.body.appendChild(this.controlsDiv);
    }

    // --- Loop methods ---

    /**
     * Draw a dot on the canvas. Called by `animate()`.
     *
     * @param {*} x - The x-coordinate
     * @param {*} y - The y-coordinate
     * @param {*} isInside - Whether the dot is inside the circle
     */
    drawDot(x, y, isInside) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI); // dots are 8 pixels in diameter
        ctx.fillStyle = isInside ? "green" : "red";
        ctx.fill();
    }

    /**
     * Draw statistics and computations on the canvas.
     *
     * Called by `animate()` after each dot is drawn.
     */
    drawStats() {
        const ctx = this.ctx;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, 600, 40);
        ctx.fillStyle = "#222";
        ctx.font = "18px sans-serif";
        ctx.fillText(`Total:\t${this.total}`, 50, 20);
        ctx.fillText(`Inside:\t${this.inside}`, 50, 38);
        if (this.total > 0) {
            const piEstimate = (this.inside / this.total) * 4;
            ctx.fillText(
                `4 × (Inside / Total) = ${piEstimate.toFixed(6)} → 𝜋`,
                200,
                20
            );
            const z = this.computeZScore();
            ctx.fillText(
                `Standard deviations from expectation: ${z.toFixed(2)}`,
                200,
                38
            );
        }
    }

    /**
     * Compute the number of standard deviations from expectation for the
     * current ratio of dots inside the circle to total dots.
     *
     * Called by `drawStats()`.
     */
    computeZScore() {
        // Probability of a point being inside the circle: p = pi/4
        const p = Math.PI / 4;
        const n = this.total;
        if (n === 0) return 0;

        // Observed proportion
        const observed = this.inside / n;

        // Standard deviation for binomial: sqrt(p*(1-p)/n)
        const std = Math.sqrt((p * (1 - p)) / n);

        // Z-score: (observed - expected) / std
        return std === 0 ? 0 : (observed - p) / std;
    }

    /**
     * Main animation loop.
     */
    animate() {
        const interval = parseInt(this.slider.value, 10);
        const x = Math.random() * this.squareSize + this.offset;
        const y = Math.random() * this.squareSize + this.offset;
        const dx = x - this.centerX;
        const dy = y - this.centerY;
        const isInside = dx * dx + dy * dy < this.radius * this.radius;

        this.drawDot(x, y, isInside);

        ++this.total;
        if (isInside) ++this.inside;

        this.drawStats();

        setTimeout(() => this.animate(), interval);
    }
}

new MonteCarloPi();
