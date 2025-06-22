"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    CalendarIcon,
    Phone,
    Mail,
    Briefcase,
    MapPin,
    Clock,
    DollarSign,
    GraduationCap,
    MessageCircle,
    Video,
    Send
} from "lucide-react";
import { Header } from "../../layout/header";
import { Footer } from "../../layout/footer";
import { useAlert } from "../../components/myalert";
import { Breadcrumb } from "../../components/breadcrump";
import { Head, usePage, useForm } from "@inertiajs/react";
import { route } from "ziggy-js";
import MapPicker from "../../components/ui/map-picker";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

function OnlineConsultationDialog({ expert, open, onOpenChange }) {
    const [isConfirmOpen, setConfirmOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm(
        "OnlineConsultation",
        {
            ahli_id: expert.id,
            jenis: "konsultasi_online",
            keluhan: "",
        }
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        if (data.keluhan.length >= 6) {
            setConfirmOpen(true);
        }
    };

    const handleConfirm = () => {
        post(route("pengguna-konsultasi"), {
            preserveScroll: true,
            onSuccess: () => {
                setConfirmOpen(false);
                onOpenChange(false);
                reset();
            },
            onError: () => {
                setConfirmOpen(false);
            },
        });
    };

    useEffect(() => {
        if (!open) {
           setTimeout(() => reset(), 500);
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Konsultasi Online</DialogTitle>
                    <DialogDescription>
                        Jelaskan keluhan Anda untuk memulai konsultasi online
                        dengan {expert.nama}.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="keluhan-online">
                                Topik Konsultasi
                            </Label>
                            <Textarea
                                id="keluhan-online"
                                placeholder="Jelaskan keluhan atau topik..."
                                value={data.keluhan}
                                onChange={(e) =>
                                    setData("keluhan", e.target.value)
                                }
                                className={errors.keluhan ? "border-red-500" : ""}
                            />
                            {errors.keluhan && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.keluhan}
                                </p>
                            )}
                        </div>
                        <div className="bg-gray-100 p-3 rounded-md text-sm text-gray-600">
                            <p>
                                <strong>Prosedur Konsultasi Online:</strong>
                            </p>
                            <ul className="list-disc list-inside">
                                <li>Kirim permintaan Anda.</li>
                                <li>
                                    Lakukan pembayaran sesuai instruksi.
                                </li>
                                <li>Ahli akan mengkonfirmasi jadwal.</li>
                                <li>Konsultasi akan dilakukan via chat.</li>
                            </ul>
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button
                            type="submit"
                            disabled={data.keluhan.length < 6 || processing}
                        >
                            {processing ? (
                                "Mengirim..."
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" /> Kirim
                                    Permintaan
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>

            <Dialog open={isConfirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Permintaan</DialogTitle>
                        <DialogDescription>
                            Anda yakin ingin mengirim permintaan konsultasi
                            online ini?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setConfirmOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button onClick={handleConfirm} disabled={processing}>
                            {processing ? "Memproses..." : "Yakin"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Dialog>
    );
}

function OfflineConsultationDialog({ expert, open, onOpenChange }) {
    const { data, setData, post, processing, errors, reset } = useForm(
        "OfflineConsultation",
        {
            ahli_id: expert.id,
            jenis: "konsultasi_offline",
            keluhan: "",
            tanggal_konsultasi: "",
            jam_konsultasi: "",
        }
    );
    const [isConfirmOpen, setConfirmOpen] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setConfirmOpen(true);
    };

    const handleConfirm = () => {
        post(route("pengguna-konsultasi"), {
            preserveScroll: true,
            onSuccess: () => {
                setConfirmOpen(false);
                onOpenChange(false);
                reset();
            },
            onError: () => {
                setConfirmOpen(false);
            },
        });
    };

    useEffect(() => {
        if (!open) {
            setTimeout(() => reset(), 500);
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Konsultasi Offline</DialogTitle>
                    <DialogDescription>
                        Isi form untuk menjadwalkan konsultasi tatap muka dengan{" "}
                        {expert.nama}.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="keluhan-offline">
                                Topik Konsultasi
                            </Label>
                            <Textarea
                                id="keluhan-offline"
                                name="keluhan"
                                placeholder="Jelaskan keluhan atau topik..."
                                value={data.keluhan}
                                onChange={(e) => setData("keluhan", e.target.value)}
                                className={errors.keluhan ? "border-red-500" : ""}
                            />
                            {errors.keluhan && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.keluhan}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="tanggal_konsultasi">
                                Tanggal Konsultasi
                            </Label>
                            <Input
                                id="tanggal_konsultasi"
                                name="tanggal_konsultasi"
                                type="date"
                                value={data.tanggal_konsultasi}
                                onChange={(e) => setData("tanggal_konsultasi", e.target.value)}
                                className={
                                    errors.tanggal_konsultasi
                                        ? "border-red-500"
                                        : ""
                                }
                            />
                            {errors.tanggal_konsultasi && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.tanggal_konsultasi}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="jam_konsultasi">Jam Konsultasi</Label>
                            <Input
                                id="jam_konsultasi"
                                name="jam_konsultasi"
                                type="time"
                                value={data.jam_konsultasi}
                                onChange={(e) => setData("jam_konsultasi", e.target.value)}
                                className={
                                    errors.jam_konsultasi ? "border-red-500" : ""
                                }
                            />
                            {errors.jam_konsultasi && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.jam_konsultasi}
                                </p>
                            )}
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button
                            type="submit"
                            disabled={
                                data.keluhan.length < 6 ||
                                !data.tanggal_konsultasi ||
                                !data.jam_konsultasi ||
                                processing
                            }
                        >
                            {processing ? (
                                "Mengirim..."
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" /> Kirim
                                    Permintaan
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>

            <Dialog open={isConfirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Permintaan</DialogTitle>
                        <DialogDescription>
                            Anda yakin ingin mengirim permintaan konsultasi offline
                            ini?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setConfirmOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button onClick={handleConfirm} disabled={processing}>
                           {processing ? "Memproses..." : "Yakin"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Dialog>
    );
}

export default function DetailAhliHerbal() {
    const { expert, user, flash, errors } = usePage().props;
    const { showSuccess, showError, AlertContainer } = useAlert();
    const [isOnlineModalOpen, setOnlineModalOpen] = useState(false);
    const [isOfflineModalOpen, setOfflineModalOpen] = useState(false);

    useEffect(() => {
        if (flash.success) {
            showSuccess("Berhasil", flash.success);
        }
        if (flash.error) {
            showError("Gagal", flash.error);
        }
        if (errors.limit) {
            showError("Gagal", errors.limit);
        }
    }, [flash, errors]);

    const breadcrumbItems = [
        { label: "Ahli Herbal", href: route("list-ahli-herbal") },
        { label: "Detail Ahli Herbal" },
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

    const formatExperience = (experience) => {
        if (!experience) {
            return <p className="text-gray-500 italic">Belum ada pengalaman</p>;
        }

        return experience.split("\n\n").map((paragraph, index) => (
            <p
                key={index}
                className="mb-3 sm:mb-4 text-gray-700 leading-relaxed text-sm sm:text-base"
            >
                {paragraph}
            </p>
        ));
    };

    const getAge = (dateString) => {
        if (!dateString) return '';
        const today = new Date();
        const birthDate = new Date(dateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    return (
        <>
            <Head title={`Detail Ahli - ${expert.nama}`} />
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
                        <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 p-6 text-white">
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    <motion.div variants={itemVariants}>
                                        <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                                            <AvatarImage
                                                src={expert.foto || "/placeholder.svg"}
                                                alt={expert.nama}
                                                className="object-cover"
                                            />
                                            <AvatarFallback className="bg-white text-green-800 text-3xl font-bold">
                                                {expert.nama.split(" ").map((n) => n[0]).join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                    </motion.div>
                                    <motion.div variants={itemVariants} className="text-center md:text-left">
                                        <h1 className="text-3xl font-bold">{expert.nama}</h1>
                                        <p className="text-lg text-green-100">{expert.ahli?.nama_spesialisasi}</p>
                                        <div className="flex gap-2 mt-2 justify-center md:justify-start">
                                            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">{expert.jk}</Badge>
                                            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">{getAge(expert.tgl_lahir)} tahun</Badge>
                                        </div>
                                    </motion.div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-8">
                                    <motion.div variants={itemVariants}>
                                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><GraduationCap className="text-emerald-600" /> Deskripsi Spesialisasi</h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            {expert.ahli?.deskripsi_spesialisasi || 'Tidak ada deskripsi.'}
                                        </p>
                                    </motion.div>

                                    <motion.div variants={itemVariants}>
                                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><Briefcase className="text-emerald-600" /> Pengalaman</h3>
                                        <div className="prose prose-sm sm:prose-base max-w-none text-gray-600">
                                            {formatExperience(expert.pengalaman)}
                                        </div>
                                    </motion.div>
                                    
                                    <motion.div variants={itemVariants}>
                                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><MapPin className="text-emerald-600" /> Lokasi Praktik</h3>
                                        {expert.lokasi ? (
                                            <div className="space-y-4">
                                                <p className="text-gray-600">{expert.lokasi.alamat}</p>
                                                <div className="overflow-hidden rounded-lg h-64 border relative z-0">
                                                    <MapPicker
                                                        isEditable={false}
                                                        initialPosition={{
                                                            lat: parseFloat(expert.lokasi.latitude),
                                                            lng: parseFloat(expert.lokasi.longitude),
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 italic">Lokasi belum diatur oleh ahli.</p>
                                        )}
                                    </motion.div>
                                </div>

                                <div className="space-y-6">
                                    <motion.div variants={itemVariants} className="p-4 bg-green-50 rounded-lg">
                                        <h3 className="text-xl font-bold text-gray-800 mb-4">Informasi Kontak</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <Mail className="h-5 w-5 text-green-600" />
                                                <span className="text-gray-700">{expert.email}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Phone className="h-5 w-5 text-green-600" />
                                                <span className="text-gray-700">{expert.telp}</span>
                                            </div>
                                            {expert.tgl_lahir &&
                                            <div className="flex items-center gap-3">
                                                <CalendarIcon className="h-5 w-5 text-green-600" />
                                                <span className="text-gray-700">{new Date(expert.tgl_lahir).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                                            </div>
                                            }
                                        </div>
                                    </motion.div>

                                    <motion.div variants={itemVariants} className="p-4 bg-green-50 rounded-lg">
                                        <h3 className="text-xl font-bold text-gray-800 mb-4">Jadwal & Biaya</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <Clock className="h-5 w-5 text-green-600" />
                                                <div>
                                                    <p className="text-gray-700">{expert.hari_pertama_buka && expert.hari_terakhir_buka ? `${expert.hari_pertama_buka} - ${expert.hari_terakhir_buka}`: 'Hari kerja belum diatur'}</p>
                                                    <p className="text-gray-700">{expert.jam_mulai_kerja && expert.jam_selesai_kerja ? `${expert.jam_mulai_kerja.substring(0, 5)} - ${expert.jam_selesai_kerja.substring(0, 5)}` : 'Jam kerja belum diatur'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <DollarSign className="h-5 w-5 text-green-600" />
                                                <div>
                                                    <p className="text-gray-700">Online: {expert.harga_konsultasi_online ? `Rp ${new Intl.NumberFormat('id-ID').format(expert.harga_konsultasi_online)}` : 'N/A'}</p>
                                                    <p className="text-gray-700">Offline: {expert.harga_konsultasi_offline ? `Rp ${new Intl.NumberFormat('id-ID').format(expert.harga_konsultasi_offline)}` : 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                    
                                    <motion.div variants={itemVariants} className="pt-6 space-y-3">
                                        {user && user.role === 'pengguna' ? (
                                            <>
                                                <Button size="lg" className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700" onClick={() => setOnlineModalOpen(true)}>
                                                    <MessageCircle className="mr-2 h-5 w-5" /> Mulai Konsultasi Online
                                                </Button>
                                                <Button size="lg" variant="outline" className="w-full border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white" onClick={() => setOfflineModalOpen(true)}>
                                                    <Video className="mr-2 h-5 w-5" /> Mulai Konsultasi Offline
                                                </Button>
                                            </>
                                        ) : null }
                                    </motion.div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </main>
                <Footer />
            </div>

            <OnlineConsultationDialog
                expert={expert}
                open={isOnlineModalOpen}
                onOpenChange={setOnlineModalOpen}
            />
            <OfflineConsultationDialog
                expert={expert}
                open={isOfflineModalOpen}
                onOpenChange={setOfflineModalOpen}
            />
        </>
    );
} 