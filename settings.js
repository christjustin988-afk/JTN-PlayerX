const STORAGE_KEY = "jtn_player_settings";

const defaults = {
    theme: "dark",
    density: "medium",
    accentColor: "#00ff3c",
    wallpaper: null,
    sleep: 0,
    adsRemoved: false,
    notifications: true,
    language: "Français",
    autoPlay: true,
    volume: 100,
    playSeconds: 0
};

let settings = loadSettings();

const subpage = document.getElementById("subpage");
const subTitle = document.getElementById("subTitle");
const subContent = document.getElementById("subContent");
const toast = document.getElementById("toast");


function loadSettings() {
    try {
        return {
            ...defaults,
            ...JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "{}"
            )
        };
    } catch {
        return { ...defaults };
    }
}


function saveSettings() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(settings)
    );
}


function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 1800);
}


function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${hours}h ${String(mins).padStart(2, "0")}m`;
}


function updateMainValues() {

    document.getElementById("playtimeValue").textContent =
        formatTime(settings.playSeconds);

    const modeLabels = {
        dark: "Sombre",
        light: "Lumière",
        system: "Système"
    };

    const densityLabels = {
        compact: "Compact",
        medium: "Moyen",
        large: "Grand"
    };

    document.getElementById("themeValue").textContent =
        `${modeLabels[settings.theme]} / ${densityLabels[settings.density]}`;

    document.getElementById("sleepValue").textContent =
        settings.sleep > 0
            ? `${settings.sleep} min`
            : "Désactiver";

    document.getElementById("adsValue").textContent =
        settings.adsRemoved
            ? "Activées"
            : "50% de REMISE";

    document.getElementById("languageValue").textContent =
        settings.language;
}


function applyTheme() {

    const isLight =
        settings.theme === "light" ||
        (
            settings.theme === "system" &&
            window.matchMedia("(prefers-color-scheme: light)").matches
        );

    document.body.classList.toggle("theme-light", isLight);

    document.documentElement.style.setProperty(
        "--accent",
        settings.accentColor
    );

    if (settings.wallpaper) {

        document.body.style.backgroundImage =
            `url(${settings.wallpaper})`;

        document.body.classList.add("has-wallpaper");

    } else {

        document.body.style.backgroundImage = "";

        document.body.classList.remove("has-wallpaper");
    }
}


function openSubPage(title, content) {

    subTitle.textContent = title;
    subContent.innerHTML = content;

    subpage.classList.add("open");

    subpage.scrollTop = 0;
}


function closeSubPage() {

    subpage.classList.remove("open");

    updateMainValues();
}


/* TEMPS DE LECTURE */

function playtimePage() {

    openSubPage(
        "Temps de lecture",
        `
        <section class="detail-card">

            <div class="about">

                <div class="about-logo">▷</div>

                <h2>
                    ${formatTime(settings.playSeconds)}
                </h2>

                <p>
                    Temps de lecture enregistré.
                </p>

            </div>

        </section>

        <section class="detail-card">

            <div class="detail-title">
                Compteur
            </div>

            <div class="detail-note">
                Le compteur est enregistré sur cet appareil.
            </div>

            <button
                class="detail-button danger full"
                id="resetTime"
            >
                Réinitialiser
            </button>

        </section>
        `
    );

    document.getElementById("resetTime").onclick = () => {

        settings.playSeconds = 0;

        saveSettings();

        updateMainValues();

        showToast("Compteur réinitialisé");

        closeSubPage();
    };
}


/* SAUVEGARDE */

function backupPage() {

    openSubPage(
        "Sauvegarder & restaurer",
        `
        <section class="detail-card">

            <div class="detail-title">
                Sauvegarder
            </div>

            <div class="detail-note">
                Enregistre tes paramètres dans un fichier.
            </div>

            <button
                class="detail-button full"
                id="exportSettings"
            >
                ↓ Sauvegarder
            </button>

        </section>

        <section class="detail-card">

            <div class="detail-title">
                Restaurer
            </div>

            <div class="detail-note">
                Sélectionne une sauvegarde JTN PLAYER.
            </div>

            <button
                class="detail-button full"
                id="importSettings"
            >
                ↑ Restaurer
            </button>

            <input
                type="file"
                id="backupFile"
                accept=".json"
                hidden
            >

        </section>
        `
    );


    document.getElementById(
        "exportSettings"
    ).onclick = () => {

        const data = {
            app: "JTN PLAYER",
            settings: settings
        };

        const blob = new Blob(
            [JSON.stringify(data, null, 2)],
            {
                type: "application/json"
            }
        );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;
        link.download = "jtn-player-backup.json";

        link.click();

        URL.revokeObjectURL(url);

        showToast("Sauvegarde créée");
    };


    const file =
        document.getElementById("backupFile");


    document.getElementById(
        "importSettings"
    ).onclick = () => file.click();


    file.onchange = () => {

        if (!file.files[0]) return;

        const reader = new FileReader();

        reader.onload = () => {

            try {

                const data =
                    JSON.parse(reader.result);

                if (!data.settings) {
                    throw new Error();
                }

                settings = {
                    ...defaults,
                    ...data.settings
                };

                saveSettings();
                applyTheme();
                updateMainValues();

                showToast("Sauvegarde restaurée");

                closeSubPage();

            } catch {

                showToast(
                    "Sauvegarde invalide"
                );
            }
        };

        reader.readAsText(file.files[0]);
    };
}


/* THÈME */

const themeColors = [
    "#00ff3c",
    "#2b8fff",
    "#20c96b",
    "#c04cff",
    "#ff8a2b",
    "#ff4b5c"
];


function buildMockupRows(count) {

    const titles = [
        "Crazy In Love With Your Smile",
        "Heart Skips A Beat",
        "Beach Memories",
        "Can't Stop This Feeling"
    ];

    const artists = [
        "Don Juan",
        "Hariel",
        "Nathan",
        "Henrique & Juliana"
    ];

    let rows = "";

    for (let i = 0; i < count; i++) {

        rows += `
        <div class="mockup-row">
            <div class="mockup-cover"></div>
            <div class="mockup-text">
                <strong>${titles[i % titles.length]}</strong>
                <small>${artists[i % artists.length]}</small>
            </div>
        </div>
        `;
    }

    return rows;
}


function themePage() {

    openSubPage(
        "Thème",
        `
        <section class="detail-card theme-card">

            <div class="theme-mockup" id="themeMockup">

                <div class="mockup-header">
                    <strong>JTN PLAYER</strong>
                    <span class="mockup-icons">⌕ ☷ ⚙</span>
                </div>

                <div class="mockup-tabs">
                    <span class="mockup-tab active">Chansons</span>
                    <span class="mockup-tab">Playlists</span>
                    <span class="mockup-tab">Dossiers</span>
                </div>

                <div class="mockup-list" id="mockupList">
                    ${buildMockupRows(4)}
                </div>

            </div>

        </section>


        <section class="detail-card">

            <div class="detail-title">
                Densité
            </div>

            <div class="density-row">

                <button
                    class="density-btn"
                    data-density="compact"
                >
                    <span class="density-icon">☰</span>
                    <small>Compact</small>
                </button>

                <button
                    class="density-btn"
                    data-density="medium"
                >
                    <span class="density-icon">☰</span>
                    <small>Moyen</small>
                </button>

                <button
                    class="density-btn"
                    data-density="large"
                >
                    <span class="density-icon">▦</span>
                    <small>Grand</small>
                </button>

            </div>

        </section>


        <section class="detail-card">

            <div class="mode-row">

                <button
                    class="mode-btn"
                    data-mode="dark"
                >
                    ☾ Sombre
                </button>

                <button
                    class="mode-btn"
                    data-mode="light"
                >
                    ☀ Lumière
                </button>

                <button
                    class="mode-btn"
                    data-mode="system"
                >
                    ◑ Système
                </button>

            </div>

        </section>


        <section class="detail-card">

            <div class="detail-title">
                Couleur
            </div>

            <div class="swatch-row" id="swatchRow">

                ${themeColors.map(color => `
                    <button
                        class="swatch"
                        data-color="${color}"
                        style="background:${color}"
                    ></button>
                `).join("")}

                <button
                    class="swatch wallpaper-swatch"
                    id="wallpaperSwatch"
                    aria-label="Ajouter un fond d'écran"
                >
                    ⊕
                </button>

            </div>

            <button
                class="wallpaper-remove"
                id="removeWallpaper"
            >
                Retirer le fond d'écran
            </button>

            <input
                type="file"
                id="wallpaperInput"
                accept="image/*"
                hidden
            >

        </section>
        `
    );


    const mockup = document.getElementById("themeMockup");


    function refresh() {

        subContent
            .querySelectorAll("[data-mode]")
            .forEach(button => {

                button.classList.toggle(
                    "active",
                    button.dataset.mode === settings.theme
                );
            });


        subContent
            .querySelectorAll("[data-density]")
            .forEach(button => {

                button.classList.toggle(
                    "active",
                    button.dataset.density === settings.density
                );
            });


        subContent
            .querySelectorAll("[data-color]")
            .forEach(button => {

                button.classList.toggle(
                    "active",
                    button.dataset.color === settings.accentColor
                );
            });


        mockup.classList.remove(
            "density-compact",
            "density-medium",
            "density-large",
            "mockup-light"
        );

        mockup.classList.add(
            `density-${settings.density}`
        );

        const isLight =
            settings.theme === "light" ||
            (
                settings.theme === "system" &&
                window.matchMedia("(prefers-color-scheme: light)").matches
            );

        mockup.classList.toggle(
            "mockup-light",
            isLight
        );

        mockup.style.setProperty(
            "--accent",
            settings.accentColor
        );


        const wallpaperSwatch =
            document.getElementById("wallpaperSwatch");

        const removeLink =
            document.getElementById("removeWallpaper");

        if (settings.wallpaper) {

            wallpaperSwatch.style.backgroundImage =
                `url(${settings.wallpaper})`;

            wallpaperSwatch.textContent = "";
            wallpaperSwatch.classList.add("has-image");

            removeLink.classList.add("show");

            mockup.style.backgroundImage =
                `url(${settings.wallpaper})`;

        } else {

            wallpaperSwatch.style.backgroundImage = "";
            wallpaperSwatch.textContent = "⊕";
            wallpaperSwatch.classList.remove("has-image");

            removeLink.classList.remove("show");

            mockup.style.backgroundImage = "";
        }
    }


    subContent
        .querySelectorAll("[data-mode]")
        .forEach(button => {

            button.onclick = () => {

                settings.theme = button.dataset.mode;

                saveSettings();
                applyTheme();
                updateMainValues();
                refresh();

                showToast("Thème appliqué");
            };
        });


    subContent
        .querySelectorAll("[data-density]")
        .forEach(button => {

            button.onclick = () => {

                settings.density = button.dataset.density;

                saveSettings();
                updateMainValues();
                refresh();

                showToast("Densité appliquée");
            };
        });


    subContent
        .querySelectorAll("[data-color]")
        .forEach(button => {

            button.onclick = () => {

                settings.accentColor = button.dataset.color;

                saveSettings();
                applyTheme();
                refresh();

                showToast("Couleur appliquée");
            };
        });


    const wallpaperInput =
        document.getElementById("wallpaperInput");


    document.getElementById(
        "wallpaperSwatch"
    ).onclick = () => wallpaperInput.click();


    wallpaperInput.onchange = () => {

        const file = wallpaperInput.files[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {

            const img = new Image();

            img.onload = () => {

                const maxWidth = 900;

                const scale =
                    Math.min(1, maxWidth / img.width);

                const canvas =
                    document.createElement("canvas");

                canvas.width = img.width * scale;
                canvas.height = img.height * scale;

                const ctx = canvas.getContext("2d");

                ctx.drawImage(
                    img,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

                settings.wallpaper =
                    canvas.toDataURL("image/jpeg", 0.75);

                saveSettings();
                applyTheme();
                refresh();

                showToast("Fond d'écran appliqué");
            };

            img.src = reader.result;
        };

        reader.readAsDataURL(file);

        wallpaperInput.value = "";
    };


    document.getElementById(
        "removeWallpaper"
    ).onclick = () => {

        settings.wallpaper = null;

        saveSettings();
        applyTheme();
        refresh();

        showToast("Fond d'écran retiré");
    };


    refresh();
}


/* MINUTERIE */

function sleepPage() {

    openSubPage(
        "Minuterie de sommeil",
        `
        <section class="detail-card">

            <div class="detail-title">
                Arrêt automatique
            </div>

            <div class="detail-note">
                Choisis la durée de la minuterie.
            </div>

            <button class="detail-action" data-sleep="0">
                Désactiver
            </button>

            <button class="detail-action" data-sleep="15">
                15 minutes
            </button>

            <button class="detail-action" data-sleep="30">
                30 minutes
            </button>

            <button class="detail-action" data-sleep="45">
                45 minutes
            </button>

            <button class="detail-action" data-sleep="60">
                1 heure
            </button>

        </section>
        `
    );


    subContent
        .querySelectorAll("[data-sleep]")
        .forEach(button => {

            button.onclick = () => {

                settings.sleep =
                    Number(button.dataset.sleep);

                saveSettings();
                updateMainValues();

                showToast(
                    settings.sleep
                        ? `Minuterie : ${settings.sleep} min`
                        : "Minuterie désactivée"
                );

                closeSubPage();
            };
        });
}


/* PUBS */

function adsPage() {

    openSubPage(
        "Supprimer les pubs",
        `
        <section class="detail-card">

            <div class="about">

                <div class="about-logo">Ⓐ</div>

                <h2>JTN PLAYER</h2>

                <p>
                    Gestion des publicités.
                </p>

            </div>

        </section>

        <section class="detail-card">

            <button
                class="detail-row"
                id="adsToggle"
            >

                <span class="text">
                    <strong>
                        Supprimer les publicités
                    </strong>

                    <small id="adsDescription"></small>
                </span>

                <span
                    class="check"
                    id="adsCheck"
                ></span>

            </button>

        </section>
        `
    );


    function refresh() {

        document.getElementById("adsCheck").textContent =
            settings.adsRemoved ? "✓" : "";

        document.getElementById("adsDescription").textContent =
            settings.adsRemoved
                ? "Option activée"
                : "Option désactivée";
    }


    document.getElementById("adsToggle").onclick = () => {

        settings.adsRemoved =
            !settings.adsRemoved;

        saveSettings();

        refresh();
        updateMainValues();

        showToast(
            settings.adsRemoved
                ? "Publicités désactivées"
                : "Publicités activées"
        );
    };


    refresh();
}


/* FICHIERS MASQUÉS */

function hiddenPage() {

    openSubPage(
        "Fichiers masqués",
        `
        <section class="detail-card">

            <div class="about">

                <div class="about-logo">◉</div>

                <h2>57 fichiers</h2>

                <p>
                    Tes fichiers masqués apparaîtront ici.
                </p>

            </div>

        </section>
        `
    );
}


/* SUPPRIMÉS */

function deletedPage() {

    openSubPage(
        "Récemment supprimé",
        `
        <section class="detail-card">

            <div class="about">

                <div class="about-logo">▢</div>

                <h2>1 fichier</h2>

                <p>
                    Les fichiers supprimés apparaîtront ici.
                </p>

            </div>

        </section>
        `
    );
}


/* LECTURE */

function playbackPage() {

    openSubPage(
        "Paramètres de lecture",
        `
        <section class="detail-card">

            <button
                class="detail-row"
                id="autoPlay"
            >

                <span class="text">

                    <strong>
                        Lecture automatique
                    </strong>

                    <small>
                        Lire automatiquement le morceau suivant.
                    </small>

                </span>

                <span
                    class="check"
                    id="autoCheck"
                ></span>

            </button>


            <div class="detail-title">
                Volume
            </div>

            <input
                class="range"
                id="volume"
                type="range"
                min="0"
                max="100"
                value="${settings.volume}"
            >

        </section>
        `
    );


    const autoCheck =
        document.getElementById("autoCheck");


    function refresh() {

        autoCheck.textContent =
            settings.autoPlay ? "✓" : "";
    }


    document.getElementById("autoPlay").onclick = () => {

        settings.autoPlay =
            !settings.autoPlay;

        saveSettings();

        refresh();

        showToast(
            settings.autoPlay
                ? "Lecture automatique activée"
                : "Lecture automatique désactivée"
        );
    };


    document.getElementById("volume").oninput = event => {

        settings.volume =
            Number(event.target.value);

        saveSettings();
    };


    refresh();
}


/* NOTIFICATIONS */

function notificationsPage() {

    openSubPage(
        "Paramètres de notifications",
        `
        <section class="detail-card">

            <button
                class="detail-row"
                id="notificationsToggle"
            >

                <span class="text">

                    <strong>
                        Notifications
                    </strong>

                    <small id="notificationsText"></small>

                </span>

                <span
                    class="check"
                    id="notificationsCheck"
                ></span>

            </button>

        </section>
        `
    );


    function refresh() {

        document.getElementById(
            "notificationsCheck"
        ).textContent =
            settings.notifications ? "✓" : "";

        document.getElementById(
            "notificationsText"
        ).textContent =
            settings.notifications
                ? "Notifications activées"
                : "Notifications désactivées";
    }


    document.getElementById(
        "notificationsToggle"
    ).onclick = () => {

        settings.notifications =
            !settings.notifications;

        saveSettings();

        refresh();
        updateMainValues();

        showToast(
            settings.notifications
                ? "Notifications activées"
                : "Notifications désactivées"
        );
    };


    refresh();
}


/* LANGUE */

function languagePage() {

    openSubPage(
        "Langue",
        `
        <section class="detail-card">

            <button
                class="detail-row"
                data-language="Français"
            >
                <span class="text">
                    <strong>Français</strong>
                </span>

                <span
                    class="check"
                    id="frCheck"
                ></span>
            </button>


            <button
                class="detail-row"
                data-language="English"
            >
                <span class="text">
                    <strong>English</strong>
                </span>

                <span
                    class="check"
                    id="enCheck"
                ></span>
            </button>


            <button
                class="detail-row"
                data-language="Kreyòl"
            >
                <span class="text">
                    <strong>Kreyòl</strong>
                </span>

                <span
                    class="check"
                    id="krCheck"
                ></span>
            </button>

        </section>
        `
    );


    function refresh() {

        document.getElementById("frCheck").textContent =
            settings.language === "Français" ? "✓" : "";

        document.getElementById("enCheck").textContent =
            settings.language === "English" ? "✓" : "";

        document.getElementById("krCheck").textContent =
            settings.language === "Kreyòl" ? "✓" : "";
    }


    subContent
        .querySelectorAll("[data-language]")
        .forEach(button => {

            button.onclick = () => {

                settings.language =
                    button.dataset.language;

                saveSettings();

                updateMainValues();

                refresh();

                showToast(
                    `Langue : ${settings.language}`
                );
            };
        });


    refresh();
}


/* RETOUR */

function feedbackPage() {

    openSubPage(
        "Retour",
        `
        <section class="detail-card">

            <div class="detail-title">
                Ton avis
            </div>

            <div class="detail-note">
                Écris une remarque ou une idée pour JTN PLAYER.
            </div>

            <textarea
                id="feedback"
                placeholder="Écris ton message..."
                style="
                    width:calc(100% - 40px);
                    min-height:140px;
                    margin:0 20px 15px;
                    padding:15px;
                    border:1px solid #333;
                    border-radius:15px;
                    background:#101010;
                    color:#fff;
                    font:inherit;
                    outline:none;
                "
            ></textarea>

            <button
                class="detail-button full"
                id="sendFeedback"
            >
                Envoyer
            </button>

        </section>
        `
    );


    document.getElementById(
        "sendFeedback"
    ).onclick = () => {

        const message =
            document.getElementById("feedback")
            .value.trim();

        if (!message) {
            showToast("Écris ton message");
            return;
        }

        localStorage.setItem(
            "jtn_player_feedback",
            message
        );

        showToast("Retour enregistré");

        closeSubPage();
    };
}


/* À PROPOS */

function aboutPage() {

    openSubPage(
        "À propos",
        `
        <section class="detail-card">

            <div class="about">

                <div class="about-logo">♪</div>

                <h2>
                    JTN PLAYER
                </h2>

                <p>
                    Version 2026.7.10
                </p>

                <p>
                    Ton lecteur de musique.
                </p>

            </div>

        </section>
        `
    );
}


/* ROUTEUR */

const pages = {
    playtime: playtimePage,
    backup: backupPage,
    theme: themePage,
    sleep: sleepPage,
    ads: adsPage,
    hidden: hiddenPage,
    deleted: deletedPage,
    playback: playbackPage,
    notifications: notificationsPage,
    language: languagePage,
    feedback: feedbackPage,
    about: aboutPage
};


document
    .querySelectorAll(".setting-row[data-page]")
    .forEach(row => {

        row.addEventListener("click", () => {

            const page =
                pages[row.dataset.page];

            if (page) {
                page();
            }
        });
    });


/* RETOUR VERS L'APPLICATION */

document.getElementById("backBtn").onclick = () => {

    window.location.href = "index.html";
};


document.getElementById("subBackBtn").onclick = () => {

    closeSubPage();
};


/* INITIALISATION */

applyTheme();
updateMainValues();