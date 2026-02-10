# API Versioning

## URI versioning

Referensi:

* [https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design\#implement-versioning](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design#implement-versioning)  
* [https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/\#h-versioning-our-apis](https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/#h-versioning-our-apis) 

Tambahkan v1, v2, dst di dalam endpoint path. Contoh:

```code
https://api.my.com/v1/customers
https://api.my.com/v2/customers
```

## Project directory structure

Referensi:

* [https://softwareengineering.stackexchange.com/questions/278876/what-is-the-correct-project-file-structure-for-a-versioned-rest-api](https://softwareengineering.stackexchange.com/questions/278876/what-is-the-correct-project-file-structure-for-a-versioned-rest-api)

Gunakan struktur direktori seperti berikut.
```text
.
app
├── v1
│   ├── book
│   └── author
└── v2
    └── author
```

Jangan pisahkan direktori seperti berikut.

``` text
.
app
├── book
│   ├── v1
└── author
    ├── v1
    └── v2
```