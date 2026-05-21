const express = require('express');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');
const { Storage } = require('@google-cloud/storage');
const { Firestore } = require('@google-cloud/firestore');

const app = express();
const PORT = process.env.PORT || 8080;
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'gangnam-x-cube-site';
const BUCKET_NAME = process.env.GCS_BUCKET || 'gangnam-x-cube-site-media';

const storage = new Storage({ projectId: PROJECT_ID });
const db = new Firestore({ projectId: PROJECT_ID });

// ─────────────────────────────────────────────
// SMTP Mail Transporter Config
// ─────────────────────────────────────────────
const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT || '587');
const smtpSecure = process.env.SMTP_SECURE === 'true'; // true for 465, false for 587
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const notificationEmails = process.env.NOTIFICATION_EMAILS || 'info@planningkorea.com';

let mailTransporter = null;
if (smtpHost && smtpUser && smtpPass) {
    mailTransporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
            user: smtpUser,
            pass: smtpPass
        }
    });
    console.log('📬 SMTP Mail Transporter configured successfully');
} else {
    console.log('⚠️ SMTP environment variables missing. Email alerts are disabled.');
}

async function sendInquiryEmail(inquiry) {
    if (!mailTransporter) {
        console.log('⚠️ Mail transporter is not configured. Skipping email notification.');
        return;
    }

    try {
        const recipients = notificationEmails.split(',').map(email => email.trim());
        
        const htmlContent = `
        <div style="font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; padding: 25px; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px; color: #1a202c; line-height: 1.6;">
            <div style="text-align: center; margin-bottom: 25px;">
                <h2 style="color: #0f172a; margin: 0 0 10px 0; font-size: 1.5rem; font-weight: 800; letter-spacing: -0.025em; border-bottom: 2px solid #0f172a; padding-bottom: 15px;">
                    🔔 GANGNAM X CUBE 대관 신청
                </h2>
            </div>
            
            <p style="font-size: 1rem; color: #475569; margin-bottom: 20px;">
                새로운 대관 문의가 접수되었습니다. 아래 내용을 확인해 주세요.
            </p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 25px; font-size: 0.95rem;">
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 12px 8px; font-weight: 700; color: #64748b; width: 120px;">행사명</td>
                    <td style="padding: 12px 8px; color: #0f172a; font-weight: 600;">${inquiry.eventName || '-'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 12px 8px; font-weight: 700; color: #64748b;">신청자 (주최사)</td>
                    <td style="padding: 12px 8px; color: #0f172a;">${inquiry.name || '-'} ${inquiry.company ? `(${inquiry.company})` : ''}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 12px 8px; font-weight: 700; color: #64748b;">연락처</td>
                    <td style="padding: 12px 8px; color: #0f172a;">${inquiry.phone || '-'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 12px 8px; font-weight: 700; color: #64748b;">이메일</td>
                    <td style="padding: 12px 8px; color: #0f172a;">${inquiry.email || '-'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 12px 8px; font-weight: 700; color: #64748b;">행사 기간</td>
                    <td style="padding: 12px 8px; color: #0f172a;">${inquiry.dateStart || '-'} ~ ${inquiry.dateEnd || '-'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 12px 8px; font-weight: 700; color: #64748b;">예상 인원</td>
                    <td style="padding: 12px 8px; color: #0f172a;">${inquiry.attendees || '-'}명</td>
                </tr>
            </table>
            
            <div style="margin-top: 20px; padding: 20px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                <strong style="display: block; font-size: 0.95rem; color: #334155; margin-bottom: 8px;">상세 문의내용:</strong>
                <p style="white-space: pre-wrap; margin: 0; color: #475569; font-size: 0.9rem;">${inquiry.message || '입력된 내용이 없습니다.'}</p>
            </div>
            
            <div style="margin-top: 30px; text-align: center;">
                <a href="https://gangnamxcube.com/admin" style="background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 700; font-size: 0.95rem; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    관리자 페이지로 이동
                </a>
            </div>
        </div>
        `;

        const mailOptions = {
            from: `"GANGNAM X CUBE" <${smtpUser}>`,
            to: recipients.join(', '),
            subject: `[GANGNAM X CUBE] 새로운 대관 신청이 있습니다. (${inquiry.name || '문의'})`,
            html: htmlContent
        };

        const info = await mailTransporter.sendMail(mailOptions);
        console.log(`📩 이메일 알림 전송 성공: ${info.messageId} (수신처: ${recipients.join(', ')})`);
    } catch (err) {
        console.error('❌ 이메일 전송 오류:', err);
    }
}

// Multer: 메모리 임시 저장, 최대 15MB
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 15 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        // 이미지 및 일반 대관자료 문서(PDF, SKP, ZIP, Word, Excel 등) 허용
        const allowedExtensions = /\.(png|jpg|jpeg|gif|pdf|doc|docx|xls|xlsx|zip|skp)$/i;
        const allowedMimetypes = [
            'image/',
            'application/pdf',
            'application/zip',
            'application/x-zip-compressed',
            'application/octet-stream', // SKP 등 일반 바이너리용
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        
        const isAllowed = allowedMimetypes.some(type => file.mimetype.startsWith(type)) || 
                          allowedExtensions.test(file.originalname);
        
        if (isAllowed) {
            cb(null, true);
        } else {
            cb(new Error('허용되지 않는 파일 형식입니다. (이미지, PDF, SKP, ZIP, 문서만 가능)'));
        }
    }
});

// CORS - 모든 출처 허용 (관리자 접근용)
app.use(cors({
    origin: true,
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
// ─────────────────────────────────────────────
// 파일 업로드 (이미지 & 자료실 문서) → Google Cloud Storage
// ─────────────────────────────────────────────
app.post('/upload', upload.any(), async (req, res) => {
    const uploadedFile = req.files && req.files[0];
    if (!uploadedFile) return res.status(400).json({ error: '업로드할 파일이 없습니다.' });

    try {
        const safeFileName = uploadedFile.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        
        // 파일의 타입에 따라 저장할 폴더 구분 (이미지는 gallery/, 문서는 resources/)
        const isImage = uploadedFile.mimetype.startsWith('image/');
        const folderName = isImage ? 'gallery' : 'resources';
        const destFileName = `${folderName}/${Date.now()}_${safeFileName}`;
        
        const bucket = storage.bucket(BUCKET_NAME);
        const file = bucket.file(destFileName);

        await file.save(uploadedFile.buffer, {
            contentType: uploadedFile.mimetype,
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

        // 이메일 알림 비동기 전송
        sendInquiryEmail(req.body).catch(err => console.error('이메일 비동기 전송 에러:', err));

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
