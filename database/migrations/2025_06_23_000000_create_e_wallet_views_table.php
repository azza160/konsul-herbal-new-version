<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('e_wallet_views', function (Blueprint $table) {
            $table->id();
            $table->string('user_id');
            $table->unsignedBigInteger('e_wallet_id');
            $table->string('konsultasi_id');
            $table->integer('view_count')->default(0);
            $table->timestamp('last_viewed_at')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('e_wallet_id')->references('id')->on('e_wallets')->onDelete('cascade');
            $table->foreign('konsultasi_id')->references('id')->on('konsultasis')->onDelete('cascade');
            
            // Unique constraint to prevent duplicate records
            $table->unique(['user_id', 'e_wallet_id', 'konsultasi_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('e_wallet_views');
    }
}; 