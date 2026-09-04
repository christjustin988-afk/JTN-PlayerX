/* =========================================================
   JTN PLAYER — APP.JS
   Compatible avec le HTML fourni
   ========================================================= */

"use strict";

/* =========================================================
   ÉLÉMENTS
   ========================================================= */

const wallpaperLayer = document.getElementById("wallpaperLayer");

const fileInput = document.getElementById("fileInput");
const scanButton = document.getElementById("scanButton");

const mediaList = document.getElementById("mediaList");
const emptyPage = document.getElementById("emptyPage");
const emptyTitle = document.getElementById("emptyTitle");
const emptyText = document.getElementById("emptyText");

const searchBtn = document.getElementById("searchBtn");
const searchContainer = document.getElementById("searchContainer");
const searchInput = document.getElementById("searchInput");

const sortBtn = document.getElementById("sortBtn");
const sortMenu = document.getElementById("sortMenu");

const settingsBtn = document.getElementById("settingsBtn");
const settingsModal = document.getElementById("settingsModal");
const closeSettings = document.getElementById("closeSettings");
const themeToggle = document.getElementById("themeToggle");
const themeLabel = document.getElementById("themeLabel");

const miniPlayer = document.getElementById("miniPlayer");
const miniCover = document.getElementById("miniCover");
const trackTitle = document.getElementById("trackTitle");
const trackArtist = document.getElementById("trackArtist");

const playButton = document.getElementById("playButton");
const previousButton = document.getElementById("previousButton");
const nextButton = document.getElementById("nextButton");
const muteButton = document.getElementById("muteButton");

const progressBar = document.getElementById("progressBar");
const miniProgressContainer =
    document.getElementById("miniProgressContainer");

const currentTimeElement =
    document.getElementById("currentTime");

const durationElement =
    document.getElementById("duration");

const audioPlayer =
    document.getElementById("audioPlayer");


/* =========================================================
   LECTEUR COMPLET
   ========================================================= */

const fullPlayer =
    document.getElementById("fullPlayer");

const closeFullPlayer =
    document.getElementById("closeFullPlayer");

const fullCover =
    document.getElementById("fullCover");

const fullTitle =
    document.getElementById("fullTitle");

const fullArtist =
    document.getElementById("fullArtist");

const fullFavorite =
    document.getElementById("fullFavorite");

const fullMore =
    document.getElementById("fullMore");

const fullProgress =
    document.getElementById("fullProgress");

const fullCurrentTime =
    document.getElementById("fullCurrentTime");

const fullDuration =
    document.getElementById("fullDuration");

const shuffleButton =
    document.getElementById("shuffleButton");

const fullPrevious =
    document.getElementById("fullPrevious");

const fullPlay =
    document.getElementById("fullPlay");

const fullNext =
    document.getElementById("fullNext");

const repeatButton =
    document.getElementById("repeatButton");

const equalizerButton =
    document.getElementById("equalizerButton");

const lyricsButton =
    document.getElementById("lyricsButton");

const timerButton =
    document.getElementById("timerButton");

const queueList =
    document.getElementById("queueList");


/* =========================================================
   LECTEUR VIDÉO
   ========================================================= */

const videoScreen =
    document.getElementById("videoScreen");

const videoStage =
    document.querySelector(".video-stage");

const videoProgress =
    document.getElementById("videoProgress");

const videoCurrentTime =
    document.getElementById("videoCurrentTime");

const videoDuration =
    document.getElementById("videoDuration");

const videoPlayer =
    document.getElementById("videoPlayer");

const videoClose =
    document.getElementById("videoClose");

const videoBack =
    document.getElementById("videoBack");

const videoPlay =
    document.getElementById("videoPlay");

const videoForward =
    document.getElementById("videoForward");

const videoFullscreen =
    document.getElementById("videoFullscreen");

const videoTitle =
    document.getElementById("videoTitle");

const videoArtist =
    document.getElementById("videoArtist");

const videoQueue =
    document.getElementById("videoQueue");

const videoCount =
    document.getElementById("videoCount");

const videoLock =
    document.getElementById("videoLock");

const videoRotate =
    document.getElementById("videoRotate");

const videoAudio =
    document.getElementById("videoAudio");

const videoPlaylist =
    document.getElementById("videoPlaylist");

const videoLockTop =
    document.getElementById("videoLockTop");

const videoSpeedTop =
    document.getElementById("videoSpeedTop");

const videoSpeedLabel =
    document.getElementById("videoSpeedLabel");

const speedMenuOverlay =
    document.getElementById("speedMenuOverlay");

const speedMenuCancel =
    document.getElementById("speedMenuCancel");

const videoMoreTop =
    document.getElementById("videoMoreTop");

const itemMenuOverlay =
    document.getElementById("itemMenuOverlay");

const itemMenuTitle =
    document.getElementById("itemMenuTitle");

const itemMenuFavorite =
    document.getElementById("itemMenuFavorite");

const itemMenuShare =
    document.getElementById("itemMenuShare");

const itemMenuDetails =
    document.getElementById("itemMenuDetails");

const itemMenuDelete =
    document.getElementById("itemMenuDelete");

const itemMenuCancel =
    document.getElementById("itemMenuCancel");


/* =========================================================
   TOAST
   ========================================================= */

const toast =
    document.getElementById("toast");


/* =========================================================
   VARIABLES
   ========================================================= */

let mediaItems = [];
let filteredItems = [];

let currentIndex = -1;
let currentVideoItem = null;

let isShuffle = false;
let isRepeat = false;

let objectUrls = [];

let volumeValue = 1;
let lastVolume = 1;

let volumeIndicator = null;
let volumeTimer = null;


/* =========================================================
   STOCKAGE
   ========================================================= */

const MEDIA_STORAGE_KEY =
    "jtn_player_media";

const FAVORITES_KEY =
    "jtn_player_favorites";

const SETTINGS_KEY =
    "jtn_player_settings";


/*
   Les Blob URL (créées avec URL.createObjectURL)
   ne survivent pas à la fermeture de l'appli.

   Pour que la musique/vidéo soit encore là au
   retour, on garde une copie du fichier lui-même
   dans IndexedDB (le stockage "fichiers" du
   navigateur), pas juste son nom.
*/

const MEDIA_DB_NAME =
    "jtn_player_files";

const MEDIA_DB_STORE =
    "files";

let mediaDbPromise = null;

function openMediaDB() {

    if (mediaDbPromise) {
        return mediaDbPromise;
    }

    mediaDbPromise = new Promise((resolve, reject) => {

        const request =
            indexedDB.open(MEDIA_DB_NAME, 1);

        request.onupgradeneeded = () => {

            request.result.createObjectStore(
                MEDIA_DB_STORE
            );

        };

        request.onsuccess = () =>
            resolve(request.result);

        request.onerror = () =>
            reject(request.error);

    });

    return mediaDbPromise;

}

async function idbSaveFile(id, file) {

    try {

        const db =
            await openMediaDB();

        await new Promise((resolve, reject) => {

            const tx =
                db.transaction(MEDIA_DB_STORE, "readwrite");

            tx.objectStore(MEDIA_DB_STORE).put(file, id);

            tx.oncomplete = resolve;
            tx.onerror = () => reject(tx.error);

        });

    } catch (error) {

        console.warn(
            "Sauvegarde du fichier impossible",
            error
        );

    }

}

async function idbGetFile(id) {

    try {

        const db =
            await openMediaDB();

        return await new Promise((resolve, reject) => {

            const tx =
                db.transaction(MEDIA_DB_STORE, "readonly");

            const req =
                tx.objectStore(MEDIA_DB_STORE).get(id);

            req.onsuccess = () =>
                resolve(req.result || null);

            req.onerror = () =>
                reject(req.error);

        });

    } catch (error) {

        console.warn(
            "Lecture du fichier impossible",
            error
        );

        return null;

    }

}

async function idbDeleteFile(id) {

    try {

        const db =
            await openMediaDB();

        await new Promise((resolve, reject) => {

            const tx =
                db.transaction(MEDIA_DB_STORE, "readwrite");

            tx.objectStore(MEDIA_DB_STORE).delete(id);

            tx.oncomplete = resolve;
            tx.onerror = () => reject(tx.error);

        });

    } catch (error) {

        console.warn(
            "Suppression du fichier impossible",
            error
        );

    }

}


