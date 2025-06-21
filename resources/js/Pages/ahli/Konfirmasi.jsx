"use client";

import { useState, useEffect, useMemo, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ExpertSidebar } from "../../layout/ahli-sidebar";
import { AdminHeader } from "../../layout/admin-header";
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
    Clock,
    Check,
    Search,
    X,
    Eye,
    CheckCircle,
    XCircle,
    CheckCheck,
    Wallet,
    FileText,
} from "lucide-react";
import { Head, router, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";
import { SimplePagination } from "@/components/simple-pagination";
import clsx from "clsx";

const statusConfig = {
    menunggu_pembayaran: { label: "Menunggu Pembayaran", color: "bg-yellow-100 text-yellow-800" },
    menunggu_konfirmasi: { label: "Menunggu Konfirmasi", color: "bg-blue-100 text-blue-800" },
    diterima: { label: "Diterima", color: "bg-green-100 text-green-800" },
    ditolak: { label: "Ditolak", color: "bg-red-100 text-red-800" },
    selesai: { label: "Selesai", color: "bg-gray-100 text-gray-800" },
};

export default function ConsultationsPage() {
    const { consultations, flash, user } = usePage().props;
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
    const perPage = 5;

    const [confirmModal, setConfirmModal] = useState({ open: false, consultation: null, action: null });
    const [detailModal, setDetailModal] = useState(null);
    const [imageModal, setImageModal] = useState(null);

    const breadcrumbItems = [
        { label: "Ahli", href: route("ahli-dashboard-acount") },
        { label: "Konfirmasi Konsultasi" },
    ];

    const handleAction = (consultation, action) => {
        setConfirmModal({ open: true, consultation, action });
    };

    const confirmAction = () => {
        const { consultation, action } = confirmModal;
        if (!consultation || !action) return;
        let targetRoute;
        switch (action) {
            case "confirm-payment": targetRoute = route("konsultasi.confirm-payment", consultation.id); break;
            case "reject": targetRoute = `/konsultasi/${consultation.id}/reject`; break;
            case "accept": targetRoute = `/konsultasi/${consultation.id}/accept`; break;
            case "complete": targetRoute = route("konsultasi.complete", consultation.id); break;
            default: return;
        }
        router.post(targetRoute, {}, {
            onSuccess: () => setConfirmModal({ open: false, consultation: null, action: null }),
            onError: (err) => {
                console.error("Error:", err);
                showError("Error", "Terjadi kesalahan saat memproses aksi.");
            },
        });
    };

    // Combined filtering, searching, and sorting logic
    const processedConsultations = useMemo(() => {
        return (consultations || [])
            .filter(c => searchTerm === "" || c.patientName.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(c => statusFilter === "all" || c.status === statusFilter)
            .filter(c => typeFilter === "all" || c.jenis === typeFilter)
            .sort((a, b) => {
                const dateA = new Date(a.requestTime);
                const dateB = new Date(b.requestTime);
                return sortBy === "terbaru" ? dateB - dateA : dateA - dateB;
            });
    }, [consultations, searchTerm, statusFilter, typeFilter, sortBy]);

    // Pagination logic
    const totalItems = processedConsultations.length;
    const paginatedConsultations = processedConsultations.slice((currentPage - 1) * perPage, currentPage * perPage);
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, typeFilter, sortBy]);

    const renderActionButtons = (consultation) => {
        const baseButtonContainerClass = "flex items-center justify-center gap-2 w-[240px]";
        switch (consultation.status) {
            case "menunggu_pembayaran":
                return (
                    <div className={baseButtonContainerClass}>
                        <Button size="sm" onClick={() => handleAction(consultation, "confirm-payment")}><Check className="h-4 w-4 mr-1" />Konfirmasi</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleAction(consultation, "reject")}><X className="h-4 w-4 mr-1" />Tolak</Button>
                    </div>
                );
            case "menunggu_konfirmasi":
                return (
                    <div className={baseButtonContainerClass}>
                        <Button size="sm" onClick={() => handleAction(consultation, "accept")}><Check className="h-4 w-4 mr-1" />Terima</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleAction(consultation, "reject")}><X className="h-4 w-4 mr-1" />Tolak</Button>
                    </div>
                );
            case "diterima":
                return (
                    <div className={baseButtonContainerClass}>
                        <Button size="sm" onClick={() => handleAction(consultation, "complete")} className="bg-blue-600 hover:bg-blue-700"><CheckCheck className="h-4 w-4 mr-1" />Selesaikan</Button>
                    </div>
                );
            case "ditolak":
                return <div className={baseButtonContainerClass}><Button size="sm" variant="destructive" disabled>Ditolak</Button></div>;
            case "selesai":
                return <div className={baseButtonContainerClass}><Button size="sm" disabled>Selesai</Button></div>;
            default:
                return <div className={baseButtonContainerClass}></div>;
        }
    };
    
    return (
        <>
            <AlertContainer />
            <Head title="Konfirmasi Konsultasi" />
            <div className="flex flex-col min-h-screen bg-background">
                <AdminHeader user={user} />
                <div className="flex flex-1 overflow-hidden">
                    <ExpertSidebar user={user} activeLink={route("ahli-konfirmasi")} />
                    <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                        <Breadcrumb items={breadcrumbItems} />
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                            <h1 className="text-2xl md:text-3xl font-bold">Konfirmasi Konsultasi</h1>
                            <p className="text-muted-foreground">Kelola permintaan konsultasi dari pasien</p>
                        </motion.div>

                        <Card className="mb-6">
                            <CardContent className="pt-6 flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                    <Input placeholder="Cari nama pasien..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Filter Status" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        {Object.keys(statusConfig).map(status => (
                                            <SelectItem key={status} value={status}>{statusConfig[status].label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Filter Jenis" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Jenis</SelectItem>
                                        <SelectItem value="konsultasi_online">Konsultasi Online</SelectItem>
                                        <SelectItem value="konsultasi_offline">Konsultasi Offline</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Urutkan" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="terbaru">Terbaru</SelectItem>
                                        <SelectItem value="terlama">Terlama</SelectItem>
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2"><Clock className="h-5 w-5" /><span>Permintaan Konsultasi ({totalItems})</span></CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <Table className="w-full text-sm text-left">
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="p-4 w-[50px] text-center">No.</TableHead>
                                                    <TableHead className="p-4 pl-6">Pasien</TableHead>
                                                    <TableHead className="p-4">Jenis</TableHead>
                                                    <TableHead className="p-4">Jadwal</TableHead>
                                                    <TableHead className="p-4">Status</TableHead>
                                                    <TableHead className="p-4 text-center">Aksi</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {paginatedConsultations.length > 0 ? (
                                                    paginatedConsultations.map((consultation, index) => (
                                                        <Fragment key={consultation.id}>
                                                            <tr className="border-t-2 border-slate-200 first:border-t-0">
                                                                <TableCell className="font-medium p-4 text-center">
                                                                    {(currentPage - 1) * perPage + index + 1}
                                                                </TableCell>
                                                                <TableCell className="font-medium p-4 pl-6">{consultation.patientName}</TableCell>
                                                                <TableCell className="p-4 capitalize">{consultation.jenis.replace('_', ' ')}</TableCell>
                                                                <TableCell className="p-4">
                                                                    {consultation.jenis === 'konsultasi_offline' && consultation.tanggal_konsultasi ? (
                                                                        `${consultation.tanggal_konsultasi} Pukul ${consultation.jam_konsultasi}`
                                                                    ) : (<span className="text-muted-foreground">Online</span>)}
                                                                </TableCell>
                                                                <TableCell className="p-4">
                                                                    <span className={clsx("px-2 py-1 rounded-full text-xs font-medium", statusConfig[consultation.status]?.color)}>
                                                                        {statusConfig[consultation.status]?.label}
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell className="p-4">{renderActionButtons(consultation)}</TableCell>
                                                            </tr>
                                                            <tr className="border-b-2 border-slate-200">
                                                                <TableCell colSpan={6} className="p-2 text-center bg-slate-50/50">
                                                                    <Button variant="ghost" size="sm" onClick={() => setDetailModal(consultation)} className="text-muted-foreground hover:text-primary">
                                                                        <Eye className="h-4 w-4 mr-2" />Lihat Detail
                                                                    </Button>
                                                                </TableCell>
                                                            </tr>
                                                        </Fragment>
                                                    ))
                                                ) : (
                                                    <TableRow><TableCell colSpan={6} className="text-center p-8 text-muted-foreground">Tidak ada data yang cocok.</TableCell></TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                        <SimplePagination currentPage={currentPage} setCurrentPage={setCurrentPage} totalItems={totalItems} perPage={perPage} itemName="konsultasi" />

                        <Dialog open={confirmModal.open} onOpenChange={(open) => setConfirmModal({ open, consultation: null, action: null })}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Konfirmasi Aksi</DialogTitle>
                                    <DialogDescription>Apakah Anda yakin ingin {confirmModal.action?.replace('-', ' ')} konsultasi dari {confirmModal.consultation?.patientName}?</DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setConfirmModal({ open: false, consultation: null, action: null })}>Batal</Button>
                                    <Button onClick={confirmAction} variant={confirmModal.action === "reject" ? "destructive" : "default"}>Lanjutkan</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <AnimatePresence>
                        {detailModal && (
                            <Dialog open={!!detailModal} onOpenChange={() => setDetailModal(null)}>
                                <DialogContent className="max-w-2xl">
                                     <DialogHeader><DialogTitle className="flex items-center gap-2"><FileText />Detail Konsultasi</DialogTitle></DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4"><span className="text-right font-semibold text-muted-foreground">Pasien</span><span className="col-span-3">{detailModal.patientName}</span></div>
                                        <div className="grid grid-cols-4 items-center gap-4"><span className="text-right font-semibold text-muted-foreground">Jenis</span><span className="col-span-3 capitalize">{detailModal.jenis.replace('_', ' ')}</span></div>
                                        {detailModal.jenis === 'konsultasi_offline' && (<div className="grid grid-cols-4 items-center gap-4"><span className="text-right font-semibold text-muted-foreground">Jadwal</span><span className="col-span-3">{detailModal.tanggal_konsultasi} Pukul {detailModal.jam_konsultasi}</span></div>)}
                                        <div className="grid grid-cols-4 items-start gap-4"><span className="text-right font-semibold text-muted-foreground pt-1">Keluhan</span><p className="col-span-3 whitespace-pre-wrap">{detailModal.topic}</p></div>
                                        <div className="grid grid-cols-4 items-start gap-4"><span className="text-right font-semibold text-muted-foreground pt-1">Bukti Bayar</span>
                                            <div className="col-span-3">
                                                {detailModal.foto_bukti_pembayaran ? (
                                                    <img src={detailModal.foto_bukti_pembayaran} alt="Bukti Pembayaran" className="w-40 h-40 object-cover rounded-md border cursor-pointer hover:opacity-80" onClick={() => setImageModal(detailModal.foto_bukti_pembayaran)} />
                                                ) : (<span className="text-muted-foreground">Tidak ada bukti.</span>)}
                                            </div>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}
                        </AnimatePresence>

                        <AnimatePresence>
                        {imageModal && (
                             <Dialog open={!!imageModal} onOpenChange={() => setImageModal(null)}>
                                <DialogContent className="p-0 bg-transparent border-none max-w-4xl w-full h-full flex items-center justify-center">
                                    <motion.img src={imageModal} alt="Bukti Pembayaran" className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} onClick={() => setImageModal(null)} />
                                     <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/70 rounded-full" onClick={() => setImageModal(null)}><X className="h-6 w-6" /></Button>
                                    </DialogTrigger>
                                </DialogContent>
                             </Dialog>
                        )}
                        </AnimatePresence>
                    </main>
                </div>
            </div>
        </>
    );
}
