
const color = document.querySelector("#Color");
const button = document.querySelector("#generateBtn");
const randomBtn = document.querySelector("#randomBtn");
const boxes = document.querySelectorAll(".color-box");
const selectedHex = document.querySelector("#selectedHex");
const copyMessage = document.querySelector("#copyMessage");

const lightness = [90, 75, 60, 50, 35, 20];

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return [r, g, b];
}

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    let h;
    let s;

    const l = (max + min) / 2;

    if (max === min) {
        h = 0;
        s = 0;
    } else {
        const d = max - min;

        s = l > 0.5
            ? d / (2 - max - min)
            : d / (max + min);

        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;

            case g:
                h = (b - r) / d + 2;
                break;

            case b:
                h = (r - g) / d + 4;
                break;
        }

        h /= 6;
    }

    return [h * 360, s * 100, l * 100];
}

function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;

    let r = 0;
    let g = 0;
    let b = 0;

    if (h < 60) {
        r = c;
        g = x;
    } else if (h < 120) {
        r = x;
        g = c;
    } else if (h < 180) {
        g = c;
        b = x;
    } else if (h < 240) {
        g = x;
        b = c;
    } else if (h < 300) {
        r = x;
        b = c;
    } else {
        r = c;
        b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return (
        "#" +
        r.toString(16).padStart(2, "0") +
        g.toString(16).padStart(2, "0") +
        b.toString(16).padStart(2, "0")
    ).toUpperCase();
}

// Generate color palette

function generatePalette() {
    const selectedColor = color.value;

    selectedHex.textContent = selectedColor.toUpperCase();

    const [r, g, b] = hexToRgb(selectedColor);
    const [h, s] = rgbToHsl(r, g, b);

    boxes.forEach((box, index) => {
        const newColor = hslToHex(h, s, lightness[index]);

        box.style.backgroundColor = newColor;
        box.querySelector("strong").textContent = newColor;

        box.dataset.color = newColor;

        box.querySelector(".color-name").textContent =
            `COLOR 0${index + 1}`;

        box.classList.remove("copied");

        box.style.color = "white";
    });

    copyMessage.textContent = "Your new palette is ready!";
}

// Random color generator

function generateRandomColor() {
    const randomColor =
        "#" +
        Math.floor(Math.random() * 16777215)
            .toString(16)
            .padStart(6, "0");

    color.value = randomColor;
    generatePalette();
}

// Copy HEX color

async function copyColor(box) {
    const hex = box.dataset.color;

    if (!hex) return;

    try {
        await navigator.clipboard.writeText(hex);

        box.querySelector(".copy-icon").textContent = "✓";
        copyMessage.textContent = `${hex} copied successfully!`;

        setTimeout(() => {
            box.querySelector(".copy-icon").textContent = "▢";
        }, 1200);

    } catch (error) {
        copyMessage.textContent =
            "Clipboard unavailable. Please copy manually: " + hex;
    }
}

// Event listeners

button.addEventListener("click", generatePalette);

randomBtn.addEventListener("click", generateRandomColor);

color.addEventListener("input", () => {
    selectedHex.textContent = color.value.toUpperCase();
});

boxes.forEach((box) => {
    box.addEventListener("click", () => {
        copyColor(box);
    });
});

// Initial palette

generatePalette();
