<?php

namespace App\Http\Controllers;

use App\Models\Ahli;
use App\Models\Article;
use App\Models\Komentar;
use App\Models\Konsultasi;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Str;
use App\Models\Notification;
use Illuminate\Support\Carbon;
use App\Models\EWalletView;
use App\Models\EWallet;

class PenggunaController extends Controller
{


    public function BerandaShow()
    {
        $user = Auth::user();
    
        $experts = User::with('ahli')
            ->where('role', 'ahli')
            ->latest()
            ->take(3)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->nama,
                    'image' => $user->foto, // pastikan URL valid
                    'specialty' => $user->ahli?->nama_spesialisasi ?? '-',
                    'specialty_description' => $user->ahli?->deskripsi_spesialisasi ?? 'Deskripsi belum tersedia.',
                    'email' => $user->email,
                    'jk' => $user->jk,
                    'telp' => $user->telp,
                    'tgl_lahir' => $user->tgl_lahir,
                    'pengalaman' => $user->pengalaman,
                ];
            });
    
        $artikels = Article::latest()->take(3)->get()->map(function ($artikel) {
            return [
                'id' => $artikel->id,
                'title' => $artikel->judul,
                'image' => $artikel->foto,
                'date' => $artikel->created_at->toDateString(),
                'excerpt' => Str::limit(strip_tags($artikel->deskripsi), 100, '...'),
            ];
        });
    
        return Inertia::render('pengguna/Landing', [
            'user' => $user,
            'articles' => $artikels,
            'experts' => $experts,
        ]);
    }
    

    public function ListArtikelShow()
    {
        $user = Auth::user();
        $artikels = Article::latest()->get()->map(function ($artikel) {
            return [
                'id' => $artikel->id,
                'title' => $artikel->judul,
                'image' => $artikel->foto, // pastikan file foto disimpan di storage
                'date' => $artikel->created_at->toDateString(),
                'excerpt' => Str::limit(strip_tags($artikel->deskripsi), 100, '...'),
            ];
        });

        return Inertia::render('pengguna/Articles',[
            'user' => $user,
            'articles' => $artikels,
        ]);
    }

    
    
    public function DetailArtikelShow($id)
    {
        $user = Auth::user();
    
        $artikel = Article::findOrFail($id);
    
        $article = [
            'id' => $artikel->id,
            'title' => $artikel->judul,
            'image' => $artikel->foto,
            'date' => $artikel->created_at->toDateString(),
            'content' => $artikel->deskripsi,
        ];
    
        // Ambil komentar terkait artikel beserta user-nya
        $komentars = $artikel->komentars()->with('user')->latest()->get()->map(function ($komentar) {
            return [
                'id' => $komentar->id,
                'user' => $komentar->user->nama ?? 'Anonim',
                'avatar' => '/placeholder.svg?height=40&width=40', // ganti kalau kamu punya avatar beneran
                'content' => $komentar->komentar,
                'date' => $komentar->created_at->toDateString(),
            ];
        });
    
        return Inertia::render('pengguna/Articles-Detail', [
            'user' => $user,
            'article' => $article,
            'comments' => $komentars,
        ]);
    }
    

    public function AhliHerbalShow()
    {
        $user = Auth::user();
        $experts = User::with('ahli')
            ->where('role', 'ahli')
            ->latest()
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->nama,
                    'image' => $user->foto, // pastikan URL valid
                    'specialty' => $user->ahli?->nama_spesialisasi ?? '-',
                    'specialty_description' => $user->ahli?->deskripsi_spesialisasi ?? 'Deskripsi belum tersedia.',
                    'email' => $user->email,
                    'jk' => $user->jk,
                    'telp' => $user->telp,
                    'tgl_lahir' => $user->tgl_lahir,
                    'pengalaman' => $user->pengalaman,
                ];
            });

            $spesialisasiList = Ahli::select('id', 'nama_spesialisasi')->get();
           

        return Inertia::render('pengguna/List-Ahli-Herbal',[
            'user' => $user,
            'experts' => $experts,
            'spesialisasiList' => $spesialisasiList,

        ]);
    }


    public function PesanShow()
{
    $user = Auth::user();


    $konsultasis = $user->role === 'pengguna'
        ? $user->konsultasiSebagaiPengguna()->where('status', 'diterima')->with(['ahli', 'messages.sender'])->get()
        : $user->konsultasiSebagaiAhli()->where('status', 'diterima')->with(['pengguna', 'messages.sender'])->get();

    $chatList = $konsultasis->map(function ($k) use ($user) {
        $other = $user->role === 'pengguna' ? $k->ahli : $k->pengguna;

        return [
            'id' => $k->id,
            'expertName' => $other->nama,
            'avatar' => $other->foto ? $other->foto : '/placeholder.svg',
            'lastMessage' => $k->keluhan,
            'status' => $k->status,
        ];
    });


    // Ambil pesan2 per konsultasi
    $chatMessages = [];
    foreach ($konsultasis as $k) {
        $chatMessages[$k->id] = $k->messages->map(function ($msg) use ($user) {
            return [
                'id' => $msg->id,
                'sender' => $msg->sender_id === $user->id ? 'user' : 'expert',
                'sender_id' => $msg->sender_id,
                'content' => $msg->message,
                'image' => $msg->image,
                'time' => $msg->created_at->format('H:i'),
            ];
        });
    }

    return Inertia::render('pengguna/Pesan', [
        'chatList' => $chatList,
        'chatMessages' => $chatMessages,
        'user' => $user,
    ]);
}