/* =========================================================
   INITIALISATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    audioPlayer.volume = 1;

    loadSettings();

    await loadSavedMedia();

    setupEvents();

    updateEmptyPage();

});


/* =========================================================
   ÉVÉNEMENTS
   ========================================================= */

function setupEvents() {

    /* Scanner */

    if (scanButton) {
        scanButton.addEventListener("click", () => {
            fileInput.click();
        });
    }


    /* Fichiers */

    if (fileInput) {

        fileInput.addEventListener(
            "change",
            handleFiles
        );

    }


    /* Recherche */

    if (searchBtn) {

        searchBtn.addEventListener(
            "click",
            () => {

                searchContainer.classList.toggle("show");

                if (
                    searchContainer.classList.contains("show")
                ) {
                    searchInput.focus();
                }

            }
        );

    }


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            filterMedia
        );

    }


    /* Tri */

    if (sortBtn) {

        sortBtn.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                sortMenu.classList.toggle("open");

            }
        );

    }


    /* Paramètres */

    if (settingsBtn) {

        settingsBtn.addEventListener(
            "click",
            () => {

                window.location.href = "settings.html";

            }
        );

    }


    if (closeSettings) {

        closeSettings.addEventListener(
            "click",
            () => {

                settingsModal.classList.remove("open");

            }
        );

    }


    if (settingsModal) {

        settingsModal.addEventListener(
            "click",
            event => {

                if (event.target === settingsModal) {

                    settingsModal.classList.remove("open");

                }

            }
        );

    }


    if (themeToggle) {

        themeToggle.addEventListener(
            "click",
            () => {

                toggleTheme();

            }
        );

    }


    document.querySelectorAll(
        "#settingsModal [data-accent]"
    ).forEach(button => {

        button.addEventListener(
            "click",
            () => {

                setAccent(
                    button.dataset.accent
                );

            }
        );

    });


    document.querySelectorAll(
        ".sort-menu button"
    ).forEach(button => {

        button.addEventListener(
            "click",
            () => {

                sortMedia(
                    button.dataset.sort
                );

                sortMenu.classList.remove("open");

            }
        );

    });


    document.addEventListener(
        "click",
        () => {

            sortMenu.classList.remove("open");

        }
    );


    /* Onglets */

    document.querySelectorAll(
        ".tab"
    ).forEach(tab => {

        tab.addEventListener(
            "click",
            () => {

                document.querySelectorAll(
                    ".tab"
                ).forEach(t => {

                    t.classList.remove("active");

                });

                tab.classList.add("active");

                showPage(
                    tab.dataset.page
                );

            }
        );

    });


    /* Mini player */

    if (miniPlayer) {

        miniPlayer.addEventListener(
            "click",
            event => {

                if (
                    event.target.closest("button")
                ) {
                    return;
                }

                openFullPlayer();

            }
        );

    }


    /* Lecture */

    playButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            togglePlay();

        }
    );


    fullPlay.addEventListener(
        "click",
        togglePlay
    );


    /* Navigation */

    previousButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            playPrevious();

        }
    );


    nextButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            playNext();

        }
    );


    fullPrevious.addEventListener(
        "click",
        playPrevious
    );


    fullNext.addEventListener(
        "click",
        playNext
    );


    /* Fermer lecteur */

    closeFullPlayer.addEventListener(
        "click",
        closeFullPlayerView
    );


    /* Favori */

    fullFavorite.addEventListener(
        "click",
        toggleCurrentFavorite
    );


    if (fullMore) {

        fullMore.addEventListener(
            "click",
            () => {

                if (
                    currentIndex >= 0 &&
                    mediaItems[currentIndex]
                ) {

                    openItemMenu(
                        mediaItems[currentIndex],
                        false
                    );

                }

            }
        );

    }


    /* Progression */

    fullProgress.addEventListener(
        "input",
        () => {

            if (
                audioPlayer.duration &&
                isFinite(audioPlayer.duration)
            ) {

                audioPlayer.currentTime =
                    Number(fullProgress.value);

            }

        }
    );


    miniProgressContainer.addEventListener(
        "click",
        event => {

            if (
                !audioPlayer.duration ||
                !isFinite(audioPlayer.duration)
            ) {
                return;
            }

            const rect =
                miniProgressContainer.getBoundingClientRect();

            const percent =
                (event.clientX - rect.left) /
                rect.width;

            audioPlayer.currentTime =
                audioPlayer.duration *
                Math.max(0, Math.min(1, percent));

        }
    );


    /* Muet */

    muteButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            toggleMute();

        }
    );


    /* Mélange */

    shuffleButton.addEventListener(
        "click",
        () => {

            isShuffle = !isShuffle;

            shuffleButton.style.color =
                isShuffle
                    ? "var(--green)"
                    : "";

            showToast(
                isShuffle
                    ? "Lecture aléatoire activée"
                    : "Lecture aléatoire désactivée"
            );

        }
    );


    /* Répétition */

    repeatButton.addEventListener(
        "click",
        () => {

            isRepeat = !isRepeat;

            repeatButton.style.color =
                isRepeat
                    ? "var(--green)"
                    : "";

            showToast(
                isRepeat
                    ? "Répétition activée"
                    : "Répétition désactivée"
            );

        }
    );


    /* Boutons supplémentaires */

    equalizerButton.addEventListener(
        "click",
        () => {

            showToast(
                "Égaliseur bientôt disponible"
            );

        }
    );


    lyricsButton.addEventListener(
        "click",
        () => {

            showToast(
                "Paroles bientôt disponibles"
            );

        }
    );


    timerButton.addEventListener(
        "click",
        () => {

            showToast(
                "Minuteur bientôt disponible"
            );

        }
    );


    /* Audio */

    audioPlayer.addEventListener(
        "loadedmetadata",
        updateDuration
    );


    audioPlayer.addEventListener(
        "timeupdate",
        updateProgress
    );


    audioPlayer.addEventListener(
        "play",
        updatePlayButtons
    );


    audioPlayer.addEventListener(
        "pause",
        updatePlayButtons
    );


    audioPlayer.addEventListener(
        "ended",
        handleAudioEnded
    );


    audioPlayer.addEventListener(
        "volumechange",
        handleVolumeChange
    );


    audioPlayer.addEventListener(
        "error",
        () => {

            showToast(
                "Impossible de lire ce fichier"
            );

        }
    );


    /* Vidéo */

    videoClose.addEventListener(
        "click",
        closeVideo
    );


    videoPlay.addEventListener(
        "click",
        toggleVideo
    );


    videoBack.addEventListener(
        "click",
        playPreviousVideo
    );


    videoForward.addEventListener(
        "click",
        playNextVideo
    );


    if (videoLock) {

        videoLock.addEventListener(
            "click",
            toggleVideoLock
        );

    }


    if (videoRotate) {

        videoRotate.addEventListener(
            "click",
            toggleVideoRotation
        );

    }


    if (videoAudio) {

        videoAudio.addEventListener(
            "click",
            switchVideoToAudioMode
        );

    }


    if (videoLockTop) {

        videoLockTop.addEventListener(
            "click",
            toggleVideoLock
        );

    }


    if (videoSpeedTop) {

        videoSpeedTop.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                speedMenuOverlay.classList.add("open");

            }
        );

    }


    speedMenuOverlay
        .querySelectorAll("[data-speed]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const speed =
                        Number(button.dataset.speed);

                    videoPlayer.playbackRate =
                        speed;

                    videoSpeedLabel.textContent =
                        speed === 1
                            ? "1x"
                            : `${speed}x`;

                    speedMenuOverlay
                        .querySelectorAll("[data-speed]")
                        .forEach(b =>
                            b.classList.toggle(
                                "active",
                                b === button
                            )
                        );

                    speedMenuOverlay.classList.remove("open");

                }
            );

        });


    if (speedMenuCancel) {

        speedMenuCancel.addEventListener(
            "click",
            () => {

                speedMenuOverlay.classList.remove("open");

            }
        );

    }


    speedMenuOverlay.addEventListener(
        "click",
        event => {

            if (event.target === speedMenuOverlay) {

                speedMenuOverlay.classList.remove("open");

            }

        }
    );


    if (videoMoreTop) {

        videoMoreTop.addEventListener(
            "click",
            () => {

                if (currentVideoItem) {

                    openItemMenu(
                        currentVideoItem,
                        true
                    );

                }

            }
        );

    }


    if (videoPlaylist) {

        videoPlaylist.addEventListener(
            "click",
            () => {

                videoScreen.classList.toggle(
                    "show-queue"
                );

            }
        );

    }


    videoFullscreen.addEventListener(
        "click",
        toggleVideoFullscreen
    );


    videoPlayer.addEventListener(
        "play",
        () => {

            videoPlay.textContent = "❚❚";

            resetControlsTimer();

        }
    );


    videoPlayer.addEventListener(
        "pause",
        () => {

            videoPlay.textContent = "▶";

            videoScreen.classList.add(
                "show-controls"
            );

            clearTimeout(controlsTimer);

        }
    );


    /*
       Barre de progression vidéo
    */

    videoPlayer.addEventListener(
        "loadedmetadata",
        () => {

            if (
                isFinite(videoPlayer.duration)
            ) {

                videoProgress.max =
                    videoPlayer.duration;

                videoDuration.textContent =
                    formatTime(videoPlayer.duration);

            }

        }
    );


    videoPlayer.addEventListener(
        "timeupdate",
        () => {

            const current =
                videoPlayer.currentTime || 0;

            const duration =
                videoPlayer.duration || 0;


            videoCurrentTime.textContent =
                formatTime(current);


            if (
                duration > 0 &&
                isFinite(duration)
            ) {

                videoDuration.textContent =
                    formatTime(duration);

                videoProgress.max =
                    duration;

                videoProgress.value =
                    current;

            }

        }
    );


    videoProgress.addEventListener(
        "input",
        () => {

            if (
                videoPlayer.duration &&
                isFinite(videoPlayer.duration)
            ) {

                videoPlayer.currentTime =
                    Number(videoProgress.value);

            }

            videoScreen.classList.add(
                "show-controls"
            );

            resetControlsTimer();

        }
    );


    /*
       Volume avec les touches/clavier
    */

    document.addEventListener(
        "keydown",
        handleKeyboard
    );


    /*
       Gestes tactiles :
       glisser vers le haut = volume +
       glisser vers le bas = volume -
    */

    setupVolumeSwipe();

}


