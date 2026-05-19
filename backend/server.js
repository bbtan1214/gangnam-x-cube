const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const { Firestore } = require('@google-cloud/firestore');

const app = express();
const PORT = process.env.PORT || 8080;
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'gangnam-x-cube-site';
const BUCKET_NAME = process.env.GCS_BUCKET || 'gangnam-x-cube-site-media';

const storage = new Storage({ projectId: PROJECT_ID });
const db = new Firestore({ projectId: PROJECT_ID });

// Multer: 메모리 임시 저장, 최대 15MB
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 15 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
});

// CORS
const allowedOrigins = [
    'https://gangnamxcube.com',
    'https://bbtan1214.github.io',
    'http://localhost',
    'http://127.0.0.1'
];
app.use(cors({
    origin: (origin, cb) => {
        if (!origin || allowedOrigins.some(o => origin.startsWith(o))) cb(null, true);
        else cb(new Error('CORS 차단: ' + origin));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

// ─────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({ status: 'ok', service: 'GANGNAM X CUBE API', version: '1.0.0' });
});

// ─────────────────────────────────────────────
// 이미지 업로드 → Google Cloud Storage
// ─────────────────────────────────────────────
app.post('/upload', upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: '이미지 파일이 없습니다.' });

    try {
        const safeFileName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        const destFileName = `gallery/${Date.now()}_${safeFileName}`;
        const bucket = storage.bucket(BUCKET_NAME);
        const file = bucket.file(destFileName);

        // Canvas 리사이징은 클라이언트에서 처리, 서버는 그대로 저장
        await file.save(req.file.buffer, {
            contentType: req.file.mimetype,
            metadata: { cacheControl: 'public, max-age=31536000' }
        });

        // 공개 URL
        const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${destFileName}`;
        console.log(`✅ 업로드 완료: ${publicUrl}`);
        res.json({ url: publicUrl });

    } catch (err) {
        console.error('업로드 오류:', err);
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────
// 사이트 콘텐츠 (Firestore: settings/siteContent_v3)
// ─────────────────────────────────────────────
app.get('/content', async (req, res) => {
    try {
        const snap = await db.collection('settings').doc('siteContent_v3').get();
        res.json(snap.exists ? snap.data() : {});
    } catch (err) {
        console.error('content GET 오류:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/content', async (req, res) => {
    try {
        await db.collection('settings').doc('siteContent_v3').set(req.body);
        res.json({ ok: true });
    } catch (err) {
        console.error('content POST 오류:', err);
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────
// 문의 관리 (Firestore: inquiries)
// ─────────────────────────────────────────────
app.get('/inquiries', async (req, res) => {
    try {
        const snap = await db.collection('inquiries').orderBy('createdAt', 'desc').get();
        const list = snap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate?.()?.toISOString() }));
        res.json(list);
    } catch (err) {
        console.error('inquiries GET 오류:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/inquiries', async (req, res) => {
    try {
        const docRef = await db.collection('inquiries').add({
            ...req.body,
            status: 'pending',
            createdAt: Firestore.Timestamp.now()
        });
        res.json({ id: docRef.id });
    } catch (err) {
        console.error('inquiries POST 오류:', err);
        res.status(500).json({ error: err.message });
    }
});

app.patch('/inquiries/:id', async (req, res) => {
    try {
        await db.collection('inquiries').doc(req.params.id).update(req.body);
        res.json({ ok: true });
    } catch (err) {
        console.error('inquiries PATCH 오류:', err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/inquiries/:id', async (req, res) => {
    try {
        await db.collection('inquiries').doc(req.params.id).delete();
        res.json({ ok: true });
    } catch (err) {
        console.error('inquiries DELETE 오류:', err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 GANGNAM X CUBE API 실행 중 (포트 ${PORT})`);
});