public function KirimPesan(Request $request)
{
    try {
        $request->validate([
            'consultation_id' => 'required|exists:konsultasis,id',
            'message' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $user = Auth::user();
        $konsultasi = Konsultasi::with(['pengguna', 'ahli'])->findOrFail($request->consultation_id);
        
        // Verify user is part of this consultation
        if ($user->id !== $konsultasi->pengguna_id && $user->id !== $konsultasi->ahli_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $data = [
            'konsultasi_id' => $request->consultation_id,
            'sender_id' => $user->id,
        ];

        if ($request->filled('message')) {
            $data['message'] = $request->message;
        }

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('chat-images', 'public');
            $data['image'] = '/storage/' . $imagePath;
        }

        Message::create($data);

        // Create notification for the other user
        $recipientId = $user->id === $konsultasi->pengguna_id ? $konsultasi->ahli_id : $konsultasi->pengguna_id;
        $recipient = User::find($recipientId);
        $senderName = $user->nama;

        Notification::create([
            'user_id' => $recipientId,
            'type' => 'new_message',
            'title' => 'Pesan Baru',
            'message' => "Pesan baru di konsultasi dengan {$senderName}",
            'related_id' => $konsultasi->id,
            'is_read' => false,
        ]);

        return redirect()->back()
            ->with('success', 'Pesan berhasil dikirim.')
            ->with('selected_chat', $request->consultation_id);
    } catch (\Exception $e) {
        Log::error('Error sending message: ' . $e->getMessage());
        return redirect()->back()
            ->with('error', 'Gagal mengirim pesan. Silakan coba lagi.');
    }
}







    public function KomentarStore(Request $request)
{
    $request->validate([
        'article_id' => 'required|string|exists:articles,id',
        'komentar' => 'required|string|max:1000',
    ]);

    $user = Auth::user();

    Komentar::create([
        'user_id' => $user->id,
        'article_id' => $request->article_id,
        'komentar' => $request->komentar,
    ]);

    // Redirect agar Inertia bisa re-render halaman
    return redirect()->route('detail-artikel', $request->article_id);
}

public function Profile(){
    $user = Auth::user();
    $userMe = [
        'name' => $user->nama,
        'email' => $user->email,
        'phone' => $user->telp,
        'photo' => $user->foto,
        'birthDate' => $user->tgl_lahir,
        'gender' => $user->jk
    ];
    
    return Inertia::render('pengguna/Profile',[
        'user' => $user,
        'userMe' => $userMe
    ]);
}

public function EditProfileShow(){
    $user = Auth::user();
    return Inertia::render('pengguna/Edit-Profile',[
        'user' => $user,
    ]);
}

public function updateProfile(Request $request)
{
    $user = Auth::user();

    $validated = $request->validate([
        'nama'       => 'required|string|max:255',
        'email'      => 'required|email|max:255|unique:users,email,' . $user->id,
        'telp'       => 'nullable|string|max:20',
        'tgl_lahir'  => 'nullable|date',
        'jk'         => 'nullable|in:laki-laki,perempuan',
        'foto'       => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
    ]);

    // Jika ada file baru, hapus foto lama dan simpan yang baru
    if ($request->hasFile('foto')) {
        // Hapus foto lama jika ada
        if ($user->foto && Storage::disk('public')->exists(str_replace('/storage/', '', $user->foto))) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $user->foto));
        }

        // Simpan foto baru
        $fotoPath = $request->file('foto')->store('foto-profil', 'public');
        $validated['foto'] = '/storage/' . $fotoPath;
    }

    $user->fill($validated);
    $user->save();

    return redirect()->back()->with('success', 'Profil berhasil diperbarui.');
}

