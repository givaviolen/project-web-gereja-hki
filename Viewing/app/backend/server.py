from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
import uuid
import io
import csv
from contextlib import asynccontextmanager
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
import jwt
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Query
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field


# ---------- Logging ----------
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ---------- Mongo ----------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_ALGORITHM = "HS256"


# ---------- Auth helpers ----------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "access",
    }
    return jwt.encode(payload, os.environ["JWT_SECRET"], algorithm=JWT_ALGORITHM)


async def get_current_user(
    request: Request,
    creds: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
) -> dict:
    token = creds.credentials if creds else None
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Tidak terautentikasi")
    try:
        payload = jwt.decode(token, os.environ["JWT_SECRET"], algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Pengguna tidak ditemukan")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token kedaluwarsa")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token tidak valid")


# ---------- Models ----------
class LoginInput(BaseModel):
    email: str
    password: str


class JemaatBase(BaseModel):
    nama_lengkap: str
    jenis_kelamin: str
    alamat: str
    wijk: str
    status_keanggotaan: str
    no_hp: str = ""


class JemaatCreate(JemaatBase):
    pass


class JemaatOut(JemaatBase):
    id: str
    created_at: str


class DailyVerse(BaseModel):
    text_id: str
    text_bbc: str
    reference: str


class News(BaseModel):
    title_id: str
    title_bbc: str = ""
    content_id: str
    content_bbc: str = ""
    image_url: str = ""
    category: str = "berita"


class NewsOut(News):
    id: str
    created_at: str


class Schedule(BaseModel):
    nama_ibadah_id: str
    nama_ibadah_bbc: str
    waktu: str
    hari: str
    pelayan_firman: str = ""
    deskripsi_id: str = ""
    deskripsi_bbc: str = ""
    icon: str = "church"


class ScheduleOut(Schedule):
    id: str


class GalleryItem(BaseModel):
    media_url: str
    caption: str = ""
    type: str = "photo"


class GalleryOut(GalleryItem):
    id: str
    created_at: str


class LiveStream(BaseModel):
    youtube_id: str = ""
    is_live: bool = False
    title: str = ""


# ---------- Seed data ----------
SAMPLE_JEMAAT = [
    ("Marlon Sianipar", "Laki-laki", "Jl. Sisingamangaraja 12, Laguboti", "Wijk I", "Aktif", "081234567801"),
    ("Tiur Hutagalung", "Perempuan", "Jl. Pelabuhan 5, Laguboti", "Wijk I", "Aktif", "081234567802"),
    ("Roy Simanjuntak", "Laki-laki", "Jl. Pendidikan 8, Laguboti", "Wijk II", "Aktif", "081234567803"),
    ("Mariana Tampubolon", "Perempuan", "Jl. Gereja 3, Laguboti", "Wijk II", "Aktif", "081234567804"),
    ("Parlin Sirait", "Laki-laki", "Jl. Pasar 21, Laguboti", "Wijk III", "Aktif", "081234567805"),
    ("Risma Manurung", "Perempuan", "Jl. Sekolah 11, Laguboti", "Wijk III", "Pindah", "081234567806"),
    ("Hotman Pardede", "Laki-laki", "Jl. Tarutung 7, Laguboti", "Wijk IV", "Aktif", "081234567807"),
    ("Lasma Hutapea", "Perempuan", "Jl. Balige 14, Laguboti", "Wijk IV", "Aktif", "081234567808"),
    ("Bonar Silitonga", "Laki-laki", "Jl. Sipoholon 6, Laguboti", "Wijk V", "Meninggal", "081234567809"),
    ("Nurma Sitanggang", "Perempuan", "Jl. Tomok 9, Laguboti", "Wijk V", "Aktif", "081234567810"),
    ("Daniel Simbolon", "Laki-laki", "Jl. Porsea 4, Laguboti", "Wijk I", "Aktif", "081234567811"),
    ("Esther Lumbantobing", "Perempuan", "Jl. Soposurung 17, Laguboti", "Wijk II", "Aktif", "081234567812"),
]

