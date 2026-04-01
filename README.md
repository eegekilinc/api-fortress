# API FORTRESS
Secure REST API Design Patterns – Hacker vs Defender Eğitim Platformu

##  Proje Tanımı

Yazılım güvenliği için tasarlanmış bir eğitim platformudur. 
Sistem, aynı işlevlere sahip iki ayrı REST API servisi üzerinden çalışır:

-  api-insecure → Bilinçli olarak güvenlik açıkları içeren servis
-  api-secure → Aynı endpoint’lerin güvenli şekilde implemente edilmiş versiyonu

Amaç hem saldırı (Hacker modu) hem savunma (Defender modu) deneyimleyebilmesini sağlamaktır.

---

##  Hafta 1–2 Çıktıları (Prototype Aşaması)

Bu aşamada aşağıdaki hedefler başarıyla tamamlanmıştır:

- İki ayrı REST API servisi ayağa kaldırıldı
- Ortak veri modeli (User, Item) oluşturuldu
- JWT tabanlı authentication sistemi kuruldu
- Protected endpoint mantığı çalışır hale getirildi
- SQLite veritabanı entegrasyonu tamamlandı
- CRUD işlemleri doğrulandı

---

## Mimari Yapı

services/
 ├── common/        → Ortak config, db, models, auth utils
 ├── api_insecure/  → Güvensiz API servisi
 └── api_secure/    → Güvenli API servisi

Her iki servis de aynı veri modelini kullanır. 
Gelecek haftalarda insecure servis üzerinde güvenlik açıkları eklenecek ve secure servis üzerinde bu açıkların güvenli implementasyonları gösterilecektir.

---

##  Çalıştırma Talimatı

1. Sanal ortam oluştur:
py -m venv .venv
.\.venv\Scripts\Activate.ps1

2. Paketleri yükle:
pip install -r services/api_insecure/requirements.txt

3. Insecure API çalıştır:
$env:FLASK_APP="services.api_insecure.app:app"
flask run --port 5001

4. Secure API çalıştır:
$env:FLASK_APP="services.api_secure.app:app"
flask run --port 5002

---

##  Servis Portları

api-insecure  → 5001  
api-secure    → 5002  

---

##  Authentication Yapısı

- JWT tabanlı authentication
- POST /auth/register
- POST /auth/login
- Authorization: Bearer <token>

Protected endpoint örneği:
GET /users/me

---

##  Mevcut Endpointler

GET    /health  
POST   /auth/register  
POST   /auth/login  
GET    /users/me  
POST   /items  
GET    /items  

---

##  Sonraki Aşama (Hafta 3–4 Planı)

- Authentication Bypass senaryosu
- IDOR (Insecure Direct Object Reference)
- Rate Limiting eksikliği
- Zafiyet – Fix karşılaştırmalı implementasyon
- CTF görev tasarımı

---

##  Proje Ekibi

- Ege Kılınç
- Enes Deniz

---

