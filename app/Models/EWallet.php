<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EWallet extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nama_e_wallet',
        'nomor_e_wallet',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
