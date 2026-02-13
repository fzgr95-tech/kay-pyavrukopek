import * as THREE from 'three';

// --- Global Variables ---
let scene, camera, renderer;
let player;
let gameActive = false;
let score = 0;
// coins removed
let speed = 30;
let clock;
let groundSegments = [];
let level = 1;
let currentDistance = 0;
let levelDistance = 75; // Starting Level Distance (Reduced from 500)
const SEGMENT_LENGTH = 50;

// Candy Variables
let candies = {
    pink: 0,
    blue: 0,
    gold: 0
};
const SEGMENT_COUNT = 15;

// Player Variables
let currentLane = 0; // -1 (Left), 0 (Center), 1 (Right)
let targetX = 0;
const LANE_WIDTH = 3;
let isJumping = false;
let verticalVelocity = 0;
const GRAVITY = -25;
const JUMP_FORCE = 10;

// Spawning Variables
let spawnTimer = 0;
let obstacles = [];
let collectibles = [];

// Finish Line Variables
let finishLineSpawned = false;
let finishLineObject = null;

// Ghost Mode Variables
let isGhost = false;
let ghostTimer = 0;

// Input State
let isDragging = false;
let startX = 0;
let startY = 0;

// Shop Variables
// Shop Variables
// 1. Colors (Body Skins)
let availableColors = [
    { id: 'gold', name: 'Altın', color: 0xffd700, cost: 0, costType: 'free' },
    { id: 'pink', name: 'Pembe', color: 0xff69b4, cost: 50, costType: 'pink' },
    { id: 'blue', name: 'Mavi', color: 0x1e90ff, cost: 100, costType: 'pink' },
    { id: 'orange', name: 'Turuncu', color: 0xffa500, cost: 150, costType: 'pink' },
    { id: 'green_plain', name: 'Yeşil', color: 0x32cd32, cost: 200, costType: 'pink' },
    { id: 'cyan', name: 'Turkuaz', color: 0x00ced1, cost: 250, costType: 'pink' },
    { id: 'black', name: 'Gece', color: 0x222222, cost: 300, costType: 'pink' },
    { id: 'white', name: 'Kar Beyaz', color: 0xffffff, cost: 400, costType: 'pink' },
    { id: 'purple_plain', name: 'Mor', color: 0x9932cc, cost: 450, costType: 'pink' },
    { id: 'brown', name: 'Kahve', color: 0x8b4513, cost: 500, costType: 'pink' },
    { id: 'red', name: 'Alev', color: 0xff3300, cost: 500, costType: 'pink' }
];

// 1.5. Breeds (New Category)
const availableBreeds = [
    { id: 'zombie', name: 'Zombi', color: 0x33cc33, cost: 600, costType: 'pink' },
    { id: 'mystery', name: 'Gizemli', color: 0x8800ff, cost: 700, costType: 'pink' },
    { id: 'husky', name: 'Husky', color: 0x9fa3a7, cost: 1000, costType: 'blue' }, // Grey
    { id: 'pug', name: 'Pug', color: 0xe5cca5, cost: 800, costType: 'blue' }, // Beige
    { id: 'shepherd', name: 'Kurt Köpeği', color: 0x8b5a2b, cost: 900, costType: 'blue' }, // Brown
    { id: 'dalmatian', name: 'Dalmaçyalı', color: 0xffffff, cost: 1200, costType: 'blue' }, // White base
    { id: 'robot', name: 'Robo-Köpek', color: 0xc0c0c0, cost: 2000, costType: 'blue' } // Silver
];

// 2. Accessories (Wearables)
let availableAccessories = [
    { id: 'none', name: 'Yok', cost: 0, costType: 'pink' },
    { id: 'tophat', name: 'Beyefendi', cost: 10, costType: 'pink' },
    { id: 'glasses', name: 'Havalı', cost: 10, costType: 'pink' },
    { id: 'eyepatch', name: 'Korsan', cost: 100, costType: 'blue' },
    { id: 'flag', name: 'Bayrak', cost: 15, costType: 'pink' },
    { id: 'crown', name: 'Kral Taç', cost: 50, costType: 'blue' },
    { id: 'bowtie', name: 'Papyon', cost: 20, costType: 'pink' },
    { id: 'santa', name: 'Noel Baba', cost: 30, costType: 'pink' }
];

// 3. Ear Colors
let availableEarColors = [
    { id: 'brown', name: 'Kahve', color: 0x442200, cost: 0, costType: 'pink' },
    { id: 'black', name: 'Siyah', color: 0x111111, cost: 50, costType: 'pink' },
    { id: 'white', name: 'Beyaz', color: 0xffffff, cost: 50, costType: 'pink' },
    { id: 'pink', name: 'Pembe', color: 0xff66b2, cost: 100, costType: 'pink' },
    { id: 'gold', name: 'Altın', color: 0xffaa00, cost: 200, costType: 'pink' }
];

let activeColor = availableColors[0];
let activeBreed = { id: 'default', name: 'Mix', cost: 0, costType: 'free' };
let activeAccessory = availableAccessories[0];
let activeEarColor = availableEarColors[0];

// 4. Trails
let availableTrails = [
    { id: 'default', name: 'Varsayılan', color: null, cost: 0, costType: 'pink' },
    { id: 'cloud', name: 'Bulut', color: 0xffffff, cost: 50, costType: 'pink' },
    { id: 'fire', name: 'Alev', color: 0xff4500, cost: 200, costType: 'pink' },
    { id: 'plasma', name: 'Plazma', color: 0x00ffff, cost: 300, costType: 'blue' },
    { id: 'gold', name: 'Altın Tozu', color: 0xffd700, cost: 500, costType: 'pink' },
    { id: 'rainbow', name: 'Gökkuşağı', color: 'rainbow', cost: 1000, costType: 'blue' }
];
let activeTrail = availableTrails[0];

// DOM Elements
let startBtn, shopBtn, backBtn, restartBtn, adReviveBtn, nextLevelBtn;
let levelsBtn, levelMenu, levelGrid, levelBackBtn;
let mainMenu, shopMenu, hud, gameOverScreen, levelCompleteScreen, adOverlay;
let scoreDisplay, coinsDisplay, finalScoreDisplay, mainMenuBtn, levelRewardDisplay;
let distanceDisplay, levelTargetDisplay;

let maxUnlockedLevel = 1;

// --- Themes ---
const themes = {
    world1: {
        background: 0xffe6f2, // Pinkish
        fog: 0xffe6f2,
        ground: 0xffccff,
        ui: "rgba(255,230,242,0.95)", // Pale Pink
        skyColor: 0xffe6f2
    },
    world2: {
        background: 0x0f0c29, // Dark Blue/Purple
        fog: 0x0f0c29,
        ground: 0x302b63, // Dark Purple Ground
        ui: "rgba(15, 12, 41, 0.95)", // Dark UI
        skyColor: 0x0f0c29
    }
};

// --- Theme Logic ---
function applyTheme(currentLevel) {
    let theme = themes.world1;
    if (currentLevel >= 21) {
        theme = themes.world2;
    }

    // Apply 3D Scene Colors
    if (scene) {
        scene.background = new THREE.Color(theme.background);
        scene.fog = new THREE.FogExp2(theme.fog, 0.015);
    }

    // Apply Ground Color
    // We need to access the ground materials. 
    // Since ground segments are recreated or we might want to just update existing ones.
    // Ideally, we update the global ground material variable if we had one, or traverse.
    // For simplicity, we will just update the background causing the "atmosphere" to change.
    // But let's try to update ground segments if possible.
    groundSegments.forEach(seg => {
        if (seg.material) seg.material.color.setHex(theme.ground);
    });

    // Apply UI Colors
    if (mainMenu) mainMenu.style.background = theme.ui;
    if (shopMenu) shopMenu.style.background = theme.ui;
    if (levelMenu) levelMenu.style.background = theme.ui;

    // Text Color Adjustment for Dark Mode
    const textColor = (currentLevel >= 21) ? '#fff' : '#444';
    document.body.style.color = textColor;

    const titles = document.querySelectorAll('h1, h2, h3, p');
    titles.forEach(t => t.style.color = textColor);
}

