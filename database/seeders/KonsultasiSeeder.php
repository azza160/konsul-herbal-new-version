<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Konsultasi;
use App\Models\User;
use Illuminate\Support\Str;

class KonsultasiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $pengguna = User::where('email', 'pengguna@example.com')->first();
        $ahli = User::where('email', 'ahli@example.com')->first();

        if (!$pengguna || !$ahli) {
            $this->command->warn('Pengguna atau Ahli default tidak ditemukan. Seeder Konsultasi dilewati.');
            return;
        }

        $keluhan = [
            'Saya sering mengalami sakit kepala sebelah (migrain) selama 3 bulan terakhir.',
            'Anak saya (5 tahun) sering batuk dan pilek. Saya ingin konsultasi langsung.',
            'Saya memiliki masalah sulit tidur (insomnia) dan sering merasa cemas.',
            'Kulit saya sangat kering dan terkadang terasa gatal, terutama di area siku.',
            'Saya mengalami masalah pencernaan, sering kembung dan sembelit.',
            'Tekanan darah saya cenderung tinggi, saya ingin mencari solusi herbal.',
            'Saya ingin meningkatkan daya tahan tubuh karena sering sakit.',
            'Masalah jerawat di wajah yang tidak kunjung sembuh.',
            'Nyeri sendi di bagian lutut, terutama saat cuaca dingin.',
            'Rambut saya rontok parah, adakah solusi untuk mengatasinya dari dalam?'
        ];

        $statuses = ['menunggu_pembayaran', 'menunggu_konfirmasi', 'diterima', 'ditolak', 'selesai'];
        $jenis_options = ['konsultasi_online', 'konsultasi_offline'];

        for ($i = 0; $i < 10; $i++) {
            $jenis = $jenis_options[array_rand($jenis_options)];
            $status = $statuses[array_rand($statuses)];
            
            $data = [
                'id' => Str::uuid()->toString(),
                'pengguna_id' => $pengguna->id,
                'ahli_id' => $ahli->id,
                'keluhan' => $keluhan[$i],
                'status' => $status,
                'jenis' => $jenis,
                'foto_bukti_pembayaran' => null,
                'tanggal_konsultasi' => null,
                'jam_konsultasi' => null,
            ];

            // Add payment proof if status is not waiting for payment
            if ($status !== 'menunggu_pembayaran') {
                // Use Unsplash for random receipt/invoice images. Add a unique signature to avoid cached images.
                $data['foto_bukti_pembayaran'] = "https://source.unsplash.com/random/400x600?receipt,payment&sig=" . rand(1, 1000);
            }

            // Add schedule if it's an offline consultation
            if ($jenis === 'konsultasi_offline') {
                $data['tanggal_konsultasi'] = now()->addDays(rand(1, 30))->format('Y-m-d');
                $data['jam_konsultasi'] = rand(9, 16) . ':00:00';
            }

            Konsultasi::create($data);
        }
    }
}