/* =========================================================
   GESTION DES FICHIERS
   ========================================================= */

async function handleFiles(event) {

    const files =
        Array.from(event.target.files || []);

    if (!files.length) {
        return;
    }


    showToast(
        "Ajout des fichiers..."
    );


    for (const file of files) {

        if (
            !file.type.startsWith("audio/") &&
            !file.type.startsWith("video/")
        ) {
            continue;
        }


        const type =
            file.type.startsWith("video/")
                ? "video"
                : "audio";


        const url =
            URL.createObjectURL(file);

        objectUrls.push(url);


        let title =
            cleanFileName(file.name);

        let artist =
            "JTN PLAYER";

        let cover =
            null;


        /*
          Pour les vidéos :
          on extrait une image de la vidéo.
        */

        if (type === "video") {

            cover =
                await extractVideoThumbnail(
                    url
                );

        }


        /*
          Pour les fichiers audio :
          le navigateur ne donne pas directement
          accès aux pochettes intégrées.

          On garde donc une structure prête
          à recevoir les métadonnées si disponibles.
        */

        const item = {

            id:
                createId(),

            name:
                title,

            title:
                title,

            artist:
                artist,

            type:
                type,

            url:
                url,

            cover:
                cover,

            fileName:
                file.name,

            size:
                file.size,

            addedAt:
                Date.now(),

            file:
                file

        };


        mediaItems.unshift(item);

        await idbSaveFile(
            item.id,
            file
        );

    }


    saveMedia();

    filteredItems =
        [...mediaItems];

    renderMediaList();

    updateEmptyPage();

    fileInput.value = "";

    if (mediaItems.length) {

        /*
          Première musique/vidéo ajoutée :
          elle apparaît en haut.
        */

        currentIndex = 0;

        loadCurrentInfo(false);

    }


    showToast(
        files.length === 1
            ? "Fichier ajouté"
            : files.length + " fichiers ajoutés"
    );

}


/* =========================================================
   EXTRAIRE MINIATURE VIDÉO
   ========================================================= */

function extractVideoThumbnail(url) {

    return new Promise(resolve => {

        const video =
            document.createElement("video");

        video.muted = true;
        video.playsInline = true;
        video.preload = "metadata";

        video.src = url;


        video.addEventListener(
            "loadedmetadata",
            () => {

                /*
                   On choisit une image vers
                   le début de la vidéo.
                */

                const time =
                    Math.min(
                        1,
                        video.duration || 1
                    );

                video.currentTime =
                    time;

            }
        );


        video.addEventListener(
            "seeked",
            () => {

                try {

                    const canvas =
                        document.createElement(
                            "canvas"
                        );

                    canvas.width =
                        video.videoWidth || 640;

                    canvas.height =
                        video.videoHeight || 360;


                    const ctx =
                        canvas.getContext(
                            "2d"
                        );

                    ctx.drawImage(
                        video,
                        0,
                        0,
                        canvas.width,
                        canvas.height
                    );


                    resolve(
                        canvas.toDataURL(
                            "image/jpeg",
                            0.82
                        )
                    );

                } catch (error) {

                    resolve(null);

                }

                video.remove();

            },
            {
                once: true
            }
        );


        video.addEventListener(
            "error",
            () => {

                resolve(null);

                video.remove();

            },
            {
                once: true
            }
        );

    });

}


/* =========================================================
   AFFICHAGE LISTE
   ========================================================= */

function renderMediaList() {

    mediaList.innerHTML = "";

    if (!filteredItems.length) {

        return;

    }


    filteredItems.forEach(
        (item, displayedIndex) => {

            const element =
                document.createElement(
                    "div"
                );

            element.className =
                "media-item";


            /*
               Pochette
            */

            const cover =
                document.createElement(
                    "div"
                );

            cover.className =
                "media-cover";


            if (item.cover) {

                const img =
                    document.createElement(
                        "img"
                    );

                img.className =
                    "cover-img";

                img.src =
                    item.cover;

                img.alt =
                    item.title;

                cover.appendChild(img);

            } else {

                cover.textContent =
                    item.type === "video"
                        ? "▶"
                        : "♫";

            }


            /*
               Informations
            */

            const info =
                document.createElement(
                    "div"
                );

            info.className =
                "media-info";


            const name =
                document.createElement(
                    "div"
                );

            name.className =
                "media-name";

            name.textContent =
                item.title;


            const type =
                document.createElement(
                    "div"
                );

            type.className =
                "media-type";

            type.textContent =
                item.type === "video"
                    ? "Vidéo"
                    : item.artist || "Musique";


            info.appendChild(name);
            info.appendChild(type);


            /*
               Favori
            */

            const favorite =
                document.createElement(
                    "button"
                );

            favorite.className =
                "favorite";

            favorite.type =
                "button";

            favorite.textContent =
                isFavorite(item)
                    ? "♥"
                    : "♡";


            if (isFavorite(item)) {
                favorite.classList.add("active");
            }


            favorite.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    toggleFavorite(item);

                    renderMediaList();

                }
            );


            element.appendChild(cover);
            element.appendChild(info);
            element.appendChild(favorite);


            /*
               Clic sur le média
            */

            element.addEventListener(
                "click",
                () => {

                    const realIndex =
                        mediaItems.indexOf(item);

                    if (realIndex < 0) {
                        return;
                    }

                    currentIndex =
                        realIndex;

                    loadCurrentInfo(true);

                }
            );


            mediaList.appendChild(element);

        }
    );

}


/* =========================================================
   CHARGER LE MÉDIA ACTUEL
   ========================================================= */

