<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('hari_pertama_buka')->nullable()->after('jam_selesai_kerja');
            $table->string('hari_terakhir_buka')->nullable()->after('hari_pertama_buka');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['hari_pertama_buka', 'hari_terakhir_buka']);
        });
    }
};