// --- Initialization ---
function logToScreen(msg) {
    console.log(msg);
}

function init() {
    try {
        console.log("Game Initializing...");

        if (typeof THREE === 'undefined') {
            throw new Error("Three.js kütüphanesi yüklenemedi! (İnternet bağlantınızı kontrol edin)");
        }

        // Fetch DOM Elements
        startBtn = document.getElementById('start-btn');
        shopBtn = document.getElementById('shop-btn');
        backBtn = document.getElementById('back-btn');
        restartBtn = document.getElementById('restart-btn');
        adReviveBtn = document.getElementById('ad-revive-btn');
        nextLevelBtn = document.getElementById('next-level-btn');
        levelsBtn = document.getElementById('levels-btn');
        levelBackBtn = document.getElementById('level-back-btn');

        mainMenu = document.getElementById('main-menu');
        shopMenu = document.getElementById('shop-menu');
        levelMenu = document.getElementById('level-menu');
        hud = document.getElementById('hud');
        gameOverScreen = document.getElementById('game-over');
        levelCompleteScreen = document.getElementById('level-complete');
        adOverlay = document.getElementById('ad-overlay');

        scoreDisplay = document.getElementById('score');
        // coinsDisplay removed
        finalScoreDisplay = document.getElementById('final-score');
        mainMenuBtn = document.getElementById('main-menu-btn');
        levelRewardDisplay = document.getElementById('level-reward');
        distanceDisplay = document.getElementById('distance');
        levelTargetDisplay = document.getElementById('level-target');

        // Candy Counters
        window.candyPinkDisplay = document.getElementById('candy-pink');
        window.candyBlueDisplay = document.getElementById('candy-blue');
        // Gold removed

        loadProgress();

        // DEV: Give free resources for testing accessories
        // coins = 5000;
        // candies.pink = 500;
        // candies.blue = 500;
        saveProgress();

        applyTheme(level); // Apply theme on startup based on loaded level


        // Scene Setup
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffe6f2);
        scene.fog = new THREE.FogExp2(0xffe6f2, 0.015);

        // Camera
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 4, 8);
        camera.lookAt(0, 0, -5);

        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.domElement.style.top = '0';
        renderer.domElement.style.left = '0';
        renderer.domElement.style.zIndex = '1';
        renderer.domElement.style.pointerEvents = 'none';
        document.body.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(20, 50, 20);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        scene.add(dirLight);

        // Clock
        clock = new THREE.Clock();

        // Initial Camera Setup
        updateCameraPosition();

        // Resize Event
        window.addEventListener('resize', onWindowResize, false);

        // Input Handling
        // Input Handling
        window.addEventListener('keydown', handleInput);

        // Touch Handling
        document.addEventListener('touchstart', (e) => {
            if (!gameActive) return;
            isDragging = true;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            if (!isDragging || !gameActive) return;
            e.preventDefault();
        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            if (!isDragging || !gameActive) return;
            isDragging = false;

            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;

            const diffX = endX - startX;
            const diffY = endY - startY;

            if (Math.abs(diffX) > Math.abs(diffY)) {
                // Horizontal
                if (Math.abs(diffX) > 30) {
                    if (diffX > 0) moveRight();
                    else moveLeft();
                }
            } else {
                // Vertical
                if (Math.abs(diffY) > 30) {
                    if (diffY < 0) jump();
                    else fastDrop();
                } else {
                    jump(); // Tap fallback
                }
            }
        });

        // Create World
        createInfiniteGround();
        createPlayer();

        // Event Listeners for UI
        if (startBtn) {
            startBtn.addEventListener('click', startGame);
            startBtn.innerHTML = `OYUNA BAŞLA ▶ (Seviye ${maxUnlockedLevel})`;
            startBtn.style.backgroundColor = "#00cc00";
        }

        // Debug exposure
        window.startGame = startGame;
        window.resetGame = resetGame;

        if (shopBtn) shopBtn.addEventListener('click', openShop);
        if (levelsBtn) levelsBtn.addEventListener('click', openLevelMenu);
        if (backBtn) backBtn.addEventListener('click', closeShop);
        if (levelBackBtn) levelBackBtn.addEventListener('click', () => {
            levelMenu.classList.add('hidden');
            mainMenu.classList.remove('hidden');
        });
        if (restartBtn) restartBtn.addEventListener('click', resetGame);
        if (mainMenuBtn) mainMenuBtn.addEventListener('click', goToMainMenu);
        if (adReviveBtn) adReviveBtn.addEventListener('click', watchAdToRevive);
        if (nextLevelBtn) nextLevelBtn.addEventListener('click', startNextLevel);

        // Level Pagination Listeners
        const prevWorldBtn = document.getElementById('prev-world-btn');
        const nextWorldBtn = document.getElementById('next-world-btn');
        if (prevWorldBtn) prevWorldBtn.addEventListener('click', prevWorld);
        if (nextWorldBtn) nextWorldBtn.addEventListener('click', nextWorld);

        // Pause Listeners
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) pauseBtn.addEventListener('click', togglePause);
        const resumeBtn = document.getElementById('resume-btn');
        if (resumeBtn) resumeBtn.addEventListener('click', togglePause);
        const quitBtn = document.getElementById('quit-btn');
        if (quitBtn) quitBtn.addEventListener('click', quitToMenu);

        // Hide Loading Message
        const loadingMsg = document.getElementById('loading-msg');
        if (loadingMsg) loadingMsg.style.display = 'none';

        // Start Loop
        animate();
        console.log("Initialization Complete");

    } catch (error) {
        console.error("Init Error:", error);
        const box = document.getElementById('error-box');
        if (box) {
            box.style.display = 'block';
            box.innerHTML += `BAŞLATMA HATASI: ${error.message}<br><small>${error.stack}</small><br>`;
        }
        alert("Oyun yüklenirken hata oluştu!\nMesaj: " + error.message + "\nLütfen sayfayı yenileyin.");
    }
}

// --- Navigation ---
function goToMainMenu() {
    gameOverScreen.classList.add('hidden');
    // Ensure shop is hidden too just in case
    if (shopMenu) shopMenu.classList.add('hidden');

    mainMenu.classList.remove('hidden');
    gameActive = false;
    clearGameObjects();
    if (player) player.position.set(0, 0.5, 0);
    camera.position.set(0, 4, 8);
    for (let i = 0; i < groundSegments.length; i++) {
        groundSegments[i].position.z = -i * SEGMENT_LENGTH;
    }
    renderer.render(scene, camera);

    // Update Start Button Text to reflect current progress
    if (startBtn) {
        startBtn.innerHTML = `OYUNA BAŞLA ▶ (Seviye ${maxUnlockedLevel})`;
    }
}