function loadCurrentInfo(autoPlay = true) {

    if (
        currentIndex < 0 ||
        currentIndex >= mediaItems.length
    ) {
        return;
    }


    const item =
        mediaItems[currentIndex];


    if (!item) {
        return;
    }


    /*
       Si c'est une vidéo
    */

    if (item.type === "video") {

        openVideo(item);

        return;

    }


    /*
       Musique
    */

    audioPlayer.src =
        item.url;

    audioPlayer.load();


    trackTitle.textContent =
        item.title;

    trackArtist.textContent =
        item.artist || "JTN PLAYER";


    fullTitle.textContent =
        item.title;

    fullArtist.textContent =
        item.artist || "JTN PLAYER";


    setCover(
        miniCover,
        item.cover,
        "♫"
    );


    setCover(
        fullCover,
        item.cover,
        "🎵"
    );


    updateFavoriteButton();


    if (autoPlay) {

        audioPlayer.play()
            .then(() => {

                updatePlayButtons();

            })
            .catch(() => {

                /*
                   Certains navigateurs mobiles
                   bloquent autoplay.
                */

                showToast(
                    "Appuie sur ▶ pour commencer"
                );

            });

    }


    updateQueue();

    updatePlayButtons();

}


/* =========================================================
   POCHETTE
   ========================================================= */

function setCover(element, image, fallback) {

    if (!element) {
        return;
    }


    element.innerHTML = "";


    if (image) {

        const img =
            document.createElement("img");

        img.className =
            "cover-img";

        img.src =
            image;

        img.alt =
            "Pochette";


        img.onerror = () => {

            element.textContent =
                fallback;

        };


        element.appendChild(img);

    } else {

        element.textContent =
            fallback;

    }

}


/* =========================================================
   LECTURE / PAUSE
   ========================================================= */

function togglePlay() {

    if (
        currentIndex < 0 ||
        !mediaItems[currentIndex]
    ) {

        if (mediaItems.length) {

            currentIndex = 0;

            loadCurrentInfo(true);

        } else {

            showToast(
                "Ajoute d'abord une musique"
            );

        }

        return;

    }


    const item =
        mediaItems[currentIndex];


    if (item.type === "video") {

        if (
            videoScreen.classList.contains("open")
        ) {

            toggleVideo();

        } else {

            openVideo(item);

        }

        return;

    }


    if (audioPlayer.paused) {

        audioPlayer.play()
            .catch(() => {

                showToast(
                    "Impossible de lancer la musique"
                );

            });

    } else {

        audioPlayer.pause();

    }

}


/* =========================================================
   BOUTONS PLAY
   ========================================================= */

function updatePlayButtons() {

    const playing =
        !audioPlayer.paused &&
        !audioPlayer.ended;


    playButton.textContent =
        playing
            ? "❚❚"
            : "▶";


    fullPlay.textContent =
        playing
            ? "❚❚"
            : "▶";

}


/* =========================================================
   TEMPS / PROGRESSION
   ========================================================= */

function updateDuration() {

    const duration =
        audioPlayer.duration;


    if (
        !isFinite(duration)
    ) {
        return;
    }


    durationElement.textContent =
        formatTime(duration);

    fullDuration.textContent =
        formatTime(duration);


    fullProgress.max =
        duration;

}


function updateProgress() {

    const current =
        audioPlayer.currentTime || 0;

    const duration =
        audioPlayer.duration || 0;


    currentTimeElement.textContent =
        formatTime(current);

    fullCurrentTime.textContent =
        formatTime(current);


    durationElement.textContent =
        formatTime(duration);

    fullDuration.textContent =
        formatTime(duration);


    if (duration > 0) {

        const percent =
            (current / duration) * 100;

        progressBar.style.width =
            percent + "%";

        fullProgress.value =
            current;

    } else {

        progressBar.style.width =
            "0%";

        fullProgress.value =
            0;

    }

}


/* =========================================================
   FIN DE MUSIQUE
   ========================================================= */

function handleAudioEnded() {

    if (isRepeat) {

        audioPlayer.currentTime = 0;

        audioPlayer.play();

        return;

    }


    playNext();

}


/* =========================================================
   MUSIQUE PRÉCÉDENTE
   ========================================================= */

function playPrevious() {

    if (!mediaItems.length) {
        return;
    }


    /*
       Si la musique a déjà avancé de plus de 3 secondes,
       retour au début.
    */

    if (
        audioPlayer.currentTime > 3
    ) {

        audioPlayer.currentTime = 0;

        return;

    }


    let index =
        currentIndex - 1;


    if (index < 0) {

        index =
            mediaItems.length - 1;

    }


    /*
       Évite de sélectionner une vidéo
       pour le lecteur audio.
    */

    index =
        findPreviousAudio(index);


    if (index !== -1) {

        currentIndex =
            index;

        loadCurrentInfo(true);

    }

}


/* =========================================================
   MUSIQUE SUIVANTE
   ========================================================= */

function playNext() {

    if (!mediaItems.length) {
        return;
    }


    let index;


    if (isShuffle) {

        index =
            getRandomAudioIndex();

    } else {

        index =
            currentIndex + 1;

        if (
            index >= mediaItems.length
        ) {

            index = 0;

        }


        index =
            findNextAudio(index);

    }


    if (index !== -1) {

        currentIndex =
            index;

        loadCurrentInfo(true);

    }

}


/* =========================================================
   TROUVER AUDIO SUIVANT
   ========================================================= */

function findNextAudio(start) {

    if (!mediaItems.length) {
        return -1;
    }


    for (
        let i = 0;
        i < mediaItems.length;
        i++
    ) {

        const index =
            (start + i) %
            mediaItems.length;


        if (
            mediaItems[index].type ===
            "audio"
        ) {

            return index;

        }

    }


    return -1;

}


/* =========================================================
   TROUVER AUDIO PRÉCÉDENT
   ========================================================= */

function findPreviousAudio(start) {

    if (!mediaItems.length) {
        return -1;
    }


    for (
        let i = 0;
        i < mediaItems.length;
        i++
    ) {

        let index =
            start - i;


        if (index < 0) {

            index +=
                mediaItems.length;

        }


        if (
            mediaItems[index].type ===
            "audio"
        ) {

            return index;

        }

    }


    return -1;

}


/* =========================================================
   ALÉATOIRE
   ========================================================= */

function getRandomAudioIndex() {

    const indexes =
        mediaItems
            .map(
                (item, index) =>
                    item.type === "audio"
                        ? index
                        : -1
            )
            .filter(
                index =>
                    index !== -1
            );


    if (!indexes.length) {
        return -1;
    }


    if (indexes.length === 1) {
        return indexes[0];
    }


    let random;

    do {

        random =
            indexes[
                Math.floor(
                    Math.random() *
                    indexes.length
                )
            ];

    } while (
        random === currentIndex
    );


    return random;

}


/* =========================================================
   LECTEUR COMPLET
   ========================================================= */

function openFullPlayer() {

    if (
        currentIndex < 0 ||
        !mediaItems[currentIndex]
    ) {

        showToast(
            "Aucune musique sélectionnée"
        );

        return;

    }


    const item =
        mediaItems[currentIndex];


    if (item.type === "video") {

        openVideo(item);

        return;

    }


    fullPlayer.classList.add("open");

    document.body.classList.add(
        "player-open"
    );


    updateFavoriteButton();

    updateQueue();

}


/* =========================================================
   FERMER LECTEUR COMPLET
   ========================================================= */

function closeFullPlayerView() {

    fullPlayer.classList.remove("open");

    document.body.classList.remove(
        "player-open"
    );

}


/* =========================================================
   PARAMÈTRES
   ========================================================= */

function getSettings() {

    try {

        return JSON.parse(
            localStorage.getItem(
                SETTINGS_KEY
            ) || "{}"
        );

    } catch {

        return {};

    }

}


function saveSettings(settings) {

    localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(settings)
    );

}


