<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin
        User::create([
            'id' => Str::uuid()->toString(),
            'nama' => 'Admin Utama',
            'email' => 'admin@example.com',
            'telp' => '081234567890',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'jk' => 'laki-laki',
            'tgl_lahir' => '1990-01-01',
        ]);

        // Ahli
        User::create([
            'id' => Str::uuid()->toString(),
            'id_ahli' => 1, // Pastikan ada ahli dengan id=1 di tabel ahlis
            'nama' => 'Dr. Budi Herbalis',
            'email' => 'ahli@example.com',
            'telp' => '081298765432',
            'password' => Hash::make('password'),
            'role' => 'ahli',
            'jk' => 'laki-laki',
            'tgl_lahir' => '1985-05-05',
            'pengalaman' => '5 tahun pengalaman dalam pengobatan herbal dan tradisional. Fokus pada penyakit dalam.',
            'harga_konsultasi_online' => 50000,
            'harga_konsultasi_offline' => 100000,
            'jam_mulai_kerja' => '09:00:00',
            'jam_selesai_kerja' => '17:00:00',
        ]);

        // Pengguna
        User::create([
            'id' => Str::uuid()->toString(),
            'nama' => 'Pengguna Biasa',
            'email' => 'pengguna@example.com',
            'telp' => '081211223344',
            'password' => Hash::make('password'),
            'role' => 'pengguna',
            'jk' => 'perempuan',
            'tgl_lahir' => '1995-08-17',
        ]);
    }
}
