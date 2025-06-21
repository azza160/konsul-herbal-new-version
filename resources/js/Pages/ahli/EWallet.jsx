"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "@/components/ui/dialog";
import { ExpertSidebar } from "../../layout/ahli-sidebar";
import { AdminHeader } from "../../layout/admin-header";
import { Breadcrumb } from "../../components/breadcrump";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Wallet,
    Trash2,
    Pencil,
    Search,
    PlusCircle,
} from "lucide-react";
import { Head, router, usePage, Link } from "@inertiajs/react";
import { route } from "ziggy-js";
import { useAlert } from "../../components/myalert";
import { SimplePagination } from "@/components/simple-pagination";

export default function EWalletPage() {
    const { eWallets, flash, user } = usePage().props;
    const { showSuccess, AlertContainer } = useAlert() || {};

    useEffect(() => {
        if (flash?.success && showSuccess) {
            showSuccess("Berhasil", flash.success);
        }
    }, [flash, showSuccess]);

    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("desc");
    const [confirmModal, setConfirmModal] = useState({
        open: false,
        eWallet: null,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 10;

    const breadcrumbItems = [
        { label: "Ahli", href: route('ahli-dashboard-acount') },
        { label: "E-Wallet" },
    ];

    // Client-side filtering
    const filteredWallets = (eWallets || []).filter((wallet) =>
        wallet.nama_e_wallet.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Client-side sorting
    const sortedWallets = [...filteredWallets].sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return sortBy === 'asc' ? dateA - dateB : dateB - dateA;
    });

    // Client-side pagination
    const totalItems = sortedWallets.length;
    const totalPages = Math.ceil(totalItems / perPage);
    const paginatedWallets = sortedWallets.slice(
        (currentPage - 1) * perPage,
        currentPage * perPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, sortBy]);

    const handleDeleteClick = (eWallet) => {
        setConfirmModal({ open: true, eWallet });
    };

    const confirmDelete = () => {
        if (!confirmModal.eWallet) return;
        router.delete(route('ahli-ewallet-destroy', { id: confirmModal.eWallet.id }), {
            onSuccess: () => {
                setConfirmModal({ open: false, eWallet: null });
            },
            onError: () => {
                alert("Terjadi kesalahan saat menghapus data.");
            },
        });
    };

    return (
        <>
        <div className="fixed z-[99999999999]">
            {AlertContainer && <AlertContainer />}

        </div>
            <Head title="Kelola E-Wallet" />
            <div className="flex flex-col min-h-screen bg-background">
                <AdminHeader user={user} />
                <div className="flex flex-1 overflow-hidden">
                    <ExpertSidebar user={user} activeLink={route("ahli-ewallet-show")} />

                    <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                        <Breadcrumb items={breadcrumbItems} />
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="flex justify-between items-center mb-8"
                        >
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold">
                                    Kelola E-Wallet
                                </h1>
                                <p className="text-muted-foreground">
                                    Atur metode pembayaran elektronik Anda
                                </p>
                            </div>
                            <Link href={route('ahli-ewallet-create')}>
                                <Button>
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    Tambah E-Wallet
                                </Button>
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="flex flex-col md:flex-row gap-4 mb-5"
                        >
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder="Cari nama e-wallet..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-full md:w-48">
                                    <SelectValue placeholder="Urutkan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="desc">Terbaru</SelectItem>
                                    <SelectItem value="asc">Terlama</SelectItem>
                                </SelectContent>
                            </Select>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            <Card className="hover:shadow-lg transition-shadow duration-300">
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Wallet className="h-5 w-5" />
                                        <span>Daftar E-Wallet Anda ({totalItems})</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <div className="overflow-x-auto rounded-md border">
                                        <Table className="w-full text-sm text-left border-collapse">
                                            <TableHeader className="bg-muted/40">
                                                <TableRow>
                                                    <TableHead className="p-4">Nama E-Wallet</TableHead>
                                                    <TableHead className="p-4">Nomor</TableHead>
                                                    <TableHead className="p-4">Tanggal Dibuat</TableHead>
                                                    <TableHead className="p-4 text-center">Aksi</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <AnimatePresence>
                                                    {paginatedWallets.length > 0 ? (
                                                        paginatedWallets.map((item, index) => (
                                                            <motion.tr
                                                                key={item.id}
                                                                layout
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                exit={{ opacity: 0 }}
                                                                transition={{ delay: index * 0.05 }}
                                                                className="transition-colors duration-200 even:bg-muted/10 hover:bg-muted/20"
                                                            >
                                                                <TableCell className="font-medium p-4">{item.nama_e_wallet}</TableCell>
                                                                <TableCell className="p-4">{item.nomor_e_wallet}</TableCell>
                                                                <TableCell className="p-4">{new Date(item.created_at).toLocaleDateString()}</TableCell>
                                                                <TableCell className="p-4 flex justify-center space-x-2">
                                                                    <Link href={route('ahli-ewallet-edit', { id: item.id })}>
                                                                        <Button variant="outline" size="icon" className="group">
                                                                            <Pencil className="h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform" />
                                                                        </Button>
                                                                    </Link>
                                                                    <Button variant="destructive" size="icon" onClick={() => handleDeleteClick(item)} className="group">
                                                                        <Trash2 className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
                                                                    </Button>
                                                                </TableCell>
                                                            </motion.tr>
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan="4" className="text-center p-8 text-muted-foreground">
                                                                {searchTerm ? "E-wallet tidak ditemukan." : "Anda belum menambahkan e-wallet."}
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </AnimatePresence>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                           <SimplePagination
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                                totalItems={totalItems}
                                perPage={perPage}
                                itemName="e-wallet"
                            />
                        </motion.div>

                        <AnimatePresence>
                            {confirmModal.open && (
                                <Dialog open={confirmModal.open} onOpenChange={(open) => setConfirmModal({ ...confirmModal, open })}>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Konfirmasi Hapus</DialogTitle>
                                            <DialogDescription>
                                                Apakah Anda yakin ingin menghapus e-wallet ini? Tindakan ini tidak dapat dibatalkan.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setConfirmModal({ open: false, eWallet: null })}>
                                                Batal
                                            </Button>
                                            <Button variant="destructive" onClick={confirmDelete}>
                                                Hapus
                                            </Button>
                                        </DialogFooter>
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
