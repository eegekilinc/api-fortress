import type { CtfTask } from "@/types";

export const ctfTasks: CtfTask[] = [
  {
    id: "mass-assignment",
    title: "Mass Assignment ile Yetki Yükseltme",
    description:
      "Kayıt sırasında istemcinin gönderdiği ayrıcalıklı alanların sunucu tarafından filtrelenmeden uygulanması.",
    tag: "OWASP API",
    vulnerabilityType: "Mass Assignment",
    targetEndpoint: "POST /auth/register",
    difficulty: "Orta",
    status: "open",
    insecureExpected:
      "JSON gövdesinde is_admin gibi alanlar kabul edilir; kullanıcı kendini yönetici yapabilir. Yanıtta uyarı alanı dönebilir.",
    secureExpected:
      "is_admin istemciden yok sayılır; yeni kullanıcı her zaman normal kullanıcı olarak oluşturulur.",
    goal:
      "İstemci tarafından gönderilen ek alanların sunucu tarafında nasıl tehlikeli sonuçlar doğurabileceğini gözlemlemek ve güvenli implementasyonda bu durumun nasıl engellendiğini anlamak.",
    procedure: `1) Insecure modunu seçin.
2) POST /auth/register endpoint'ine istek gönderin.
3) JSON body içerisine 'is_admin: true' ekleyin.
4) Oluşturulan kullanıcının rolünü gözlemleyin.
5) Aynı işlemi Secure modda tekrar edin ve sonucu karşılaştırın.`,
    exampleRequest: `POST /auth/register
Content-Type: application/json

{
  "email": "mass_lab@test.com",
  "password": "123456",
  "is_admin": true
}`,
    successCriteria:
      "Insecure API'de kullanıcı admin olarak oluşturulabilmelidir. Secure API'de ise is_admin alanı dikkate alınmamalıdır.",
    whyBlockedOnSecure:
      "Secure API, istemciden gelen is_admin alanını yok sayar ve rol atamasını yalnızca sunucu tarafında yapar.",
  },
  {
    id: "auth-bypass",
    title: "Kimlik Doğrulama Atlama (Backdoor Header)",
    description: "Gizli bir HTTP header kullanılarak parola kontrolünün atlanması.",
    tag: "Broken Auth",
    vulnerabilityType: "Hardcoded Backdoor",
    targetEndpoint: "POST /auth/login",
    difficulty: "İleri",
    status: "open",
    insecureExpected:
      "X-Magic-World: abracadabra başlığı ile parola doğrulaması atlanabilir; yanlış parola ile bile access_token dönebilir.",
    secureExpected:
      "Özel backdoor başlığı yoktur; parola her zaman doğrulanır. Yanlış kimlik bilgisinde 401 döner.",
    goal:
      "Sunucuda bırakılmış gizli mekanizmaların nasıl büyük güvenlik açıklarına yol açabileceğini göstermek.",
    procedure: `1) POST /auth/login endpoint'ine istek gönderin.
2) Header olarak 'X-Magic-World: abracadabra' ekleyin.
3) Yanlış parola ile giriş yapmayı deneyin.
4) Token alınıp alınmadığını kontrol edin.
5) Secure modda aynı işlemi tekrar edin.`,
    exampleRequest: `POST /auth/login
Content-Type: application/json
X-Magic-World: abracadabra

{
  "email": "test@test.com",
  "password": "wrong"
}`,
    successCriteria:
      "Insecure API'de yanlış parola ile token alınabilmelidir. Secure API bu isteği reddetmelidir.",
    whyBlockedOnSecure:
      "Secure API sabit header backdoor içermez ve parola doğrulaması zorunludur.",
  },
  {
    id: "login-logic-flaw",
    title: "Kimlik Doğrulama Mantık Hatası",
    description: "Parola alanı gönderilmeden giriş yapılabilmesi.",
    tag: "Broken Auth",
    vulnerabilityType: "Authentication Logic Flaw",
    targetEndpoint: "POST /auth/login",
    difficulty: "Orta",
    status: "open",
    insecureExpected:
      "password alanı gövdede yokken veya null iken bile geçerli kullanıcı için token üretilebilir.",
    secureExpected:
      "Parola zorunludur; eksik veya geçersiz gövde 400 veya 401 ile reddedilir.",
    goal:
      "Giriş mekanizmasında eksik kontrol durumlarının nasıl istismar edilebileceğini anlamak.",
    procedure: `1) POST /auth/login endpoint'ine istek gönderin.
2) JSON body içinde password alanını tamamen kaldırın.
3) Yanıtı gözlemleyin.
4) Secure modda aynı isteği test edin.`,
    exampleRequest: `POST /auth/login
Content-Type: application/json

{
  "email": "test@test.com"
}`,
    successCriteria:
      "Insecure API parola olmadan girişe izin verebilir. Secure API bu isteği reddetmelidir.",
    whyBlockedOnSecure:
      "Secure API, password alanını zorunlu kılar ve eksik istekleri kabul etmez.",
  },
  {
    id: "idor-bola",
    title: "IDOR / BOLA ile Veri Erişimi",
    description: "Kullanıcı ID'si değiştirilerek başka kullanıcı verilerine erişilmesi.",
    tag: "Access Control",
    vulnerabilityType: "IDOR / BOLA & Excessive Data Exposure",
    targetEndpoint: "GET /users/<id>",
    difficulty: "Orta",
    status: "open",
    insecureExpected:
      "Geçerli token ile başka kullanıcının id'si okunur; yanıtta password_hash ve is_admin gibi alanlar dönebilir.",
    secureExpected:
      "Yalnızca kendi kaydı veya yönetici başkasını görür; yanıtta yalnızca id ve email döner.",
    goal:
      "Nesne düzeyinde yetkilendirme eksikliğinin veri sızıntısına nasıl yol açtığını görmek.",
    procedure: `1) Giriş yaparak token alın.
2) GET /users/me ile kendi ID'nizi öğrenin.
3) GET /users/1 gibi farklı bir ID deneyin.
4) Dönen veriyi inceleyin.
5) Secure modda aynı isteği test edin.`,
    exampleRequest: `GET /users/1
Authorization: Bearer <token>`,
    successCriteria:
      "Insecure API başka kullanıcı verilerini döndürmelidir. Secure API erişimi kısıtlamalıdır.",
    whyBlockedOnSecure:
      "Secure API kullanıcı ID kontrolü yapar ve yalnızca yetkili erişime izin verir.",
  },
  {
    id: "bfla",
    title: "Broken Function Level Authorization",
    description: "Kritik işlemlerin yetkisiz kullanıcılar tarafından yapılabilmesi.",
    tag: "AuthZ",
    vulnerabilityType: "BFLA",
    targetEndpoint: "DELETE /users/<id>",
    difficulty: "İleri",
    status: "open",
    insecureExpected:
      "Giriş yapmış herhangi bir kullanıcı başka kullanıcıyı silebilir; yönetici kontrolü yoktur.",
    secureExpected:
      "Silme yalnızca is_admin kullanıcılar için mümkündür; aksi halde 403 döner.",
    goal:
      "İşlev düzeyinde yetkilendirme eksikliğinin nasıl sistem güvenliğini tehlikeye attığını anlamak.",
    procedure: `1) Normal kullanıcı ile giriş yapın.
2) DELETE /users/{id} isteği gönderin.
3) Başka kullanıcıyı silmeyi deneyin.
4) Secure modda aynı isteği test edin.`,
    exampleRequest: `DELETE /users/1
Authorization: Bearer <token>`,
    successCriteria:
      "Insecure API normal kullanıcı ile silmeye izin verir. Secure API bu isteği reddeder.",
    whyBlockedOnSecure:
      "Secure API yalnızca admin kullanıcıların silme işlemi yapmasına izin verir.",
  },
];
