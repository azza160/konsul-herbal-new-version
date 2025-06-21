<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Ahli;

class AhliSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Ahli::create([
            'nama_spesialisasi' => 'Penyakit Dalam',
            'deskripsi_spesialisasi' => 'Spesialisasi dalam pengobatan herbal untuk penyakit dalam seperti diabetes, hipertensi, dan masalah pencernaan.'
        ]);

        Ahli::create([
            'nama_spesialisasi' => 'Kesehatan Kulit',
            'deskripsi_spesialisasi' => 'Fokus pada solusi herbal untuk berbagai masalah kulit, termasuk jerawat, eksim, dan penuaan dini.'
        ]);

        Ahli::create([
            'nama_spesialisasi' => 'Kesehatan Wanita',
            'deskripsi_spesialisasi' => 'Mengatasi masalah kesehatan khusus wanita, seperti siklus menstruasi tidak teratur dan masalah kesuburan dengan pendekatan herbal.'
        ]);
    }
}