// --- Storage ---
function loadProgress() {
    try {
        // coins removed
        const savedCandies = localStorage.getItem('puppyr_candies');
        const savedSkin = localStorage.getItem('puppyr_skin');

        // Load Color
        const savedColorId = localStorage.getItem('puppyr_color');
        if (savedColorId) {
            const c = availableColors.find(x => x.id === savedColorId);
            if (c) activeColor = c;
        }

        // Load Breed (New System)
        const savedBreedId = localStorage.getItem('puppyr_breed');
        if (savedBreedId) {
            const b = availableBreeds.find(x => x.id === savedBreedId);
            if (b) activeBreed = b;
        } else {
            // Migration for old saves where breeds were stored as colors
            if (savedColorId) {
                const asBreed = availableBreeds.find(x => x.id === savedColorId);
                if (asBreed) {
                    activeBreed = asBreed;
                    activeColor = availableColors[0]; // Reset color to default (Gold) if we migrated a breed
                }
            }
        }

        const savedAccId = localStorage.getItem('puppyr_accessory');
        if (savedAccId) {
            const a = availableAccessories.find(x => x.id === savedAccId);
            if (a) activeAccessory = a;
        } else {
            // Fallback for migration
            if (savedSkin) {
                // Try to map old skin system to new
                if (savedSkin === 'gentleman') { activeColor = availableColors.find(c => c.id === 'blue') || activeColor; activeAccessory = availableAccessories.find(a => a.id === 'tophat'); }
                else if (savedSkin === 'cool') { activeColor = availableColors.find(c => c.id === 'gold') || activeColor; activeAccessory = availableAccessories.find(a => a.id === 'glasses'); }
                else if (savedSkin === 'pirate') { activeColor = availableColors.find(c => c.id === 'dalmatian') || activeColor; activeAccessory = availableAccessories.find(a => a.id === 'eyepatch'); }
            }
        }
        if (savedCandies) {
            try {
                candies = JSON.parse(savedCandies);
            } catch (e) {
                console.error("Candies Data Corrupt, Resetting", e);
                candies = { pink: 0, blue: 0, gold: 0 };
            }
        }

        if (savedEarColorId) {
            const ec = availableEarColors.find(x => x.id === savedEarColorId);
            if (ec) activeEarColor = ec;
        }

        const savedTrailId = localStorage.getItem('puppyr_trail');
        if (savedTrailId) {
            const tr = availableTrails.find(x => x.id === savedTrailId);
            if (tr) activeTrail = tr;
        }

        const savedLevel = localStorage.getItem('puppyr_level');
        if (savedLevel) {
            level = parseInt(savedLevel);
            if (isNaN(level)) level = 1;
        }

        const savedMaxLevel = localStorage.getItem('puppyr_max_level');
        if (savedMaxLevel) {
            maxUnlockedLevel = parseInt(savedMaxLevel);
            if (isNaN(maxUnlockedLevel)) maxUnlockedLevel = 1;
        } else {
            maxUnlockedLevel = level; // Default to current level if no max saved
        }

    } catch (e) {
        console.error("Load Progress Error:", e);
        // Reset defaults on catastrophic error
        // coins removed
        activeColor = availableColors[0];
        activeAccessory = availableAccessories[0];
        activeEarColor = availableEarColors[0];
        candies = { pink: 0, blue: 0, gold: 0 };
        level = 1;
        maxUnlockedLevel = 1;
    }
}

function saveProgress() {
    // coins removed
    localStorage.setItem('puppyr_color', activeColor.id);
    localStorage.setItem('puppyr_ear_color', activeEarColor.id);
    localStorage.setItem('puppyr_accessory', activeAccessory.id);
    localStorage.setItem('puppyr_trail', activeTrail.id);
    localStorage.setItem('puppyr_candies', JSON.stringify(candies));
    localStorage.setItem('puppyr_level', level);
    localStorage.setItem('puppyr_max_level', maxUnlockedLevel);
}

// --- World Creation ---
function createInfiniteGround() {
    const geometry = new THREE.PlaneGeometry(30, SEGMENT_LENGTH);
    const material = new THREE.MeshPhongMaterial({ color: 0xffb3b3, specular: 0x555555, shininess: 10, side: THREE.DoubleSide });
    for (let i = 0; i < SEGMENT_COUNT; i++) {
        const segment = new THREE.Mesh(geometry, material);
        segment.rotation.x = -Math.PI / 2;
        segment.position.z = -i * SEGMENT_LENGTH;
        segment.receiveShadow = true;
        scene.add(segment);
        groundSegments.push(segment);

        const lineGeo = new THREE.PlaneGeometry(0.2, SEGMENT_LENGTH);
        const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const lineLeft = new THREE.Mesh(lineGeo, lineMat);
        lineLeft.position.x = -LANE_WIDTH / 2;
        lineLeft.position.z = 0.01;
        segment.add(lineLeft);
        const lineRight = new THREE.Mesh(lineGeo, lineMat);
        lineRight.position.x = LANE_WIDTH / 2;
        lineRight.position.z = 0.01;
        segment.add(lineRight);
    }
}

