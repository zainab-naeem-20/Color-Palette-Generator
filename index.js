
// SELECT ELEMENTS

const color = document.querySelector("#Color");
const button = document.querySelector("#generateBtn");
const randomBtn = document.querySelector("#randomBtn");

const boxes = document.querySelectorAll(".color-box");

const selectedHex = document.querySelector("#selectedHex");
const copyMessage = document.querySelector("#copyMessage");

const harmony = document.querySelector("#harmony");

const favoriteBtn = document.querySelector("#favoriteBtn");
const downloadBtn = document.querySelector("#downloadBtn");
const exportBtn = document.querySelector("#exportBtn");
const copyExportBtn = document.querySelector("#copyExportBtn");

const themeBtn = document.querySelector("#themeBtn");

const favoritesContainer =
    document.querySelector("#favoritesContainer");

const exportOutput =
    document.querySelector("#exportOutput");


// GLOBAL VARIABLES

let currentPalette = [];

const lightness = [90, 75, 60, 50, 35, 20];


// HEX TO RGB

function hexToRgb(hex) {

    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return [r, g, b];
}


// RGB TO HSL

function rgbToHsl(r, g, b) {

    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    let h = 0;
    let s = 0;

    const l = (max + min) / 2;

    if (max !== min) {

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


// HSL TO HEX

function hslToHex(h, s, l) {

    h = ((h % 360) + 360) % 360;

    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;

    const x = c * (
        1 - Math.abs((h / 60) % 2 - 1)
    );

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
        [r, g, b]
            .map(value =>
                value.toString(16).padStart(2, "0")
            )
            .join("")
    ).toUpperCase();

}


// COLOR HARMONY MODES

function getHueOffsets(mode) {

    const modes = {

        monochromatic: [0, 0, 0, 0, 0, 0],

        analogous: [-50, -30, -10, 10, 30, 50],

        complementary: [0, 180, 0, 180, 0, 180],

        triadic: [0, 120, 240, 0, 120, 240],

        split: [0, 150, 210, 0, 150, 210]

    };

    return modes[mode] || modes.monochromatic;

}


// TEXT CONTRAST

function getTextColor(hex) {

    const [r, g, b] = hexToRgb(hex);

    const brightness =
        (r * 299 + g * 587 + b * 114) / 1000;

    return brightness > 145 ? "#211b35" : "#ffffff";

}


// UPDATE COLOR CARDS

function updateCards(palette) {

    boxes.forEach((box, index) => {

        const hex = palette[index];

        box.style.backgroundColor = hex;

        box.dataset.color = hex;

        const textColor = getTextColor(hex);

        box.querySelector("strong").textContent = hex;

        box.querySelector(".color-name").textContent =
            `COLOR 0${index + 1}`;

        box.querySelector(".copy-icon").textContent = "▢";

        box.querySelector("strong").style.color = textColor;

        box.querySelector(".color-name").style.color = textColor;

        box.querySelector(".copy-icon").style.color = textColor;

    });

}


// GENERATE PALETTE

function generatePalette() {

    const selectedColor = color.value.toUpperCase();

    selectedHex.textContent = selectedColor;

    const [r, g, b] = hexToRgb(selectedColor);

    const [h, s] = rgbToHsl(r, g, b);

    const offsets = getHueOffsets(harmony.value);

    currentPalette = lightness.map((l, index) => {

        return hslToHex(
            h + offsets[index],
            s,
            l
        );

    });

    updateCards(currentPalette);

    copyMessage.textContent = "Your new palette is ready!";

}


// RANDOM COLOR GENERATOR

function generateRandomColor() {

    const randomColor =
        "#" +
        Math.floor(Math.random() * 16777216)
            .toString(16)
            .padStart(6, "0");

    color.value = randomColor;

    generatePalette();

}


// COPY COLOR

async function copyColor(hex, box = null) {

    try {

        await navigator.clipboard.writeText(hex);

        copyMessage.textContent =
            `${hex} copied successfully!`;

        if (box) {

            box.querySelector(".copy-icon").textContent = "✓";

            setTimeout(() => {

                box.querySelector(".copy-icon").textContent = "▢";

            }, 1200);

        }

    } catch (error) {

        copyMessage.textContent =
            "Clipboard unavailable. Please copy manually.";

    }

}


// GET SAVED FAVORITES

function getFavorites() {

    try {

        return JSON.parse(
            localStorage.getItem("favoritePalettes")
        ) || [];

    } catch (error) {

        return [];

    }

}


// SAVE FAVORITES

function saveFavorites(favorites) {

    try {

        localStorage.setItem(
            "favoritePalettes",
            JSON.stringify(favorites)
        );

        return true;

    } catch (error) {

        copyMessage.textContent =
            "Unable to save favorites.";

        return false;

    }

}


// ADD FAVORITE

function saveFavorite() {

    const favorites = getFavorites();

    const alreadySaved = favorites.some(item =>

        JSON.stringify(item.colors) ===
        JSON.stringify(currentPalette)

    );

    if (alreadySaved) {

        copyMessage.textContent =
            "This palette is already saved!";

        return;

    }

    favorites.push({

        id: Date.now(),

        colors: [...currentPalette]

    });

    if (saveFavorites(favorites)) {

        renderFavorites();

        copyMessage.textContent =
            "Palette saved successfully! ♥";

    }

}


// DISPLAY FAVORITES

function renderFavorites() {

    const favorites = getFavorites();

    favoritesContainer.innerHTML = "";

    if (favorites.length === 0) {

        const message = document.createElement("p");

        message.className = "empty-message";

        message.textContent = "No favorites saved yet.";

        favoritesContainer.appendChild(message);

        return;

    }

    favorites.forEach(item => {

        const card = document.createElement("div");

        card.className = "favorite-card";


        const colors = document.createElement("div");

        colors.className = "favorite-colors";


        item.colors.forEach(hex => {

            const swatch = document.createElement("span");

            swatch.style.backgroundColor = hex;

            colors.appendChild(swatch);

        });


        const info = document.createElement("div");

        info.className = "favorite-info";


        const name = document.createElement("p");

        name.textContent = item.colors[3] || "Saved Palette";


        const loadButton = document.createElement("button");

        loadButton.textContent = "Load";

        loadButton.addEventListener("click", () => {

            currentPalette = [...item.colors];

            color.value = item.colors[3] || item.colors[0];

            selectedHex.textContent =
                color.value.toUpperCase();

            updateCards(currentPalette);

            copyMessage.textContent =
                "Favorite palette loaded!";

        });


        const deleteButton = document.createElement("button");

        deleteButton.textContent = "✕";

        deleteButton.setAttribute(
            "aria-label",
            "Delete favorite palette"
        );

        deleteButton.addEventListener("click", () => {

            const updatedFavorites = getFavorites().filter(
                favorite => favorite.id !== item.id
            );

            if (saveFavorites(updatedFavorites)) {

                renderFavorites();

                copyMessage.textContent =
                    "Favorite removed.";

            }

        });


        info.append(name, loadButton, deleteButton);

        card.append(colors, info);

        favoritesContainer.appendChild(card);

    });

}


// DOWNLOAD PALETTE AS PNG

function downloadPalette() {

    const canvas = document.createElement("canvas");

    canvas.width = 1200;
    canvas.height = 420;

    const ctx = canvas.getContext("2d");

    if (!ctx) {

        copyMessage.textContent =
            "Unable to create palette image.";

        return;

    }

    ctx.fillStyle = "#ffffff";

    ctx.fillRect(0, 0, canvas.width, canvas.height);


    ctx.fillStyle = "#211b35";

    ctx.font = "bold 38px Arial";

    ctx.fillText("My Color Palette", 50, 65);


    const width = 1100 / currentPalette.length;


    currentPalette.forEach((hex, index) => {

        const x = 50 + index * width;

        ctx.fillStyle = hex;

        ctx.fillRect(
            x,
            110,
            width - 10,
            210
        );

        ctx.fillStyle = "#211b35";

        ctx.font = "bold 19px Arial";

        ctx.fillText(
            hex,
            x,
            355
        );

    });


    const link = document.createElement("a");

    link.download = "my-color-palette.png";

    link.href = canvas.toDataURL("image/png");

    link.click();

    copyMessage.textContent =
        "Palette image downloaded!";

}


// EXPORT CSS VARIABLES

function exportPalette() {

    const css = `:root {

${currentPalette.map((hex, index) => {

        const [r, g, b] = hexToRgb(hex);

        return `    --color-${index + 1}: ${hex};
    --color-${index + 1}-rgb: ${r}, ${g}, ${b};`;

    }).join("\n\n")}

}`;

    exportOutput.value = css;

    exportOutput.style.display = "block";

    copyExportBtn.style.display = "inline-block";

    copyMessage.textContent =
        "CSS variables generated successfully!";

}


// COPY EXPORTED CSS

async function copyExportedCSS() {

    if (!exportOutput.value) {

        copyMessage.textContent =
            "Generate CSS first.";

        return;

    }

    await copyColor(exportOutput.value);

}


// DARK MODE

function toggleTheme() {

    document.body.classList.toggle("dark");

    const isDark =
        document.body.classList.contains("dark");

    themeBtn.textContent = isDark
        ? "☀ Light Mode"
        : "☾ Dark Mode";

    try {

        localStorage.setItem(
            "paletteTheme",
            isDark ? "dark" : "light"
        );

    } catch (error) {

        // Theme remains active for this session.

    }

}


// LOAD SAVED THEME

function loadTheme() {

    try {

        const savedTheme =
            localStorage.getItem("paletteTheme");

        if (savedTheme === "dark") {

            document.body.classList.add("dark");

            themeBtn.textContent = "☀ Light Mode";

        }

    } catch (error) {

        // Default light mode.

    }

}


// EVENT LISTENERS

button.addEventListener("click", generatePalette);

randomBtn.addEventListener(
    "click",
    generateRandomColor
);

color.addEventListener("input", () => {

    selectedHex.textContent =
        color.value.toUpperCase();

});

harmony.addEventListener(
    "change",
    generatePalette
);

boxes.forEach(box => {

    box.addEventListener("click", () => {

        copyColor(box.dataset.color, box);

    });

});

favoriteBtn.addEventListener(
    "click",
    saveFavorite
);

downloadBtn.addEventListener(
    "click",
    downloadPalette
);

exportBtn.addEventListener(
    "click",
    exportPalette
);

copyExportBtn.addEventListener(
    "click",
    copyExportedCSS
);

themeBtn.addEventListener(
    "click",
    toggleTheme
);


// INITIALIZE WEBSITE

loadTheme();

generatePalette();

renderFavorites();
