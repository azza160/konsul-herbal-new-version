<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EWalletView extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'e_wallet_id',
        'konsultasi_id',
        'view_count',
        'last_viewed_at',
    ];

    protected $casts = [
        'last_viewed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function eWallet()
    {
        return $this->belongsTo(EWallet::class);
    }

    public function konsultasi()
    {
        return $this->belongsTo(Konsultasi::class);
    }
} 