function createPlayer() {
    if (player) scene.remove(player);

    // Body (Color)
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshToonMaterial({ color: activeColor.color });
    player = new THREE.Mesh(geometry, material);
    player.position.set(0, 0.5, 0);
    player.castShadow = true;

    // --- BREED SPECIFIC DETAILS ---
    const breedId = activeBreed.id;
    const whiteMat = new THREE.MeshToonMaterial({ color: 0xffffff });
    const blackMat = new THREE.MeshToonMaterial({ color: 0x111111 });

    if (breedId === 'husky') {
        // White Belly
        const belly = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.05), whiteMat);
        belly.position.set(0, -0.15, 0.51); // Front
        player.add(belly);

        // White Face Mask
        const mask = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.3, 0.05), whiteMat);
        mask.position.set(0, 0.2, 0.51);
        player.add(mask);
    }
    else if (breedId === 'pug') {
        // Black Muzzle/Mask
        const mask = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.35, 0.05), blackMat);
        mask.position.set(0, 0.05, 0.51);
        player.add(mask);
    }
    else if (breedId === 'shepherd') {
        // Black Saddle (Back)
        const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 1.02), blackMat);
        saddle.position.set(0, 0.31, 0);
        player.add(saddle);
    }
    else if (breedId === 'dalmatian' || breedId === 'benekli') { // Update old 'benekli' too
        // Random Spots
        const spotGeo = new THREE.CircleGeometry(0.08, 8);
        const spotMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

        // Front spots
        for (let i = 0; i < 3; i++) {
            const spot = new THREE.Mesh(spotGeo, spotMat);
            spot.position.set((Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.8, 0.51);
            player.add(spot);
        }
        // Side spots (Left/Right)
        for (let i = 0; i < 3; i++) {
            const spotL = new THREE.Mesh(spotGeo, spotMat);
            spotL.rotation.y = -Math.PI / 2;
            spotL.position.set(-0.51, (Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.8);
            player.add(spotL);

            const spotR = new THREE.Mesh(spotGeo, spotMat);
            spotR.rotation.y = Math.PI / 2;
            spotR.position.set(0.51, (Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.8);
            player.add(spotR);
        }
    }
    else if (breedId === 'robot') {
        // Glowing Eyes
        const eyeGeo = new THREE.BoxGeometry(0.15, 0.1, 0.05);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Green Glow
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.2, 0.2, 0.51);
        player.add(leftEye);
        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.2, 0.2, 0.51);
        player.add(rightEye);

        // Antenna
        const antStick = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4), new THREE.MeshToonMaterial({ color: 0x888888 }));
        antStick.position.set(0, 0.7, 0);
        player.add(antStick);
        const antBall = new THREE.Mesh(new THREE.SphereGeometry(0.08), new THREE.MeshToonMaterial({ color: 0xff0000 }));
        antBall.position.set(0, 0.9, 0);
        player.add(antBall);
    }


    // Ears
    const earGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const earMat = new THREE.MeshToonMaterial({ color: activeEarColor.color });
    const leftEar = new THREE.Mesh(earGeo, earMat);
    leftEar.position.set(-0.4, 0.5, 0);
    player.add(leftEar);
    const rightEar = new THREE.Mesh(earGeo, earMat);
    rightEar.position.set(0.4, 0.5, 0);
    player.add(rightEar);

    // Tail
    const tailGeo = new THREE.BoxGeometry(0.2, 0.2, 0.5);
    const tail = new THREE.Mesh(tailGeo, earMat);
    tail.position.set(0, 0, 0.6);
    player.add(tail);

    // Accessories
    const accId = activeAccessory.id;

    if (accId === 'tophat') {
        const hatGroup = new THREE.Group();
        const brimGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.1, 16);
        const brimMat = new THREE.MeshToonMaterial({ color: 0x111111 });
        const brim = new THREE.Mesh(brimGeo, brimMat);
        brim.position.y = 0.5;
        hatGroup.add(brim);

        const cylGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.6, 16);
        const cyl = new THREE.Mesh(cylGeo, brimMat);
        cyl.position.y = 0.8;
        hatGroup.add(cyl);

        const ribGeo = new THREE.CylinderGeometry(0.41, 0.41, 0.1, 16);
        const ribMat = new THREE.MeshToonMaterial({ color: 0xff0000 });
        const rib = new THREE.Mesh(ribGeo, ribMat);
        rib.position.y = 0.6;
        hatGroup.add(rib);

        player.add(hatGroup);
    } else if (accId === 'glasses') {
        const glassesGroup = new THREE.Group();
        const glassMat = new THREE.MeshToonMaterial({ color: 0x111111 });

        const leftLens = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.15, 0.1), glassMat);
        leftLens.position.set(-0.2, 0.2, 0.55);
        glassesGroup.add(leftLens);

        const rightLens = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.15, 0.1), glassMat);
        rightLens.position.set(0.2, 0.2, 0.55);
        glassesGroup.add(rightLens);

        const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.1), glassMat);
        bridge.position.set(0, 0.2, 0.55);
        glassesGroup.add(bridge);

        player.add(glassesGroup);
    } else if (accId === 'eyepatch') {
        const patchGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.05, 16);
        patchGeo.rotateX(Math.PI / 2);
        const patchMat = new THREE.MeshToonMaterial({ color: 0x000000 });
        const patch = new THREE.Mesh(patchGeo, patchMat);
        patch.position.set(-0.2, 0.2, 0.52);
        player.add(patch);

        const strap = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.05, 1.02), patchMat);
        strap.position.y = 0.2;
        player.add(strap);
    } else if (accId === 'flag') {
        const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.5);
        const poleMat = new THREE.MeshToonMaterial({ color: 0x885522 });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.set(0, 0.5, 0.6); // On back/tail area
        pole.rotation.x = -Math.PI / 4;
        player.add(pole);

        const flagGeo = new THREE.BoxGeometry(0.6, 0.4, 0.05);
        const flagMat = new THREE.MeshToonMaterial({ color: 0xff0000 });
        const flag = new THREE.Mesh(flagGeo, flagMat);
        flag.position.set(0, 1.0, 0.8);
        flag.rotation.x = -Math.PI / 4;
        player.add(flag);
    } else if (accId === 'crown') {
        const crownGroup = new THREE.Group();
        const baseGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 16);
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2 });
        const base = new THREE.Mesh(baseGeo, goldMat);
        base.position.y = 0.6;
        crownGroup.add(base);

        for (let i = 0; i < 5; i++) {
            const spikeGeo = new THREE.ConeGeometry(0.1, 0.3, 8);
            const spike = new THREE.Mesh(spikeGeo, goldMat);
            const angle = (i / 5) * Math.PI * 2;
            spike.position.set(Math.cos(angle) * 0.4, 0.8, Math.sin(angle) * 0.4);
            crownGroup.add(spike);
        }
        player.add(crownGroup);
    } else if (accId === 'bowtie') {
        const bowGeo = new THREE.BoxGeometry(0.8, 0.3, 0.1);
        const redMat = new THREE.MeshToonMaterial({ color: 0xff0000 });
        const bow = new THREE.Mesh(bowGeo, redMat);
        bow.position.set(0, 0, 0.55); // Front of chest
        player.add(bow);
        const knot = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.15), new THREE.MeshToonMaterial({ color: 0xffffff }));
        knot.position.set(0, 0, 0.6);
        player.add(knot);
    } else if (accId === 'santa') {
        const hatGroup = new THREE.Group();
        const coneGeo = new THREE.ConeGeometry(0.5, 0.8, 16);
        const redMat = new THREE.MeshToonMaterial({ color: 0xff0000 });
        const hat = new THREE.Mesh(coneGeo, redMat);
        hat.position.y = 0.9;
        hatGroup.add(hat);

        const trimGeo = new THREE.TorusGeometry(0.5, 0.1, 8, 16);
        const whiteMat = new THREE.MeshToonMaterial({ color: 0xffffff });
        const trim = new THREE.Mesh(trimGeo, whiteMat);
        trim.position.y = 0.5;
        trim.rotation.x = Math.PI / 2;
        hatGroup.add(trim);

        const ballGeo = new THREE.SphereGeometry(0.15);
        const ball = new THREE.Mesh(ballGeo, whiteMat);
        ball.position.y = 1.3;
        hatGroup.add(ball);
        player.add(hatGroup);
    }

    scene.add(player);
}

// --- Game Logic ---
function createFinishLine(z) {
    const group = new THREE.Group();
    // Posts
    const postGeo = new THREE.CylinderGeometry(0.5, 0.5, 5);
    const postMat = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const leftPost = new THREE.Mesh(postGeo, postMat);
    leftPost.position.set(-LANE_WIDTH * 1.5, 2.5, 0);
    group.add(leftPost);
    const rightPost = new THREE.Mesh(postGeo, postMat);
    rightPost.position.set(LANE_WIDTH * 1.5, 2.5, 0);
    group.add(rightPost);

    // Banner
    const bannerGeo = new THREE.BoxGeometry(LANE_WIDTH * 3.5, 1.2, 0.2);
    // Create Canvas Texture for Text
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Background (Green)
    ctx.fillStyle = '#33cc33';
    ctx.fillRect(0, 0, 512, 128);

    // Border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, 502, 118);

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BİTİŞ ÇİZGİSİ', 256, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const bannerMat = new THREE.MeshBasicMaterial({ map: texture });

    const banner = new THREE.Mesh(bannerGeo, bannerMat);
    banner.position.set(0, 4, 0);
    group.add(banner);

    group.position.set(0, 0, z);
    scene.add(group);
    finishLineObject = group;
}

function finishLevel() {
    gameActive = false;
    // Show celebration
    startConfetti();

    if (player) {
        // Simple victory spin
        const spinInterval = setInterval(() => {
            player.rotation.y += 0.2;
            player.position.y = 0.5 + Math.sin(Date.now() / 100) * 0.2;
        }, 16);
        setTimeout(() => clearInterval(spinInterval), 5000);
    }

    // Unlock next level IMMEDIATELY
    if (level >= maxUnlockedLevel) {
        maxUnlockedLevel = level + 1;
        saveProgress();
        console.log("Level Complete! Progress Saved. New Max Level:", maxUnlockedLevel);
    }

    setTimeout(() => {
        stopConfetti();
        showLevelComplete();
    }, 5000);
}

// --- Confetti System ---
let confettiCanvas;
let confettiCtx;
let confettiParticles = [];
let confettiAnimationId;

function startConfetti() {
    if (!confettiCanvas) {
        confettiCanvas = document.createElement('canvas');
        confettiCanvas.id = 'confetti-canvas';
        confettiCanvas.style.position = 'fixed';
        confettiCanvas.style.top = '0';
        confettiCanvas.style.left = '0';
        confettiCanvas.style.width = '100%';
        confettiCanvas.style.height = '100%';
        confettiCanvas.style.zIndex = '9999';
        confettiCanvas.style.pointerEvents = 'none';
        document.body.appendChild(confettiCanvas);
        confettiCtx = confettiCanvas.getContext('2d');

        window.addEventListener('resize', resizeConfetti);
    }
    resizeConfetti();
    confettiParticles = [];
    for (let i = 0; i < 300; i++) {
        confettiParticles.push(createConfettiParticle());
    }
    updateConfetti();
}

