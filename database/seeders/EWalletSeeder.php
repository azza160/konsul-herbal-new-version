<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\EWallet;

class EWalletSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ambil semua user dengan role 'ahli'
        $ahlis = User::where('role', 'ahli')->get();

        $eWalletTypes = [
            ['name' => 'GoPay', 'prefix' => '0812'],
            ['name' => 'OVO', 'prefix' => '0857'],
            ['name' => 'Dana', 'prefix' => '0896'],
            ['name' => 'ShopeePay', 'prefix' => '0813'],
        ];

        foreach ($ahlis as $ahli) {
            // Buat 1 sampai 3 e-wallet random untuk setiap ahli
            $numberOfEWallets = rand(1, 3);
            $usedTypes = [];

            for ($i = 0; $i < $numberOfEWallets; $i++) {
                // Pilih tipe e-wallet yang belum digunakan
                $availableTypes = array_filter($eWalletTypes, function ($type) use ($usedTypes) {
                    return !in_array($type['name'], $usedTypes);
                });

                if (empty($availableTypes)) break;

                $type = array_values($availableTypes)[array_rand(array_values($availableTypes))];
                $usedTypes[] = $type['name'];

                EWallet::create([
                    'user_id' => $ahli->id,
                    'nama_e_wallet' => $type['name'],
                    // Generate nomor acak dengan prefix
                    'nomor_e_wallet' => $type['prefix'] . rand(10000000, 99999999),
                ]);
            }
        }
    }
}