function loadSettings() {

    const settings =
        getSettings();


    if (settings.theme === "light") {

        document.body.classList.add(
            "theme-light"
        );

        if (themeLabel) {

            themeLabel.textContent =
                "Clair";

        }

    }


    if (settings.accentColor || settings.accent) {

        document.documentElement.style.setProperty(
            "--accent",
            settings.accentColor || settings.accent
        );

    }


    if (settings.wallpaper && wallpaperLayer) {

        wallpaperLayer.style.backgroundImage =
            `url(${settings.wallpaper})`;

        document.body.classList.add(
            "has-wallpaper"
        );

    } else {

        if (wallpaperLayer) {

            wallpaperLayer.style.backgroundImage =
                "";

        }

        document.body.classList.remove(
            "has-wallpaper"
        );

    }

}


function toggleTheme() {

    const settings =
        getSettings();

    const isLight =
        document.body.classList.toggle(
            "theme-light"
        );

    settings.theme =
        isLight
            ? "light"
            : "dark";

    saveSettings(settings);


    if (themeLabel) {

        themeLabel.textContent =
            isLight
                ? "Clair"
                : "Sombre";

    }

}


function setAccent(color) {

    const settings =
        getSettings();

    settings.accent =
        color;

    saveSettings(settings);


    document.documentElement.style.setProperty(
        "--accent",
        color
    );


    showToast(
        "Couleur d'accent mise à jour"
    );

}


/* =========================================================
   FAVORIS
   ========================================================= */

function getFavorites() {

    try {

        return JSON.parse(
            localStorage.getItem(
                FAVORITES_KEY
            ) || "[]"
        );

    } catch {

        return [];

    }

}


function saveFavorites(list) {

    localStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(list)
    );

}


function isFavorite(item) {

    return getFavorites().includes(
        item.id
    );

}


function toggleFavorite(item) {

    let favorites =
        getFavorites();


    if (favorites.includes(item.id)) {

        favorites =
            favorites.filter(
                id =>
                    id !== item.id
            );

        showToast(
            "Retiré des favoris"
        );

    } else {

        favorites.push(item.id);

        showToast(
            "Ajouté aux favoris"
        );

    }


    saveFavorites(favorites);

    updateFavoriteButton();

}


function toggleCurrentFavorite() {

    if (
        currentIndex < 0 ||
        !mediaItems[currentIndex]
    ) {
        return;
    }


    toggleFavorite(
        mediaItems[currentIndex]
    );


    renderMediaList();

}


function updateFavoriteButton() {

    if (
        currentIndex < 0 ||
        !mediaItems[currentIndex]
    ) {
        return;
    }


    const item =
        mediaItems[currentIndex];


    const active =
        isFavorite(item);


    fullFavorite.textContent =
        active
            ? "♥"
            : "♡";


    fullFavorite.classList.toggle(
        "active",
        active
    );

}


/* =========================================================
   FILE D'ATTENTE
   ========================================================= */

function updateQueue() {

    queueList.innerHTML = "";


    const audioItems =
        mediaItems.filter(
            item =>
                item.type === "audio"
        );


    audioItems.forEach(item => {

        const row =
            document.createElement(
                "div"
            );

        row.className =
            "queue-item";


        const cover =
            document.createElement(
                "div"
            );

        cover.className =
            "queue-cover";


        if (item.cover) {

            const img =
                document.createElement(
                    "img"
                );

            img.className =
                "cover-img";

            img.src =
                item.cover;

            cover.appendChild(img);

        } else {

            cover.textContent =
                "♫";

        }


        const info =
            document.createElement(
                "div"
            );

        info.className =
            "queue-info";


        const title =
            document.createElement(
                "div"
            );

        title.className =
            "queue-title";

        title.textContent =
            item.title;


        const type =
            document.createElement(
                "div"
            );

        type.className =
            "queue-type";

        type.textContent =
            item.artist ||
            "JTN PLAYER";


        info.appendChild(title);
        info.appendChild(type);


        row.appendChild(cover);
        row.appendChild(info);


        row.addEventListener(
            "click",
            () => {

                const index =
                    mediaItems.indexOf(item);


                if (index !== -1) {

                    currentIndex =
                        index;

                    loadCurrentInfo(true);

                }

            }
        );


        queueList.appendChild(row);

    });

}


/* =========================================================
   VIDÉO
   ========================================================= */

function playPreviousVideo() {

    const videoItems =
        mediaItems.filter(
            item => item.type === "video"
        );

    const index =
        videoItems.indexOf(currentVideoItem);

    if (index > 0) {

        openVideo(
            videoItems[index - 1]
        );

    }

}


function playNextVideo() {

    const videoItems =
        mediaItems.filter(
            item => item.type === "video"
        );

    const index =
        videoItems.indexOf(currentVideoItem);

    if (
        index !== -1 &&
        index < videoItems.length - 1
    ) {

        openVideo(
            videoItems[index + 1]
        );

    }

}


function toggleVideoLock() {

    videoScreen.classList.toggle("locked");

    showToast(
        videoScreen.classList.contains("locked")
            ? "Contrôles verrouillés"
            : "Contrôles déverrouillés"
    );

}


function toggleVideoRotation() {

    if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock("landscape")
            .then(() => {
                videoScreen.classList.add("fullscreen-mode");
                videoScreen.classList.add("show-controls");
                resetControlsTimer();
            })
            .catch(() => {
                videoScreen.classList.toggle("rotated");
            });
    } else {
        videoScreen.classList.toggle("rotated");
    }
}


function switchVideoToAudioMode() {

    videoScreen.classList.toggle("audio-only");

}


function openVideo(item) {

    currentVideoItem =
        item;

    videoPlayer.src =
        item.url;

    videoPlayer.load();


    videoTitle.textContent =
        item.title;

    videoArtist.textContent =
        item.artist || "JTN PLAYER";


    videoScreen.classList.remove("audio-only");


    videoProgress.value = 0;
    videoCurrentTime.textContent = "00:00";
    videoDuration.textContent = "00:00";


    videoPlayer.playbackRate = 1;

    if (videoSpeedLabel) {

        videoSpeedLabel.textContent = "1x";

    }

    if (speedMenuOverlay) {

        speedMenuOverlay
            .querySelectorAll("[data-speed]")
            .forEach(b =>
                b.classList.toggle(
                    "active",
                    b.dataset.speed === "1"
                )
            );

    }


    updateVideoQueue(item);


    /*
       Si l'écran vidéo n'est pas déjà ouvert,
       on ajoute une étape dans l'historique.
       Ainsi, le bouton "retour" du téléphone
       ferme juste l'écran vidéo au lieu de
       recharger toute la page (ce qui effaçait
       la liste des vidéos importées).
    */

    if (!videoScreen.classList.contains("open")) {

        history.pushState(
            { overlay: "video" },
            ""
        );

    }


    videoScreen.classList.add(
        "open"
    );


    document.body.classList.add(
        "player-open"
    );


    /*
       Lire automatiquement après
       le clic de l'utilisateur.
    */

    videoPlayer.play()
        .catch(() => {

            videoPlay.textContent =
                "▶";

        });

}


/*
   Détecte les fichiers sans image
   (audio seul) pour afficher le
   logo JTN à la place de l'écran noir.
*/

videoPlayer.addEventListener(
    "loadedmetadata",
    () => {

        const isAudioOnly =
            videoPlayer.videoWidth === 0 ||
            videoPlayer.videoHeight === 0;

        videoScreen.classList.toggle(
            "audio-only",
            isAudioOnly
        );

    }
);


let menuTargetItem = null;
let menuTargetIsVideo = false;


function openItemMenu(item, isVideo) {

    menuTargetItem =
        item;

    menuTargetIsVideo =
        isVideo;


    itemMenuTitle.textContent =
        item.title;


    itemMenuFavorite.innerHTML =
        isFavorite(item)
            ? "♥ &nbsp; Retirer des favoris"
            : "♡ &nbsp; Ajouter aux favoris";

    itemMenuFavorite.classList.toggle(
        "active",
        isFavorite(item)
    );


    itemMenuOverlay.classList.add("open");

}


function closeItemMenu() {

    itemMenuOverlay.classList.remove("open");

    menuTargetItem =
        null;

}