function stopConfetti() {
    cancelAnimationFrame(confettiAnimationId);
    if (confettiCanvas) {
        confettiCanvas.remove();
        confettiCanvas = null;
    }
}

function resizeConfetti() {
    if (confettiCanvas) {
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
    }
}

function createConfettiParticle() {
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
    return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight - window.innerHeight,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5,
        speedY: Math.random() * 3 + 2,
        speedX: Math.random() * 2 - 1,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 10 - 5
    };
}

function updateConfetti() {
    if (!confettiCanvas) return;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    confettiParticles.forEach((p, index) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;

        if (p.y > confettiCanvas.height) {
            confettiParticles[index] = createConfettiParticle(); // Recycle
        }

        confettiCtx.save();
        confettiCtx.translate(p.x, p.y);
        confettiCtx.rotate(p.rotation * Math.PI / 180);
        confettiCtx.fillStyle = p.color;
        confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        confettiCtx.restore();
    });

    confettiAnimationId = requestAnimationFrame(updateConfetti);
}

function showLevelComplete() {
    if (levelCompleteScreen) levelCompleteScreen.classList.remove('hidden');
    const bonus = level * 10;
    candies.pink += bonus;
    // Save candies
    saveProgress();

    if (levelRewardDisplay) levelRewardDisplay.innerHTML = `${bonus} 🍭`;

    // Update Start Button text for next time (if they go to menu)
    if (startBtn) startBtn.innerHTML = `OYUNA BAŞLA ▶ (Seviye ${maxUnlockedLevel})`;
}

function startNextLevel() {
    if (levelCompleteScreen) levelCompleteScreen.classList.add('hidden');
    if (hud) hud.classList.remove('hidden');
    level++;
    currentDistance = 0;
    levelDistance = 50 + (level * 25);
    speed = 30 + ((level - 1) * 2);
    clearGameObjects();
    if (player) {
        player.position.set(0, 0.5, 0);
        targetX = 0;
        currentLane = 0;
    }
    gameActive = true;
}

function resetGame() {
    if (gameOverScreen) gameOverScreen.classList.add('hidden');
    if (hud) hud.classList.remove('hidden');
    score = 0;
    if (!level || level < 1) level = 1;
    speed = 30 + ((level - 1) * 2);
    levelDistance = 50 + (level * 25);
    currentDistance = 0;
    clearGameObjects();
    if (player) {
        player.position.set(0, 0.5, 0);
        isJumping = false;
        verticalVelocity = 0;
        targetX = 0;
        currentLane = 0;
    }
    gameActive = true;
    gamePaused = false;
}

function handleInput(event) {
    if (event.code === 'KeyP' || event.code === 'Escape') {
        if (gameActive || gamePaused) togglePause();
        return;
    }
    if (!gameActive || gamePaused) return;

    if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
        moveLeft();
    } else if (event.code === 'ArrowRight' || event.code === 'KeyD') {
        moveRight();
    } else if (event.code === 'ArrowUp' || event.code === 'Space' || event.code === 'KeyW') {
        jump();
    } else if (event.code === 'ArrowDown' || event.code === 'KeyS') {
        fastDrop();
    }
}

function fastDrop() {
    if (isJumping && verticalVelocity > -10) {
        verticalVelocity = -20; // Force down
        // Trail/Effect trigger can go here later
    }
}

function moveLeft() {
    if (currentLane > -1) {
        currentLane--;
        targetX = currentLane * LANE_WIDTH;
    }
}

function moveRight() {
    if (currentLane < 1) {
        currentLane++;
        targetX = currentLane * LANE_WIDTH;
    }
}

function jump() {
    if (!isJumping) {
        isJumping = true;
        verticalVelocity = JUMP_FORCE;
    }
}

function updatePhysics(delta) {
    const moveSpeed = speed * delta;

    // Ground
    for (let i = 0; i < groundSegments.length; i++) {
        groundSegments[i].position.z += moveSpeed;
        if (groundSegments[i].position.z > SEGMENT_LENGTH + 10) {
            groundSegments[i].position.z -= SEGMENT_COUNT * SEGMENT_LENGTH;
        }
    }

    // Player
    if (player) {
        player.position.x += (targetX - player.position.x) * (delta * 10);
        player.position.y += verticalVelocity * delta;
        verticalVelocity += GRAVITY * delta;

        // Floor Collision
        if (player.position.y <= 0.5) {
            // Impact Effect if falling fast
            if (verticalVelocity < -10) {
                createLandingEffect(player.position.x, player.position.z);
            }

            player.position.y = 0.5;
            isJumping = false;
            verticalVelocity = 0;
        }
    }

    spawnLogic(delta);
    checkCollisions();
    moveGameObjects(moveSpeed);

    currentDistance += moveSpeed * 0.1;
    score += delta * 5;

    // Finish Line Logic
    if (!finishLineSpawned) {
        const remainingDistance = levelDistance - currentDistance;
        createFinishLine(-(remainingDistance * 10));
        finishLineSpawned = true;
    }
    if (finishLineObject) {
        finishLineObject.position.z += moveSpeed;
    }

    if (currentDistance >= levelDistance) {
        finishLevel();
        return;
    }

    updateUI();
    speed += delta * 0.1;
}

function moveGameObjects(moveSpeed) {
    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].position.z += moveSpeed;
    }
    for (let i = 0; i < collectibles.length; i++) {
        collectibles[i].position.z += moveSpeed;
    }
}

function spawnLogic(delta) {
    spawnTimer += delta;
    const spawnThreshold = 1.5 * (10 / speed);

    if (spawnTimer > spawnThreshold) {
        spawnTimer = 0;
        spawnObject();
    }
}

function spawnObject() {
    const lanes = [-LANE_WIDTH, 0, LANE_WIDTH];
    const laneX = lanes[Math.floor(Math.random() * lanes.length)];
    const spawnZ = -100;
    const type = Math.random();
    if (type < 0.3) {
        const candyRand = Math.random();
        let candyType = 'pink';
        if (candyRand > 0.7) candyType = 'blue';
        // Gold removed
        createCollectible(laneX, spawnZ, candyType);
    } else {
        // Obstacle Logic
        // Chance for Jumpable Obstacle increases with level
        // Level 1: 0%, Level 2: 20%, Level 5+: 50%
        const jumpChance = Math.min(0.5, (level - 1) * 0.1);

        if (Math.random() < jumpChance) {
            createJumpableObstacle(laneX, spawnZ);
        } else {
            createObstacle(laneX, spawnZ);
        }
    }
}

function createObstacle(x, z) {
    const geometry = new THREE.DodecahedronGeometry(0.5);
    const material = new THREE.MeshPhongMaterial({ color: 0xff3333 });
    const obstacle = new THREE.Mesh(geometry, material);
    obstacle.position.set(x, 0.5, z);
    obstacle.castShadow = true;
    scene.add(obstacle);
    obstacles.push(obstacle);
}

function createJumpableObstacle(x, z) {
    // A low, wide barrier (Log or Fence)
    const geometry = new THREE.CylinderGeometry(0.2, 0.2, 2.8, 16);
    geometry.rotateZ(Math.PI / 2); // Lay flat
    const material = new THREE.MeshPhongMaterial({ color: 0x8B4513 }); // Brown for wood
    const obstacle = new THREE.Mesh(geometry, material);
    obstacle.position.set(x, 0.3, z); // Low height
    obstacle.castShadow = true;

    // Add supports
    const supportGeo = new THREE.BoxGeometry(0.1, 0.6, 0.1);
    const supportMat = new THREE.MeshPhongMaterial({ color: 0x553311 });

    const leftSup = new THREE.Mesh(supportGeo, supportMat);
    leftSup.position.set(-1.2, -0.2, 0);
    obstacle.add(leftSup);

    const rightSup = new THREE.Mesh(supportGeo, supportMat);
    rightSup.position.set(1.2, -0.2, 0);
    obstacle.add(rightSup);

    scene.add(obstacle);
    obstacles.push(obstacle);
}

