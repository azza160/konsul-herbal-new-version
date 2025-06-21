<?php

namespace App\Http\Controllers;

use App\Models\Ahli;
use App\Models\EWallet;
use App\Models\Konsultasi;
use App\Models\Message;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AhliController extends Controller
{
    public function AhliDashboardShow()
    {
        $user = Auth::user();
        $jumlahKonsulPending = Konsultasi::where('ahli_id', $user->id)
        ->where('status', 'menunggu')
        ->count();
        $jumlahKonsulAcc =  Konsultasi::where('ahli_id', $user->id)
        ->where('status', 'diterima')
        ->count();
        $jumlahKonsulTolak = Konsultasi::where('ahli_id', $user->id)
        ->where('status', 'ditolak')
        ->count();

        return Inertia::render('ahli/Dashboard',[
            'user' => $user,
            'jumlahKonsulPending' => $jumlahKonsulPending,
            'jumlahKonsulAcc' => $jumlahKonsulAcc,
            'jumlahKonsulTolak' => $jumlahKonsulTolak

        ]);
    }

    public function KonfirmasiShow()
    {
        $user = Auth::user();

        $consultations = Konsultasi::with('pengguna')
            ->where('ahli_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'patientName' => $item->pengguna->nama,
                    'topic' => $item->keluhan,
                    'status' => $item->status,
                    'requestTime' => $item->created_at->format('Y-m-d H:i'),
                    'jenis' => $item->jenis,
                    'tanggal_konsultasi' => $item->tanggal_konsultasi,
                    'jam_konsultasi' => $item->jam_konsultasi ? substr($item->jam_konsultasi, 0, 5) : null,
                    'foto_bukti_pembayaran' => $item->foto_bukti_pembayaran ? Storage::url($item->foto_bukti_pembayaran) : null,
                ];
            });

          ;

        return Inertia::render('ahli/Konfirmasi', [
            'consultations' => $consultations,
            'user' => $user
        ]);
    }

    public function Profile()
    {
        $user = User::with('lokasi')->find(Auth::id());
        return Inertia::render('ahli/ahli-profile', [
            'user' => $user,
        ]);
    }

    public function EditProfile()
    {
        $user = User::with('lokasi')->find(Auth::id());
        $spesialisasi = Ahli::all(); // Ambil semua spesialisasi untuk dropdown

        return Inertia::render('ahli/edit-profile', [
            'user' => $user,
            'spesialisasi' => $spesialisasi,
        ]);
    }

    public function UpdateProfile(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'telp' => 'nullable|string|max:20',
            'tgl_lahir' => 'nullable|date',
            'jk' => 'nullable|in:laki-laki,perempuan',
            'pengalaman' => 'nullable|string',
            'id_ahli' => 'nullable|exists:ahlis,id',
            'foto' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'alamat' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'harga_konsultasi_online' => 'nullable|integer|min:0',
            'harga_konsultasi_offline' => 'nullable|integer|min:0',
            'jam_mulai_kerja' => 'nullable|date_format:H:i',
            'jam_selesai_kerja' => 'nullable|date_format:H:i|after:jam_mulai_kerja',
            'hari_pertama_buka' => 'nullable|string|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu,Minggu',
            'hari_terakhir_buka' => 'nullable|string|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu,Minggu',
        ]);

        // Jika ada file baru, hapus foto lama dan simpan yang baru
        if ($request->hasFile('foto')) {
            // Hapus foto lama jika ada dan file-nya masih ada di storage
            if ($user->foto && Storage::disk('public')->exists(str_replace('/storage/', '', $user->foto))) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $user->foto));
            }

            // Simpan foto baru
            $fotoPath = $request->file('foto')->store('foto-profil', 'public');
            $validated['foto'] = '/storage/' . $fotoPath;
        }

        // Update data user
        $user->update($validated);

        // Update atau buat data lokasi
        if (isset($validated['latitude']) && isset($validated['longitude']) && isset($validated['alamat'])) {
            $user->lokasi()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'alamat' => $validated['alamat'],
                    'latitude' => $validated['latitude'],
                    'longitude' => $validated['longitude'],
                ]
            );
        }

        return redirect()->back()->with('success', 'Profil berhasil diperbarui.');
    }

    public function EditPasswordProfile(){
        $user = Auth::user();
        return Inertia::render('ahli/edit-password',[
            'user' => $user,
        ]);
    }

    public function UpdatePassword(Request $request)
{
    /** @var \App\Models\User $user */
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

    public function Accept($id){
        $konsultasi = Konsultasi::findOrFail($id);
        $konsultasi->status = 'diterima';
        $konsultasi->save();
        
        // Create notification for user
        Notification::create([
            'user_id' => $konsultasi->pengguna_id,
            'type' => 'consultation_accepted',
            'title' => 'Konsultasi Diterima',
            'message' => 'Permintaan konsultasi Anda telah diterima oleh ahli. Anda dapat memulai percakapan sekarang.',
            'related_id' => $konsultasi->id,
            'is_read' => false,
        ]);

        // Send bot welcome message if it's an online consultation
        if ($konsultasi->jenis === 'konsultasi_online') {
            $botMessage = "Selamat datang di konsultasi herbal! 🌿\n\n" .
                         "Saya adalah bot asisten yang akan membantu Anda selama proses konsultasi.\n\n" .
                         "📋 Langkah-langkah konsultasi:\n" .
                         "1. Jelaskan keluhan Anda secara detail\n" .
                         "2. Ahli akan menganalisis dan memberikan saran\n" .
                         "3. Anda dapat bertanya lebih lanjut jika diperlukan\n" .
                         "4. Konsultasi akan berlangsung hingga masalah teratasi\n\n" .
                         "💡 Tips: Berikan informasi yang lengkap agar ahli dapat memberikan saran yang tepat.\n\n" .
                         "Selamat berkonsultasi! 🙏";

            Message::create([
                'konsultasi_id' => $konsultasi->id,
                'sender_id' => $konsultasi->ahli_id, // Bot message appears as from ahli
                'message' => $botMessage,
            ]);
        }

        return back()->with('success', 'Konsultasi berhasil diterima.');
    }

    public function Reject($id)
{
    $konsultasi = Konsultasi::findOrFail($id);
    $konsultasi->status = 'ditolak';
    $konsultasi->save();

    // Create notification for user
    Notification::create([
        'user_id' => $konsultasi->pengguna_id,
        'type' => 'consultation_rejected',
        'title' => 'Konsultasi Ditolak',
        'message' => 'Permintaan konsultasi Anda ditolak oleh ahli. Silakan hubungi support jika ada pertanyaan.',
        'related_id' => $konsultasi->id,
    ]);

    return back()->with('success', 'Konsultasi berhasil ditolak.');
}

public function confirmPayment($id)
{
    $konsultasi = Konsultasi::findOrFail($id);

    // Pastikan hanya bisa dikonfirmasi jika statusnya 'menunggu_pembayaran'
    if ($konsultasi->status !== 'menunggu_pembayaran') {
        return back()->with('error', 'Aksi tidak valid.');
    }

    // Cek bukti pembayaran
    if (empty($konsultasi->foto_bukti_pembayaran)) {
        return back()->with('error', 'Bukti pembayaran belum diunggah oleh pengguna.');
    }

    $konsultasi->status = 'menunggu_konfirmasi';
    $konsultasi->save();

    // Notifikasi untuk pengguna
    Notification::create([
        'user_id' => $konsultasi->pengguna_id,
        'type' => 'payment_confirmed',
        'title' => 'Pembayaran Terkonfirmasi',
        'message' => 'Pembayaran Anda telah dikonfirmasi. Menunggu persetujuan final dari ahli.',
        'related_id' => $konsultasi->id,
    ]);

    return back()->with('success', 'Pembayaran berhasil dikonfirmasi.');
}

public function completeConsultation($id)
{
    $konsultasi = Konsultasi::findOrFail($id);

    // Pastikan hanya bisa diselesaikan jika statusnya 'diterima'
    if ($konsultasi->status !== 'diterima') {
        return back()->with('error', 'Aksi tidak valid.');
    }

    $konsultasi->status = 'selesai';
    $konsultasi->save();

    // Notifikasi untuk pengguna
    Notification::create([
        'user_id' => $konsultasi->pengguna_id,
        'type' => 'consultation_completed',
        'title' => 'Konsultasi Selesai',
        'message' => 'Sesi konsultasi Anda telah ditandai sebagai selesai oleh ahli.',
        'related_id' => $konsultasi->id,
    ]);

    return back()->with('success', 'Konsultasi telah diselesaikan.');
}

public function PesanShow()
{
    /** @var \App\Models\User $user */
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
                'image' => $msg->image ? asset($msg->image) : null,
                'time' => $msg->created_at->format('H:i'),
            ];
        });
    }

    return Inertia::render('ahli/Pesan', [
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
            'image' => $msg->image ? asset($msg->image) : null,
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

// E-Wallet Methods
public function EWalletShow(Request $request)
{
    /** @var \App\Models\User $user */
    $user = Auth::user();

    // As per your suggestion, I'm modifying this to work like the articles page, without pagination from the backend.
    // The frontend component will now receive a simple array and will be responsible for any pagination/filtering.
    $eWallets = $user->eWallets()
                    ->orderBy('created_at', 'desc')
                    ->get();
    

    return Inertia::render('ahli/EWallet', [
        'eWallets' => $eWallets,
        'filters' => $request->only(['search', 'sort']),
        'flash' => session('flash'),
        'user' => $user
    ]);
}

public function EWalletCreateShow()
{
    return Inertia::render('ahli/CreateEWallet', [
        'user' => Auth::user(),
    ]);
}

public function EWalletStore(Request $request)
{
    $request->validate([
        'nama_e_wallet' => 'required|string|max:255',
        'nomor_e_wallet' => 'required|string|max:255',
    ]);

    /** @var \App\Models\User $user */
    $user = Auth::user();
    $user->eWallets()->create($request->all());

    return redirect()->route('ahli-ewallet-show')->with('flash', ['success' => 'E-Wallet berhasil ditambahkan.']);
}

public function EWalletEditShow($id)
{
    $eWallet = EWallet::findOrFail($id);
    // Authorization check
    if ($eWallet->user_id !== Auth::id()) {
        abort(403);
    }

    return Inertia::render('ahli/EditEWallet', [
        'eWallet' => $eWallet,
        'user' => Auth::user(),
    ]);
}

public function EWalletUpdate(Request $request, $id)
{
    $eWallet = EWallet::findOrFail($id);
    if ($eWallet->user_id !== Auth::id()) {
        abort(403);
    }

    $request->validate([
        'nama_e_wallet' => 'required|string|max:255',
        'nomor_e_wallet' => 'required|string|max:255',
    ]);

    $eWallet->update($request->all());

    return redirect()->route('ahli-ewallet-show')->with('flash', ['success' => 'E-Wallet berhasil diperbarui.']);
}

public function EWalletDestroy($id)
{
    $eWallet = EWallet::findOrFail($id);
    if ($eWallet->user_id !== Auth::id()) {
        abort(403);
    }

    $eWallet->delete();

    return redirect()->back()->with('flash', ['success' => 'E-Wallet berhasil dihapus.']);
}
}
