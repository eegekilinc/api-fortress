# API Fortress

## Secure REST API Design Patterns — Hacker vs Defender Platformu

API Fortress, REST API güvenlik açıklarını uygulamalı olarak göstermek amacıyla geliştirilmiş bir eğitim ve laboratuvar platformudur. Sistem, aynı işlevleri sunan iki ayrı backend servisi içerir:

* **api_insecure**: Bilinçli olarak güvenlik açıkları barındıran sürüm
* **api_secure**: Aynı endpoint’lerin güvenli şekilde uygulanmış sürümü

Bu yapı sayesinde kullanıcılar hem saldırı senaryolarını hem de bu senaryoların güvenli karşılıklarını aynı proje üzerinde karşılaştırmalı biçimde inceleyebilir.

---

## Proje Amacı

Bu projenin temel amacı:

* modern API güvenlik açıklarını görünür hale getirmek
* insecure ve secure implementasyon farkını karşılaştırmalı sunmak
* kimlik doğrulama, yetkilendirme ve veri sızıntısı problemlerini uygulamalı göstermek
* bitirme projesi kapsamında hem teknik hem görsel olarak güçlü bir güvenlik laboratuvarı ortaya koymaktır

---

## Kullanılan Teknolojiler

### Backend

* Flask
* Flask-SQLAlchemy
* Flask-CORS
* PyJWT
* SQLite

### Frontend

* React
* Vite
* TypeScript
* Tailwind CSS

### Dağıtım / Çalıştırma

* Docker
* Docker Compose

---

## Sistem Bileşenleri

```text
api-fortress/
├── services/
│   ├── common/
│   ├── api_insecure/
│   └── api_secure/
├── frontend/
├── docker-compose.yml
├── .gitignore
├── .dockerignore
└── README.md
```

---

## Tek Komutla Çalıştırma

Projeyi çalıştırmak için yalnızca Docker Desktop kurulu olması yeterlidir.

### Başlatma

```bash
docker compose up --build -d
```

### Durdurma

```bash
docker compose down
```

### Temiz yeniden başlatma

```bash
docker compose down --remove-orphans
docker compose up --build -d
```

---

## Erişim Adresleri

Sistem ayağa kalktıktan sonra aşağıdaki adreslerden erişilebilir:

* Frontend: `http://localhost:5173`
* Insecure API: `http://localhost:5001`
* Secure API: `http://localhost:5002`

### Health Check

* `http://localhost:5001/health`
* `http://localhost:5002/health`

---

## Kullanım Akışı

1. Frontend arayüzü üzerinden API modu seçilir:

   * Insecure
   * Secure

2. Kullanıcı kayıt olur veya giriş yapar

3. Dashboard ekranında:

   * aktif API modu
   * kullanıcı bilgisi
   * insecure ve secure servis sağlık durumu
   * CTF görev kartları
     görüntülenir

4. Her görev kartı seçildiğinde ilgili güvenlik senaryosunun detayları açılır

---

## CTF Senaryoları

Projede aşağıdaki senaryolar yer almaktadır:

### 1. Mass Assignment ile Yetki Yükseltme

`POST /auth/register`

İstemciden gelen ayrıcalıklı alanların filtrelenmeden uygulanması sonucu kullanıcının kendisini yetkili rol ile oluşturabilmesi.

### 2. Kimlik Doğrulama Atlama (Backdoor Header)

`POST /auth/login`

Gizli bir HTTP header kullanılarak parola doğrulamasının atlanabilmesi.

### 3. Kimlik Doğrulama Mantık Hatası

`POST /auth/login`

Parola alanı gönderilmeden giriş yapılabilmesi.

### 4. IDOR / BOLA ile Veri Erişimi

`GET /users/<id>`

Kullanıcı kimliği değiştirilerek başka kullanıcı kayıtlarına erişilebilmesi.

### 5. Broken Function Level Authorization

`DELETE /users/<id>`

Yetkisiz kullanıcıların kritik silme işlemlerini gerçekleştirebilmesi.

---

## Secure Tarafında Gösterilen Yaklaşımlar

Secure API tarafında aşağıdaki savunma prensipleri uygulanmıştır:

* istemciden gelen ayrıcalıklı alanların yok sayılması
* gizli header / backdoor kaldırılması
* parola zorunluluğu
* nesne düzeyinde yetki kontrolü
* işlev düzeyinde yetki kontrolü
* hassas alanların API yanıtlarından çıkarılması

---

## Frontend Özellikleri

Frontend arayüzü aşağıdaki özellikleri içerir:

* modern ve koyu tema tasarım
* insecure / secure mod geçişi
* login / register ekranı
* kullanıcı dashboard’u
* servis sağlık durumu kartları
* CTF görev kartları
* görev detay modalı
* insecure ve secure davranışların görsel karşılaştırması

---

## Veri Kalıcılığı Hakkında Not

Bu proje eğitim ve test amaçlı olarak SQLite kullanmaktadır. Docker container’ları tamamen kaldırılıp yeniden oluşturulduğunda veritabanı sıfırlanabilir. Bu davranış, laboratuvar senaryolarını temiz başlangıçla tekrar etmek için bilinçli olarak kabul edilmiştir.

---

## Repoyu Klonlayanlar İçin

Projeyi klonlayan bir kullanıcı aşağıdaki adımlarla sistemi ayağa kaldırabilir:

```bash
git clone <repo-url>
cd api-fortress
docker compose up --build -d
```

Ardından `http://localhost:5173` adresinden uygulamaya erişebilir.

---

## Geliştirme Notu

Bu proje bitirme projesi kapsamında;

* güvenlik odaklı backend tasarımı
* karşılaştırmalı insecure / secure yaklaşımı
* modern frontend arayüzü
* Docker tabanlı tek komutla çalıştırma

hedefleri doğrultusunda geliştirilmiştir.

---

## Uyarı

Bu proje yalnızca eğitim amaçlıdır. Gerçek sistemlerde veya yetkisiz ortamlarda kullanılmamalıdır.

---

## Proje Ekibi

* Enes Deniz
* Ege Kılıç