function createCollectible(x, z, type) {
    const group = new THREE.Group();

    if (type === 'blue') {

        // Blue Candy: Solid Sphere Model (No Gaps)
        const texture = new THREE.TextureLoader().load('candy.png');

        // 1. Center Body: Solid Sphere
        const coreGeo = new THREE.SphereGeometry(0.45, 32, 32);
        const coreMat = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.4,
            metalness: 0.1,
            side: THREE.FrontSide // Ensure it looks solid
        });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.y = 0.5;
        core.scale.set(1.1, 1.0, 1.0); // Slightly oblong
        group.add(core);

        // 2. Wrappers: Solid Cones (Gap filling)
        // Use a matching blue color or the texture if user prefers
        const fanGeo = new THREE.ConeGeometry(0.4, 0.5, 32);
        fanGeo.rotateZ(Math.PI / 2);

        // Use a material that matches the texture roughly or re-use texture
        const fanMat = new THREE.MeshStandardMaterial({
            map: texture, // Wrap texture on cones too for continuity
            roughness: 0.4,
            metalness: 0.1
        });

        const leftFan = new THREE.Mesh(fanGeo, fanMat);
        leftFan.position.set(-0.6, 0.5, 0);
        group.add(leftFan);

        const rightFan = new THREE.Mesh(fanGeo, fanMat);
        rightFan.position.set(0.6, 0.5, 0);
        rightFan.rotation.z = -Math.PI / 2;
        group.add(rightFan);

    } else {
        // Swirl Lollipop (Pink)
        // Swirl Lollipop (Unchanged)
        const stickGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.0);
        const stickMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const stick = new THREE.Mesh(stickGeo, stickMat);
        stick.position.y = 0.5;
        group.add(stick);

        // Swirl Texture
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        const cx = 128, cy = 128;

        ctx.fillStyle = '#ff3366';
        ctx.fillRect(0, 0, 256, 256);

        ctx.fillStyle = 'white';
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, 128, (i * 60) * Math.PI / 180, (i * 60 + 30) * Math.PI / 180);
            ctx.lineTo(cx, cy);
            ctx.fill();
        }

        ctx.lineWidth = 15;
        ctx.strokeStyle = '#ff99cc';
        ctx.beginPath();
        for (let i = 0; i < 50; i++) {
            const angle = 0.5 * i;
            const x = cx + (2 + 4 * angle) * Math.cos(angle);
            const y = cy + (2 + 4 * angle) * Math.sin(angle);
            if (i == 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        const texture = new THREE.CanvasTexture(canvas);
        const headGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.15, 32);
        headGeo.rotateX(Math.PI / 2);
        const headMat = new THREE.MeshStandardMaterial({ map: texture });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.0;
        group.add(head);

        const bowGeo = new THREE.SphereGeometry(0.15, 16, 16);
        const bowMat = new THREE.MeshStandardMaterial({ color: 0x33ccff });
        const center = new THREE.Mesh(bowGeo, bowMat);
        center.position.y = 0.6;
        center.scale.set(0.5, 0.5, 0.5);
        group.add(center);

        const wingGeo = new THREE.ConeGeometry(0.2, 0.3, 16);
        wingGeo.rotateZ(Math.PI / 2);
        const leftWing = new THREE.Mesh(wingGeo, bowMat);
        leftWing.position.set(-0.2, 0.6, 0);
        leftWing.scale.set(1, 0.5, 1);
        group.add(leftWing);
        const rightWing = new THREE.Mesh(wingGeo, bowMat);
        rightWing.position.set(0.2, 0.6, 0);
        rightWing.rotation.z = -Math.PI / 2;
        rightWing.scale.set(1, 0.5, 1);
        group.add(rightWing);
    }

    group.position.set(x, 0, z);

    // 70% Ground (0.6 - easy), 30% Air (1.9 - jumpable)
    const startY = Math.random() < 0.7 ? 0.6 : 1.9;

    group.userData = {
        type: type,
        rotationSpeed: 3,
        bobSpeed: 5,
        initialY: startY,
        timeOffset: Math.random() * 10
    };
    scene.add(group);
    collectibles.push(group);
}

function checkCollisions() {
    const playerBox = new THREE.Box3().setFromObject(player);
    playerBox.expandByScalar(-0.3);
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        const obsBox = new THREE.Box3().setFromObject(obs);
        if (playerBox.intersectsBox(obsBox)) {
            if (isGhost) return; // Ignore collision if ghost
            gameOver();
            return;
        }
        if (obs.position.z > player.position.z + 10) {
            scene.remove(obs);
            obstacles.splice(i, 1);
        }
    }
    for (let i = collectibles.length - 1; i >= 0; i--) {
        const coin = collectibles[i];
        const coinBox = new THREE.Box3().setFromObject(coin);
        // Animation: Rotate & Bob
        coin.rotation.y += 0.05;
        // Fix clipping: Use initialY from userData
        coin.position.y = coin.userData.initialY + Math.sin(clock.getElapsedTime() * coin.userData.bobSpeed + coin.userData.timeOffset) * 0.3;

        if (playerBox.intersectsBox(coinBox)) {
            const type = coin.userData.type;

            // Logic for different candies
            if (type === 'blue') {
                candies.blue++;
                score += 250;
            } else {
                candies.pink++;
                score += 100;
            }

            saveProgress();
            scene.remove(coin);
            collectibles.splice(i, 1);
            continue;
        }
        if (coin.position.z > player.position.z + 10) {
            scene.remove(coin);
            collectibles.splice(i, 1);
        }
    }
}

function gameOver() {
    gameActive = false;
    if (gameOverScreen) gameOverScreen.classList.remove('hidden');
    if (finalScoreDisplay) finalScoreDisplay.innerText = Math.floor(score);
    if (hud) hud.classList.add('hidden');
}

function clearGameObjects() {
    obstacles.forEach(obj => scene.remove(obj));
    obstacles = [];
    collectibles.forEach(obj => scene.remove(obj));
    collectibles = [];
    if (finishLineObject) {
        scene.remove(finishLineObject);
        finishLineObject = null;
    }
    finishLineSpawned = false;
}



function watchAdToRevive() {
    alert("Reklam izleniyor... (Simülasyon)");
    setTimeout(() => {
        alert("Reklam bitti! +1 Can");
        obstacles.forEach((obs, index) => {
            if (obs.position.z > -10 && obs.position.z < 10) {
                scene.remove(obs);
                obstacles.splice(index, 1);
            }
        });
        gameOverScreen.classList.add('hidden');
        hud.classList.remove('hidden');
        gameActive = true;

        // Ghost Mode Activation
        isGhost = true;
        ghostTimer = 3; // 3 seconds invincibility
        if (player) {
            player.traverse((child) => {
                if (child.isMesh) {
                    child.material.transparent = true;
                    child.material.opacity = 0.5;
                }
            });
        }
    }, 1000);
}
// --- Pause Logic ---
let gamePaused = false;
function togglePause() {
    if (!gameActive && !gamePaused) return;
    gamePaused = !gamePaused;
    const pauseMenu = document.getElementById('pause-menu');
    if (gamePaused) {
        pauseMenu.classList.remove('hidden');
    } else {
        pauseMenu.classList.add('hidden');
    }
}

function quitToMenu() {
    // If paused, unpause logic first locally or just reset
    if (gamePaused) {
        gamePaused = false;
        const pauseMenu = document.getElementById('pause-menu');
        if (pauseMenu) pauseMenu.classList.add('hidden');
    }
    goToMainMenu();
}

