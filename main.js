import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import gsap from 'gsap';

// ─── GOOGLE CLOUD RUN API ───────────────────────────────────────
// Cloud Run 배포 후 아래 URL을 실제 서비스 URL로 교체하세요
// 예: https://gxcube-api-xxxxxxxx-an.a.run.app
const API_URL = window.GX_API_URL || 'https://gxcube-api-327271214021.asia-northeast3.run.app';
// ────────────────────────────────────────────────────────────────


console.log("🛠️ GANGNAM X CUBE System Loading... v1.50 (Cloud Powered)");
window.addEventListener('error', (e) => {
    console.error("❌ Global Script Error:", e.message, "at", e.filename, ":", e.lineno);
});

// Configuration
const CONFIG = {
    models: {
        total: 'BMM (전체).gltf',
        A: 'BMM (B관 메인홀).gltf',
        B: 'BMM (A관 리셉션).gltf',
        C: 'BMM (C관 스튜디오).gltf'
    },
    camera: {
        iso: { pos: { x: -40, y: 45, z: 45 }, target: { x: 0, y: 0, z: 0 } },
        A: { 
            pos: { x: 25, y: 30, z: 25 }, target: { x: 0, y: 0, z: 0 },
            fpv: { pos: { x: 0, y: 1.6, z: 22 }, target: { x: 0, y: 1.6, z: -10 } }
        },
        B: { 
            pos: { x: -20, y: 25, z: 25 }, target: { x: 0, y: 0, z: 0 },
            fpv: { pos: { x: 0, y: 1.6, z: 18 }, target: { x: 0, y: 1.6, z: -10 } }
        },
        C: { 
            pos: { x: 20, y: 20, z: 20 }, target: { x: 0, y: 0, z: 0 },
            fpv: { pos: { x: 0, y: 1.6, z: 18 }, target: { x: 0, y: 1.6, z: -10 } }
        },
        total: {
            fpv: { pos: { x: 0, y: 1.6, z: 35 }, target: { x: 0, y: 1.6, z: -10 } }
        }
    }
};

// Configuration
window.DEFAULT_CONTENT = {
    halls: {
        A: {
            title: 'Grand Hall (A)',
            desc: '5m 이상의 높은 층고와 기둥 없는 광활한 공간을 자랑하는 메인 홀입니다. 대형 컨퍼런스, 패션쇼 등에 완벽한 캔버스가 되어줍니다.',
            area: '284㎡ (86평)', cap: '250명', height: '5.0m',
            img: 'main_grandhall.jpg?v=2'
        },
        B: {
            title: 'Reception Hall (B)',
            desc: '우아한 채광과 미니멀한 디자인이 조화로운 리셉션 전용 공간입니다. 브랜드 팝업, 웰컴 리셉션 등에 최적화되어 있습니다.',
            area: '205㎡ (62평)', cap: '100명', height: '3.5m',
            img: 'main_reception.jpg?v=2'
        },
        C: {
            title: 'Studio Hall (C)',
            desc: '창의적인 영감을 자극하는 아늑하고 집중도 높은 공간입니다. 워크숍, 미디어 아트, 소규모 영상 촬영 등을 전문적으로 지원합니다.',
            area: '280㎡ (85평)', cap: '150명', height: '3.2m',
            img: 'main_studio.jpg?v=4'
        }
    },
    resources: [
        { id: 1, title: '2026 대관 가이드 (PDF)', desc: '시설 이용 규칙 및 단가표 포함', url: 'Rental_Guide_2026.pdf', icon: '📄' },
        { id: 2, title: '공간 도면 자료 (PDF)', desc: '각 홀별 평면도 및 상세 치수 도면', url: 'Floorplan_Total.pdf', icon: '📐' },
        { id: 3, title: '공간 스케치업 파일 (SKP)', desc: '3D 공간 시뮬레이션용 원본 파일', url: 'BMM_Space_SketchUp.skp', icon: '📦' }
    ],
    gallery: ['event_1.jpg', 'event_2.jpg', 'event_3.jpg', 'event_4.jpg', 'event_5.jpg'],
    notices: [
        { id: 1, title: '2026 하반기 대관 일정 안내', date: '2026-01-15', content: '2026년 하반기 대관 신청은 2월 1일부터 접수 시작합니다.', urgent: true },
        { id: 2, title: '전시장 조명 시설 보수 작업 공지', date: '2026-03-20', content: '4월 첫째 주 리셉션 홀 조명 보수 작업으로 대관이 제한됩니다.', urgent: false }
    ],
    contact: {
        address: '서울특별시 서초구 서초대로 397 부티크 모나코 (B1 뮤지엄)',
        addressEn: 'B1 Museum, Boutique Monaco, 397, Seocho-daero, Seocho-gu, Seoul, Korea',
        phone: '02.344.5042',
        email: 'info@planningkorea.com',
        partnership: 'info@planningkorea.com',
        hours: 'Weekdays / 09:30 AM ~ 05:00 PM\nWeekends & Holidays / Closed'
    },
    siteInfo: {
        heroTitle: 'GANGNAM X CUBE',
        heroSub: 'HIGH-END EVENT VENUE',
        introMain: '강남 중심가 336평 대형 대관, GANGNAM X CUBE는\n기업 행사와 산업 전시에 특화된 하이엔드 이벤트 베뉴입니다.',
        introSub: '부띠크모나코의 미학적 건축물이 주는 상징성과 넓은 오픈 플랜 구조는 컨퍼런스, 브랜드 런칭, 아트 페어 등 대규모 이벤트 기획에 최적화된 환경을 제공합니다.\n독보적인 규모와 압도적 접근성을 갖춘 공간에서 귀사의 비즈니스 이벤트를 성공적으로 개최하십시오.'
    },
    heroImg: 'main_grandhall.jpg'
};

// Global Variables
let scene, camera, renderer, controls, loader;
let currentModel = null;
let viewMode = 'iso';
let simulationActive = false;
let selectedFurnitureType = null;
const placedObjects = [];
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const keys = { w: false, a: false, s: false, d: false };

/**
 * Initialize Three.js Engine
 */
function init() {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(CONFIG.camera.iso.pos.x, CONFIG.camera.iso.pos.y, CONFIG.camera.iso.pos.z);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true;
    controls.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };
    
    // Safety Constraints
    controls.minDistance = 5;       // Prevent going inside walls
    controls.maxDistance = 150;     // Prevent getting lost in distance
    controls.maxPolarAngle = Math.PI / 2.05; // Prevent going below floor

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loadHall('total');
    const totalBtn = document.getElementById('btn-total');
    if (totalBtn) totalBtn.classList.add('active');
    
    window.addEventListener('resize', onWindowResize);
    animate();
}

function loadHall(hallId) {
    if (currentModel) scene.remove(currentModel);
    loader.load(CONFIG.models[hallId] + '?v=' + Date.now(), (gltf) => {
        currentModel = gltf.scene;
        const box = new THREE.Box3().setFromObject(currentModel);
        const center = box.getCenter(new THREE.Vector3());
        currentModel.position.x = -center.x;
        currentModel.position.y = -box.min.y;
        currentModel.position.z = -center.z;
        scene.add(currentModel);
        
        const isTotal = hallId === 'total';
        const camData = CONFIG.camera[isTotal ? 'iso' : hallId];
        
        // Fix Top View for Total
        if (isTotal) {
            controls.minPolarAngle = 0;
            controls.maxPolarAngle = 0.1; // Strict top-down
        } else {
            controls.minPolarAngle = 0;
            controls.maxPolarAngle = Math.PI / 2.2; // Natural angle
        }
        
        tweenCamera(camData.pos, camData.target);
    });
}

function tweenCamera(pos, target, onComplete) {
    gsap.to(camera.position, { x: pos.x, y: pos.y, z: pos.z, duration: 1.5, ease: "power2.inOut" });
    gsap.to(controls.target, { 
        x: target.x, y: target.y, z: target.z, duration: 1.5, ease: "power2.inOut",
        onComplete: onComplete 
    });
}

function onWindowResize() {
    const container = document.getElementById('canvas-container');
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    if (viewMode === 'fpv') {
        const speed = 0.15;
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        
        // Move horizontal only
        const moveDir = dir.clone();
        moveDir.y = 0;
        moveDir.normalize();

        const side = new THREE.Vector3().crossVectors(camera.up, moveDir).normalize();
        
        if (keys.w || keys.s || keys.a || keys.d) {
            controls.enabled = false; // TEMPORARILY DISABLE TO PREVENT FIGHTING
            if (keys.w) { camera.position.addScaledVector(moveDir, speed); controls.target.addScaledVector(moveDir, speed); }
            if (keys.s) { camera.position.addScaledVector(moveDir, -speed); controls.target.addScaledVector(moveDir, -speed); }
            if (keys.a) { camera.position.addScaledVector(side, speed); controls.target.addScaledVector(side, speed); }
            if (keys.d) { camera.position.addScaledVector(side, -speed); controls.target.addScaledVector(side, -speed); }
        } else {
            controls.enabled = true; // RE-ENABLE WHEN NOT MOVING
        }
    } else {
        controls.enabled = true; // ALWAYS ENABLE IN ISO
    }

    if (controls) controls.update();
    if (renderer && scene && camera) renderer.render(scene, camera);
}

function switchViewMode(mode) {
    viewMode = mode;
    document.querySelectorAll('.side-menu.left .menu-btn').forEach(b => b.classList.remove('active'));
    
    // Get current hall configuration
    const activeHallBtn = document.querySelector('.side-menu.right .menu-btn.active');
    const hallId = activeHallBtn ? activeHallBtn.innerText : 'total';
    const configKey = hallId === 'ALL' ? 'total' : hallId;
    const camConfig = CONFIG.camera[configKey];

    if (mode === 'iso') {
        document.getElementById('btn-iso').classList.add('active');
        const isTotal = configKey === 'total';
        controls.enablePan = true;
        controls.enableZoom = true; // RE-ENABLE ZOOM
        controls.minPolarAngle = 0;
        controls.maxPolarAngle = isTotal ? 0.1 : Math.PI / 2.2;
        controls.minDistance = 5;
        controls.maxDistance = 300; // Allow more room
        
        const cam = camConfig.pos ? camConfig : CONFIG.camera.iso;
        tweenCamera(cam.pos, cam.target);
    } else {
        document.getElementById('btn-fpv').classList.add('active');
        controls.enablePan = true;
        controls.enableZoom = false; // ZOOM IS FOR ISO ONLY
        controls.maxPolarAngle = Math.PI; 
        
        controls.minDistance = 0;
        controls.maxDistance = 1000;

        const fpv = camConfig.fpv || CONFIG.camera.total.fpv;
        tweenCamera(fpv.pos, fpv.target, () => {
            if (viewMode === 'fpv') {
                controls.minDistance = 0.01;
                controls.maxDistance = 0.01;
            }
        });
    }
}

