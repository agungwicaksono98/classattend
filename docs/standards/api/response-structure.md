# Struktur JSON response body

Berikut adalah struktur response body yang akan digunakan pada service-service Inergi.
* **message**: Berisi pesan untuk keperluan debugging atau sebagai user feedback yang ditampilkan melalui service frontend.
* **data**: Berisi data sesuai dengan fungsi dari API yang dipanggil. Pada request yang gagal, field ini dapat digunakan untuk memberikan informasi tambahan sesuai kebutuhan.
* **meta**: Berisi metadata dari request.
    * **uuid**: UUID dari service pengirim response. Akan unik untuk setiap replika service (suatu service akan bisa memiliki banyak replika).
    * **id** (optional, default \= null): ID dari request.
    * **process\_time\_ns** (optional, default \= null): Durasi pemrosean request dalam nano second.

Contoh response success

```json
{
  "message": "",
  "data": {
    "items": ["..."],
    "total_items": 17,
    "total_pages": 4
  },
  "meta": {
    "uuid": "...",
    "id": "...",
    "process_time_ns": 123456789
  }
}
```

Contoh response failed

```json
{
  "message": "Too many requests",
  "data": {
    "retry_after_seconds": 60,
    "rate_limit_exceed": true
  },
  "meta": {
    "uuid": "...",
    "id": "...",
    "process_time_ns": 123456789
  }
}
```