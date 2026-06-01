# Workflow Model 3D untuk Produksi

## Masalah pada model saat ini
Model GLB yang tersedia hanya terbaca sebagai 2 mesh utama. Karena itu, aplikasi belum bisa mengenali klik langsung pada bagian kecil seperti alveoli, bronkiolus, trakea, atau fisura.

## Opsi 1 — Cepat dan ekonomis: Hotspot annotation
Cocok untuk demo, MVP, dan pembelajaran sekolah/kampus.

Langkah:
1. Pakai model GLB sebagai visual utama.
2. Tentukan koordinat hotspot di atas model.
3. Setiap hotspot memiliki data: nama, deskripsi, fungsi, tugas, dan quiz.
4. Klik hotspot membuka panel penjelasan.

Kelebihan:
- Cepat dibuat.
- Tidak perlu memecah mesh.
- Mudah update konten.

Kekurangan:
- Klik bukan benar-benar pada object anatomi, tetapi pada titik anotasi.

## Opsi 2 — Produksi premium: Mesh dipisah di Blender
Cocok jika customer ingin model terasa seperti BioDigital / Visible Body.

Langkah Blender:
1. Import GLB ke Blender.
2. Masuk Edit Mode.
3. Seleksi bagian anatomi yang ingin dipisah.
4. Tekan `P` > `Selection` untuk memisahkan menjadi object baru.
5. Rename object dengan nama rapi:
   - `Trachea`
   - `Right_Main_Bronchus`
   - `Left_Main_Bronchus`
   - `Right_Superior_Lobe`
   - `Right_Middle_Lobe`
   - `Right_Inferior_Lobe`
   - `Left_Superior_Lobe`
   - `Left_Inferior_Lobe`
   - `Alveoli`
   - `Diaphragm`
6. Assign material warna berbeda untuk setiap object.
7. Export sebagai `.glb`.
8. Di React Three Fiber, gunakan `event.object.name` untuk mapping ke konten.

Kelebihan:
- Klik langsung di object anatomi.
- Highlight object bisa lebih akurat.
- Lebih premium untuk customer.

Kekurangan:
- Perlu waktu retopology/cleanup.
- Model harus cukup detail dan lisensinya aman.

## Rekomendasi harga pengerjaan

### Paket Basic — Hotspot 3D Learning
- 1 model GLB.
- 15–20 anotasi.
- Panel deskripsi dan quiz.
- Estimasi: 3–5 hari kerja.

### Paket Pro — Segmented 3D Model
- Pemisahan mesh di Blender.
- Klik langsung object anatomi.
- Highlight object.
- 20–30 anotasi.
- Estimasi: 7–14 hari kerja.

### Paket Premium — LMS / Admin Panel
- Semua fitur Pro.
- Admin untuk edit konten anotasi.
- Quiz scoring.
- Progress siswa.
- Estimasi: 3–6 minggu.
