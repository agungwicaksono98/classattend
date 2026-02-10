# Naming Convention

Referensi:

* [https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design) (diakses pada 21 Agustus 2025\)
* [https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/](https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/) (diakses pada 21 Agustus 2025\)
* Gemini (diakses pada 21 Agustus 2025\)
* Claude Sonnet 4

Konvensi penamaan mampu meningkatkan kejelasan, konsistensi, dan kesesuaian terhadap prinsip-prinsip yang telah umum digunakan sehingga mempermudah developer dalam menggunakan dan memelihara API. Berikut adalah beberapa konvensi tersebut.

1. **Jangan gunakan kata kerja**
   Suatu endpoint harus dinyatakan sebagai operasi terhadap suatu resource. Dengan demikian, nama endpoint harus menggunakan kata benda, bukan kata kerja. Aksi terhadap resource terkait akan sudah dinyatakan dalam bentuk metode HTTP (GET, POST, PUT, DELETE).
   * **Bagus:** /users
   * **Buruk:** /getUsers

2. **Gunakan kata benda jamak**
   Resource yang bisa dioperasikan dalam bentuk koleksi (array) harus dinyatakan dengan kata benda jamak. Karena sebagian besar resource biasanya bisa dioperasikan dalam bentuk koleksi, kata benda jamak hampir akan selalu digunakan.
   * **Bagus:** /products (untuk kumpulan produk), /users (untuk kumpulan user)
   * **Buruk:** /product

3. **Gunakan format “kata benda jamak/{identifier}” untuk resource singleton**
   Untuk endpoint yang melakukan operasi terhadap resource secara satuan, gunakan kata benda jamak yang diikuti dengan identifier.
   * **Bagus:** /users/{id} atau /products/123

4. **Gunakan kebab case**
   Pada kebab case, semua huruf harus ditulis dalam huruf kecil dan nama yang terdiri lebih dari satu kata harus ditulis dengan tanda hubung “-”. Hindari penggunaan camel case dan snake case.
   * **Bagus:** /user-accounts (kebab case)
   * **Buruk:** /UserAccounts (camel case), /user\_accounts (snake case)

5. **Struktur hirarkis**
   Untuk endpoint yang mencerminkan hubungan antara resource, gunakan format “parent-resource/parent-resource-identifier/child-resource”.
   * **Bagus:** /departments/{departmentId}/lectures

   Hindari penggunaan struktur hirarkis yang melibatkan lebih dari 2 level.

   * **Buruk:** /departments/1/lectures/123/professor

   Jika level hirarki yang lebih dalam benar-benar diperlukan, gunakan sistem [HATEOAS](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design#implement-hateoas).

6. **Gunakan query parameter untuk filter, sort, dan pagination**
   Jangan membuat endpoint terpisah untuk ketiga hal ini.
   * **Bagus:** /products?category=elektronik\&sort=harga\&limit=25\&offset=50

   Untuk mencegah serangan denial-of-service, pastikan batas atas untuk parameter “limit” dipasang.

   Jika kondisi filter terlalu panjang atau kompleks sehingga tidak memungkinkan untuk dinyatakan di dalam query parameter, developer dianjurkan untuk mengganti method endpoint menjadi POST dan memindahkan query ke request body.

7. **Versioning**
   Pisahkan endpoint berdasarkan versi untuk memungkinkan klien melakukan migrasi dan rollback versi tanpa interupsi dari sisi penyedia API.
   * **Contoh versioning melalui penamaan endpoint:**
     /v1/users
     /v2/users

   * **Contoh versioning dengan query parameter**
     https://my.api.com/users?version=1
     https://my.api.com/users?version=2

   * **Contoh versioning melalui request header:**
     GET https://my.api.com/users
     X-API-VERSION: 1

     GET https://my.api.com/users
     X-API-VERSION: 2

   Versioning melalui penamaan endpoint dan query parameter lebih cache-friendly dibandingkan dengan request header karena mekanisme caching biasanya menggunakan URI atau query string sebagai key untuk menentukan kapan cache perlu diperbarui dan tidak.

8. **Gunakan camel case atau snake case untuk penamaan field di dalam request/response body**
    * **Contoh field dengan camel case:** firstName, orderTotal
    * **Contoh field dengan snake case:** first\_name, orer\_total

    Pilih salah  satu dari case tersebut dan gunakan secara konsisten pada service yang dikembangkan. Pertimbangan pemilihan case dapat didasari oleh bahasa pemrograman yang digunakan oleh backend (misal JS menggunakan camel case, Python menggunakan snake case).

9. **Gunakan nama field yang deskriptif**
    Gunakan nama yang jelas dan deskriptif. Hindari penyingkatan kecuali untuk yang telah diketahui secara umum (misalnya, id).

10. **Jangan gunakan request body untuk request GET**
    Beberapa library API backend (seperti FastAPI) memperbolehkan developer untuk mengakses body dari request GET sementara beberapa library request client (seperti Axios) tidak memperbolehkan developer menyertakan body pada request GET. Untuk memastikan kompabilitas antar library, pastikan tidak ada aplikasi yang memproses atau menyertakan body pada request GET.

**Contoh Kasus**  
Referensi:

* Gemini 3.0 Pro (diakses pada 14 Januari 2026\)

Misal terdapat 3 endpoint berikut.

1. Get all/many users
2. Get one user detail
3. Get my own detail as a user

Untuk ketiga endpoint tersebut, gunakan endpoint path berikut.

1. GET /users/
2. GET /users/{user\_id}
3. GET /users/me

Sistem penamaan yang sama bisa digunakan untuk method lainnya.