itemMenuOverlay.addEventListener(
    "click",
    event => {

        if (event.target === itemMenuOverlay) {

            closeItemMenu();

        }

    }
);


itemMenuCancel.addEventListener(
    "click",
    closeItemMenu
);


itemMenuFavorite.addEventListener(
    "click",
    () => {

        if (!menuTargetItem) return;

        toggleFavorite(menuTargetItem);

        if (menuTargetIsVideo) {

            updateVideoQueue(menuTargetItem);

        } else {

            updateFavoriteButton();
            renderMediaList();

        }

        closeItemMenu();

    }
);


itemMenuShare.addEventListener(
    "click",
    async () => {

        if (!menuTargetItem) return;

        const item =
            menuTargetItem;

        closeItemMenu();


        if (navigator.share) {

            try {

                await navigator.share({
                    title: item.title,
                    text:
                        `${item.title} — ${item.artist || "JTN PLAYER"}`
                });

            } catch {}

        } else {

            try {

                await navigator.clipboard.writeText(
                    `${item.title} — ${item.artist || "JTN PLAYER"}`
                );

                showToast(
                    "Copié dans le presse-papiers"
                );

            } catch {

                showToast(
                    "Partage non disponible"
                );

            }

        }

    }
);


itemMenuDetails.addEventListener(
    "click",
    () => {

        if (!menuTargetItem) return;

        const item =
            menuTargetItem;

        closeItemMenu();

        showToast(
            `${item.title} · ${item.artist || "JTN PLAYER"} · ${formatTime(item.duration || 0)}`
        );

    }
);


itemMenuDelete.addEventListener(
    "click",
    () => {

        if (!menuTargetItem) return;

        const item =
            menuTargetItem;

        const isVideo =
            menuTargetIsVideo;

        closeItemMenu();


        const wasPlayingThis =
            isVideo
                ? currentVideoItem === item
                : mediaItems[currentIndex] === item;


        const index =
            mediaItems.indexOf(item);

        if (index !== -1) {

            mediaItems.splice(index, 1);

        }

        idbDeleteFile(item.id);

        saveMedia();


        if (wasPlayingThis) {

            if (isVideo) {

                closeVideo();

            } else {

                audioPlayer.pause();
                audioPlayer.removeAttribute("src");

                currentIndex = -1;

                if (
                    fullPlayer.classList.contains("open")
                ) {

                    closeFullPlayerView();

                }

            }

        }


        renderMediaList();

        showToast(
            "Supprimé de la liste"
        );

    }
);


function updateVideoQueue(currentItem) {

    const videoItems =
        mediaItems.filter(
            item =>
                item.type === "video"
        );


    const currentPosition =
        videoItems.indexOf(currentItem) + 1;


    videoCount.textContent =
        `${currentPosition}/${videoItems.length}`;


    videoQueue.innerHTML = "";


    videoItems.forEach(item => {

        const row =
            document.createElement("div");

        row.className =
            "queue-item";

        if (item === currentItem) {

            row.classList.add("active");

        }


        const cover =
            document.createElement("div");

        cover.className =
            "queue-cover";

        if (item.cover) {

            const img =
                document.createElement("img");

            img.className =
                "cover-img";

            img.src =
                item.cover;

            cover.appendChild(img);

        } else {

            cover.innerHTML =
                `<span class="queue-video-brand">
                    <b>JTN</b>PLAYER
                </span>`;

        }


        const duration =
            document.createElement("span");

        duration.className =
            "queue-duration";

        duration.textContent =
            formatTime(item.duration || 0);

        cover.appendChild(duration);


        const info =
            document.createElement("div");

        info.className =
            "queue-info";


        const title =
            document.createElement("div");

        title.className =
            "queue-title";

        title.textContent =
            item.title;


        const type =
            document.createElement("div");

        type.className =
            "queue-type";

        type.textContent =
            item.artist || "JTN PLAYER";


        info.appendChild(title);
        info.appendChild(type);


        row.appendChild(cover);
        row.appendChild(info);


        row.addEventListener(
            "click",
            () => {

                openVideo(item);

            }
        );


        videoQueue.appendChild(row);

    });

}


function performCloseVideo() {

    videoPlayer.pause();

    videoPlayer.removeAttribute(
        "src"
    );

    videoPlayer.load();


    videoScreen.classList.remove(
        "open",
        "locked",
        "rotated",
        "audio-only",
        "show-queue",
        "fullscreen-mode",
        "show-controls"
    );


    clearTimeout(controlsTimer);


    document.body.classList.remove(
        "player-open"
    );


    currentVideoItem =
        null;

}


function closeVideo() {

    /*
       Si une étape "vidéo" a été ajoutée
       à l'historique, on recule dedans :
       cela déclenchera "popstate", qui
       se charge de fermer l'écran vidéo
       (voir plus bas). Cela évite tout
       rechargement de la page.
    */

    if (
        history.state &&
        history.state.overlay === "video"
    ) {

        history.back();

    } else {

        performCloseVideo();

    }

}


window.addEventListener(
    "popstate",
    () => {

        if (
            videoScreen.classList.contains("open")
        ) {

            performCloseVideo();

        }

    }
);


function toggleVideo() {

    if (videoPlayer.paused) {

        videoPlayer.play();

    } else {

        videoPlayer.pause();

    }

}


function getFullscreenElement() {

    return (
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.webkitCurrentFullScreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement ||
        null
    );

}


function requestFullscreenCompat(el) {

    const request =
        el.requestFullscreen ||
        el.webkitRequestFullscreen ||
        el.webkitRequestFullScreen ||
        el.webkitEnterFullscreen ||
        el.mozRequestFullScreen ||
        el.msRequestFullscreen;

    if (!request) {
        return Promise.reject(
            new Error("Fullscreen API non disponible")
        );
    }

    try {

        const result = request.call(el);

        return result && result.catch
            ? result
            : Promise.resolve();

    } catch (err) {

        return Promise.reject(err);

    }

}


function exitFullscreenCompat() {

    const exit =
        document.exitFullscreen ||
        document.webkitExitFullscreen ||
        document.webkitCancelFullScreen ||
        document.mozCancelFullScreen ||
        document.msExitFullscreen;

    if (!exit) {
        return Promise.reject(
            new Error("Fullscreen API non disponible")
        );
    }

    try {

        const result = exit.call(document);

        return result && result.catch
            ? result
            : Promise.resolve();

    } catch (err) {

        return Promise.reject(err);

    }

}


function toggleVideoFullscreen() {

    videoScreen.classList.toggle(
        "fullscreen-mode"
    );

    videoScreen.classList.add(
        "show-controls"
    );

    resetControlsTimer();


    /*
       On tente aussi le plein écran natif du
       téléphone en plus (amélioration facultative).
       Certains WebView Android ne le supportent
       pas : le mode CSS ci-dessus fonctionne
       de toute façon, avec ou sans lui.
    */

    if (
        videoScreen.classList.contains("fullscreen-mode")
    ) {

        requestFullscreenCompat(videoScreen)
            .catch(() => {});

    } else if (getFullscreenElement()) {

        exitFullscreenCompat()
            .catch(() => {});

    }

}


/*
   Si le plein écran natif est fermé par le
   système (bouton retour Android, geste, etc.)
   sans passer par notre bouton, on remet
   l'interface CSS en cohérence.
*/

[
    "fullscreenchange",
    "webkitfullscreenchange",
    "mozfullscreenchange",
    "MSFullscreenChange"
].forEach((eventName) => {

    document.addEventListener(eventName, () => {

        if (
            !getFullscreenElement() &&
            videoScreen.classList.contains("fullscreen-mode")
        ) {

            videoScreen.classList.remove(
                "fullscreen-mode"
            );

        }

    });

});


let controlsTimer = null;


function resetControlsTimer() {

    clearTimeout(controlsTimer);

    if (
        !videoScreen.classList.contains("fullscreen-mode") ||
        videoPlayer.paused
    ) {
        return;
    }

    controlsTimer = setTimeout(
        () => {

            videoScreen.classList.remove(
                "show-controls"
            );

        },
        3000
    );

}


