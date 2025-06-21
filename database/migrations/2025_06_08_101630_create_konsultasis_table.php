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
        Schema::create('konsultasis', function (Blueprint $table) {
            $table->string('id')->primary(); // UUID
            $table->string('pengguna_id');
            $table->string('ahli_id');
            $table->text('keluhan');
            $table->enum('status', ['menunggu_pembayaran', 'menunggu_konfirmasi', 'diterima', 'ditolak', 'selesai'])->default('menunggu_pembayaran');
            $table->enum('jenis', ['konsultasi_online', 'konsultasi_offline']);
            $table->string('foto_bukti_pembayaran')->nullable();
            $table->date('tanggal_konsultasi')->nullable();
            $table->time('jam_konsultasi')->nullable();
            $table->timestamps();
        
            // Tambahkan foreign key secara manual
            $table->foreign('pengguna_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('ahli_id')->references('id')->on('users')->onDelete('cascade');
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('konsultasis');
    }
};
