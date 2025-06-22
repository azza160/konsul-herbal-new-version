"use client";
import { useState, useEffect, useMemo, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Header } from "../../layout/header";
import { Footer } from "../../layout/footer";
import { Breadcrumb } from "../../components/breadcrump";
import { Input } from "@/components/ui/input";
import { useAlert } from "../../components/myalert";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Search,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    Hourglass,
    Download,
    MessageSquare,
    Trash2,
    Check,
    FileText,
    Wallet,
    Calendar,
    ArrowRight
} from "lucide-react";
import { Head, router, usePage, Link } from "@inertiajs/react";
import { route } from "ziggy-js";
import { SimplePagination } from "@/components/simple-pagination";
import clsx from "clsx";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const statusConfig = {
    menunggu_pembayaran: { label: "Menunggu Pembayaran", color: "bg-yellow-100 text-yellow-800", icon: <Wallet className="h-4 w-4" /> },
    menunggu_konfirmasi: { label: "Menunggu Konfirmasi", color: "bg-blue-100 text-blue-800", icon: <Hourglass className="h-4 w-4" /> },
    diterima: { label: "Diterima", color: "bg-green-100 text-green-800", icon: <CheckCircle className="h-4 w-4" /> },
    ditolak: { label: "Ditolak", color: "bg-red-100 text-red-800", icon: <XCircle className="h-4 w-4" /> },
    selesai: { label: "Selesai", color: "bg-gray-100 text-gray-800", icon: <Check className="h-4 w-4" /> },
};

const StepIndicator = ({ status }) => {
    const steps = ['menunggu_pembayaran', 'menunggu_konfirmasi', 'diterima', 'selesai'];
    const isRejected = status === 'ditolak';
    let currentStepIndex = steps.indexOf(status);
    
    // For rejected status, determine where it was rejected from
    if (isRejected) {
        // Check if there's a payment proof, if yes, it was rejected after payment
        // For now, we'll assume it was rejected after payment confirmation
        currentStepIndex = 2; // After payment confirmation
    }

    const timelineSteps = [
        { label: "Pembayaran" },
        { label: "Konfirmasi" },
        isRejected ? { label: "Ditolak", rejected: true } : { label: "Diterima" },
        { label: "Selesai" },
    ];

    return (
        <div className="flex items-center justify-between w-full">
            {timelineSteps.map((step, index) => (
                <Fragment key={index}>
                    <div className="flex flex-col items-center">
                        <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center border-2", {
                            "bg-green-500 border-green-600 text-white": !isRejected && index < currentStepIndex,
                            "bg-emerald-600 border-emerald-700 text-white animate-pulse": !isRejected && index === currentStepIndex,
                            "bg-red-500 border-red-600 text-white": step.rejected,
                            "bg-gray-200 border-gray-300 text-gray-500": (index > currentStepIndex && !isRejected) || (isRejected && index > 2),
                        })}>
                           {index < currentStepIndex && !isRejected ? <Check size={16} /> : <span className="text-xs font-bold">{index + 1}</span>}
                        </div>
                        <p className={clsx("text-xs mt-2 text-center", { "text-red-500 font-semibold": step.rejected, "text-muted-foreground": (index > currentStepIndex && !isRejected) || (isRejected && index > 2) })}>
                            {step.label}
                        </p>
                    </div>
                    {index < timelineSteps.length - 1 && (
                        <div className={clsx("flex-1 h-1 mx-2", {
                            "bg-green-500": !isRejected && index < currentStepIndex,
                            "bg-red-500": isRejected && index < 2, // Show red line up to rejection point
                            "bg-gray-300": (index >= currentStepIndex && !isRejected) || (isRejected && index >= 2),
                        })} />
                    )}
                </Fragment>
            ))}
        </div>
    );
};