public function EditPasswordProfile(){
    $user = Auth::user();
    return Inertia::render('pengguna/edit-password',[
        'user' => $user,
    ]);
}

public function updatePassword(Request $request)
{
    $user = Auth::user();

    // Validasi input
    $request->validate([
        'oldPassword' => 'required',
        'newPassword' => 'required|min:6|confirmed', // pakai confirmed untuk mencocokkan dengan confirmPassword
    ]);

    // Cek apakah password lama cocok
    if (!Hash::check($request->oldPassword, $user->password)) {
        return back()->withErrors(['oldPassword' => 'Password lama salah.']);
    }

    // Update password
    $user->password = Hash::make($request->newPassword);
    $user->save();

    return back()->with('success', 'Password berhasil diperbarui.');
}

public function BuatKonsultasi(Request $request){
    $request->validate([
        'ahli_id' => 'required|exists:users,id',
        'jenis' => 'required|in:konsultasi_online,konsultasi_offline',
        'keluhan' => 'required|string|min:6',
        'tanggal_konsultasi' => 'required_if:jenis,konsultasi_offline|nullable|date',
        'jam_konsultasi' => 'required_if:jenis,konsultasi_offline|nullable|date_format:H:i',
    ]);

    $user = Auth::user();
    $ahli = User::findOrFail($request->ahli_id);

    $activeConsultations = Konsultasi::where('pengguna_id', $user->id)
        ->whereIn('status', ['menunggu_pembayaran', 'menunggu_konfirmasi'])
        ->count();

    if ($activeConsultations >= 3) {
        return redirect()->back()->withErrors(['limit' => 'Anda memiliki 3 konsultasi yang belum selesai. Selesaikan terlebih dahulu.'])->withInput();
    }

    if ($request->jenis === 'konsultasi_offline') {
        $tanggalKonsultasi = Carbon::parse($request->tanggal_konsultasi);
        if ($tanggalKonsultasi->isPast() && !$tanggalKonsultasi->isToday()) {
            return redirect()->back()->withErrors(['tanggal_konsultasi' => 'Tanggal konsultasi tidak boleh di masa lalu.'])->withInput();
        }
        if ($tanggalKonsultasi->isToday()) {
            return redirect()->back()->withErrors(['tanggal_konsultasi' => 'Tanggal konsultasi minimal H+1 dari hari ini.'])->withInput();
        }
        if ($tanggalKonsultasi->diffInDays(now()) > 30) {
            return redirect()->back()->withErrors(['tanggal_konsultasi' => 'Tanggal konsultasi tidak boleh lebih dari 30 hari ke depan.'])->withInput();
        }

        if (empty($ahli->hari_pertama_buka) || empty($ahli->hari_terakhir_buka)) {
             return redirect()->back()->withErrors(['tanggal_konsultasi' => 'Jadwal kerja ahli belum diatur.'])->withInput();
        }
        $daysOfWeek = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        $dayIndex = $tanggalKonsultasi->dayOfWeek;

        $startIndex = array_search($ahli->hari_pertama_buka, $daysOfWeek);
        $endIndex = array_search($ahli->hari_terakhir_buka, $daysOfWeek);

        if ($startIndex === false || $endIndex === false || $dayIndex < $startIndex || $dayIndex > $endIndex) {
            return redirect()->back()->withErrors(['tanggal_konsultasi' => "Jadwal kerja ahli adalah {$ahli->hari_pertama_buka} - {$ahli->hari_terakhir_buka}. Silakan pilih tanggal yang sesuai."])->withInput();
        }

        if (empty($ahli->jam_mulai_kerja) || empty($ahli->jam_selesai_kerja)) {
            return redirect()->back()->withErrors(['jam_konsultasi' => 'Jam kerja ahli belum diatur.'])->withInput();
        }

        $jamKonsultasi = Carbon::parse($request->jam_konsultasi);
        $jamMulaiKerja = Carbon::parse($ahli->jam_mulai_kerja);
        $jamSelesaiKerja = Carbon::parse($ahli->jam_selesai_kerja);
        $jamSelesaiKerjaMinus3Hours = $jamSelesaiKerja->copy()->subHours(3);

        if (!$jamKonsultasi->between($jamMulaiKerja, $jamSelesaiKerja)) {
            return redirect()->back()->withErrors(['jam_konsultasi' => "Jam konsultasi harus antara {$jamMulaiKerja->format('H:i')} dan {$jamSelesaiKerja->format('H:i')}."])->withInput();
        }
        
        if ($jamKonsultasi->gt($jamSelesaiKerjaMinus3Hours)) {
            return redirect()->back()->withErrors(['jam_konsultasi' => "Jam konsultasi harus setidaknya 3 jam sebelum jam selesai kerja ({$jamSelesaiKerja->format('H:i')})."])->withInput();
        }
    }

    $konsultasi = Konsultasi::create([
        'pengguna_id' => $user->id,
        'ahli_id' => $ahli->id,
        'keluhan' => $request->keluhan,
        'jenis' => $request->jenis,
        'tanggal_konsultasi' => $request->jenis === 'konsultasi_offline' ? $request->tanggal_konsultasi : null,
        'jam_konsultasi' => $request->jenis === 'konsultasi_offline' ? $request->jam_konsultasi : null,
        'status' => 'menunggu_pembayaran',
    ]);

    Notification::create([
        'user_id' => $ahli->id,
        'type' => 'consultation_request',
        'title' => 'Permintaan Konsultasi Baru',
        'message' => "{$user->nama} mengirim permintaan konsultasi {$request->jenis}.",
        'related_id' => $konsultasi->id,
    ]);

    return redirect()->route('pengguna-pembayaran', $konsultasi->id)->with('success', 'Permintaan konsultasi berhasil dikirim. Silakan lakukan pembayaran.');
}