// Global Nav Helper
window.hallNav = (id) => {
    loadHall(id);
    document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById(`btn-hall-${id.toLowerCase()}`);
    if (btn) btn.classList.add('active');
};

/**
 * Common Logic for App
 */
window.resolveImageUrl = (url) => {
    if (!url) return url;
    if (url.startsWith('local_')) {
        try {
            const localImages = JSON.parse(localStorage.getItem('bmm_local_images') || '{}');
            return localImages[url] || 'https://placehold.co/600x400?text=Image+Not+Found';
        } catch(e) { return url; }
    }
    // Admin 페이지(/admin/ 하위)에서 상대경로 이미지는 '../'를 붙여 루트 참조
    const isAdminPage = window.location.pathname.includes('/admin/');
    const isRelativePath = !url.startsWith('http') && !url.startsWith('data:') && !url.startsWith('/') && !url.startsWith('../');
    if (isAdminPage && isRelativePath) {
        return '../' + url;
    }
    return url;
};

async function loadSiteContent() {
    // Firestore REST API 로드 (Cloud Run 경유)
    let saved = {};
    try {
        const res = await fetch(`${API_URL}/content`);
        if (res.ok) {
            saved = await res.json();
            // 캐시: localStorage 동기화
            localStorage.setItem('siteContent_v3', JSON.stringify(saved));
            console.log('📡 Cloud 콘텐츠 로드 완료');
        }
    } catch (e) {
        console.warn('⚠️ Cloud 연결 실패, localStorage 사용:', e.message);
        saved = JSON.parse(localStorage.getItem('siteContent_v3') || '{}');
    }
    const hasSavedData = Object.keys(saved).length > 0;
    const content = hasSavedData ? { ...DEFAULT_CONTENT, ...saved } : { ...DEFAULT_CONTENT };
    
    // Deep merge only when saved data exists but might be missing sub-fields
    if (hasSavedData) {
        content.halls = saved.halls ? { ...DEFAULT_CONTENT.halls, ...saved.halls } : (saved.halls !== undefined ? saved.halls : DEFAULT_CONTENT.halls);
        content.siteInfo = saved.siteInfo ? { ...DEFAULT_CONTENT.siteInfo, ...saved.siteInfo } : (saved.siteInfo !== undefined ? saved.siteInfo : DEFAULT_CONTENT.siteInfo);
        content.contact = saved.contact ? { ...DEFAULT_CONTENT.contact, ...saved.contact } : (saved.contact !== undefined ? saved.contact : DEFAULT_CONTENT.contact);
        // Respect empty notices - don't force defaults if admin cleared them
        if (saved.notices !== undefined) content.notices = saved.notices;
    }
    
    // Hall Specs
    if (content.halls) {
        for (const id in content.halls) {
            const h = content.halls[id];
            const lowId = id.toLowerCase();
            // Hall Specs (General)
            const tEl = document.getElementById(`hall-${lowId}-title`);
            if (tEl) tEl.innerText = h.title;
            const dEl = document.getElementById(`hall-${lowId}-desc`);
            if (dEl) dEl.innerText = h.desc;
            const sEl = document.getElementById(`hall-${lowId}-spec-list`);
            if (sEl) sEl.innerHTML = `<li>면적: ${h.area} / 수용: ${h.cap} / 층고: ${h.height}</li>`;
            
            // Table Specs (Summary Table)
            const tn = document.getElementById(`spec-${lowId}-name`);
            if (tn) tn.innerText = h.title;
            const ta = document.getElementById(`spec-${lowId}-area`);
            if (ta) ta.innerText = h.area;
            const tc = document.getElementById(`spec-${lowId}-cap`);
            if (tc) tc.innerText = h.cap;
            const th = document.getElementById(`spec-${lowId}-height`);
            if (th) th.innerText = h.height;

            // Rental Page Cards
            const rcImg = document.getElementById(`hall-${lowId}-preview-img`);
            if (rcImg && h.img) rcImg.src = window.resolveImageUrl(h.img);
            const rcTitle = document.getElementById(`hall-${lowId}-card-title`);
            if (rcTitle) rcTitle.innerText = h.title;
            const rcArea = document.getElementById(`hall-${lowId}-card-area`);
            if (rcArea) rcArea.innerText = h.area;
            
            const rcCap = document.getElementById(`hall-${lowId}-card-cap`);
            if (rcCap) rcCap.innerText = h.cap;
            const rcHeight = document.getElementById(`hall-${lowId}-card-height`);
            if (rcHeight) rcHeight.innerText = h.height;
        }
    }

    // Render Resources for Rental Page
    const resList = document.getElementById('rental-resource-list');
    if (resList) {
        const resources = content.resources || DEFAULT_CONTENT.resources;
        resList.innerHTML = resources.map(r => `
            <div class="resource-card" onclick="window.open('${r.url}')">
                <div style="font-size: 2.5rem; margin-bottom: 15px;">${r.icon || '📄'}</div>
                <h4 style="margin-bottom: 10px; font-size: 0.95rem;">${r.title}</h4>
                <p style="font-size: 0.75rem; color: #888;">${r.desc}</p>
            </div>
        `).join('');
    }

    // Site Info (Home Page)
    const si = content.siteInfo || DEFAULT_CONTENT.siteInfo;
    const siEls = {
        'hero-title': si.heroTitle,
        'hero-subtitle': si.heroSub,
        'intro-main': si.introMain,
        'intro-sub': si.introSub
    };
    for (const id in siEls) {
        const el = document.getElementById(id);
        if (el) {
            if (id === 'intro-main' || id === 'intro-sub') {
                el.innerHTML = siEls[id].replace(/\n/g, '<br>');
            } else {
                el.innerText = siEls[id];
            }
        }
    }

    // Gallery & Notices (Consolidated)
    try {
        const gallery = document.getElementById('space-gallery');
        if (gallery && content.gallery) {
            gallery.innerHTML = content.gallery.map(img => `
                <div class="gallery-item-pill" data-src="${window.resolveImageUrl(img)}">
                    <img src="${window.resolveImageUrl(img)}" alt="Gallery" onerror="this.src='https://placehold.co/600x400?text=No+Image'">
                    <div class="item-hover-overlay"><span>VIEW</span></div>
                </div>
            `).join('');
        }
        
        const noticeList = document.getElementById('main-notice-list');
        if (noticeList && content.notices) {
            noticeList.innerHTML = content.notices.map(n => `
                <div class="notice-item ${n.urgent ? 'urgent' : ''}">
                    <span class="notice-date">${n.date}</span>
                    <h4 class="notice-title">${n.title}</h4>
                </div>
            `).join('');
        }
    } catch (e) { console.error("Final render block error:", e); }
}

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 BMM System Restored");
    
    try {
        loadSiteContent();
    } catch(e) { console.error("Content load failed", e); }
    
    if (document.getElementById('canvas-container')) {
        console.log("🌐 Initializing 3D Canvas...");
        try { init(); } catch(e) { console.error("3D Init failed", e); }
    }
    
    const toggle = document.getElementById('mobile-menu-toggle');
    if (toggle) toggle.onclick = () => document.getElementById('mobile-nav').classList.add('active');

    const closeNav = document.getElementById('btn-close-mobile-nav');
    if (closeNav) closeNav.onclick = () => document.getElementById('mobile-nav').classList.remove('active');

    // View Mode Controls
    const btnIso = document.getElementById('btn-iso');
    const btnFpv = document.getElementById('btn-fpv');
    
    if (btnIso) btnIso.onclick = () => switchViewMode('iso');
    if (btnFpv) btnFpv.onclick = () => switchViewMode('fpv');

    window.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (keys.hasOwnProperty(key)) keys[key] = true;
    });
    window.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        if (keys.hasOwnProperty(key)) keys[key] = false;
    });

    // Page Specific Initializations
    try {
        if (document.getElementById('rental-period')) {
            console.log("📅 Initializing Rental Page...");
            initRentalPage();
        }
        if (document.getElementById('inquiry-list-body')) initAdminDashboard();
        if (document.getElementById('public-notice-list')) renderNotices();
        if (document.getElementById('admin-login-form')) initAdminLogin();
    } catch(e) { console.error("Page init failed", e); }

    // View Mode Controls Extensions
    const btnFullscreen = document.getElementById('btn-fullscreen');

    if (btnIso) btnIso.onclick = () => switchViewMode('iso');
    if (btnFpv) btnFpv.onclick = () => switchViewMode('fpv');
    if (btnFullscreen) {
        btnFullscreen.onclick = () => {
            const container = document.getElementById('canvas-container');
            if (!document.fullscreenElement) {
                container.requestFullscreen().catch(err => {
                    console.error("Fullscreen error", err);
                });
            } else {
                document.exitFullscreen();
            }
        };
    }

    // Initialize Admin Dashboard if on the actual management page (not login)
    const isLoginPage = location.pathname.includes('login.html');
    const isAdminPage = !!document.getElementById('admin-header-title');
    
    if (isAdminPage && !isLoginPage) {
        console.log("🛠️ Admin Page Detected. Initializing Dashboard...");
        initAdminDashboard();
    }

    // Force fade-in loaded state
    document.body.classList.add('loaded');
    renderContactInfo();
    renderNotices();
});

/**
 * Rental & Admin Logic Integration
 */
function initRentalPage() {
    const periodInput = document.getElementById('rental-period');
    if (!periodInput) return;

    // Retry if flatpickr not loaded yet
    if (typeof window.flatpickr === 'undefined') {
        setTimeout(initRentalPage, 300);
        return;
    }

    try {
        const fpConfig = { 
            inline: true, 
            mode: 'range', 
            dateFormat: 'Y-m-d', 
            onChange: (dates) => {
                if (dates.length === 2) {
                    const startAt = window.flatpickr.formatDate(dates[0], 'Y-m-d');
                    const endAt = window.flatpickr.formatDate(dates[1], 'Y-m-d');
                    periodInput.value = startAt + ' ~ ' + endAt;
                }
            }
        };
        ['a','b','c'].forEach(id => {
            const el = document.getElementById('inline-cal-' + id);
            if (el) window.flatpickr(el, fpConfig);
        });
    } catch(e) {
        console.error("Calendar Init failed", e);
    }

    // Sync Top Input
    const topPeriod = document.getElementById('rental-period-top');
    if (topPeriod) {
        window.flatpickr(topPeriod, {
            ...fpConfig,
            onChange: (selectedDates, dateStr) => {
                periodInput.value = dateStr;
            }
        });
    }

    const submitBtn = document.getElementById('btn-submit-inquiry');
    if (submitBtn) {
        submitBtn.onclick = () => {
            const halls = Array.from(document.querySelectorAll('.hall-cb:checked')).map(cb => cb.value);
            const category = document.getElementById('rental-category').value;
            if (halls.length === 0 || !periodInput.value || periodInput.value.includes('날짜') || !category) {
                alert('공간, 행사 성격, 날짜를 모두 선택해 주세요.');
                return;
            }
            localStorage.setItem('inquiryData', JSON.stringify({ halls, period: periodInput.value, category }));
            location.href = 'inquiry_form.html';
        };
    }
}