function startGame() {
    console.log("Game Starting!");
    if (mainMenu) mainMenu.classList.add('hidden');
    if (gameOverScreen) gameOverScreen.classList.add('hidden');
    if (hud) hud.classList.remove('hidden');
    if (shopMenu) shopMenu.classList.add('hidden');

    score = 0;

    // Use the loaded level, don't reset to 1
    // Update: Start from highest unlocked level
    if (maxUnlockedLevel > 1) level = maxUnlockedLevel;
    if (!level || level < 1) level = 1;

    // Recalculate difficulty based on saved level
    speed = 30 + ((level - 1) * 2);
    levelDistance = 50 + (level * 25);

    currentDistance = 0;
    gameActive = true;
    gamePaused = false;
    clearGameObjects();
}

function openShop() {
    // FORCE UPDATE FOR USER
    if (candies.pink < 5000) candies.pink = 5000;
    if (candies.blue < 5000) candies.blue = 5000;
    saveProgress();

    mainMenu.classList.add('hidden');
    shopMenu.classList.remove('hidden');

    // Header Currency Display
    const uiContainer = document.getElementById('shop-coins');
    if (uiContainer) {
        uiContainer.innerHTML = `
            <div class="shop-currency-header">
                <span style="color:#ff66b2">🍭 ${candies.pink}</span>
                <span style="color:#3399ff">🍬 ${candies.blue}</span>
            </div>
        `;
    }

    renderShopItems();
}

function closeShop() {
    shopMenu.classList.add('hidden');
    mainMenu.classList.remove('hidden');
    createPlayer();
}

function renderShopItems() {
    const container = document.getElementById('shop-items');
    container.innerHTML = '';

    // Helper to create tab buttons
    const createTabBtn = (text, id, isActive = false) => {
        const btn = document.createElement('button');
        btn.innerText = text;
        btn.className = isActive ? 'shop-tab-btn active-tab' : 'shop-tab-btn';
        btn.onclick = () => {
            document.querySelectorAll('.shop-tab-btn').forEach(b => b.classList.remove('active-tab'));
            btn.classList.add('active-tab');
            document.querySelectorAll('.shop-tab-content').forEach(c => c.classList.remove('active-content'));
            document.getElementById(id).classList.add('active-content');
        };
        return btn;
    };

    // Create Tab Container
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'shop-tabs';
    tabsContainer.style.display = 'flex';
    tabsContainer.style.gap = '10px';
    tabsContainer.style.marginBottom = '20px';

    tabsContainer.appendChild(createTabBtn('VÜCUT RENGİ 🎨', 'tab-colors', true));
    tabsContainer.appendChild(createTabBtn('KÖPEK 🐕', 'tab-breeds'));
    tabsContainer.appendChild(createTabBtn('KULAK 👂', 'tab-ears'));
    tabsContainer.appendChild(createTabBtn('EŞYA 🎩', 'tab-accessories'));
    tabsContainer.appendChild(createTabBtn('İZ 💨', 'tab-trails'));

    container.appendChild(tabsContainer);

    // Create Content Containers
    const contentContainer = document.createElement('div');
    contentContainer.style.width = '100%';

    // Helper to render grid
    const renderGrid = (items, currentItem, onSelect) => {
        const grid = document.createElement('div');
        grid.className = 'shop-grid';

        items.forEach(item => {
            const el = document.createElement('div');
            el.className = 'shop-item';
            if (currentItem.id === item.id) el.classList.add('active-item');

            // Preview
            const preview = document.createElement('div');
            preview.className = 'shop-item-preview';

            if (item.color) {
                preview.style.backgroundColor = `#${item.color.toString(16).padStart(6, '0')}`;
            } else {
                if (item.id === 'tophat') preview.innerText = '🎩';
                else if (item.id === 'glasses') preview.innerText = '🕶️';
                else if (item.id === 'eyepatch') preview.innerText = '🏴‍☠️';
                else if (item.id === 'flag') preview.innerText = '🚩';
                else if (item.id === 'crown') preview.innerText = '👑';
                else if (item.id === 'bowtie') preview.innerText = '🎀';
                else if (item.id === 'santa') preview.innerText = '🎅';
                else if (item.id === 'default') preview.innerText = '✨';
                else if (item.id === 'cloud') preview.innerText = '☁️';
                else if (item.id === 'fire') preview.innerText = '🔥';
                else if (item.id === 'plasma') preview.innerText = '⚡';
                else if (item.id === 'rainbow') preview.innerText = '🌈';
                else preview.innerText = '📦';
            }
            el.appendChild(preview);

            // Name
            const name = document.createElement('div');
            name.className = 'shop-item-name';
            name.innerText = item.name;
            el.appendChild(name);

            // Button
            const btn = document.createElement('button');
            btn.className = 'shop-item-btn';

            const costType = item.costType || 'pink';
            let userBalance = candies.pink;
            let currencySymbol = '🍭';

            if (costType === 'blue') { userBalance = candies.blue; currencySymbol = '🍬'; }
            else if (costType === 'pink') { userBalance = candies.pink; currencySymbol = '🍭'; }

            if (currentItem.id === item.id) {
                btn.innerText = "SEÇİLDİ";
                btn.classList.add('btn-selected');
                btn.disabled = true;
            } else if (userBalance >= item.cost) {
                btn.innerText = item.cost > 0 ? `${item.cost} ${currencySymbol}` : "ÜCRETSİZ";
                btn.classList.add('btn-buy');
                btn.onclick = () => {
                    // Confirmation Dialog
                    if (!confirm(`${item.name} ürününü ${item.cost} ${currencySymbol} karşılığında satın almak istiyor musunuz?`)) {
                        return;
                    }

                    // Purchase Logic
                    if (costType === 'blue') candies.blue -= item.cost;
                    else if (costType === 'pink') candies.pink -= item.cost; // Default logic covers costType='pink' or others mapped to pink

                    // coins logic removed

                    onSelect(item);
                    saveProgress();
                    openShop();
                };
            } else {
                btn.innerText = `${item.cost} ${currencySymbol}`;
                btn.classList.add('btn-locked');
                btn.disabled = true;
            }

            el.appendChild(btn);
            grid.appendChild(el);
        });
        return grid;
    };

    // 1. Colors Tab
    const colorsDiv = document.createElement('div');
    colorsDiv.id = 'tab-colors';
    colorsDiv.className = 'shop-tab-content active-content';
    colorsDiv.appendChild(renderGrid(availableColors, activeColor, (item) => {
        activeColor = item;
        localStorage.setItem('puppyr_color', item.id);
        createPlayer();
    }));
    contentContainer.appendChild(colorsDiv);

    // 1.5. Breeds Tab
    const breedsDiv = document.createElement('div');
    breedsDiv.id = 'tab-breeds';
    breedsDiv.className = 'shop-tab-content';
    breedsDiv.appendChild(renderGrid(availableBreeds, activeBreed, (item) => {
        activeBreed = item;
        localStorage.setItem('puppyr_breed', item.id);
        createPlayer();
    }));
    contentContainer.appendChild(breedsDiv);

    // 2. Ears Tab
    const earsDiv = document.createElement('div');
    earsDiv.id = 'tab-ears';
    earsDiv.className = 'shop-tab-content';
    earsDiv.appendChild(renderGrid(availableEarColors, activeEarColor, (item) => activeEarColor = item));
    contentContainer.appendChild(earsDiv);

    // 3. Accessories Tab
    const accessDiv = document.createElement('div');
    accessDiv.id = 'tab-accessories';
    accessDiv.className = 'shop-tab-content';
    accessDiv.appendChild(renderGrid(availableAccessories, activeAccessory, (item) => activeAccessory = item));
    contentContainer.appendChild(accessDiv);

    // 5. Trails Tab
    const trailDiv = document.createElement('div');
    trailDiv.id = 'tab-trails';
    trailDiv.className = 'shop-tab-content';
    trailDiv.appendChild(renderGrid(availableTrails, activeTrail, (item) => activeTrail = item));
    contentContainer.appendChild(trailDiv);

    container.appendChild(contentContainer);

    // Tab Switching Logic (Removed as new createTabBtn handles it)
    // window.switchTab = (tabId) => {
    //     document.querySelectorAll('.shop-tab-btn').forEach(b => {
    //         b.classList.toggle('active-tab', b.dataset.tab === tabId);
    //     });
    //     document.querySelectorAll('.shop-tab-content').forEach(c => {
    //         c.classList.remove('active-content');
    //     });
    //     document.getElementById(`tab-${tabId}`).classList.add('active-content');
    // };
}