public function getLatestMessages(Request $request)
{
    $request->validate([
        'consultation_id' => 'required|exists:konsultasis,id',
    ]);

    $user = Auth::user();
    $konsultasi = Konsultasi::with(['messages.sender'])->findOrFail($request->consultation_id);

    $messages = $konsultasi->messages->map(function ($msg) use ($user) {
        return [
            'id' => $msg->id,
            'sender' => $msg->sender_id === $user->id ? 'user' : 'expert',
            'sender_id' => $msg->sender_id,
            'content' => $msg->message,
            'image' => $msg->image,
            'time' => $msg->created_at->format('H:i'),
        ];
    });

    return response()->json(['messages' => $messages]);
}

public function editMessage(Request $request)
{
    try {
        $request->validate([
            'message_id' => 'required|exists:messages,id',
            'message' => 'required|string|max:1000',
        ]);

        $user = Auth::user();
        $message = Message::findOrFail($request->message_id);
        
        // Verify user owns this message
        if ($message->sender_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $message->update([
            'message' => $request->message,
        ]);

        return response()->json(['success' => true, 'message' => $message]);
    } catch (\Exception $e) {
        Log::error('Error editing message: ' . $e->getMessage());
        return response()->json(['error' => 'Gagal mengedit pesan. Silakan coba lagi.'], 500);
    }
}

public function deleteMessage(Request $request)
{
    try {
        $request->validate([
            'message_id' => 'required|exists:messages,id',
        ]);

        $user = Auth::user();
        $message = Message::findOrFail($request->message_id);
        
        // Verify user owns this message
        if ($message->sender_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Delete image if exists
        if ($message->image && Storage::disk('public')->exists(str_replace('/storage/', '', $message->image))) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $message->image));
        }

        $message->delete();

        return response()->json(['success' => true]);
    } catch (\Exception $e) {
        Log::error('Error deleting message: ' . $e->getMessage());
        return response()->json(['error' => 'Gagal menghapus pesan. Silakan coba lagi.'], 500);
    }
}

public function DetailAhliHerbalShow($id)
{
    $user = Auth::user();
    $expert = User::with(['ahli', 'lokasi'])
        ->where('role', 'ahli')
        ->findOrFail($id);

    $expertData = [
        'id' => $expert->id,
        'nama' => $expert->nama,
        'email' => $expert->email,
        'telp' => $expert->telp,
        'foto' => $expert->foto,
        'tgl_lahir' => $expert->tgl_lahir,
        'jk' => $expert->jk,
        'pengalaman' => $expert->pengalaman,
        'harga_konsultasi_online' => $expert->harga_konsultasi_online,
        'harga_konsultasi_offline' => $expert->harga_konsultasi_offline,
        'jam_mulai_kerja' => $expert->jam_mulai_kerja,
        'jam_selesai_kerja' => $expert->jam_selesai_kerja,
        'hari_pertama_buka' => $expert->hari_pertama_buka,
        'hari_terakhir_buka' => $expert->hari_terakhir_buka,
        'ahli' => $expert->ahli ? [
            'nama_spesialisasi' => $expert->ahli->nama_spesialisasi,
            'deskripsi_spesialisasi' => $expert->ahli->deskripsi_spesialisasi,
        ] : null,
        'lokasi' => $expert->lokasi,
    ];

    return Inertia::render('pengguna/Detail-Ahli-Herbal', [
        'user' => $user,
        'expert' => $expertData,
    ]);
}