function toggleFullscreenControls() {

    if (
        !videoScreen.classList.contains("fullscreen-mode")
    ) {
        return;
    }

    videoScreen.classList.toggle(
        "show-controls"
    );

    resetControlsTimer();

}


if (videoStage) {

    videoStage.addEventListener(
        "click",
        toggleFullscreenControls
    );

}


/* =========================================================
   RECHERCHE
   ========================================================= */

function filterMedia() {

    const query =
        searchInput.value
            .trim()
            .toLowerCase();


    if (!query) {

        filteredItems =
            [...mediaItems];

    } else {

        filteredItems =
            mediaItems.filter(
                item =>
                    item.title
                        .toLowerCase()
                        .includes(query) ||
                    (item.artist || "")
                        .toLowerCase()
                        .includes(query)
            );

    }


    renderMediaList();

}


/* =========================================================
   TRI
   ========================================================= */

function sortMedia(type) {

    if (type === "az") {

        mediaItems.sort(
            (a, b) =>
                a.title.localeCompare(
                    b.title,
                    "fr"
                )
        );

    }


    if (type === "za") {

        mediaItems.sort(
            (a, b) =>
                b.title.localeCompare(
                    a.title,
                    "fr"
                )
        );

    }


    if (type === "new") {

        mediaItems.sort(
            (a, b) =>
                (b.addedAt || 0) -
                (a.addedAt || 0)
        );

    }


    filteredItems =
        [...mediaItems];


    renderMediaList();

    saveMedia();

}


/* =========================================================
   ONGLETS
   ========================================================= */

function showPage(page) {

    let list;


    if (page === "songs") {

        list =
            mediaItems.filter(
                item =>
                    item.type === "audio"
            );

        emptyTitle.textContent =
            "Aucune musique trouvée";

        emptyText.innerHTML =
            "Vos musiques apparaîtront ici<br>automatiquement.";

    }


    else if (page === "videos") {

        list =
            mediaItems.filter(
                item =>
                    item.type === "video"
            );

        emptyTitle.textContent =
            "Aucune vidéo trouvée";

        emptyText.innerHTML =
            "Vos vidéos apparaîtront ici<br>automatiquement.";

    }


    else {

        list =
            [];

        emptyTitle.textContent =
            "Bientôt disponible";

        emptyText.innerHTML =
            "Cette section sera disponible<br>prochainement.";

    }


    filteredItems =
        list;


    if (list.length) {

        emptyPage.style.display =
            "none";

        mediaList.classList.add(
            "show"
        );

    } else {

        emptyPage.style.display =
            "block";

        mediaList.classList.remove(
            "show"
        );

    }


    renderMediaList();

}


/* =========================================================
   PAGE VIDE
   ========================================================= */

function updateEmptyPage() {

    const activeTab =
        document.querySelector(
            ".tab.active"
        );


    if (!activeTab) {
        return;
    }


    showPage(
        activeTab.dataset.page
    );

}


/* =========================================================
   STOCKAGE MÉDIAS
   ========================================================= */

function saveMedia() {

    /*
       IMPORTANT :
       Les Blob URLs ne survivent pas
       au rechargement de la page.

       On sauvegarde donc uniquement
       les informations simples.
    */

    try {

        const clean =
            mediaItems.map(
                item => ({

                    id:
                        item.id,

                    title:
                        item.title,

                    name:
                        item.name,

                    artist:
                        item.artist,

                    type:
                        item.type,

                    cover:
                        item.cover,

                    fileName:
                        item.fileName,

                    size:
                        item.size,

                    addedAt:
                        item.addedAt

                })
            );


        localStorage.setItem(
            MEDIA_STORAGE_KEY,
            JSON.stringify(clean)
        );

    } catch (error) {

        console.warn(
            "Sauvegarde impossible",
            error
        );

    }

}


/* =========================================================
   CHARGEMENT INFORMATIONS SAUVEGARDÉES
   ========================================================= */

async function loadSavedMedia() {

    /*
       On récupère la liste des morceaux/vidéos
       sauvegardés, puis on va rechercher le
       fichier réel de chacun dans IndexedDB
       pour recréer un lien de lecture valide.
    */

    try {

        const saved =
            JSON.parse(
                localStorage.getItem(
                    MEDIA_STORAGE_KEY
                ) || "[]"
            );

        if (
            !Array.isArray(saved) ||
            !saved.length
        ) {
            return;
        }


        const restored = [];

        for (const meta of saved) {

            const file =
                await idbGetFile(meta.id);

            /*
               Fichier introuvable (ancienne
               sauvegarde d'avant cette mise à
               jour, ou supprimé) : on l'ignore
               plutôt que d'afficher une entrée
               illisible.
            */

            if (!file) {
                continue;
            }

            const url =
                URL.createObjectURL(file);

            objectUrls.push(url);

            restored.push({
                ...meta,
                url,
                file
            });

        }


        if (restored.length) {

            mediaItems.push(
                ...restored
            );

            filteredItems =
                [...mediaItems];

            renderMediaList();

            updateEmptyPage();


            /*
               Certaines entrées n'ont pas pu
               être restaurées : on nettoie la
               sauvegarde pour rester cohérent.
            */

            if (restored.length !== saved.length) {

                saveMedia();

            }

        } else {

            localStorage.removeItem(
                MEDIA_STORAGE_KEY
            );

        }

    } catch (error) {

        console.warn(
            "Chargement impossible",
            error
        );

    }

}


/* =========================================================
   FORMAT TEMPS
   ========================================================= */

function formatTime(seconds) {

    if (
        !isFinite(seconds) ||
        seconds < 0
    ) {

        return "0:00";

    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    const secs =
        Math.floor(
            seconds % 60
        );


    return (
        minutes +
        ":" +
        String(secs).padStart(
            2,
            "0"
        )
    );

}


/* =========================================================
   NOM DU FICHIER
   ========================================================= */

function cleanFileName(name) {

    return name
        .replace(
            /\.[^/.]+$/,
            ""
        )
        .replace(
            /[_-]+/g,
            " "
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();

}


/* =========================================================
   ID
   ========================================================= */

function createId() {

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2, 9)
    );

}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(message) {

    if (!toast) {
        return;
    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toast._timer
    );


    toast._timer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2200
        );

}


/* =========================================================
   INDICATEUR DE VOLUME — EN HAUT
   ========================================================= */

function createVolumeIndicator() {

    if (volumeIndicator) {
        return;
    }


    volumeIndicator =
        document.createElement(
            "div"
        );


    volumeIndicator.id =
        "jtnVolumeIndicator";


    volumeIndicator.innerHTML = `

        <div class="jtn-volume-icon">
            🔊
        </div>

        <div class="jtn-volume-content">

            <div class="jtn-volume-title">
                Volume
            </div>

            <div class="jtn-volume-line">

                <div
                    class="jtn-volume-progress"
                    id="jtnVolumeProgress"
                ></div>

            </div>

        </div>

        <div
            class="jtn-volume-percent"
            id="jtnVolumePercent"
        >
            100%
        </div>

    `;


    /*
       Style directement dans JS :
       aucun changement obligatoire
       dans ton HTML.
    */

    volumeIndicator.style.cssText = `

        position: fixed;

        top:
            max(
                15px,
                env(safe-area-inset-top)
            );

        left: 50%;

        transform:
            translate(-50%, -20px);

        z-index: 99999;

        width: min(
            calc(100vw - 30px),
            360px
        );

        min-height: 64px;

        display: flex;

        align-items: center;

        gap: 12px;

        padding: 10px 14px;

        border-radius: 18px;

        background:
            rgba(15,15,15,.94);

        border:
            1px solid
            rgba(255,255,255,.12);

        box-shadow:
            0 12px 35px
            rgba(0,0,0,.55);

        backdrop-filter:
            blur(12px);

        -webkit-backdrop-filter:
            blur(12px);

        color: white;

        opacity: 0;

        pointer-events: none;

        transition:
            opacity .2s ease,
            transform .2s ease;

    `;


    const icon =
        volumeIndicator.querySelector(
            ".jtn-volume-icon"
        );


    icon.style.cssText = `

        width: 38px;

        height: 38px;

        display: grid;

        place-items: center;

        border-radius: 50%;

        background:
            rgba(0,255,60,.12);

        font-size: 19px;

        flex-shrink: 0;

    `;


    const content =
        volumeIndicator.querySelector(
            ".jtn-volume-content"
        );


    content.style.cssText = `

        flex: 1;

        min-width: 0;

    `;


    const title =
        volumeIndicator.querySelector(
            ".jtn-volume-title"
        );


    title.style.cssText = `

        font-size: 12px;

        color: #aaa;

        margin-bottom: 6px;

        font-weight: bold;

    `;


    const line =
        volumeIndicator.querySelector(
            ".jtn-volume-line"
        );


    line.style.cssText = `

        width: 100%;

        height: 5px;

        background: #333;

        border-radius: 10px;

        overflow: hidden;

    `;


    const progress =
        volumeIndicator.querySelector(
            ".jtn-volume-progress"
        );


    progress.style.cssText = `

        width: 100%;

        height: 100%;

        background: var(--green);

        border-radius: inherit;

        transition: width .1s linear;

    `;


    const percent =
        volumeIndicator.querySelector(
            ".jtn-volume-percent"
        );


    percent.style.cssText = `

        min-width: 45px;

        text-align: right;

        font-size: 14px;

        font-weight: bold;

        color: var(--green);

    `;


    document.body.appendChild(
        volumeIndicator
    );

}