// --- Level Selection ---
let currentWorldPage = 1;

function openLevelMenu() {
    mainMenu.classList.add('hidden');
    levelMenu.classList.remove('hidden');

    // Update Title
    const worldTitle = document.getElementById('world-title');
    if (worldTitle) {
        if (currentWorldPage === 1) worldTitle.innerText = "Dünya 1: Şeker Diyarı 🍬";
        else worldTitle.innerText = "Dünya 2: Neon Geceler 🌌";
    }

    const container = document.getElementById('level-grid');
    container.innerHTML = '';

    const firstLevelNum = (currentWorldPage - 1) * 20 + 1;
    const endLevelNum = currentWorldPage * 20;

    for (let i = firstLevelNum; i <= endLevelNum; i++) {
        const btn = document.createElement('button');
        // const isLocked = i > maxUnlockedLevel;
        const isLocked = false; // USER REQUEST: Unlock all levels for preview

        btn.className = isLocked ? 'level-btn locked' : 'level-btn unlocked';
        btn.style.cssText = `
            width: 60px; height: 60px; 
            border-radius: 10px; border: none; 
            display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 2px;
            font-size: 1.2rem; font-weight: bold; cursor: pointer;
            background: ${isLocked ? '#ccc' : (currentWorldPage === 2 ? '#3a0ca3' : '#4CAF50')};
            color: ${isLocked ? '#666' : 'white'};
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transition: transform 0.1s;
        `;

        btn.innerHTML = isLocked ? `🔒<br><span style="font-size:0.8rem">${i}</span>` : i;
        if (!isLocked) {
            btn.onmouseover = () => btn.style.transform = 'scale(1.1)';
            btn.onmouseout = () => btn.style.transform = 'scale(1)';
            btn.onclick = () => startLevel(i);
        } else {
            btn.style.cursor = 'not-allowed';
        }

        container.appendChild(btn);
    }

    // Update Init DOM elements called here if not already cached
    // Quick Fix: Re-attach listeners for new buttons if necessary or ensure they are static
    // Since buttons are static in HTML now, we just attach listeners in init() 
}

function prevWorld() {
    if (currentWorldPage > 1) {
        currentWorldPage--;
        openLevelMenu();
    }
}

function nextWorld() {
    // Assuming max world is 2
    if (currentWorldPage < 2) {
        currentWorldPage++;
        openLevelMenu();
    }
}

function startLevel(selectedLevel) {
    level = selectedLevel;
    levelMenu.classList.add('hidden');
    mainMenu.classList.add('hidden');

    // Reset for new game
    speed = 30 + ((level - 1) * 2);
    levelDistance = 50 + (level * 25);
    currentDistance = 0;
    score = 0;

    applyTheme(level);

    gameActive = true;
    gamePaused = false;

    if (hud) hud.classList.remove('hidden');
    createPlayer();
    clearGameObjects();
    finishLineSpawned = false; // Reset finish line flag
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    updateCameraPosition();
}

function updateCameraPosition() {
    const aspect = window.innerWidth / window.innerHeight;
    if (aspect < 1) {
        // Portrait (Mobile) - Pull back to see side lanes
        camera.position.z = 12;
        camera.position.y = 5;
    } else {
        // Landscape (Desktop) - Standard view
        camera.position.z = 8;
        camera.position.y = 4;
    }
}

function updateUI() {
    scoreDisplay.innerText = `Level: ${level}`;
    // coinsDisplay removed
    if (distanceDisplay) distanceDisplay.innerText = Math.floor(currentDistance);
    if (levelTargetDisplay) levelTargetDisplay.innerText = levelDistance;

    if (window.candyPinkDisplay) window.candyPinkDisplay.innerText = candies.pink;
    if (window.candyBlueDisplay) window.candyBlueDisplay.innerText = candies.blue;
    // Gold removed
}

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (gameActive && !gamePaused) {
        updatePhysics(delta);
        updateEffects(delta);

        // Camera Follow Logic (Smooth X-axis)
        if (player) {
            const targetCamX = player.position.x * 0.5; // Follow 50% of player movement
            camera.position.x += (targetCamX - camera.position.x) * delta * 5;
            camera.lookAt(0, 0, -5); // Keep looking forward
        }
    }
    renderer.render(scene, camera);
}

// --- Effects System ---
let particles = [];
let trailTimer = 0;

function createLandingEffect(x, z) {
    const particleCount = 10;
    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });

    for (let i = 0; i < particleCount; i++) {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, 0.1, z);

        // Random velocity
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        mesh.userData = {
            velocity: new THREE.Vector3(Math.cos(angle) * speed, Math.random() * 3, Math.sin(angle) * speed),
            life: 1.0
        };

        scene.add(mesh);
        particles.push(mesh);
    }
}

function createTrailParticle(x, y, z) {
    const geometry = new THREE.BoxGeometry(0.25, 0.25, 0.25);

    // Color Logic
    let color = activeTrail.color;
    if (activeTrail.id === 'default') {
        color = activeColor.color;
    } else if (activeTrail.id === 'rainbow') {
        color = new THREE.Color().setHSL(Math.random(), 1.0, 0.5);
    }

    // If color is not an object (like hex), make it one if needed, or Three.js handles hex fine

    const material = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.9 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);

    // Slight random drift
    mesh.userData = {
        velocity: new THREE.Vector3((Math.random() - 0.5) * 0.2, 0, (Math.random() - 0.5) * 0.2), // Increased drift
        life: 1.0 // Increased life
    };

    scene.add(mesh);
    particles.push(mesh);
}

function updateEffects(delta) {
    // Ghost Mode Logic
    if (isGhost) {
        ghostTimer -= delta;
        if (ghostTimer <= 0) {
            isGhost = false;
            if (player) {
                player.traverse((child) => {
                    if (child.isMesh) {
                        child.material.transparent = false;
                        child.material.opacity = 1.0;
                    }
                });
            }
        } else {
            // Blink effect
            if (player) {
                const opacity = (Math.floor(Date.now() / 100) % 2 === 0) ? 0.2 : 1.0;
                player.traverse((child) => {
                    if (child.isMesh) {
                        child.material.transparent = true;
                        child.material.opacity = opacity;
                    }
                });
            }
        }
    }

    // 1. Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.userData.life -= delta;

        // Move with world speed (simulating drag)
        const moveSpeed = speed * delta;
        p.position.z += moveSpeed; // Move "backwards" effectively staying with ground

        p.position.add(p.userData.velocity);
        p.rotation.x += delta;
        p.rotation.y += delta;

        // Fade out
        if (p.material && p.material.opacity !== undefined) p.material.opacity = p.userData.life;

        if (p.userData.life <= 0) {
            scene.remove(p);
            particles.splice(i, 1);
        }
    }

    // 2. Spawn Trail
    if (gameActive && !gamePaused && !isGhost && player) {
        trailTimer += delta;
        if (trailTimer > 0.025) { // Spawn every 0.025s (More frequent)
            trailTimer = 0;
            createTrailParticle(player.position.x, player.position.y + 0.2, player.position.z + 0.5);
        }
    }
}







// Start Game
init();