public function PembayaranShow($id)
{
    $user = Auth::user();
    $konsultasi = Konsultasi::with(['ahli.eWallets'])->findOrFail($id);
    
    // Verify user owns this consultation
    if ($konsultasi->pengguna_id !== $user->id) {
        abort(403);
    }
    
    // Verify consultation status is waiting for payment
    if ($konsultasi->status !== 'menunggu_pembayaran') {
        return redirect()->back()->with('error', 'Status konsultasi tidak valid untuk pembayaran.');
    }

    $expert = $konsultasi->ahli;
    $eWallets = $expert->eWallets->map(function ($eWallet) use ($user, $konsultasi) {
        // Get view count for this specific combination
        $viewRecord = EWalletView::where([
            'user_id' => $user->id,
            'e_wallet_id' => $eWallet->id,
            'konsultasi_id' => $konsultasi->id,
        ])->first();
        
        return [
            'id' => $eWallet->id,
            'nama_e_wallet' => $eWallet->nama_e_wallet,
            'view_count' => $viewRecord ? $viewRecord->view_count : 0,
            'can_view' => $viewRecord ? $viewRecord->view_count < 3 : true,
        ];
    });

    return Inertia::render('pengguna/Pembayaran', [
        'user' => $user,
        'konsultasi' => [
            'id' => $konsultasi->id,
            'keluhan' => $konsultasi->keluhan,
            'jenis' => $konsultasi->jenis,
            'tanggal_konsultasi' => $konsultasi->tanggal_konsultasi,
            'jam_konsultasi' => $konsultasi->jam_konsultasi,
            'status' => $konsultasi->status,
        ],
        'expert' => [
            'id' => $expert->id,
            'nama' => $expert->nama,
            'foto' => $expert->foto,
            'harga_konsultasi_online' => $expert->harga_konsultasi_online,
            'harga_konsultasi_offline' => $expert->harga_konsultasi_offline,
        ],
        'eWallets' => $eWallets,
    ]);
}

public function LihatEWallet($konsultasiId, $ewalletId)
{
    try {
        $user = Auth::user();
        $konsultasi = Konsultasi::findOrFail($konsultasiId);
        $eWallet = EWallet::findOrFail($ewalletId);
        
        // Verify user owns this consultation
        if ($konsultasi->pengguna_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized access to consultation'], 403);
        }
        
        // Verify e-wallet belongs to the expert
        if ($eWallet->user_id !== $konsultasi->ahli_id) {
            return response()->json(['error' => 'E-wallet does not belong to the expert'], 403);
        }
        
        // Check view count BEFORE incrementing
        $viewRecord = EWalletView::where([
            'user_id' => $user->id,
            'e_wallet_id' => $eWallet->id,
            'konsultasi_id' => $konsultasi->id,
        ])->first();
        
        $currentViewCount = $viewRecord ? $viewRecord->view_count : 0;
        
        // Check if already at limit (3 views)
        if ($currentViewCount >= 3) {
            return response()->json([
                'error' => 'Anda telah melihat detail e-wallet ini sebanyak 3 kali. Tindakan ini dianggap sebagai spam.',
                'can_view' => false,
                'view_count' => $currentViewCount
            ], 429);
        }
        
        // Update or create view record
        if ($viewRecord) {
            $viewRecord->update([
                'view_count' => $currentViewCount + 1,
                'last_viewed_at' => now(),
            ]);
            // Refresh the record to get updated data
            $viewRecord->refresh();
        } else {
            $viewRecord = EWalletView::create([
                'user_id' => $user->id,
                'e_wallet_id' => $eWallet->id,
                'konsultasi_id' => $konsultasi->id,
                'view_count' => 1,
                'last_viewed_at' => now(),
            ]);
        }
        
        return response()->json([
            'success' => true,
            'e_wallet' => [
                'id' => $eWallet->id,
                'nama_e_wallet' => $eWallet->nama_e_wallet,
                'nomor_e_wallet' => $eWallet->nomor_e_wallet,
            ],
            'view_count' => $viewRecord->view_count,
            'can_view' => $viewRecord->view_count < 3
        ]);
    } catch (\Exception $e) {
        Log::error('Error in LihatEWallet: ' . $e->getMessage());
        return response()->json(['error' => 'Terjadi kesalahan server'], 500);
    }
}