SAMPLE_SCHEDULES = [
    {
        "nama_ibadah_id": "Ibadah Minggu", "nama_ibadah_bbc": "Partangiangan Minggu",
        "hari": "Minggu", "waktu": "09.00 WIB", "pelayan_firman": "Pdt. Tigor Simanjuntak, S.Th",
        "deskripsi_id": "Ibadah umum jemaat HKI Laguboti setiap hari Minggu pagi.",
        "deskripsi_bbc": "Partangiangan na umum ni jemaat HKI Laguboti ganup ari Minggu sogot.",
        "icon": "church",
    },
    {
        "nama_ibadah_id": "Sekolah Minggu", "nama_ibadah_bbc": "Sikola Minggu",
        "hari": "Minggu", "waktu": "08.00 WIB", "pelayan_firman": "Tim Guru Sekolah Minggu",
        "deskripsi_id": "Ibadah khusus anak-anak dengan cerita Alkitab dan pujian.",
        "deskripsi_bbc": "Partangiangan na khusus ni dakdanak rap dohot turi-turian ni Bibel.",
        "icon": "baby",
    },
    {
        "nama_ibadah_id": "Ibadah Naposobulung", "nama_ibadah_bbc": "Partangiangan Naposobulung",
        "hari": "Sabtu", "waktu": "18.30 WIB", "pelayan_firman": "Pdt. Tigor Simanjuntak, S.Th",
        "deskripsi_id": "Persekutuan pemuda-pemudi gereja dengan tema yang relevan.",
        "deskripsi_bbc": "Parsaoran ni naposobulung rap dohot tema na patut.",
        "icon": "users",
    },
    {
        "nama_ibadah_id": "Doa Malam", "nama_ibadah_bbc": "Tangiang Borngin",
        "hari": "Rabu", "waktu": "19.00 WIB", "pelayan_firman": "Sintua Jonggi Hutabarat",
        "deskripsi_id": "Persekutuan doa pertengahan minggu di rumah jemaat secara bergilir.",
        "deskripsi_bbc": "Parsaoran tangiang di parsitongaan ni minggu di jabu ni jemaat.",
        "icon": "moon",
    },
]

SAMPLE_NEWS = [
    {
        "title_id": "Perayaan Natal Jemaat 2025", "title_bbc": "Pesta Natal ni Jemaat 2025",
        "content_id": "Jemaat HKI Laguboti telah merayakan Natal bersama dengan penuh sukacita pada 25 Desember 2025.",
        "content_bbc": "Jemaat HKI Laguboti nunga marpesta Natal rap di tanggal 25 Desember 2025.",
        "image_url": "https://images.pexels.com/photos/34504326/pexels-photo-34504326.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "category": "berita",
    },
    {
        "title_id": "Renungan Harian: Hidup dalam Pengharapan", "title_bbc": "Renungan Ari-ari: Mangolu di Pangkirimon",
        "content_id": "Roma 5:5 — Pengharapan tidak mengecewakan karena kasih Allah telah dicurahkan dalam hati kita.",
        "content_bbc": "Roma 5:5 — Pangkirimon i ndang mambahen huaila.",
        "image_url": "https://images.unsplash.com/photo-1623466453010-1ecb0e6d494a?crop=entropy&cs=srgb&fm=jpg&q=85",
        "category": "renungan",
    },
    {
        "title_id": "Bakti Sosial Sektor Wijk II", "title_bbc": "Ulaon Bakti Sosial Wijk II",
        "content_id": "Wijk II mengadakan bakti sosial pembersihan halaman gereja dan kunjungan kepada jemaat lansia.",
        "content_bbc": "Wijk II patupahon ulaon paias halaman ni gareja dohot manopot natuatua.",
        "image_url": "https://images.pexels.com/photos/29422232/pexels-photo-29422232.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "category": "berita",
    },
]

SAMPLE_GALLERY = [
    {"media_url": "https://images.unsplash.com/photo-1767897672315-1e551e4eabfb?crop=entropy&cs=srgb&fm=jpg&q=85", "caption": "Gedung Gereja HKI Laguboti", "type": "photo"},
    {"media_url": "https://images.pexels.com/photos/34504326/pexels-photo-34504326.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", "caption": "Ibadah Minggu", "type": "photo"},
    {"media_url": "https://images.pexels.com/photos/29422232/pexels-photo-29422232.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", "caption": "Khotbah Minggu", "type": "photo"},
    {"media_url": "https://images.unsplash.com/photo-1623466453010-1ecb0e6d494a?crop=entropy&cs=srgb&fm=jpg&q=85", "caption": "Pendalaman Alkitab", "type": "photo"},
]