function initAdminDashboard() {
    console.log("Admin Dashboard Logic Active");
    
    // Simple Session Check
    if (!sessionStorage.getItem('adminLoggedIn')) {
        location.href = 'login.html';
        return;
    }

    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const target = item.getAttribute('data-tab');
            
            // 1. UI Update: Sidebar & Tabs
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            tabContents.forEach(content => {
                content.style.display = content.id === `tab-${target}` ? 'block' : 'none';
                // Also ensure the "active" class is toggled for CSS animations
                if (content.id === `tab-${target}`) content.classList.add('active');
                else content.classList.remove('active');
            });

            // 2. Header Update
            const headerTitle = document.getElementById('admin-header-title');
            const headerBread = document.getElementById('admin-header-breadcrumb');
            const titles = {
                inquiry: ['통합 문의 관리', '매니지먼트 / 대관 문의'],
                content: ['웹 콘텐츠 관리 (CMS)', 'CMS / 사이트 편집'],
                notice: ['공지사항 관리', '커뮤니케이션 / 알림'],
                status: ['공간 현황 및 일정', '운영 / 캘린더'],
                stats: ['데이터 통계 분석', '매니지먼트 / 인사이트'],
                settings: ['시스템 설정', '관리 / 설정']
            };

            if (titles[target] && headerTitle && headerBread) {
                headerTitle.innerHTML = `${titles[target][0]} <span style="font-size: 0.6rem; opacity: 0.3;">v1.42</span>`;
                headerBread.innerText = titles[target][1];
            }

            // 3. Data Initialization for each tab
            if (target === 'inquiry') window.renderInquiryList();
            if (target === 'content') window.initCMS(); 
            if (target === 'notice') window.initAdminNotices();
            if (target === 'status') window.initSpaceStatus();
            if (target === 'estimate') { if(typeof initEstimateManager === 'function') initEstimateManager(); }
            if (target === 'stats') window.initAdminStats();
            if (target === 'settings') window.initAdminSettingsAccounts();
        });
    });

    // Default view: Inquiry
    window.renderInquiryList();

    // Logout Helper

    const logoutBtn = document.getElementById('btn-admin-logout');
    if (logoutBtn) logoutBtn.onclick = () => { sessionStorage.removeItem('adminLoggedIn'); location.href = 'login.html'; };

    // Data Export/Import Logic
    const exportBtn = document.getElementById('btn-export-data');
    if (exportBtn) {
        exportBtn.onclick = () => {
            const data = {
                inquiryList: JSON.parse(localStorage.getItem('inquiryList') || '[]'),
                siteContent: JSON.parse(localStorage.getItem('siteContent_v3') || '{}'),
                timestamp: new Date().toISOString()
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `BMM_Data_Backup_${new Date().toLocaleDateString().replace(/\./g, '')}.json`;
            a.click();
            URL.revokeObjectURL(url);
        };
    }

    const exportExcelBtn = document.getElementById('btn-export-excel');
    if (exportExcelBtn) {
        exportExcelBtn.onclick = () => {
            const list = window.currentInquiryList || [];
            if (list.length === 0) {
                alert('추출할 데이터가 없습니다.');
                return;
            }
            let csvContent = "\uFEFF상태,구분,문의자,업체,연락처,이메일,공간,희망 일정,첨부\n";
            list.forEach(item => {
                const row = [
                    item.status === 'confirmed' ? '확정' : '대기',
                    item.category || '기타',
                    item.name || '무명',
                    item.company || '-',
                    item.phone || '-',
                    item.email || '-',
                    (item.halls || []).join(' '),
                    item.period || '-',
                    item.attachedFiles && item.attachedFiles.length > 0 ? item.attachedFiles[0] : '-'
                ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
                csvContent += row + "\n";
            });
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `대관문의내역_${new Date().toLocaleDateString().replace(/\./g, '')}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        };
    }

    window.resetCMSData = function() {
        if(confirm('모든 CMS 설정을 기본값으로 되돌리시겠습니까? 저장된 내용은 사라집니다.')) {
            localStorage.removeItem('siteContent_v3');
            location.reload();
        }
    };

    const importTrigger = document.getElementById('btn-import-trigger');
    const importFile = document.getElementById('file-import-data');
    if (importTrigger && importFile) {
        importTrigger.onclick = () => importFile.click();
        importFile.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (data.inquiryList) localStorage.setItem('inquiryList', JSON.stringify(data.inquiryList));
                    if (data.siteContent) localStorage.setItem('siteContent_v3', JSON.stringify(data.siteContent));
                    alert('데이터 복구가 완료되었습니다. 페이지를 새로고침합니다.');
                    location.reload();
                } catch (err) {
                    alert('잘못된 파일 형식입니다.');
                }
            };
            reader.readAsText(file);
        };
    }
}

window.renderInquiryList = function() {
    const body = document.getElementById('inquiry-list-body');
    if (!body) return;

    const renderData = (list) => {
        body.innerHTML = list.length ? list.map((item) => `
            <tr>
                <td><span class="status-chip ${item.status || 'pending'}">${item.status === 'confirmed' ? '확정' : '대기'}</span></td>
                <td><strong>${item.category || '기타'}</strong></td>
                <td><strong>${item.name || '무명'}</strong><br><small style="opacity:0.5;">${item.company || '-'}</small></td>
                <td>${item.phone || '-'}<br><small style="opacity:0.5;">${item.email || '-'}</small></td>
                <td>${(item.halls || []).join(', ')}</td>
                <td>${item.period || '-'}</td>
                <td>${item.attachedFiles && item.attachedFiles.length > 0 ? item.attachedFiles[0] : '-'}</td>
                <td><button class="edit-btn" onclick="window.showInquiryDetail('${item.id}')">상세/견적</button></td>
            </tr>
        `).join('') : '<tr><td colspan="8" class="empty-state" style="text-align:center; padding:30px;">내역이 없습니다.</td></tr>';

        const total = document.getElementById('stat-total-inquires');
        if (total) total.innerText = list.length;
        const pendingCount = document.getElementById('stat-pending-inquires');
        if (pendingCount) pendingCount.innerText = list.filter(i => i.status !== 'confirmed').length;
        const confirmedCount = document.getElementById('stat-confirmed-inquires');
        if (confirmedCount) confirmedCount.innerText = list.filter(i => i.status === 'confirmed').length;
        window.currentInquiryList = list;
    };

    // Cloud Run REST API로 문의 목록 조회
    fetch(`${API_URL}/inquiries`)
        .then(r => r.json())
        .then(list => renderData(list))
        .catch(err => {
            console.warn('Cloud 조회 실패, localStorage 사용:', err.message);
            renderData(JSON.parse(localStorage.getItem('inquiryList') || '[]'));
        });
}



function initEstimateManager() {
    // Use already-loaded inquiry data from renderInquiryList, fallback to localStorage
    const list = window.currentInquiryList || JSON.parse(localStorage.getItem('inquiryList') || '[]');
    const selector = document.getElementById('est-inquiry-selector');
    const editBody = document.getElementById('est-edit-body');
    const totalEl = document.getElementById('est-edit-total');

    if (!selector || !editBody) return;

    // Fill Selector
    selector.innerHTML = '<option value="">문의 내역 선택 (선택 시 자동 완성)</option>' + 
        list.map((inq, idx) => `<option value="${idx}">${inq.name} (${inq.company || '-'}) - ${inq.category}</option>`).join('');

    selector.onchange = (e) => {
        const inq = list[e.target.value];
        if (!inq) return;

        // Remove '귀하' if it exists in the data to avoid double '귀하' in the template
        const cleanName = inq.name.replace(/ 귀하/g, '');
        const cleanCompany = (inq.company || '').replace(/ 귀하/g, '');
        
        document.getElementById('est-input-receiver').value = cleanCompany || cleanName;
        document.getElementById('est-input-date').value = new Date().toISOString().split('T')[0];

        // Clear and Add Initial Rows
        editBody.innerHTML = '';
        const rates = { 'Reception Hall': 3500000, 'Grand Main Hall': 8500000, 'Private Studio': 2500000 };
        (inq.halls || []).forEach(h => {
            const rate = rates[h] || 5000000;
            addEstimateRow(`[대관] ${h}`, 1, '일', rate);
        });
        updateEstimateTotal();
    };

    document.getElementById('btn-est-add-row').onclick = () => addEstimateRow('', 1, '일', 0);

    document.getElementById('btn-est-preview').onclick = () => {
        const receiver = document.getElementById('est-input-receiver').value;
        const date = document.getElementById('est-input-date').value;
        
        const modal = document.getElementById('estimate-modal');
        document.getElementById('est-receiver').innerText = receiver;
        document.getElementById('est-date').innerText = date.replace(/-/g, '. ');

        let subtotal = 0;
        let html = '';
        const rows = editBody.querySelectorAll('tr');
        rows.forEach(row => {
            const name = row.querySelector('.est-item-name').value;
            const qty = parseInt(row.querySelector('.est-item-qty').value) || 0;
            const unit = row.querySelector('.est-item-unit').value;
            const price = parseInt(row.querySelector('.est-item-price').value) || 0;
            const amount = qty * price;
            subtotal += amount;
            html += `
                <div class="est-item-row">
                    <div style="display:flex; flex-direction:column;">
                        <span class="est-item-label">${name}</span>
                        <span style="font-size:0.8rem; color:#999; margin-top:5px;">${qty} ${unit} &times; ￦${price.toLocaleString()}</span>
                    </div>
                    <span class="est-item-val">￦${amount.toLocaleString()}</span>
                </div>
            `;
        });

        const tax = Math.floor(subtotal * 0.1);
        const total = subtotal + tax;

        document.getElementById('est-items-body').innerHTML = html;
        document.getElementById('est-subtotal').innerText = `￦${subtotal.toLocaleString()}`;
        document.getElementById('est-tax').innerText = `￦${tax.toLocaleString()}`;
        document.getElementById('est-total-top').innerText = total.toLocaleString();
        document.getElementById('est-total-korean').innerText = numberToKorean(total);

        modal.style.display = 'block';
    };

    function addEstimateRow(name = '', qty = 1, unit = '일', price = 0) {
        const tr = document.createElement('tr');
        const inputStyle = 'width:100%; padding:8px; border:1px solid #eee; border-radius:3px; outline:none; transition:all 0.2s; background:#fdfdfd;';
        tr.innerHTML = `
            <td><input type="text" class="est-item-name" value="${name}" placeholder="항목명" style="${inputStyle}"></td>
            <td><input type="number" class="est-item-qty" value="${qty}" style="${inputStyle} text-align:center;"></td>
            <td><input type="text" class="est-item-unit" value="${unit}" placeholder="단위" style="${inputStyle} text-align:center;"></td>
            <td><input type="number" class="est-item-price" value="${price}" style="${inputStyle} text-align:right;"></td>
            <td class="est-item-amount" style="text-align:right; font-weight:600; padding-right:15px;">${(qty * price).toLocaleString()}</td>
            <td><button class="delete-row" style="background:none; border:none; color:#ff4444; cursor:pointer; font-size:1.2rem;">&times;</button></td>
        `;
        
        const updateRowAmount = () => {
            const q = parseInt(tr.querySelector('.est-item-qty').value) || 0;
            const p = parseInt(tr.querySelector('.est-item-price').value) || 0;
            tr.querySelector('.est-item-amount').innerText = (q * p).toLocaleString();
            updateEstimateTotal();
        };

        tr.querySelector('.est-item-qty').oninput = updateRowAmount;
        tr.querySelector('.est-item-price').oninput = updateRowAmount;

        tr.querySelector('.delete-row').onclick = () => {
            tr.remove();
            updateEstimateTotal();
        };

        editBody.appendChild(tr);
        updateEstimateTotal();
    }

    function updateEstimateTotal() {
        let total = 0;
        editBody.querySelectorAll('tr').forEach(row => {
            const q = parseInt(row.querySelector('.est-item-qty').value) || 0;
            const p = parseInt(row.querySelector('.est-item-price').value) || 0;
            total += (q * p);
        });
        totalEl.innerText = total.toLocaleString();
    }

    function numberToKorean(number) {
        if (number === 0) return '영원정';
        const koreanNumbers = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
        const units = ['', '십', '백', '천'];
        const bigUnits = ['', '만', '억', '조', '경'];
        
        let result = '';
        let numStr = number.toString();
        
        for (let i = 0; i < numStr.length; i += 4) {
            let chunk = numStr.substring(Math.max(0, numStr.length - i - 4), numStr.length - i);
            let chunkResult = '';
            for (let j = 0; j < chunk.length; j++) {
                let digit = parseInt(chunk[chunk.length - j - 1]);
                if (digit !== 0) {
                    let part = (digit === 1 && j > 0 ? '' : koreanNumbers[digit]) + units[j];
                    chunkResult = part + chunkResult;
                }
            }
            if (chunkResult !== '') {
                result = chunkResult + bigUnits[i / 4] + result;
            }
        }
        return '일금 ' + result + '원정';
    }

    // === Estimate Save/Load System ===
    const savedBody = document.getElementById('saved-estimates-body');
    let editingEstimateId = null; // Track if we're editing an existing estimate

    function getEstimates() {
        return JSON.parse(localStorage.getItem('savedEstimates') || '[]');
    }

    function saveEstimates(estimates) {
        localStorage.setItem('savedEstimates', JSON.stringify(estimates));
    }

    function generateEstimateNumber() {
        const estimates = getEstimates();
        const today = new Date();
        const prefix = `EST-${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}`;
        const existing = estimates.filter(e => e.number && e.number.startsWith(prefix));
        const nextSeq = existing.length > 0 ? Math.max(...existing.map(e => parseInt(e.number.split('-').pop()) || 0)) + 1 : 1;
        return `${prefix}-${String(nextSeq).padStart(3,'0')}`;
    }

    function collectCurrentEstimateData() {
        const receiver = document.getElementById('est-input-receiver').value.trim();
        const date = document.getElementById('est-input-date').value;
        const items = [];
        editBody.querySelectorAll('tr').forEach(row => {
            items.push({
                name: row.querySelector('.est-item-name').value,
                qty: parseInt(row.querySelector('.est-item-qty').value) || 0,
                unit: row.querySelector('.est-item-unit').value,
                price: parseInt(row.querySelector('.est-item-price').value) || 0
            });
        });
        const subtotal = items.reduce((sum, i) => sum + (i.qty * i.price), 0);
        return { receiver, date, items, subtotal, tax: Math.floor(subtotal * 0.1), total: subtotal + Math.floor(subtotal * 0.1) };
    }

    // Save Button
    const saveBtn = document.getElementById('btn-est-save');
    if (saveBtn) {
        saveBtn.onclick = () => {
            const data = collectCurrentEstimateData();
            if (!data.receiver) { alert('수신자를 입력하세요.'); return; }
            if (data.items.length === 0) { alert('항목을 추가하세요.'); return; }

            const estimates = getEstimates();

            if (editingEstimateId) {
                // Update existing estimate
                const idx = estimates.findIndex(e => e.id === editingEstimateId);
                if (idx !== -1) {
                    estimates[idx] = { ...estimates[idx], ...data, updatedAt: new Date().toISOString() };
                    saveEstimates(estimates);
                    alert(`견적서 ${estimates[idx].number} 수정 완료!`);
                }
                editingEstimateId = null;
                saveBtn.innerText = '💾 견적서 저장';
            } else {
                // Create new estimate
                const newEst = {
                    id: 'est_' + Date.now(),
                    number: generateEstimateNumber(),
                    ...data,
                    createdAt: new Date().toISOString()
                };
                estimates.unshift(newEst);
                saveEstimates(estimates);
                alert(`견적서 ${newEst.number} 저장 완료!`);
            }

            renderSavedEstimates();
        };
    }

    // Render Saved Estimates List
    function renderSavedEstimates() {
        if (!savedBody) return;
        const estimates = getEstimates();
        savedBody.innerHTML = estimates.length > 0 ? estimates.map(est => `
            <tr>
                <td><strong>${est.number || '-'}</strong></td>
                <td>${est.receiver || '-'}</td>
                <td>${est.date || '-'}</td>
                <td style="text-align:right; font-weight:600;">￦${(est.total || 0).toLocaleString()}</td>
                <td>
                    <div style="display:flex; gap:5px;">
                        <button onclick="window.loadEstimate('${est.id}')" style="background:#333; color:#fff; border:none; padding:5px 12px; border-radius:3px; cursor:pointer; font-size:0.75rem;">수정</button>
                        <button onclick="window.previewSavedEstimate('${est.id}')" style="background:#666; color:#fff; border:none; padding:5px 12px; border-radius:3px; cursor:pointer; font-size:0.75rem;">미리보기</button>
                        <button onclick="window.deleteEstimate('${est.id}')" style="background:#ff4444; color:#fff; border:none; padding:5px 12px; border-radius:3px; cursor:pointer; font-size:0.75rem;">삭제</button>
                    </div>
                </td>
            </tr>
        `).join('') : '<tr><td colspan="5" class="empty-state" style="text-align:center; padding:30px; color:#aaa;">저장된 견적서가 없습니다.</td></tr>';
    }

    // Load estimate into editor for editing
    window.loadEstimate = (id) => {
        const estimates = getEstimates();
        const est = estimates.find(e => e.id === id);
        if (!est) return;

        document.getElementById('est-input-receiver').value = est.receiver || '';
        document.getElementById('est-input-date').value = est.date || '';

        editBody.innerHTML = '';
        (est.items || []).forEach(item => {
            addEstimateRow(item.name, item.qty, item.unit, item.price);
        });
        updateEstimateTotal();

        editingEstimateId = id;
        if (saveBtn) saveBtn.innerText = `📝 ${est.number} 수정 저장`;
        alert(`${est.number} 견적서를 불러왔습니다. 수정 후 [수정 저장] 버튼을 눌러주세요.`);
    };

    // Preview saved estimate
    window.previewSavedEstimate = (id) => {
        const estimates = getEstimates();
        const est = estimates.find(e => e.id === id);
        if (!est) return;

        // Load into form then trigger preview
        document.getElementById('est-input-receiver').value = est.receiver || '';
        document.getElementById('est-input-date').value = est.date || '';
        editBody.innerHTML = '';
        (est.items || []).forEach(item => addEstimateRow(item.name, item.qty, item.unit, item.price));
        updateEstimateTotal();

        document.getElementById('btn-est-preview').click();
    };

    // Delete estimate
    window.deleteEstimate = (id) => {
        const estimates = getEstimates();
        const est = estimates.find(e => e.id === id);
        if (!est) return;
        if (!confirm(`견적서 ${est.number}을(를) 삭제하시겠습니까?`)) return;
        const filtered = estimates.filter(e => e.id !== id);
        saveEstimates(filtered);
        renderSavedEstimates();
    };

    renderSavedEstimates();
}

window.initAdminStats = function() {
    const list = JSON.parse(localStorage.getItem('inquiryList') || '[]');
    const startInput = document.getElementById('stats-date-start');
    const endInput = document.getElementById('stats-date-end');
    const filterBtn = document.getElementById('btn-stats-filter');
    const clearBtn = document.getElementById('btn-stats-clear');

    if (!filterBtn || !clearBtn) return;

    const render = (dataList) => {
        // Category Stats
        const catMap = {};
        dataList.forEach(i => {
            const cat = i.category || '기타';
            const status = i.status === 'confirmed' ? 'confirmed' : 'pending';
            if (!catMap[cat]) catMap[cat] = { pending: 0, confirmed: 0 };
            catMap[cat][status]++;
        });

        const catChart = document.getElementById('stats-category-chart');
        if (catChart) {
            const max = Math.max(...Object.values(catMap).map(v => v.pending + v.confirmed), 1);
            catChart.innerHTML = Object.entries(catMap).map(([name, data]) => `
                <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:5px; min-width:60px;">
                    <div style="font-size:0.7rem; font-weight:700;">${data.pending + data.confirmed}</div>
                    <div style="width:100%; display:flex; flex-direction:column-reverse; height:200px; background:#eee; border-radius:3px; overflow:hidden;">
                        <div title="확정" style="background:#000; height:${(data.confirmed/max)*100}%; transition: height 0.5s;"></div>
                        <div title="대기" style="background:#aaa; height:${(data.pending/max)*100}%; transition: height 0.5s;"></div>
                    </div>
                    <div style="font-size:0.6rem; transform:rotate(-45deg); margin-top:25px; white-space:nowrap;">${name}</div>
                </div>
            `).join('') + `
                <div style="position:absolute; top:15px; right:15px; display:flex; gap:15px; font-size:0.65rem; background:rgba(255,255,255,0.8); padding:5px 10px; border-radius:4px;">
                    <div style="display:flex; align-items:center; gap:5px;"><i style="width:8px; height:8px; background:#000; border-radius:2px;"></i> 확정</div>
                    <div style="display:flex; align-items:center; gap:5px;"><i style="width:8px; height:8px; background:#aaa; border-radius:2px;"></i> 대기</div>
                </div>
            `;
            catChart.style.position = 'relative';
        }

        // Hall Stats
        const hallMap = { 
            'Reception Hall': { pending: 0, confirmed: 0 }, 
            'Grand Main Hall': { pending: 0, confirmed: 0 }, 
            'Private Studio': { pending: 0, confirmed: 0 } 
        };
        dataList.forEach(i => {
            const status = i.status === 'confirmed' ? 'confirmed' : 'pending';
            (i.halls || []).forEach(h => {
                if (hallMap[h]) hallMap[h][status]++;
            });
        });

        const hallChart = document.getElementById('stats-hall-chart');
        if (hallChart) {
            const totalMax = Math.max(...Object.values(hallMap).map(v => v.pending + v.confirmed), 1);
            hallChart.innerHTML = Object.entries(hallMap).map(([name, data]) => `
                <div style="width:100%;">
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:8px;">
                        <span style="font-weight:600;">${name}</span>
                        <span style="color:#888;">${data.confirmed} Confirmed / ${data.pending} Pending</span>
                    </div>
                    <div style="width:100%; height:10px; background:#f0f0f0; border-radius:5px; overflow:hidden; display:flex;">
                        <div style="width:${(data.confirmed/totalMax)*100}%; height:100%; background:#000;" title="확정"></div>
                        <div style="width:${(data.pending/totalMax)*100}%; height:100%; background:#ccc;" title="대기"></div>
                    </div>
                </div>
            `).join('');
        }
    };

    const normalizeDate = (dStr) => {
        if (!dStr) return null;
        // Handle "2026. 4. 21." format or YYYY-MM-DD
        const clean = dStr.replace(/\. /g, '-').replace(/\./g, '');
        const d = new Date(clean);
        return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
    };

    filterBtn.onclick = () => {
        const start = startInput.value;
        const end = endInput.value;
        if (!start || !end) { alert('시작일과 종료일을 모두 선택해 주세요.'); return; }

        const filtered = list.filter(i => {
            const itemDate = normalizeDate(i.date);
            if (!itemDate) return false;
            return itemDate >= start && itemDate <= end;
        });
        render(filtered);
    };

    clearBtn.onclick = () => {
        startInput.value = '';
        endInput.value = '';
        render(list);
    };

    // Initial render
    render(list);
}

function initAdminLogin() {
    const loginForm = document.getElementById('admin-login-form');
    if (!loginForm) return;

    // Seed default account if none exists
    let accounts = JSON.parse(localStorage.getItem('adminAccounts') || '[]');
    if (accounts.length === 0) {
        accounts = [{ id: 'admin', name: '최고 관리자', pw: 'bmm2026!', role: 'Master', lastLogin: '-' }];
        localStorage.setItem('adminAccounts', JSON.stringify(accounts));
    }

    loginForm.onsubmit = (e) => {
        e.preventDefault();
        const id = document.getElementById('admin-id').value;
        const pw = document.getElementById('admin-pw').value;
        const errorMsg = document.getElementById('login-error');

        const user = accounts.find(a => a.id === id && a.pw === pw);
        if (user) {
            user.lastLogin = new Date().toLocaleString();
            localStorage.setItem('adminAccounts', JSON.stringify(accounts));
            sessionStorage.setItem('adminLoggedIn', 'true');
            sessionStorage.setItem('adminUser', id);
            location.href = 'index.html';
        } else {
            if (errorMsg) errorMsg.style.display = 'block';
        }
    };
}

window.initAdminSettingsAccounts = function() {
    const listBody = document.getElementById('admin-account-list');
    if (!listBody) return;

    // Ensure default admin account always exists
    let storedAccounts = JSON.parse(localStorage.getItem('adminAccounts') || '[]');
    if (!storedAccounts.find(a => a.id === 'admin')) {
        storedAccounts.unshift({ id: 'admin', name: '최고 관리자', pw: 'bmm2026!', role: 'Master', lastLogin: '-' });
        localStorage.setItem('adminAccounts', JSON.stringify(storedAccounts));
    }

    const renderAccounts = () => {
        const accounts = JSON.parse(localStorage.getItem('adminAccounts') || '[]');
        if (accounts.length === 0) {
            listBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:30px; color:#aaa;">등록된 계정이 없습니다.</td></tr>';
            return;
        }
        listBody.innerHTML = accounts.map((a, idx) => `
            <tr>
                <td style="padding:12px;">
                    <strong>${a.id}</strong><br>
                    <small style="color:#666;">${a.name || '-'}</small>
                    ${a.phone ? `<br><small style="color:#888;">${a.phone}</small>` : ''}
                </td>
                <td style="padding:12px;"><span style="background:#eee; padding:2px 8px; border-radius:10px; font-size:0.7rem;">${a.role || 'Staff'}</span></td>
                <td style="padding:12px; font-size:0.8rem; color:#888;">${a.lastLogin || '-'}</td>
                <td style="padding:12px;">
                    ${a.id !== 'admin'
                        ? `<button onclick="window.deleteAdminAccount(${idx})" style="background:none; border:none; color:#ff4444; cursor:pointer; font-size:0.8rem;">삭제</button>`
                        : '<span style="color:#ccc; font-size:0.8rem;">고정</span>'}
                </td>
            </tr>
        `).join('');
    };

    // Show/hide add form - use boolean flag to avoid display string comparison issues
    const addForm = document.getElementById('admin-add-form');
    const showAddBtn = document.getElementById('btn-show-add-admin');
    if (addForm && showAddBtn && !showAddBtn._bound) {
        showAddBtn._bound = true;
        showAddBtn.onclick = () => {
            const isHidden = addForm.style.display === 'none' || addForm.style.display === '';
            addForm.style.display = isHidden ? 'block' : 'none';
        };
    }

    // Save new account
    const saveNewBtn = document.getElementById('btn-save-new-admin');
    if (saveNewBtn && !saveNewBtn._bound) {
        saveNewBtn._bound = true;
        saveNewBtn.onclick = () => {
            const idEl = document.getElementById('new-admin-id');
            const nameEl = document.getElementById('new-admin-name');
            const phoneEl = document.getElementById('new-admin-phone');
            const pwEl = document.getElementById('new-admin-pw');

            const id = idEl.value.trim();
            const name = nameEl.value.trim();
            const phone = phoneEl.value.trim();
            const pw = pwEl.value;

            if (!id || !name || !pw) {
                alert('아이디, 이름, 비밀번호는 필수 입력 항목입니다.');
                return;
            }

            const accounts = JSON.parse(localStorage.getItem('adminAccounts') || '[]');
            if (accounts.find(a => a.id === id)) {
                alert('이미 존재하는 아이디입니다.');
                return;
            }

            accounts.push({ id, name, phone, pw, role: 'Staff', lastLogin: '-' });
            localStorage.setItem('adminAccounts', JSON.stringify(accounts));

            idEl.value = '';
            nameEl.value = '';
            phoneEl.value = '';
            pwEl.value = '';
            if (addForm) addForm.style.display = 'none';
            alert(`✅ 계정 "${id}"이(가) 생성되었습니다.`);
            renderAccounts();
        };
    }

    window.deleteAdminAccount = (idx) => {
        const accounts = JSON.parse(localStorage.getItem('adminAccounts') || '[]');
        if (!accounts[idx]) return;
        if (!confirm(`계정 "${accounts[idx].id}"을(를) 삭제하시겠습니까?`)) return;
        accounts.splice(idx, 1);
        localStorage.setItem('adminAccounts', JSON.stringify(accounts));
        renderAccounts();
    };

    renderAccounts();
}


/**
 * CMS Logic: Content Management
 */
window.initCMS = function() {
    const saved = JSON.parse(localStorage.getItem('siteContent_v3')) || {};
    const content = { ...window.DEFAULT_CONTENT, ...saved };
    
    // Deep merge for nested fields
    content.halls = saved.halls ? { ...window.DEFAULT_CONTENT.halls, ...saved.halls } : window.DEFAULT_CONTENT.halls;
    content.siteInfo = saved.siteInfo ? { ...window.DEFAULT_CONTENT.siteInfo, ...saved.siteInfo } : window.DEFAULT_CONTENT.siteInfo;
    
    // 1. Fill Hall Data
    for (const id in content.halls) {
        const h = content.halls[id];
        const prefix = `cms-hall-${id.toLowerCase()}`;
        if (document.getElementById(`${prefix}-title`)) document.getElementById(`${prefix}-title`).value = h.title;
        if (document.getElementById(`${prefix}-img`)) document.getElementById(`${prefix}-img`).value = h.img || '';
        if (document.getElementById(`${prefix}-gallery`)) {
            document.getElementById(`${prefix}-gallery`).value = (h.gallery || []).join('\n');
        }
        if (document.getElementById(`${prefix}-desc`)) document.getElementById(`${prefix}-desc`).value = h.desc;
        if (document.getElementById(`${prefix}-area`)) document.getElementById(`${prefix}-area`).value = h.area;
        if (document.getElementById(`${prefix}-cap`)) document.getElementById(`${prefix}-cap`).value = h.cap;
        if (document.getElementById(`${prefix}-height`)) document.getElementById(`${prefix}-height`).value = h.height;
    }
    
    // 2. Fill Contact Data
    const c = content.contact || DEFAULT_CONTENT.contact;
    if (document.getElementById('cms-contact-address')) document.getElementById('cms-contact-address').value = c.address;
    if (document.getElementById('cms-contact-address-en')) document.getElementById('cms-contact-address-en').value = c.addressEn;
    if (document.getElementById('cms-contact-phone')) document.getElementById('cms-contact-phone').value = c.phone;
    if (document.getElementById('cms-contact-email')) document.getElementById('cms-contact-email').value = c.email;
    if (document.getElementById('cms-contact-partnership')) document.getElementById('cms-contact-partnership').value = c.partnership;
    if (document.getElementById('cms-contact-hours')) document.getElementById('cms-contact-hours').value = c.hours;

    if (document.getElementById('cms-gallery-urls')) {
        document.getElementById('cms-gallery-urls').value = (content.gallery || []).join('\n');
    }

    if (document.getElementById('cms-hero-img')) {
        document.getElementById('cms-hero-img').value = content.heroImg || '';
    }

    // 3. Fill Site Info Data
    const si = content.siteInfo || DEFAULT_CONTENT.siteInfo;
    if (document.getElementById('cms-site-hero-title')) document.getElementById('cms-site-hero-title').value = si.heroTitle;
    if (document.getElementById('cms-site-hero-sub')) document.getElementById('cms-site-hero-sub').value = si.heroSub;
    if (document.getElementById('cms-site-intro-main')) document.getElementById('cms-site-intro-main').value = si.introMain;
    if (document.getElementById('cms-site-intro-sub')) document.getElementById('cms-site-intro-sub').value = si.introSub;

    // Resource Management Logic
    const resList = document.getElementById('cms-resource-list');
    if (resList) {
        resList.innerHTML = (content.resources || []).map((res, i) => `
            <div class="cms-resource-item" style="display:grid; grid-template-columns: 50px 1fr 1fr 1fr 60px 50px; gap:10px; align-items:center;">
                <input type="text" class="cms-input res-icon" value="${res.icon}" placeholder="아이콘">
                <input type="text" class="cms-input res-title" value="${res.title}" placeholder="자료명">
                <input type="text" class="cms-input res-desc" value="${res.desc}" placeholder="설명">
                <input type="text" class="cms-input res-url" value="${res.url}" placeholder="파일명/URL">
                <button type="button" class="save-btn" style="padding:5px; background:#444;" onclick="this.nextElementSibling.click()">업로드</button>
                <input type="file" style="display:none" accept=".pdf,.doc,.docx,.xls,.xlsx,.zip" onchange="window.processResourceUpload(this)">
                <button class="delete-btn" onclick="this.parentElement.remove()" style="padding:5px;">×</button>
            </div>
        `).join('');
    }

    const addResBtn = document.getElementById('btn-add-resource');
    if (addResBtn) {
        addResBtn.onclick = () => {
            const div = document.createElement('div');
            div.className = 'cms-resource-item';
            div.style = 'display:grid; grid-template-columns: 50px 1fr 1fr 1fr 60px 50px; gap:10px; align-items:center; margin-top:10px;';
            div.innerHTML = `
                <input type="text" class="cms-input res-icon" value="📄" placeholder="아이콘">
                <input type="text" class="cms-input res-title" value="" placeholder="자료명">
                <input type="text" class="cms-input res-desc" value="" placeholder="설명">
                <input type="text" class="cms-input res-url" value="" placeholder="파일명/URL">
                <button type="button" class="save-btn" style="padding:5px; background:#444;" onclick="this.nextElementSibling.click()">업로드</button>
                <input type="file" style="display:none" accept=".pdf,.doc,.docx,.xls,.xlsx,.zip" onchange="window.processResourceUpload(this)">
                <button class="delete-btn" onclick="this.parentElement.remove()" style="padding:5px;">×</button>
            `;
            resList.appendChild(div);
        };
    }

    const saveBtn = document.getElementById('btn-save-cms');
    if (saveBtn) {
        saveBtn.onclick = async () => {
            const newContent = { ...content };
            ['A', 'B', 'C'].forEach(id => {
                const p = `cms-hall-${id.toLowerCase()}`;
                if (!newContent.halls[id]) newContent.halls[id] = {};
                newContent.halls[id].title = document.getElementById(`${p}-title`).value;
                newContent.halls[id].img = document.getElementById(`${p}-img`).value;
                newContent.halls[id].desc = document.getElementById(`${p}-desc`).value;
                newContent.halls[id].area = document.getElementById(`${p}-area`).value;
                newContent.halls[id].cap = document.getElementById(`${p}-cap`).value;
                newContent.halls[id].height = document.getElementById(`${p}-height`).value;
            });
            newContent.gallery = document.getElementById('cms-gallery-urls').value.split('\n').filter(l => l.trim());
            newContent.heroImg = document.getElementById('cms-hero-img').value;

            newContent.contact = {
                address: document.getElementById('cms-contact-address').value,
                addressEn: document.getElementById('cms-contact-address-en').value,
                phone: document.getElementById('cms-contact-phone').value,
                email: document.getElementById('cms-contact-email').value,
                partnership: document.getElementById('cms-contact-partnership').value,
                hours: document.getElementById('cms-contact-hours').value
            };

            newContent.siteInfo = {
                heroTitle: document.getElementById('cms-site-hero-title').value,
                heroSub: document.getElementById('cms-site-hero-sub').value,
                introMain: document.getElementById('cms-site-intro-main').value,
                introSub: document.getElementById('cms-site-intro-sub').value
            };
            
            const resItems = document.querySelectorAll('.cms-resource-item');
            newContent.resources = Array.from(resItems).map(item => ({
                icon: item.querySelector('.res-icon').value,
                title: item.querySelector('.res-title').value,
                desc: item.querySelector('.res-desc').value,
                url: item.querySelector('.res-url').value
            }));

            try {
                saveBtn.disabled = true;
                saveBtn.innerText = '저장 중...';
                localStorage.setItem('siteContent_v3', JSON.stringify(newContent));
                const res = await fetch(`${API_URL}/content`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newContent)
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                alert('☁️ Google Cloud에 성공적으로 저장되었습니다!');
            } catch (e) {
                console.error('Save Error:', e);
                alert('☁️ 클라우드 저장 실패, 로컬에만 임시 저장되었습니다.\n' + e.message);
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerText = "변경사항 최종 저장하기";
            }
        };
    }

    // Global Upload Zone Logic
    // === Gallery Upload Logic ===
    const galleryUploadBtn = document.getElementById('btn-gallery-upload');
    const galleryFileInput = document.getElementById('file-gallery-upload');
    const galleryUrlAddBtn = document.getElementById('btn-gallery-url-add');
    const galleryPreview = document.getElementById('cms-gallery-preview');

    // Render gallery preview thumbnails
    function renderGalleryPreview() {
        if (!galleryPreview) return;
        const textarea = document.getElementById('cms-gallery-urls');
        if (!textarea) return;
        const urls = textarea.value.split('\n').filter(u => u.trim());
        galleryPreview.innerHTML = urls.length > 0 ? urls.map((url, i) => `
            <div style="position:relative; border-radius:8px; overflow:hidden; border:1px solid #eee; aspect-ratio:1; background:#f5f5f5;">
                <img src="${window.resolveImageUrl(url.trim())}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='https://placehold.co/150x150?text=Error'">
                <button onclick="window.removeGalleryImage(${i})" style="position:absolute; top:4px; right:4px; width:24px; height:24px; border-radius:50%; border:none; background:rgba(0,0,0,0.6); color:#fff; cursor:pointer; font-size:14px; display:flex; align-items:center; justify-content:center;">×</button>
            </div>
        `).join('') : '<div style="grid-column:1/-1; text-align:center; padding:30px; color:#ccc;">이미지를 업로드하거나 URL을 추가하세요</div>';
    }

    window.removeGalleryImage = (idx) => {
        const textarea = document.getElementById('cms-gallery-urls');
        if (!textarea) return;
        const urls = textarea.value.split('\n').filter(u => u.trim());
        urls.splice(idx, 1);
        textarea.value = urls.join('\n');
        renderGalleryPreview();
    };

    if (galleryUploadBtn && galleryFileInput) {
        galleryUploadBtn.onclick = () => galleryFileInput.click();
        galleryFileInput.onchange = (e) => {
            if (e.target.files.length) handleGalleryUpload(e.target.files);
        };
    }

    if (galleryUrlAddBtn) {
        galleryUrlAddBtn.onclick = () => {
            const url = prompt('갤러리에 추가할 이미지 URL을 입력하세요:');
            if (url && url.trim()) {
                const textarea = document.getElementById('cms-gallery-urls');
                if (textarea) {
                    const cur = textarea.value.trim();
                    textarea.value = cur ? cur + '\n' + url.trim() : url.trim();
                    renderGalleryPreview();
                }
            }
        };
    }

    // Drag and drop on gallery preview area
    if (galleryPreview) {
        galleryPreview.ondragover = (e) => { e.preventDefault(); galleryPreview.style.borderColor = '#000'; };
        galleryPreview.ondragleave = (e) => { e.preventDefault(); galleryPreview.style.borderColor = '#eee'; };
        galleryPreview.ondrop = (e) => {
            e.preventDefault();
            galleryPreview.style.borderColor = '#eee';
            if (e.dataTransfer.files.length) handleGalleryUpload(e.dataTransfer.files);
        };
    }

    function handleGalleryUpload(files) {
        const textarea = document.getElementById('cms-gallery-urls');
        if (!textarea) return;
        const msg = document.getElementById('msg-box');
        if (msg) { msg.querySelector('div').innerText = '갤러리 이미지 처리 중...'; msg.style.display = 'block'; }
        let processed = 0;
        let keys = [];
        for (let i = 0; i < files.length; i++) {
            if (!files[i].type.startsWith('image/')) { processed++; continue; }
            window.processImageUpload(files[i], (key) => {
                keys.push(key);
                processed++;
                if (processed === files.length) {
                    const cur = textarea.value.trim();
                    textarea.value = cur ? cur + '\n' + keys.join('\n') : keys.join('\n');
                    renderGalleryPreview();
                    if (msg) { msg.querySelector('div').innerText = `✅ ${keys.length}개 이미지 업로드 완료! [저장] 버튼을 눌러 확정하세요.`; setTimeout(() => { msg.style.display = 'none'; }, 4000); }
                    galleryFileInput.value = '';
                }
            });
        }
    }

    // === Hero Image Upload Logic ===
    const heroUploadBtn = document.getElementById('btn-hero-upload');
    const heroFileInput = document.getElementById('file-hero-upload');
    const heroPreview = document.getElementById('cms-hero-preview');
    const heroInput = document.getElementById('cms-hero-img');

    function renderHeroPreview() {
        if (!heroPreview || !heroInput) return;
        const url = heroInput.value.trim();
        if (url) {
            heroPreview.innerHTML = `<img src="${window.resolveImageUrl(url)}" style="width:100%; height:100%; object-fit:cover;" onerror="this.parentElement.innerHTML='<span style=\\'color:#f44\\'>이미지 로드 실패</span>'">`;
        } else {
            heroPreview.innerHTML = '<span style="color:#ccc; font-size:0.8rem;">미리보기</span>';
        }
    }

    if (heroUploadBtn && heroFileInput) {
        heroUploadBtn.onclick = () => heroFileInput.click();
        heroFileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file || !file.type.startsWith('image/')) return;
            const msg = document.getElementById('msg-box');
            if (msg) { msg.querySelector('div').innerText = '히어로 이미지 처리 중...'; msg.style.display = 'block'; }
            window.processImageUpload(file, (key) => {
                if (heroInput) { heroInput.value = key; renderHeroPreview(); }
                if (msg) { msg.querySelector('div').innerText = '✅ 히어로 이미지 업로드 완료! [저장] 버튼을 눌러 확정하세요.'; setTimeout(() => { msg.style.display = 'none'; }, 4000); }
                heroFileInput.value = '';
            });
        };
    }

    // Update preview when text input changes manually
    if (heroInput) heroInput.onchange = renderHeroPreview;

    // Initial renders
    renderGalleryPreview();
    renderHeroPreview();
}

window.processResourceUpload = (input) => {
    const file = input.files[0];
    if (!file) return;

    const msg = document.getElementById('msg-box');
    if (msg) {
        msg.querySelector('div').innerText = `자료 업로드 중...`;
        msg.style.display = 'block';
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const dataUrl = e.target.result;
        let localImages = JSON.parse(localStorage.getItem('bmm_local_images') || '{}');
        const key = 'local_res_' + Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9.-]/g, '');
        
        try {
            localImages[key] = dataUrl;
            localStorage.setItem('bmm_local_images', JSON.stringify(localImages));
            
            // The URL input is the previous element sibling of the button, and the button is the previous sibling of this input
            const urlInput = input.previousElementSibling.previousElementSibling;
            if (urlInput) urlInput.value = key;

            if (msg) {
                msg.querySelector('div').innerText = `자료 업로드 완료! '저장' 버튼을 누르세요.`;
                setTimeout(() => { msg.style.display = 'none'; }, 3000);
            }
        } catch (err) {
            alert('저장 공간이 부족합니다. 용량이 큰 PDF(약 3MB 이상)는 로컬 환경에 업로드할 수 없습니다.');
            if (msg) msg.style.display = 'none';
        }
    };
    reader.readAsDataURL(file);
};

// Firebase Storage 이미지 업로드 → Cloud Run → Google Cloud Storage
window.processImageUpload = async (file, callback) => {
    const msg = document.getElementById('msg-box');
    try {
        if (msg) { msg.style.background = ''; msg.style.color = ''; msg.querySelector('div').innerText = '☁️ Google Cloud에 업로드 중...'; msg.style.display = 'block'; }

        // 클라이언트에서 리사이징 후 서버로 전송
        const resizedBlob = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = reject;
            reader.onload = (e) => {
                const img = new Image();
                img.onerror = reject;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX = 1200;
                    let w = img.width, h = img.height;
                    if (w > h) { if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; } }
                    else { if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; } }
                    canvas.width = w; canvas.height = h;
                    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('이미지 변환 실패')), 'image/jpeg', 0.85);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });

        const formData = new FormData();
        const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        formData.append('image', resizedBlob, safeFileName);

        const res = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData });
        if (!res.ok) throw new Error(`서버 응답 오류: HTTP ${res.status}`);
        const { url } = await res.json();

        if (msg) { msg.querySelector('div').innerText = '✅ Google Cloud Storage 업로드 완료! [저장] 버튼으로 확정하세요.'; setTimeout(() => { msg.style.display = 'none'; }, 5000); }
        callback(url);

    } catch (err) {
        console.error('GCS 업로드 실패:', err);
        if (msg) {
            msg.querySelector('div').innerHTML = `❌ <strong>업로드 실패</strong><br><small>${err.message}</small>`;
            msg.style.display = 'block';
        }
    }
};

/**
 * Hall Image Upload
 */
window.simulateHallUpload = (hallId, input) => {
    const file = input.files[0];
    if (!file) return;
    
    const msg = document.getElementById('msg-box');
    if (msg) {
        msg.querySelector('div').innerText = `업로드 중...`;
        msg.style.display = 'block';
    }
    
    window.processImageUpload(file, (key) => {
        const textarea = document.getElementById(`cms-hall-${hallId}-gallery`);
        if (textarea) {
            const currentVal = textarea.value.trim();
            const newVal = currentVal ? currentVal + '\n' + key : key;
            textarea.value = newVal;
            
            if (msg) {
                msg.querySelector('div').innerText = `[${hallId.toUpperCase()}] 이미지 추가됨. '저장' 버튼을 눌러 확정하세요.`;
                setTimeout(() => { msg.style.display = 'none'; }, 3000);
            }
        }
        input.value = ''; 
    });
};

/**
 * Notice & Status Logic
 */
window.initAdminNotices = function() {
    const listBody = document.getElementById('cms-notice-list-body');
    if (!listBody) return;
    const content = JSON.parse(localStorage.getItem('siteContent_v3')) || DEFAULT_CONTENT;
    if (!content.notices) content.notices = [];
    listBody.innerHTML = content.notices.map((n, idx) => `
        <tr>
            <td>${n.date}</td>
            <td><strong>${n.title}</strong></td>
            <td><button class="delete-btn" onclick="window.deleteNotice(${idx})" style="background:#ff4444; color:#fff; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">삭제</button></td>
        </tr>
    `).join('');

    const addBtn = document.getElementById('btn-add-notice');
    if (addBtn && !addBtn.dataset.bound) {
        addBtn.dataset.bound = 'true';
        addBtn.onclick = () => {
            const title = document.getElementById('new-notice-title').value.trim();
            const contentText = document.getElementById('new-notice-content') ? document.getElementById('new-notice-content').value.trim() : '';
            let date = document.getElementById('new-notice-date').value;
            if (!title) { alert('제목을 입력하세요.'); return; }
            if (!date) {
                const today = new Date();
                date = `${today.getFullYear()}.${String(today.getMonth()+1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
            } else {
                date = date.replace(/-/g, '.');
            }
            
            const curContent = JSON.parse(localStorage.getItem('siteContent_v3')) || DEFAULT_CONTENT;
            if (!curContent.notices) curContent.notices = [];
            curContent.notices.unshift({ date, title, content: contentText });
            localStorage.setItem('siteContent_v3', JSON.stringify(curContent));
            
            document.getElementById('new-notice-title').value = '';
            document.getElementById('new-notice-date').value = '';
            if(document.getElementById('new-notice-content')) document.getElementById('new-notice-content').value = '';
            window.initAdminNotices();
        };
    }
}

window.deleteNotice = (idx) => {
    if (confirm('정말 삭제하시겠습니까?')) {
        const content = JSON.parse(localStorage.getItem('siteContent_v3')) || DEFAULT_CONTENT;
        content.notices.splice(idx, 1);
        localStorage.setItem('siteContent_v3', JSON.stringify(content));
        initAdminNotices();
    }
};

let adminCalDate = new Date(); 

window.initSpaceStatus = function() {
    const grid = document.getElementById('status-calendar-grid');
    const yearSelect = document.getElementById('cal-year-select');
    const monthSelect = document.getElementById('cal-month-select');
    const prevBtn = document.getElementById('btn-prev-month');
    const nextBtn = document.getElementById('btn-next-month');
    
    if (!grid || !yearSelect || !monthSelect) return;
    
    const year = adminCalDate.getFullYear();
    const month = adminCalDate.getMonth();
    
    // Init Selectors
    if (yearSelect.options.length === 0) {
        for (let y = 2024; y <= 2030; y++) yearSelect.add(new Option(`${y}년`, y));
        for (let m = 0; m < 12; m++) monthSelect.add(new Option(`${m + 1}월`, m));
        
        yearSelect.onchange = () => { adminCalDate.setFullYear(yearSelect.value); initSpaceStatus(); };
        monthSelect.onchange = () => { adminCalDate.setMonth(monthSelect.value); initSpaceStatus(); };
        
        if (prevBtn) prevBtn.onclick = () => { adminCalDate.setMonth(adminCalDate.getMonth() - 1); initSpaceStatus(); };
        if (nextBtn) nextBtn.onclick = () => { adminCalDate.setMonth(adminCalDate.getMonth() + 1); initSpaceStatus(); };
    }

    yearSelect.value = year;
    monthSelect.value = month;
    
    const list = JSON.parse(localStorage.getItem('inquiryList') || '[]');
    const confirmed = list.filter(i => i.status === 'confirmed');
    
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    
    let html = '';
    // Days from previous month
    for (let i = 0; i < firstDay; i++) {
        html += `<div class="calendar-day empty"></div>`;
    }
    
    // Days of current month
    for (let day = 1; day <= lastDate; day++) {
        const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const matches = confirmed.filter(inq => {
            const p = inq.period || (inq.startDate + ' ~ ' + inq.endDate);
            if (!p) return false;
            const [start, end] = p.split(' ~ ');
            return dateStr >= start && dateStr <= end;
        });

        let spots = '';
        matches.forEach(m => {
            (m.halls || []).forEach(h => {
                const type = h.includes('A') ? 'a' : (h.includes('B') ? 'b' : 'c');
                spots += `<i class="dot ${type}" title="${m.name} / ${h}"></i>`;
            });
        });

        html += `
            <div class="calendar-day ${matches.length ? 'booked' : ''}">
                <span class="day-num">${day}</span>
                <div class="booking-dots">${spots}</div>
            </div>
        `;
    }
    
    grid.innerHTML = html;

    // Navigation Events
    document.getElementById('btn-prev-month').onclick = () => {
        adminCalDate.setMonth(adminCalDate.getMonth() - 1);
        initSpaceStatus();
    };
    document.getElementById('btn-next-month').onclick = () => {
        adminCalDate.setMonth(adminCalDate.getMonth() + 1);
        initSpaceStatus();
    };
}

function initPlanningSupport() {
    const body = document.getElementById('planning-list-body');
    if (!body) return;

    const list = JSON.parse(localStorage.getItem('planningProposals') || '[]');
    body.innerHTML = list.length ? list.map((p, idx) => `
        <tr>
            <td>${p.date}</td>
            <td><strong>${p.title}</strong><br><small>${p.customer}</small></td>
            <td>${p.items} Item(s)</td>
            <td><img src="${p.preview || 'map_total.png'}" style="width:50px; height:35px; border-radius:2px; object-fit:cover;"></td>
            <td>
                <button class="edit-btn" onclick="alert('기획안 상세보기')">세부 기획</button>
                <button class="delete-btn" onclick="window.deleteProposal(${idx})" style="margin-left:5px;">삭제</button>
            </td>
        </tr>
    `).join('') : '<tr><td colspan="5" class="empty-state">저장된 기획안이 없습니다.</td></tr>';

    const addBtn = document.getElementById('btn-add-proposal');
    if (addBtn) {
        addBtn.onclick = () => {
            const title = prompt('기획안 제목을 입력하세요:', '2026 신제품 런칭 쇼케이스');
            const customer = prompt('담당 고객/사 명을 입력하세요:', '(주)플래닝코리아');
            if (title && customer) {
                const newList = [...list, {
                    date: new Date().toLocaleDateString(),
                    title,
                    customer,
                    items: Math.floor(Math.random() * 20) + 5,
                    preview: 'map_total.png'
                }];
                localStorage.setItem('planningProposals', JSON.stringify(newList));
                initPlanningSupport();
                alert('새로운 기획안이 등록되었습니다.');
            }
        };
    }
}

window.deleteProposal = (idx) => {
    if (confirm('해당 기획안을 삭제하시겠습니까?')) {
        const list = JSON.parse(localStorage.getItem('planningProposals') || '[]');
        list.splice(idx, 1);
        localStorage.setItem('planningProposals', JSON.stringify(list));
        initPlanningSupport();
    }
};

/**
 * Inquiry Submission Logic (Global)
 */
window.submitInquiryToFirestore = async function(inquiryData) {
    // localStorage 백업
    const localList = JSON.parse(localStorage.getItem('inquiryList') || '[]');
    const localEntry = { ...inquiryData, id: 'local_' + Date.now(), createdAt: new Date().toISOString(), status: 'pending' };
    localList.unshift(localEntry);
    localStorage.setItem('inquiryList', JSON.stringify(localList));

    // Cloud Run REST API로 제출
    try {
        const res = await fetch(`${API_URL}/inquiries`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...inquiryData, status: 'pending' })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { id } = await res.json();
        console.log('✅ 문의 Cloud 저장 완료. ID:', id);
        return true;
    } catch (e) {
        console.warn('⚠️ Cloud 저장 실패, 로컬 백업만 저장됨:', e.message);
        return true;
    }
};

/**
 * Inquiry Detail Modal Logic
 */
window.showInquiryDetail = function(id) {
    const item = (window.currentInquiryList || []).find(i => i.id === id);
    if (!item) return;

    const modal = document.getElementById('inquiry-detail-modal');
    const body = document.getElementById('detail-modal-body');
    
    body.innerHTML = `
        <div style="border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div>
                <span style="font-size: 0.75rem; letter-spacing: 0.1em; color: #888; text-transform: uppercase;">Cloud ID</span>
                <h4 style="margin: 5px 0 0; font-size: 1.1rem; font-family: 'Fraunces', serif;">${id}</h4>
            </div>
            <span class="status-chip ${item.status || 'pending'}" style="padding: 6px 15px; font-size: 0.8rem;">${item.status === 'confirmed' ? '예약 확정됨' : '상담 대기중'}</span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 35px;">
            <div class="info-group">
                <label style="display: block; font-size: 0.7rem; font-weight: 700; color: #999; margin-bottom: 10px; text-transform: uppercase;">Customer Info</label>
                <div style="font-size: 1rem; line-height: 1.8;">
                    <strong style="font-size: 1.1rem;">${item.name}</strong> <span style="color: #666; font-size: 0.9rem;">| ${item.company}</span><br>
                    <span style="color: #444;">${item.phone}</span><br>
                    <span style="color: #888; font-size: 0.85rem;">${item.email}</span>
                </div>
            </div>
            <div class="info-group">
                <label style="display: block; font-size: 0.7rem; font-weight: 700; color: #999; margin-bottom: 10px; text-transform: uppercase;">Reservation Data</label>
                <div style="font-size: 1rem; line-height: 1.8;">
                    <strong style="color: #0055ff;">${(item.halls || []).join(', ')}</strong><br>
                    <strong>${item.period || '-'}</strong><br>
                    <span style="color: #888; font-size: 0.85rem;">신청일: ${item.date || '-'}</span>
                </div>
            </div>
        </div>

        <div style="background: #fbfbfb; border: 1px solid #eee; padding: 25px; border-radius: 4px; margin-bottom: 35px;">
            <label style="display: block; font-size: 0.7rem; font-weight: 700; color: #e67e22; margin-bottom: 15px; text-transform: uppercase;">Internal Management</label>
            <div style="display: flex; align-items: center; gap: 20px;">
                <div style="flex: 1;">
                    <span style="font-size: 0.85rem; color: #555;">배정 로컬 담당자</span>
                    <input type="text" id="inq-manager" value="${item.manager || '미지정'}" style="width: 100%; margin-top: 8px; padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 0.95rem; outline: none; background: #fff;">
                </div>
                <div style="flex: 1;">
                    <span style="font-size: 0.85rem; color: #555;">첨부 파일 (${(item.attachedFiles || []).length})</span>
                    <div style="display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap;">
                        ${item.attachedFiles && item.attachedFiles.length ? item.attachedFiles.map(f => `<span style="background: #000; color: #fff; padding: 4px 10px; border-radius: 2px; font-size: 0.7rem;">${f}</span>`).join('') : '<span style="color: #ccc; font-size: 0.85rem; padding: 10px 0;">첨부파일 없음</span>'}
                    </div>
                </div>
            </div>
        </div>

        <div>
            <label style="display: block; font-size: 0.7rem; font-weight: 700; color: #999; margin-bottom: 10px; text-transform: uppercase;">Events Memo & Requirements</label>
            <div style="background: #fff; border: 1px solid #eee; padding: 25px; border-radius: 4px; font-size: 0.95rem; line-height: 1.7; color: #444; min-height: 100px; white-space: pre-wrap;">${item.memo || '고객의 추가 요청사항이 없습니다.'}</div>
        </div>
    `;

    modal.style.display = 'flex';

    // Button Logic
    document.getElementById('btn-confirm-inq').onclick = () => window.confirmInquiry(id);
    document.getElementById('btn-delete-inq').onclick = () => window.deleteInquiry(id);
    
    // Add Estimate View Button in Modal (Injecting a new button)
    const footer = modal.querySelector('.modal-footer');
    if (footer && !document.getElementById('btn-view-estimate')) {
        const estBtn = document.createElement('button');
        estBtn.id = 'btn-view-estimate';
        estBtn.className = 'save-btn';
        estBtn.style = 'background:#555; color:#fff; padding:10px 25px; margin-right:10px;';
        estBtn.innerText = '견적서 생성';
        estBtn.onclick = () => window.openEstimate(id);
        footer.insertBefore(estBtn, document.getElementById('btn-confirm-inq'));
    }
};

window.openEstimate = (id) => {
    const item = (window.currentInquiryList || []).find(i => i.id === id);
    if (!item) return;

    const modal = document.getElementById('estimate-modal');
    modal.style.display = 'block';

    // Fill Estimate Data
    document.getElementById('est-receiver').innerText = `${item.company || item.name} 귀하`;
    document.getElementById('est-date').innerText = item.date || new Date().toLocaleDateString();

    // Rates (Standard)
    const rates = { 'Reception Hall': 3500000, 'Grand Main Hall': 8500000, 'Private Studio': 2500000 };
    let html = '';
    let total = 0;
    const halls = item.halls || [];
    
    halls.forEach(h => {
        const rate = rates[h] || 5000000;
        const sub = rate * 1; // Default 1 day
        total += sub;
        html += `
            <tr>
                <td style="padding:15px; border:1px solid #ddd;">[대관] ${h}</td>
                <td style="padding:15px; border:1px solid #ddd; text-align:center;">1일</td>
                <td style="padding:15px; border:1px solid #ddd; text-align:right;">${rate.toLocaleString()}</td>
                <td style="padding:15px; border:1px solid #ddd; text-align:right;">${sub.toLocaleString()}</td>
                <td style="padding:15px; border:1px solid #ddd; color:#888;">기본 대관료</td>
            </tr>
        `;
    });

    const tax = Math.floor(total * 0.1);
    const finalTotal = total + tax;

    document.getElementById('est-items-body').innerHTML = html;
    document.getElementById('est-subtotal').innerText = total.toLocaleString();
    document.getElementById('est-tax').innerText = tax.toLocaleString();
    document.getElementById('est-total-top').innerText = finalTotal.toLocaleString();
    document.getElementById('est-total-bottom').innerText = finalTotal.toLocaleString();
};

window.closeInquiryDetail = function() {
    document.getElementById('inquiry-detail-modal').style.display = 'none';
};

window.confirmInquiry = async function(id) {
    if (!id) return;
    try {
        const manager = document.getElementById('inq-manager').value;
        const res = await fetch(`${API_URL}/inquiries/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'confirmed', manager })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        window.closeInquiryDetail();
        window.renderInquiryList();
        alert('☁️ 예약이 확정되었습니다.');
    } catch (e) {
        console.error('Confirm Error:', e);
        alert('업데이트 실패: ' + e.message);
    }
};

window.deleteInquiry = async function(id) {
    if (confirm('해당 대관 문의 내역을 정말 삭제하시겠습니까? (Google Cloud에서 영구 삭제됩니다)')) {
        try {
            const res = await fetch(`${API_URL}/inquiries/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            window.closeInquiryDetail();
            window.renderInquiryList();
            alert('🗑️ 삭제 완료');
        } catch (e) {
            console.error('Delete Error:', e);
            alert('삭제 실패: ' + e.message);
        }
    }
};

/**
 * Notice & Contact Rendering
 */
function renderNotices() {
    const container = document.getElementById('public-notice-list');
    if (!container) return;
    const saved = JSON.parse(localStorage.getItem('siteContent_v3')) || {};
    // Fallback to DEFAULT_CONTENT only if 'notices' is explicitly undefined in saved content.
    const notices = saved.notices !== undefined ? saved.notices : DEFAULT_CONTENT.notices;
    
    container.innerHTML = notices && notices.length > 0 ? notices.map(n => `
        <div class="notice-entry">
            <div class="notice-header-bar" onclick="this.parentElement.classList.toggle('active')">
                <div class="notice-date">${n.date || ''}</div>
                <div class="notice-title-box">
                    ${n.urgent ? '<span class="urgent-tag">중요</span>' : ''}
                    <h3 class="notice-title">${n.title || ''}</h3>
                </div>
                <div class="notice-chevron"></div>
            </div>
            <div class="notice-body">
                <div class="notice-content-inner">
                    <p>${(n.content || '').replace(/\n/g, '<br>')}</p>
                </div>
            </div>
        </div>
    `).join('') : '<div class="empty-state" style="padding:100px; text-align:center; color:#999;">등록된 공지사항이 없습니다.</div>';
}

function renderContactInfo() {
    const saved = JSON.parse(localStorage.getItem('siteContent_v3')) || {};
    const content = { ...DEFAULT_CONTENT, ...saved };
    
    // Update Hero Image
    const hero = document.getElementById('main-hero-section');
    if (hero) {
        const heroUrl = content.heroImg || DEFAULT_CONTENT.heroImg;
        hero.style.background = `url('${heroUrl}') no-repeat center center/cover`;
    }

    const c = content.contact || DEFAULT_CONTENT.contact;
    const els = {
        'contact-address': c.address,
        'contact-address-en': c.addressEn,
        'contact-phone': c.phone,
        'contact-email': c.email,
        'contact-partnership': c.partnership,
        'contact-hours': c.hours
    };
    for (const id in els) {
        const el = document.getElementById(id);
        if (el) {
            if (id === 'contact-hours') {
                el.innerHTML = els[id].replace(/\n/g, '<br>');
            } else {
                el.innerText = els[id];
            }
        }
    }
}

/**
 * Image Lightbox / Zoom
 */
window.openImageModal = function(src) {
    let modal = document.getElementById('global-image-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'global-image-modal';
        modal.className = 'image-modal-overlay';
        modal.innerHTML = `
            <div class="modal-close" onclick="this.parentElement.style.display='none'">&times;</div>
            <img src="" id="modal-img-content">
        `;
        document.body.appendChild(modal);
    }
    const img = document.getElementById('modal-img-content');
    img.src = src;
    modal.style.display = 'flex';
};