public function UploadBuktiPembayaran(Request $request, $id)
{
    $request->validate([
        'foto_bukti_pembayaran' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
    ]);

    $user = Auth::user();
    $konsultasi = Konsultasi::findOrFail($id);
    
    // Verify user owns this consultation
    if ($konsultasi->pengguna_id !== $user->id) {
        abort(403);
    }
    
    // Verify consultation status is waiting for payment
    if ($konsultasi->status !== 'menunggu_pembayaran') {
        return redirect()->back()->with('error', 'Status konsultasi tidak valid untuk upload pembayaran.');
    }

    try {
        // Upload image
        $imagePath = $request->file('foto_bukti_pembayaran')->store('bukti-pembayaran', 'public');
        
        // Update consultation
        $konsultasi->update([
            'foto_bukti_pembayaran' => $imagePath,
            'status' => 'menunggu_konfirmasi',
        ]);

        // Create notification for expert
        Notification::create([
            'user_id' => $konsultasi->ahli_id,
            'type' => 'payment_uploaded',
            'title' => 'Bukti Pembayaran Diunggah',
            'message' => "{$user->nama} telah mengunggah bukti pembayaran untuk konsultasi.",
            'related_id' => $konsultasi->id,
            'is_read' => false,
        ]);

        // Create notification for user
        Notification::create([
            'user_id' => $user->id,
            'type' => 'payment_uploaded',
            'title' => 'Bukti Pembayaran Berhasil',
            'message' => 'Bukti pembayaran Anda telah berhasil diunggah. Menunggu konfirmasi dari ahli.',
            'related_id' => $konsultasi->id,
            'is_read' => false,
        ]);

        return redirect()->route('detail-ahli-herbal', $konsultasi->ahli_id)
            ->with('success', 'Bukti pembayaran berhasil diunggah. Menunggu konfirmasi dari ahli.');
    } catch (\Exception $e) {
        Log::error('Error uploading payment proof: ' . $e->getMessage());
        return redirect()->back()->with('error', 'Gagal mengunggah bukti pembayaran. Silakan coba lagi.');
    }
}

public function RiwayatKonsultasiShow()
{
    $user = Auth::user();
    $konsultasis = Konsultasi::with('ahli')
        ->where('pengguna_id', $user->id)
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function ($konsultasi) {
            return [
                'id' => $konsultasi->id,
                'ahli_nama' => $konsultasi->ahli->nama,
                'ahli_foto' => $konsultasi->ahli->foto,
                'status' => $konsultasi->status,
                'jenis' => $konsultasi->jenis,
                'keluhan' => $konsultasi->keluhan,
                'tanggal_konsultasi' => $konsultasi->tanggal_konsultasi,
                'jam_konsultasi' => $konsultasi->jam_konsultasi ? substr($konsultasi->jam_konsultasi, 0, 5) : null,
                'created_at' => $konsultasi->created_at->toDateTimeString(),
                'updated_at' => $konsultasi->updated_at->toDateTimeString(),
            ];
        });

    return Inertia::render('pengguna/RiwayatKonsultasi', [
        'user' => $user,
        'konsultasis' => $konsultasis
    ]);
}

public function HapusKonsultasi($id)
{
    $user = Auth::user();
    $konsultasi = Konsultasi::findOrFail($id);

    // Authorization
    if ($konsultasi->pengguna_id !== $user->id) {
        abort(403, 'Unauthorized');
    }

    if ($konsultasi->status !== 'selesai' && $konsultasi->status !== 'ditolak') {
        return redirect()->back()->with('error', 'Hanya konsultasi yang sudah selesai atau ditolak yang bisa dihapus.');
    }

    // Deleting messages associated with online consultation
    if ($konsultasi->jenis === 'konsultasi_online') {
        $konsultasi->messages()->delete();
    }

    $konsultasi->delete();

    return redirect()->back()->with('success', 'Riwayat konsultasi berhasil dihapus.');
}

}
