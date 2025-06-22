"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Wallet,
    Upload,
    Eye,
    AlertCircle,
    CheckCircle,
    Info,
    CreditCard,
    FileText,
    ArrowLeft
} from "lucide-react";
import { Header } from "../../layout/header";
import { Footer } from "../../layout/footer";
import { useAlert } from "../../components/myalert";
import { Breadcrumb } from "../../components/breadcrump";
import { Head, usePage, router } from "@inertiajs/react";
import { route } from "ziggy-js";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

function EWalletDetailModal({ eWallet, open, onOpenChange, viewCount }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Wallet className="h-5 w-5" />
                        Detail {eWallet?.nama_e_wallet}
                    </DialogTitle>
                    <DialogDescription>
                        Informasi lengkap e-wallet untuk pembayaran
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700">Nama E-Wallet:</span>
                                <span className="text-gray-900">{eWallet?.nama_e_wallet}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700">Nomor Akun:</span>
                                <span className="text-gray-900 font-mono">{eWallet?.nomor_e_wallet}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700">Jumlah Dilihat:</span>
                                <Badge variant="secondary">{viewCount}/3</Badge>
                            </div>
                        </div>
                    </div>
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                            Silakan transfer ke nomor e-wallet di atas sesuai dengan biaya konsultasi yang tertera.
                        </AlertDescription>
                    </Alert>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Tutup
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function Pembayaran() {
    const { konsultasi, expert, eWallets, user, flash, errors } = usePage().props;
    const { showSuccess, showError, AlertContainer } = useAlert();
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedEWallet, setSelectedEWallet] = useState(null);
    const [isDetailModalOpen, setDetailModalOpen] = useState(false);
    const [ewalletViewCounts, setEwalletViewCounts] = useState({});

    useEffect(() => {
        if (flash.success) {
            showSuccess("Berhasil", flash.success);
        }
        if (flash.error) {
            showError("Gagal", flash.error);
        }
    }, [flash]);

    // Initialize view counts from props
    useEffect(() => {
        const counts = {};
        eWallets.forEach(ewallet => {
            counts[ewallet.id] = ewallet.view_count;
        });
        setEwalletViewCounts(counts);
    }, [eWallets]);

    const breadcrumbItems = [
        { label: "Ahli Herbal", href: route("list-ahli-herbal") },
        { label: "Pembayaran Konsultasi" },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.5,
                when: "beforeChildren",
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                showError("Error", "File harus berupa gambar (JPG, PNG, GIF)");
                return;
            }
            
            // Validate file size (2MB)
            if (file.size > 2 * 1024 * 1024) {
                showError("Error", "Ukuran file maksimal 2MB");
                return;
            }
            
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setSelectedFile(null);
            setPreviewUrl(null);
        }
    };

    const handleUpload = () => {
        if (!selectedFile) {
            showError("Error", "Pilih file bukti pembayaran terlebih dahulu");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('foto_bukti_pembayaran', selectedFile);

        router.post(route('pengguna-upload-bukti', konsultasi.id), formData, {
            onSuccess: () => {
                setSelectedFile(null);
                if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                }
                setIsUploading(false);
            },
            onError: () => {
                setIsUploading(false);
            },
        });
    };

    const handleViewEWallet = async (eWallet) => {
        try {
            const response = await fetch(route('pengguna-lihat-ewallet', [konsultasi.id, eWallet.id]), {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setSelectedEWallet(data.e_wallet);
                setEwalletViewCounts(prev => ({
                    ...prev,
                    [eWallet.id]: data.view_count
                }));
                setDetailModalOpen(true);
            } else {
                // Update view count even if it's an error (for spam case)
                if (data.view_count !== undefined) {
                    setEwalletViewCounts(prev => ({
                        ...prev,
                        [eWallet.id]: data.view_count
                    }));
                }
                showError("Error", data.error || "Gagal melihat detail e-wallet");
            }
        } catch (error) {
            console.error('Error fetching e-wallet details:', error);
            showError("Error", "Terjadi kesalahan saat mengambil detail e-wallet");
        }
    };

    const getConsultationPrice = () => {
        if (konsultasi.jenis === 'konsultasi_online') {
            return expert.harga_konsultasi_online;
        } else {
            return expert.harga_konsultasi_offline;
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(price);
    };

    return (
        <>
            <Head title="Pembayaran Konsultasi" />
            <div classname="fixed z-[9999999]">
            <AlertContainer />
            </div>
            <div className="flex flex-col min-h-screen bg-background">
                <Header />
                <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    <div className="container mx-auto px-4 py-6">
                        <Breadcrumb items={breadcrumbItems} />
                    </div>
                    <motion.div
                        className="container mx-auto"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className="mb-6">
                            <Button 
                                variant="outline" 
                                onClick={() => router.get(route('list-ahli-herbal'))}
                                className="mb-4"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali ke Daftar Ahli
                            </Button>
                        </div>

                        <Card className="shadow-lg border-0 rounded-2xl overflow-hidden mb-8">
                            <CardHeader className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 p-6 text-white">
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    <motion.div variants={itemVariants}>
                                        <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                                            <AvatarImage
                                                src={expert.foto || "/placeholder.svg"}
                                                alt={expert.nama}
                                                className="object-cover"
                                            />
                                            <AvatarFallback className="bg-white text-green-800 text-xl font-bold">
                                                {expert.nama.split(" ").map((n) => n[0]).join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                    </motion.div>
                                    <motion.div variants={itemVariants} className="text-center md:text-left">
                                        <h1 className="text-2xl font-bold">Pembayaran Konsultasi</h1>
                                        <p className="text-lg text-green-100">dengan {expert.nama}</p>
                                        <div className="flex gap-2 mt-2 justify-center md:justify-start">
                                            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                                                {konsultasi.jenis.replace('_', ' ')}
                                            </Badge>
                                            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                                                {formatPrice(getConsultationPrice())}
                                            </Badge>
                                        </div>
                                    </motion.div>
                                </div>
                            </CardHeader>
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Informasi Konsultasi */}
                            <motion.div variants={itemVariants}>
                                <Card className="shadow-lg border-0 rounded-2xl h-full">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-emerald-600" />
                                            Informasi Konsultasi
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Jenis Konsultasi:</span>
                                                <span className="font-medium capitalize">{konsultasi.jenis.replace('_', ' ')}</span>
                                            </div>
                                            {konsultasi.tanggal_konsultasi && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Tanggal:</span>
                                                    <span className="font-medium">{konsultasi.tanggal_konsultasi}</span>
                                                </div>
                                            )}
                                            {konsultasi.jam_konsultasi && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Jam:</span>
                                                    <span className="font-medium">{konsultasi.jam_konsultasi}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Biaya:</span>
                                                <span className="font-bold text-emerald-600">{formatPrice(getConsultationPrice())}</span>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h4 className="font-medium text-gray-800 mb-2">Keluhan:</h4>
                                            <p className="text-gray-600 text-sm">{konsultasi.keluhan}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* E-Wallet List */}
                            <motion.div variants={itemVariants}>
                                <Card className="shadow-lg border-0 rounded-2xl h-full flex flex-col">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Wallet className="h-5 w-5 text-emerald-600" />
                                            Metode Pembayaran
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-1 overflow-hidden">
                                        <div className="h-full overflow-y-auto pr-2 space-y-4">
                                            {eWallets.length > 0 ? (
                                                eWallets.map((eWallet) => (
                                                    <div key={eWallet.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <h4 className="font-medium text-gray-800">{eWallet.nama_e_wallet}</h4>
                                                                <p className="text-sm text-gray-500">
                                                                    Dilihat {ewalletViewCounts[eWallet.id] || 0}/3 kali
                                                                </p>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                variant={eWallet.can_view ? "default" : "destructive"}
                                                                onClick={() => handleViewEWallet(eWallet)}
                                                                disabled={!eWallet.can_view}
                                                            >
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                {eWallet.can_view ? "Lihat Detail" : "Limit Terpenuhi"}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <Alert>
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertDescription>
                                                        Ahli belum menambahkan metode pembayaran. Silakan hubungi ahli untuk informasi pembayaran.
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>

                        {/* Upload Bukti Pembayaran */}
                        <motion.div variants={itemVariants} className="mt-8">
                            <Card className="shadow-lg border-0 rounded-2xl">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Upload className="h-5 w-5 text-emerald-600" />
                                        Upload Bukti Pembayaran
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <Alert>
                                            <Info className="h-4 w-4" />
                                            <AlertDescription>
                                                Setelah melakukan transfer, silakan upload bukti pembayaran (screenshot atau foto transfer) untuk konfirmasi.
                                            </AlertDescription>
                                        </Alert>
                                        
                                        <div className="space-y-2">
                                            <Label htmlFor="bukti-pembayaran">Pilih File Bukti Pembayaran</Label>
                                            <Input
                                                id="bukti-pembayaran"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="cursor-pointer"
                                            />
                                            <p className="text-sm text-gray-500">
                                                Format: JPG, PNG, GIF (Maksimal 2MB)
                                            </p>
                                        </div>

                                        {previewUrl && (
                                            <div className="mt-4 border p-2 rounded-lg bg-gray-50 flex justify-center">
                                                <img src={previewUrl} alt="Preview Bukti Pembayaran" className="max-h-60 w-auto rounded-md shadow-sm" />
                                            </div>
                                        )}

                                        <Button
                                            onClick={handleUpload}
                                            disabled={!selectedFile || isUploading}
                                            className="w-full"
                                            size="lg"
                                        >
                                            {isUploading ? (
                                                "Mengupload..."
                                            ) : (
                                                <>
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    Upload Bukti Pembayaran
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                </main>
                <Footer />
            </div>

            <EWalletDetailModal
                eWallet={selectedEWallet}
                open={isDetailModalOpen}
                onOpenChange={setDetailModalOpen}
                viewCount={selectedEWallet ? ewalletViewCounts[selectedEWallet.id] : 0}
            />
        </>
    );
}