export default function RiwayatKonsultasi() {
    const { konsultasis, flash, user } = usePage().props;
    const { showSuccess, showError, AlertContainer } = useAlert();

    useEffect(() => {
        if (flash.success) showSuccess("Berhasil", flash.success);
        if (flash.error) showError("Gagal", flash.error);
    }, [flash, showSuccess, showError]);

    // State for filters and search
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [sortBy, setSortBy] = useState("terbaru");
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 6;

    const [confirmDeleteModal, setConfirmDeleteModal] = useState({ open: false, consultation: null });
    const [detailModal, setDetailModal] = useState(null);

    const breadcrumbItems = [
        { label: "Beranda", href: route("beranda") },
        { label: "Riwayat Konsultasi" },
    ];

    const handleDelete = (consultation) => {
        setConfirmDeleteModal({ open: true, consultation });
    };

    const confirmDelete = () => {
        const { consultation } = confirmDeleteModal;
        if (!consultation) return;
        router.delete(route("hapus-konsultasi", consultation.id), {
            onSuccess: () => setConfirmDeleteModal({ open: false, consultation: null }),
        });
    };

    // Combined filtering, searching, and sorting logic
    const processedConsultations = useMemo(() => {
        return (konsultasis || [])
            .filter(c => searchTerm === "" || c.ahli_nama.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(c => statusFilter === "all" || c.status === statusFilter)
            .filter(c => typeFilter === "all" || c.jenis === typeFilter)
            .sort((a, b) => {
                const dateA = new Date(a.created_at);
                const dateB = new Date(b.created_at);
                return sortBy === "terbaru" ? dateB - dateA : dateA - dateB;
            });
    }, [konsultasis, searchTerm, statusFilter, typeFilter, sortBy]);

    // Pagination logic
    const totalItems = processedConsultations.length;
    const paginatedConsultations = processedConsultations.slice((currentPage - 1) * perPage, currentPage * perPage);
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, typeFilter, sortBy]);

    const renderActionButtons = (consultation, context = 'card') => {
        const buttonProps = context === 'card' ? { size: 'sm' } : {};
        switch (consultation.status) {
            case "menunggu_pembayaran":
                return <Button {...buttonProps} className="w-full" asChild><Link href={route('pengguna-pembayaran', consultation.id)}><Wallet className="h-4 w-4 mr-2" /> Lakukan Pembayaran</Link></Button>;
            case "diterima":
                if (consultation.jenis === 'konsultasi_online') {
                    return <Button {...buttonProps} className="w-full" asChild><Link href={route('pengguna-pesan')}><MessageSquare className="h-4 w-4 mr-2" /> Mulai Konsultasi</Link></Button>;
                }
                return <Button {...buttonProps} className="w-full" onClick={() => console.log('Download offline details')}><Download className="h-4 w-4 mr-2" /> Download</Button>;
            case "selesai":
            case "ditolak":
                return <Button {...buttonProps} variant="destructive" className="w-full" onClick={() => handleDelete(consultation)}><Trash2 className="h-4 w-4 mr-2" /> Hapus</Button>;
            default:
                return null;
        }
    };
    
    return (
        <>
            <AlertContainer />
            <Head title="Riwayat Konsultasi" />
            <div className="flex flex-col min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    <div className="container mx-auto">
                        <Breadcrumb items={breadcrumbItems} />
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                            <h1 className="text-2xl md:text-3xl font-bold">Riwayat Konsultasi Anda</h1>
                            <p className="text-muted-foreground">Kelola semua riwayat konsultasi herbal Anda di sini.</p>
                        </motion.div>

                        <Card className="mb-6">
                            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="relative lg:col-span-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                    <Input placeholder="Cari nama ahli..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger><SelectValue placeholder="Filter Status" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        {Object.keys(statusConfig).map(status => (
                                            <SelectItem key={status} value={status}>{statusConfig[status].label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger><SelectValue placeholder="Filter Jenis" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Jenis</SelectItem>
                                        <SelectItem value="konsultasi_online">Konsultasi Online</SelectItem>
                                        <SelectItem value="konsultasi_offline">Konsultasi Offline</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger><SelectValue placeholder="Urutkan" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="terbaru">Terbaru</SelectItem>
                                        <SelectItem value="terlama">Terlama</SelectItem>
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {paginatedConsultations.length > 0 ? (
                                paginatedConsultations.map((consultation) => (
                                    <motion.div key={consultation.id} whileHover={{ y: -5 }} className="h-full">
                                    <Card className="h-full flex flex-col justify-between shadow-sm hover:shadow-lg transition-shadow duration-300">
                                        <CardContent className="p-6 space-y-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-16 w-16">
                                                        <AvatarImage 
                                                            src={consultation.ahli_foto} 
                                                            alt={consultation.ahli_nama}
                                                            className="object-cover"
                                                        />
                                                        <AvatarFallback className="text-lg font-semibold">{consultation.ahli_nama.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <h3 className="font-semibold">{consultation.ahli_nama}</h3>
                                                        <p className="text-sm text-muted-foreground capitalize">{consultation.jenis.replace('_', ' ')}</p>
                                                    </div>
                                                </div>
                                                <Badge className={clsx("text-xs", statusConfig[consultation.status]?.color)}>
                                                    {statusConfig[consultation.status]?.label}
                                                </Badge>
                                            </div>
                                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                 <Calendar className="h-4 w-4" /> 
                                                 <span>{new Date(consultation.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                            </div>
                                            <div className="flex items-center gap-4 pt-4">
                                                <Button variant="outline" size="sm" className="w-full" onClick={() => setDetailModal(consultation)}><Eye className="h-4 w-4 mr-2" />Lihat Detail</Button>
                                                {renderActionButtons(consultation, 'card')}
                                            </div>
                                        </CardContent>
                                    </Card>
                                    </motion.div>
                                ))
                            ) : (
                               <div className="col-span-full text-center p-12 bg-white rounded-lg shadow-sm">
                                    <p className="text-muted-foreground">Tidak ada data konsultasi yang cocok.</p>
                               </div>
                            )}
                            </div>
                        </motion.div>
                        <SimplePagination currentPage={currentPage} setCurrentPage={setCurrentPage} totalItems={totalItems} perPage={perPage} itemName="konsultasi" />

                        {/* Delete Confirmation Modal */}
                        <Dialog open={confirmDeleteModal.open} onOpenChange={(open) => setConfirmDeleteModal({ ...confirmDeleteModal, open })}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Konfirmasi Hapus</DialogTitle>
                                    <DialogDescription>
                                        Apakah Anda yakin ingin menghapus riwayat konsultasi ini?
                                        {confirmDeleteModal.consultation?.jenis === 'konsultasi_online' && " Semua riwayat pesan akan ikut terhapus secara permanen."}
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setConfirmDeleteModal({ open: false, consultation: null })}>Batal</Button>
                                    <Button onClick={confirmDelete} variant="destructive">Hapus</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                         {/* Detail Modal */}
                        <AnimatePresence>
                        {detailModal && (
                            <Dialog open={!!detailModal} onOpenChange={() => setDetailModal(null)}>
                                <DialogContent className="max-w-2xl">
                                     <DialogHeader><DialogTitle className="flex items-center gap-2"><FileText />Detail Konsultasi</DialogTitle></DialogHeader>
                                    <div className="space-y-6 py-4">
                                        <div>
                                            <h4 className="font-semibold mb-3 text-center">Progres Konsultasi</h4>
                                            <StepIndicator status={detailModal.status} />
                                        </div>
                                        <Card>
                                            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                               <div className="font-semibold text-muted-foreground">Nama Ahli:</div><div>{detailModal.ahli_nama}</div>
                                               <div className="font-semibold text-muted-foreground">Nama Pengguna:</div><div>{user.nama}</div>
                                               <div className="font-semibold text-muted-foreground">Jenis:</div><div className="capitalize">{detailModal.jenis.replace('_',' ')}</div>
                                               <div className="font-semibold text-muted-foreground">Status:</div><div><Badge className={statusConfig[detailModal.status]?.color}>{statusConfig[detailModal.status]?.label}</Badge></div>
                                               <div className="font-semibold text-muted-foreground">Tanggal Dibuat:</div><div>{new Date(detailModal.created_at).toLocaleString('id-ID')}</div>
                                               {detailModal.jenis === 'konsultasi_offline' && (
                                                   <>
                                                    <div className="font-semibold text-muted-foreground">Jadwal:</div>
                                                    <div>{detailModal.tanggal_konsultasi} Pukul {detailModal.jam_konsultasi}</div>
                                                   </>
                                               )}
                                               <div className="md:col-span-2 font-semibold text-muted-foreground">Topik/Keluhan:</div>
                                               <div className="md:col-span-2 whitespace-pre-wrap bg-muted/50 p-3 rounded-md">{detailModal.keluhan}</div>
                                            </CardContent>
                                        </Card>
                                        <div className="flex gap-4">
                                             {renderActionButtons(detailModal, 'modal')}
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setDetailModal(null)}>Tutup</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                        </AnimatePresence>

                    </div>
                </main>
                <Footer />
            </div>
        </>
    );
}
