import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import gsap from 'gsap';

console.log("🛠️ BMM Script Loading... v1.39");
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

const DEFAULT_CONTENT = {
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
        phone: '02-535-5875',
        email: 'museum@bmm.kr',
        partnership: 'biz@bmm.kr',
        hours: 'Weekdays / 09:30 AM ~ 06:30 PM\nWeekends & Holidays / Closed'
    }
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
    return url;
};

function loadSiteContent() {
    const saved = JSON.parse(localStorage.getItem('siteContent_v3')) || {};
    const content = { ...DEFAULT_CONTENT, ...saved };
    // Ensure nested objects like halls and notices are also merged or defaulted
    if (!content.notices || content.notices.length === 0) content.notices = DEFAULT_CONTENT.notices;
    // Force halls to use DEFAULT_CONTENT to prevent admin cached data from overwriting code updates
    content.halls = DEFAULT_CONTENT.halls;
    if (!content.contact) content.contact = DEFAULT_CONTENT.contact;
    
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

    // Gallery
    const gallery = document.getElementById('space-gallery');
    if (gallery && content.gallery) {
        gallery.innerHTML = content.gallery.map(img => `
            <div class="gallery-item-pill" data-src="${window.resolveImageUrl(img)}">
                <img src="${window.resolveImageUrl(img)}" alt="Gallery" onerror="this.src='https://placehold.co/600x400?text=No+Image'">
                <div class="item-hover-overlay"><span>VIEW</span></div>
            </div>
        `).join('');
    }
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

    // CRITICAL: Remove the Fade Overlay
    setTimeout(() => {
        document.body.classList.add('loaded');
        renderContactInfo();
    }, 300);
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
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            tabContents.forEach(content => {
                content.style.display = content.id === `tab-${target}` ? 'block' : 'none';
            });

            // Update Header Title & Breadcrumb
            const headerTitle = document.getElementById('admin-header-title');
            const headerBread = document.getElementById('admin-header-breadcrumb');
            const titles = {
                inquiry: ['통합 문의 관리', '매니지먼트 / 대관 문의'],
                estimate: ['견적서 관리 및 발송', '매니지먼트 / 견적서'],
                content: ['웹 콘텐츠 관리', 'CMS / 사이트 편집'],
                notice: ['공지사항 관리', '커뮤니케이션 / 알림'],
                status: ['공간 현황 및 일정', '운영 / 캘린더'],
                stats: ['데이터 통계 분석', '매니지먼트 / 인사이트'],
                planning: ['공간 기획 지원', '디자인 / 시뮬레이션'],
                settings: ['시스템 설정', '관리 / 설정']
            };

            if (titles[target] && headerTitle && headerBread) {
                headerTitle.innerHTML = `${titles[target][0]} <span style="font-size: 0.6rem; opacity: 0.3;">v1.07</span>`;
                headerBread.innerText = titles[target][1];
            }

            if (target === 'inquiry') renderInquiryList();
            if (target === 'estimate') initEstimateManager();
            if (target === 'content') initCMS();
            if (target === 'notice') initAdminNotices();
            if (target === 'status') initSpaceStatus();
            if (target === 'stats') initAdminStats();
            if (target === 'planning') initPlanningSupport();
            if (target === 'settings') initAdminSettingsAccounts();
        });
    });

    renderInquiryList();

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

function renderInquiryList() {
    const body = document.getElementById('inquiry-list-body');
    if (!body) return;
    const list = JSON.parse(localStorage.getItem('inquiryList') || '[]');
    body.innerHTML = list.length ? list.map((item, idx) => `
        <tr>
            <td><span class="status-chip ${item.status || 'pending'}">${item.status === 'confirmed' ? '확정' : '대기'}</span></td>
            <td><strong>${item.category || '기타'}</strong></td>
            <td><strong>${item.name || '무명'}</strong><br><small style="opacity:0.5;">${item.company || '-'}</small></td>
            <td>${item.phone || '-'}<br><small style="opacity:0.5;">${item.email || '-'}</small></td>
            <td>${(item.halls || []).join(', ')}</td>
            <td>${item.period || (item.startDate + ' ~ ' + item.endDate)}</td>
            <td>${item.attachedFiles && item.attachedFiles.length > 0 ? item.attachedFiles[0] : '-'}</td>
            <td><button class="edit-btn" onclick="window.showInquiryDetail(${idx})">상세/견적</button></td>
        </tr>
    `).join('') : '<tr><td colspan="8" class="empty-state">내역이 없습니다.</td></tr>';

    // Update Stats on Dashboard
    const total = document.getElementById('stat-total-inquires');
    if (total) total.innerText = list.length;
    const pending = document.getElementById('stat-pending-inquires');
    if (pending) pending.innerText = list.filter(i => i.status !== 'confirmed').length;
    const confirmed = document.getElementById('stat-confirmed-inquires');
    if (confirmed) confirmed.innerText = list.filter(i => i.status === 'confirmed').length;
}