# ---------- Lifespan (menggantikan @app.on_event yang deprecated) ----------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        await db.users.create_index("email", unique=True)
        await db.jemaat.create_index("nama_lengkap")
        await db.jemaat.create_index("wijk")
        await db.news.create_index("created_at")
    except Exception as e:
        logger.warning(f"Index creation skipped: {e}")

    admin_email = os.environ.get("ADMIN_EMAIL", "admin@hkilaguboti.id").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Administrator",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Seeded admin user: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}},
        )
        logger.info("Updated admin password hash")

    if await db.jemaat.count_documents({}) == 0:
        docs = []
        for nama, jk, alamat, wijk, status, hp in SAMPLE_JEMAAT:
            docs.append({
                "id": str(uuid.uuid4()), "nama_lengkap": nama, "jenis_kelamin": jk,
                "alamat": alamat, "wijk": wijk, "status_keanggotaan": status,
                "no_hp": hp, "created_at": datetime.now(timezone.utc).isoformat(),
            })
        await db.jemaat.insert_many(docs)
        logger.info(f"Seeded {len(docs)} jemaat")

    if await db.schedules.count_documents({}) == 0:
        docs = [{**s, "id": str(uuid.uuid4())} for s in SAMPLE_SCHEDULES]
        await db.schedules.insert_many(docs)

    if await db.news.count_documents({}) == 0:
        docs = [
            {**n, "id": str(uuid.uuid4()), "created_at": (datetime.now(timezone.utc) - timedelta(days=i)).isoformat()}
            for i, n in enumerate(SAMPLE_NEWS)
        ]
        await db.news.insert_many(docs)

    if await db.gallery.count_documents({}) == 0:
        docs = [{**g, "id": str(uuid.uuid4()), "created_at": datetime.now(timezone.utc).isoformat()} for g in SAMPLE_GALLERY]
        await db.gallery.insert_many(docs)

    if not await db.daily_verse.find_one({"id": "current"}):
        await db.daily_verse.update_one(
            {"id": "current"},
            {"$set": {
                "id": "current",
                "text_id": "Sebab karena kasih karunia kamu diselamatkan oleh iman; itu bukan hasil usahamu, tetapi pemberian Allah.",
                "text_bbc": "Ai marhitehite asi ni roha hamu dipalua marhitehite haporseaon; ndada hasil ni ulaonmuna, anggia silehonlehon ni Debata do i.",
                "reference": "Efesus 2:8",
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }},
            upsert=True,
        )

    if not await db.live_stream.find_one({"id": "current"}):
        await db.live_stream.update_one(
            {"id": "current"},
            {"$set": {"id": "current", "youtube_id": "jfKfPfyJRdk", "is_live": False, "title": "Ibadah Minggu HKI Laguboti"}},
            upsert=True,
        )

    yield  # aplikasi berjalan di sini

    # Shutdown
    client.close()


# ---------- App ----------
app = FastAPI(title="HKI Laguboti API", lifespan=lifespan)
api_router = APIRouter(prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Auth routes ----------
@api_router.post("/auth/login")
async def login(payload: LoginInput):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email atau kata sandi salah")
    token = create_access_token(user["id"], user["email"])
    return {
        "token": token,
        "user": {"id": user["id"], "email": user["email"], "name": user.get("name", "Admin"), "role": user.get("role", "admin")},
    }


@api_router.get("/auth/me")
async def me(current=Depends(get_current_user)):
    return current


@api_router.post("/auth/logout")
async def logout(current=Depends(get_current_user)):
    return {"message": "Berhasil keluar"}


# ---------- Jemaat ----------
@api_router.get("/jemaat", response_model=List[JemaatOut])
async def list_jemaat(
    search: Optional[str] = Query(None),
    wijk: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    current=Depends(get_current_user),
):
    q: dict = {}
    if search:
        q["nama_lengkap"] = {"$regex": search, "$options": "i"}
    if wijk and wijk != "semua":
        q["wijk"] = wijk
    if status and status != "semua":
        q["status_keanggotaan"] = status
    items = await db.jemaat.find(q, {"_id": 0}).sort("nama_lengkap", 1).to_list(2000)
    return items


@api_router.post("/jemaat", response_model=JemaatOut)
async def create_jemaat(payload: JemaatCreate, current=Depends(get_current_user)):
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.jemaat.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.put("/jemaat/{jid}", response_model=JemaatOut)
async def update_jemaat(jid: str, payload: JemaatCreate, current=Depends(get_current_user)):
    res = await db.jemaat.find_one_and_update(
        {"id": jid}, {"$set": payload.model_dump()}, return_document=True
    )
    if not res:
        raise HTTPException(status_code=404, detail="Data jemaat tidak ditemukan")
    res.pop("_id", None)
    return res


@api_router.delete("/jemaat/{jid}")
async def delete_jemaat(jid: str, current=Depends(get_current_user)):
    res = await db.jemaat.delete_one({"id": jid})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Data jemaat tidak ditemukan")
    return {"message": "Data jemaat dihapus"}


@api_router.get("/jemaat-stats")
async def jemaat_stats(current=Depends(get_current_user)):
    total = await db.jemaat.count_documents({})
    by_wijk = [{"wijk": x["_id"], "count": x["count"]} for x in
               await db.jemaat.aggregate([{"$group": {"_id": "$wijk", "count": {"$sum": 1}}}, {"$sort": {"_id": 1}}]).to_list(100)]
    by_status = [{"status": x["_id"], "count": x["count"]} for x in
                 await db.jemaat.aggregate([{"$group": {"_id": "$status_keanggotaan", "count": {"$sum": 1}}}]).to_list(100)]
    by_gender = [{"jenis_kelamin": x["_id"], "count": x["count"]} for x in
                 await db.jemaat.aggregate([{"$group": {"_id": "$jenis_kelamin", "count": {"$sum": 1}}}]).to_list(100)]
    return {"total": total, "by_wijk": by_wijk, "by_status": by_status, "by_gender": by_gender}


@api_router.get("/jemaat-export")
async def export_jemaat(current=Depends(get_current_user)):
    items = await db.jemaat.find({}, {"_id": 0}).sort("nama_lengkap", 1).to_list(5000)
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["Nama Lengkap", "Jenis Kelamin", "Alamat", "Wijk", "Status", "No HP", "Tanggal Daftar"])
    for j in items:
        writer.writerow([j.get(k, "") for k in ("nama_lengkap", "jenis_kelamin", "alamat", "wijk", "status_keanggotaan", "no_hp", "created_at")])
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=data-jemaat.csv"},
    )


