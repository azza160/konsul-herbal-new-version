<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bukti Konsultasi - {{ $konsultasi->id }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
            color: #333;
            line-height: 1.6;
            font-size: 14px;
        }
        .container {
            width: 100%;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #4CAF50;
            padding-bottom: 10px;
        }
        .header h1 {
            margin: 0;
            color: #4CAF50;
            font-size: 28px;
        }
        .header p {
            margin: 5px 0 0;
            font-size: 16px;
        }
        .content {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 20px;
            color: #4CAF50;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .info-table td {
            padding: 10px;
            border: 1px solid #eee;
        }
        .info-table .label {
            font-weight: bold;
            background-color: #f9f9f9;
            width: 30%;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #777;
            border-top: 1px solid #ddd;
            padding-top: 15px;
            margin-top: 30px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>HerbalCare</h1>
            <p>Bukti Konsultasi Offline</p>
        </div>

        <div class="content">
            <h2 class="section-title">Detail Konsultasi</h2>
            <table class="info-table">
                <tr>
                    <td class="label">ID Konsultasi</td>
                    <td>{{ $konsultasi->id }}</td>
                </tr>
                <tr>
                    <td class="label">Tanggal Pengajuan</td>
                    <td>{{ $konsultasi->created_at->format('d F Y, H:i') }}</td>
                </tr>
                <tr>
                    <td class="label">Jadwal Konsultasi</td>
                    <td>{{ \Carbon\Carbon::parse($konsultasi->tanggal_konsultasi)->format('d F Y') }} pukul {{ substr($konsultasi->jam_konsultasi, 0, 5) }}</td>
                </tr>
                 <tr>
                    <td class="label">Harga Konsultasi</td>
                    <td>Rp {{ number_format($konsultasi->ahli->harga_konsultasi_offline, 0, ',', '.') }}</td>
                </tr>
                 <tr>
                    <td class="label">Keluhan</td>
                    <td>{{ $konsultasi->keluhan }}</td>
                </tr>
            </table>

            <h2 class="section-title">Informasi Pengguna</h2>
            <table class="info-table">
                <tr>
                    <td class="label">Nama</td>
                    <td>{{ $konsultasi->pengguna->nama }}</td>
                </tr>
                <tr>
                    <td class="label">Email</td>
                    <td>{{ $konsultasi->pengguna->email }}</td>
                </tr>
                 <tr>
                    <td class="label">Telepon</td>
                    <td>{{ $konsultasi->pengguna->telp ?? '-' }}</td>
                </tr>
            </table>

            <h2 class="section-title">Informasi Ahli Herbal</h2>
            <table class="info-table">
                <tr>
                    <td class="label">Nama Ahli</td>
                    <td>{{ $konsultasi->ahli->nama }}</td>
                </tr>
                <tr>
                    <td class="label">Spesialisasi</td>
                    <td>{{ $konsultasi->ahli->ahli->nama_spesialisasi ?? '-' }}</td>
                </tr>
                <tr>
                    <td class="label">Alamat Praktik</td>
                    <td>{{ $konsultasi->ahli->lokasi->alamat ?? 'Lokasi belum diatur' }}</td>
                </tr>
                 <tr>
                    <td class="label">Telepon Ahli</td>
                    <td>{{ $konsultasi->ahli->telp ?? '-' }}</td>
                </tr>
            </table>
        </div>

        <div class="footer">
            <p>Dokumen ini dibuat secara otomatis oleh sistem.</p>
            <p>Proses pemesanan dilakukan melalui website <strong>HerbalCare</strong>.</p>
        </div>
    </div>
</body>
</html> 