function initEstimateManager() {
    const list = JSON.parse(localStorage.getItem('inquiryList') || '[]');
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
}

function initAdminStats() {
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

function initAdminSettingsAccounts() {
    const listBody = document.getElementById('admin-account-list');
    const addForm = document.getElementById('admin-add-form');
    const showAddBtn = document.getElementById('btn-show-add-admin');
    const saveNewBtn = document.getElementById('btn-save-new-admin');

    if (!listBody) return;

    const render = () => {
        const accounts = JSON.parse(localStorage.getItem('adminAccounts') || '[]');
        listBody.innerHTML = accounts.map((a, idx) => `
            <tr>
                <td style="padding:12px;"><strong>${a.id}</strong><br><small style="color:#666;">${a.name || '-'}</small></td>
                <td style="padding:12px;"><span style="background:#eee; padding:2px 8px; border-radius:10px; font-size:0.7rem;">${a.role || 'Staff'}</span></td>
                <td style="padding:12px; font-size:0.8rem; color:#888;">${a.lastLogin || '-'}</td>
                <td style="padding:12px;">
                    ${a.id !== 'admin' ? `<button onclick="window.deleteAdminAccount(${idx})" style="background:none; border:none; color:#ff4444; cursor:pointer; font-size:0.8rem;">삭제</button>` : '<span style="color:#ccc; font-size:0.8rem;">고정</span>'}
                </td>
            </tr>
        `).join('');
    };

    showAddBtn.onclick = () => {
        addForm.style.display = addForm.style.display === 'none' ? 'block' : 'none';
    };

    saveNewBtn.onclick = () => {
        const id = document.getElementById('new-admin-id').value;
        const name = document.getElementById('new-admin-name').value;
        const pw = document.getElementById('new-admin-pw').value;
        if (!id || !name || !pw) return alert('아이디, 이름, 비밀번호를 모두 입력해 주세요.');

        const accounts = JSON.parse(localStorage.getItem('adminAccounts') || '[]');
        if (accounts.find(a => a.id === id)) return alert('이미 존재하는 아이디입니다.');

        accounts.push({ id, name, pw, role: 'Staff', lastLogin: '-' });
        localStorage.setItem('adminAccounts', JSON.stringify(accounts));
        
        document.getElementById('new-admin-id').value = '';
        document.getElementById('new-admin-name').value = '';
        document.getElementById('new-admin-pw').value = '';
        addForm.style.display = 'none';
        render();
    };

    window.deleteAdminAccount = (idx) => {
        if (confirm('해당 직원 계정을 삭제하시겠습니까?')) {
            const accounts = JSON.parse(localStorage.getItem('adminAccounts') || '[]');
            accounts.splice(idx, 1);
            localStorage.setItem('adminAccounts', JSON.stringify(accounts));
            render();
        }
    };

    render();
}

/**
 * CMS Logic: Content Management
 */
function initCMS() {
    const content = JSON.parse(localStorage.getItem('siteContent_v3')) || DEFAULT_CONTENT;
    
    // Fill Inquiry Data to Forms
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
    
    if (document.getElementById('cms-gallery-urls')) {
        document.getElementById('cms-gallery-urls').value = (content.gallery || []).join('\n');
    }

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
        saveBtn.onclick = () => {
            const newContent = { ...content };
            ['A', 'B', 'C'].forEach(id => {
                const p = `cms-hall-${id.toLowerCase()}`;
                newContent.halls[id].title = document.getElementById(`${p}-title`).value;
                newContent.halls[id].img = document.getElementById(`${p}-img`).value;
                newContent.halls[id].gallery = document.getElementById(`${p}-gallery`).value.split('\n').filter(l => l.trim());
                newContent.halls[id].desc = document.getElementById(`${p}-desc`).value;
                newContent.halls[id].area = document.getElementById(`${p}-area`).value;
                newContent.halls[id].cap = document.getElementById(`${p}-cap`).value;
                newContent.halls[id].height = document.getElementById(`${p}-height`).value;
            });
            newContent.gallery = document.getElementById('cms-gallery-urls').value.split('\n').filter(l => l.trim());
            
            const resItems = document.querySelectorAll('.cms-resource-item');
            newContent.resources = Array.from(resItems).map(item => ({
                icon: item.querySelector('.res-icon').value,
                title: item.querySelector('.res-title').value,
                desc: item.querySelector('.res-desc').value,
                url: item.querySelector('.res-url').value
            }));

            localStorage.setItem('siteContent_v3', JSON.stringify(newContent));
            alert('콘텐츠가 성공적으로 저장되었습니다.');
        };
    }

    // Global Upload Zone Logic
    const uploadZone = document.getElementById('cms-upload-zone');
    const fileInput = document.getElementById('cms-file-input');

    if (uploadZone && fileInput) {
        uploadZone.onclick = () => fileInput.click();
        
        uploadZone.ondragover = (e) => { e.preventDefault(); uploadZone.style.background = '#f0f0f0'; };
        uploadZone.ondragleave = (e) => { e.preventDefault(); uploadZone.style.background = ''; };
        uploadZone.ondrop = (e) => {
            e.preventDefault();
            uploadZone.style.background = '';
            if (e.dataTransfer.files.length) handleGlobalUpload(e.dataTransfer.files);
        };
        
        fileInput.onchange = (e) => {
            if (e.target.files.length) handleGlobalUpload(e.target.files);
        };
        
        function handleGlobalUpload(files) {
            const textarea = document.getElementById('cms-gallery-urls');
            if (!textarea) return;
            
            const msg = document.getElementById('msg-box');
            if (msg) {
                msg.querySelector('div').innerText = `갤러리 이미지 처리 중...`;
                msg.style.display = 'block';
            }
            
            let processed = 0;
            let keys = [];
            for(let i=0; i<files.length; i++) {
                if(!files[i].type.startsWith('image/')) {
                    processed++;
                    continue;
                }
                window.processImageUpload(files[i], (key) => {
                    keys.push(key);
                    processed++;
                    if (processed === files.length) {
                        const currentVal = textarea.value.trim();
                        const newVal = currentVal ? currentVal + '\n' + keys.join('\n') : keys.join('\n');
                        textarea.value = newVal;
                        
                        if (msg) {
                            msg.querySelector('div').innerText = `갤러리 이미지 업로드 완료! '저장' 버튼을 눌러 확정하세요.`;
                            setTimeout(() => { msg.style.display = 'none'; }, 3000);
                        }
                        fileInput.value = '';
                    }
                });
            }
        }
    }
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

window.processImageUpload = (file, callback) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1200;
            const MAX_HEIGHT = 1200;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
            } else {
                if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            let localImages = JSON.parse(localStorage.getItem('bmm_local_images') || '{}');
            const key = 'local_' + Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9.-]/g, '');
            
            try {
                localImages[key] = dataUrl;
                localStorage.setItem('bmm_local_images', JSON.stringify(localImages));
                callback(key);
            } catch (err) {
                alert('저장 공간이 부족합니다(LocalStorage Quota 초과). 로컬에서는 최대 5MB 정도만 임시 보관이 가능합니다.');
            }
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
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
function initAdminNotices() {
    const listBody = document.getElementById('cms-notice-list-body');
    if (!listBody) return;
    const content = JSON.parse(localStorage.getItem('siteContent_v3')) || DEFAULT_CONTENT;
    listBody.innerHTML = (content.notices || []).map((n, idx) => `
        <tr>
            <td>${n.date}</td>
            <td><strong>${n.title}</strong></td>
            <td><button class="delete-btn" onclick="window.deleteNotice(${idx})">삭제</button></td>
        </tr>
    `).join('');
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

function initSpaceStatus() {
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
 * Inquiry Detail Modal Logic
 */
window.showInquiryDetail = function(idx) {
    const list = JSON.parse(localStorage.getItem('inquiryList') || '[]');
    const item = list[idx];
    if (!item) return;

    const modal = document.getElementById('inquiry-detail-modal');
    const body = document.getElementById('detail-modal-body');
    
    body.innerHTML = `
        <div style="border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div>
                <span style="font-size: 0.75rem; letter-spacing: 0.1em; color: #888; text-transform: uppercase;">Registration Number</span>
                <h4 style="margin: 5px 0 0; font-size: 1.4rem; font-family: 'Fraunces', serif;">INQ-${2026000 + idx}</h4>
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
                    <strong>${item.period || (item.startDate + ' ~ ' + item.endDate)}</strong><br>
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
    document.getElementById('btn-confirm-inq').onclick = () => window.confirmInquiry(idx);
    document.getElementById('btn-delete-inq').onclick = () => window.deleteInquiry(idx);
    
    // Add Estimate View Button in Modal (Injecting a new button)
    const footer = modal.querySelector('.modal-footer');
    if (footer && !document.getElementById('btn-view-estimate')) {
        const estBtn = document.createElement('button');
        estBtn.id = 'btn-view-estimate';
        estBtn.className = 'save-btn';
        estBtn.style = 'background:#555; color:#fff; padding:10px 25px; margin-right:10px;';
        estBtn.innerText = '견적서 생성';
        estBtn.onclick = () => window.openEstimate(idx);
        footer.insertBefore(estBtn, document.getElementById('btn-confirm-inq'));
    }
};

window.openEstimate = (idx) => {
    const list = JSON.parse(localStorage.getItem('inquiryList') || '[]');
    const inq = list[idx];
    if (!inq) return;

    const modal = document.getElementById('estimate-modal');
    modal.style.display = 'block';

    // Fill Estimate Data
    document.getElementById('est-receiver').innerText = `${inq.company || inq.name} 귀하`;
    document.getElementById('est-date').innerText = inq.date || new Date().toLocaleDateString();

    // Rates (Standard)
    const rates = { 'Reception Hall': 3500000, 'Grand Main Hall': 8500000, 'Private Studio': 2500000 };
    let html = '';
    let total = 0;
    const halls = inq.halls || [];
    
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

window.confirmInquiry = function(idx) {
    let list = JSON.parse(localStorage.getItem('inquiryList') || '[]');
    if (list[idx]) {
        list[idx].status = 'confirmed';
        list[idx].manager = document.getElementById('inq-manager').value;
        localStorage.setItem('inquiryList', JSON.stringify(list));
        window.closeInquiryDetail();
        initAdminDashboard();
        alert(`예약이 확정되었으며, 담당자(${list[idx].manager})가 지정되었습니다.`);
    }
};

window.deleteInquiry = function(idx) {
    if (confirm('해당 대관 문의 내역을 정말 삭제하시겠습니까?')) {
        let list = JSON.parse(localStorage.getItem('inquiryList') || '[]');
        list.splice(idx, 1);
        localStorage.setItem('inquiryList', JSON.stringify(list));
        window.closeInquiryDetail();
        initAdminDashboard();
    }
};

/**
 * Notice & Contact Rendering
 */
function renderNotices() {
    const container = document.getElementById('public-notice-list');
    if (!container) return;
    const saved = JSON.parse(localStorage.getItem('siteContent_v3')) || {};
    const content = { ...DEFAULT_CONTENT, ...saved };
    const notices = (content.notices && content.notices.length > 0) ? content.notices : DEFAULT_CONTENT.notices;
    
    container.innerHTML = notices.length ? notices.map(n => `
        <div class="notice-entry">
            <div class="notice-header-bar" onclick="this.parentElement.classList.toggle('active')">
                <div class="notice-date">${n.date}</div>
                <div class="notice-title-box">
                    ${n.urgent ? '<span class="urgent-tag">중요</span>' : ''}
                    <h3 class="notice-title">${n.title}</h3>
                </div>
                <div class="notice-chevron"></div>
            </div>
            <div class="notice-body">
                <div class="notice-content-inner">
                    <p>${n.content.replace(/\n/g, '<br>')}</p>
                </div>
            </div>
        </div>
    `).join('') : '<div class="empty-state" style="padding:100px; text-align:center; color:#999;">등록된 공지사항이 없습니다.</div>';
}

function renderContactInfo() {
    const saved = JSON.parse(localStorage.getItem('siteContent_v3')) || {};
    const content = { ...DEFAULT_CONTENT, ...saved };
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
        if (el) el.innerText = els[id];
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

