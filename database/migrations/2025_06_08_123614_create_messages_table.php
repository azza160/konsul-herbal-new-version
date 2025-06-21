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
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            
            // Ubah menjadi string + definisikan foreign key manual
            $table->string('konsultasi_id');
            $table->string('sender_id');
        
            $table->text('message')->nullable();
            $table->string('image')->nullable();
            $table->timestamps();
        
            // Foreign key constraints manual
            $table->foreign('konsultasi_id')->references('id')->on('konsultasis')->onDelete('cascade');
            $table->foreign('sender_id')->references('id')->on('users')->onDelete('cascade');
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