/* =========================================================
   AFFICHER VOLUME
   ========================================================= */

function showVolumeIndicator(value) {

    createVolumeIndicator();


    const percent =
        Math.round(
            value * 100
        );


    const progress =
        volumeIndicator.querySelector(
            "#jtnVolumeProgress"
        );


    const percentElement =
        volumeIndicator.querySelector(
            "#jtnVolumePercent"
        );


    const icon =
        volumeIndicator.querySelector(
            ".jtn-volume-icon"
        );


    progress.style.width =
        percent + "%";


    percentElement.textContent =
        percent + "%";


    if (percent === 0) {

        icon.textContent =
            "🔇";

    }

    else if (percent < 35) {

        icon.textContent =
            "🔈";

    }

    else if (percent < 70) {

        icon.textContent =
            "🔉";

    }

    else {

        icon.textContent =
            "🔊";

    }


    volumeIndicator.style.opacity =
        "1";

    volumeIndicator.style.transform =
        "translate(-50%, 0)";


    clearTimeout(
        volumeTimer
    );


    volumeTimer =
        setTimeout(
            () => {

                volumeIndicator.style.opacity =
                    "0";

                volumeIndicator.style.transform =
                    "translate(-50%, -20px)";

            },
            1300
        );

}


/* =========================================================
   VOLUME
   ========================================================= */

function setVolume(value) {

    value =
        Math.max(
            0,
            Math.min(
                1,
                value
            )
        );


    volumeValue =
        value;

    lastVolume =
        value;


    audioPlayer.volume =
        value;


    /*
       Pour la vidéo aussi
    */

    videoPlayer.volume =
        value;


    if (value > 0) {

        audioPlayer.muted =
            false;

        videoPlayer.muted =
            false;

    }


    updateMuteIcon();

    showVolumeIndicator(
        value
    );

}


/* =========================================================
   VOLUME + / -
   ========================================================= */

function volumeUp() {

    setVolume(
        volumeValue + 0.05
    );

}


function volumeDown() {

    setVolume(
        volumeValue - 0.05
    );

}


/* =========================================================
   MUET
   ========================================================= */

function toggleMute() {

    if (
        audioPlayer.muted ||
        videoPlayer.muted
    ) {

        audioPlayer.muted =
            false;

        videoPlayer.muted =
            false;


        setVolume(
            lastVolume > 0
                ? lastVolume
                : 1
        );

    } else {

        lastVolume =
            volumeValue > 0
                ? volumeValue
                : 1;


        audioPlayer.muted =
            true;

        videoPlayer.muted =
            true;


        updateMuteIcon();

        showVolumeIndicator(
            0
        );

    }

}


function updateMuteIcon() {

    const muted =
        audioPlayer.muted ||
        videoPlayer.muted ||
        volumeValue === 0;


    muteButton.textContent =
        muted
            ? "🔇"
            : "🔊";

}


/* =========================================================
   VOLUME CHANGE
   ========================================================= */

function handleVolumeChange() {

    if (
        !audioPlayer.muted
    ) {

        volumeValue =
            audioPlayer.volume;

    }


    updateMuteIcon();

}


/* =========================================================
   GESTES VOLUME
   ========================================================= */

function setupVolumeSwipe() {

    let startY = 0;

    let startX = 0;

    let touching = false;


    const target =
        document.body;


    target.addEventListener(
        "touchstart",
        event => {

            /*
               Seulement si on est dans le lecteur
               vidéo ou dans le lecteur complet.
            */

            const videoOpen =
                videoScreen.classList.contains(
                    "open"
                );

            const playerOpen =
                fullPlayer.classList.contains(
                    "open"
                );


            if (
                !videoOpen &&
                !playerOpen
            ) {
                return;
            }


            const touch =
                event.touches[0];


            startY =
                touch.clientY;

            startX =
                touch.clientX;

            touching = true;

        },
        {
            passive: true
        }
    );


    target.addEventListener(
        "touchend",
        event => {

            if (!touching) {
                return;
            }


            touching = false;


            const touch =
                event.changedTouches[0];


            const endY =
                touch.clientY;

            const endX =
                touch.clientX;


            const distanceY =
                startY - endY;

            const distanceX =
                Math.abs(
                    startX - endX
                );


            /*
               Il faut un geste vertical.
            */

            if (
                Math.abs(distanceY) < 45 ||
                distanceX > Math.abs(distanceY)
            ) {
                return;
            }


            if (
                distanceY > 0
            ) {

                volumeUp();

            } else {

                volumeDown();

            }

        },
        {
            passive: true
        }
    );

}


/* =========================================================
   CLAVIER
   ========================================================= */

function handleKeyboard(event) {

    /*
       Évite de modifier le volume
       lorsqu'on écrit dans la recherche.
    */

    if (
        document.activeElement ===
        searchInput
    ) {
        return;
    }


    if (
        event.key === "ArrowUp"
    ) {

        event.preventDefault();

        volumeUp();

    }


    if (
        event.key === "ArrowDown"
    ) {

        event.preventDefault();

        volumeDown();

    }


    if (
        event.code === "Space"
    ) {

        if (
            document.activeElement.tagName ===
            "INPUT"
        ) {
            return;
        }


        event.preventDefault();

        togglePlay();

    }


    if (
        event.key === "Escape"
    ) {

        if (
            videoScreen.classList.contains(
                "open"
            )
        ) {

            closeVideo();

        }

        else if (
            fullPlayer.classList.contains(
                "open"
            )
        ) {

            closeFullPlayerView();

        }

    }

}


/* =========================================================
   SWIPE DU LECTEUR COMPLET
   ========================================================= */

(function setupFullPlayerSwipe() {

    let startY = 0;

    let startX = 0;


    fullPlayer.addEventListener(
        "touchstart",
        event => {

            const touch =
                event.touches[0];

            startY =
                touch.clientY;

            startX =
                touch.clientX;

        },
        {
            passive: true
        }
    );


    fullPlayer.addEventListener(
        "touchend",
        event => {

            const touch =
                event.changedTouches[0];


            const distanceY =
                touch.clientY -
                startY;


            const distanceX =
                Math.abs(
                    touch.clientX -
                    startX
                );


            if (
                distanceY > 100 &&
                distanceX < 100 &&
                fullPlayer.scrollTop <= 2
            ) {

                closeFullPlayerView();

            }

        },
        {
            passive: true
        }
    );

})();


/* =========================================================
   NETTOYAGE
   ========================================================= */

window.addEventListener(
    "beforeunload",
    () => {

        objectUrls.forEach(
            url => {

                try {

                    URL.revokeObjectURL(
                        url
                    );

                } catch {}

            }
        );

    }
);


/* =========================================================
   FIN
   ========================================================= */