# ---------- Public ----------
@api_router.get("/public/daily-verse")
async def get_daily_verse():
    doc = await db.daily_verse.find_one({"id": "current"}, {"_id": 0})
    return doc or {"text_id": "", "text_bbc": "", "reference": ""}


@api_router.get("/public/schedules", response_model=List[ScheduleOut])
async def get_schedules():
    return await db.schedules.find({}, {"_id": 0}).to_list(100)


@api_router.get("/public/news", response_model=List[NewsOut])
async def get_news(category: Optional[str] = None, limit: int = 20):
    q = {"category": category} if category else {}
    return await db.news.find(q, {"_id": 0}).sort("created_at", -1).to_list(limit)


@api_router.get("/public/news/{nid}", response_model=NewsOut)
async def get_news_item(nid: str):
    item = await db.news.find_one({"id": nid}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Artikel tidak ditemukan")
    return item


@api_router.get("/public/gallery", response_model=List[GalleryOut])
async def get_gallery():
    return await db.gallery.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)


@api_router.get("/public/live-stream")
async def get_live_stream():
    doc = await db.live_stream.find_one({"id": "current"}, {"_id": 0})
    return doc or {"youtube_id": "", "is_live": False, "title": ""}


# ---------- Admin ----------
@api_router.put("/admin/daily-verse")
async def update_daily_verse(payload: DailyVerse, current=Depends(get_current_user)):
    doc = {**payload.model_dump(), "id": "current", "updated_at": datetime.now(timezone.utc).isoformat()}
    await db.daily_verse.update_one({"id": "current"}, {"$set": doc}, upsert=True)
    doc.pop("_id", None)
    return doc


@api_router.post("/admin/news", response_model=NewsOut)
async def create_news(payload: News, current=Depends(get_current_user)):
    doc = {**payload.model_dump(), "id": str(uuid.uuid4()), "created_at": datetime.now(timezone.utc).isoformat()}
    await db.news.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.put("/admin/news/{nid}", response_model=NewsOut)
async def update_news(nid: str, payload: News, current=Depends(get_current_user)):
    res = await db.news.find_one_and_update({"id": nid}, {"$set": payload.model_dump()}, return_document=True)
    if not res:
        raise HTTPException(status_code=404, detail="Artikel tidak ditemukan")
    res.pop("_id", None)
    return res


@api_router.delete("/admin/news/{nid}")
async def delete_news(nid: str, current=Depends(get_current_user)):
    res = await db.news.delete_one({"id": nid})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Artikel tidak ditemukan")
    return {"message": "Artikel dihapus"}


@api_router.put("/admin/live-stream")
async def update_live_stream(payload: LiveStream, current=Depends(get_current_user)):
    doc = {**payload.model_dump(), "id": "current"}
    await db.live_stream.update_one({"id": "current"}, {"$set": doc}, upsert=True)
    doc.pop("_id", None)
    return doc


# ---------- Health ----------
@api_router.get("/")
async def root():
    return {"message": "HKI Laguboti API"}


app.include_router(api_router)