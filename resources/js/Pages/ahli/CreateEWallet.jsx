"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExpertSidebar } from "../../layout/ahli-sidebar";
import { AdminHeader } from "../../layout/admin-header";
import { Breadcrumb } from "../../components/breadcrump";
import { Wallet, Save } from "lucide-react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";

export default function CreateEWalletPage() {
    const { errors, user } = usePage().props;
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        nama_e_wallet: "",
        nomor_e_wallet: "",
    });

    const breadcrumbItems = [
        { label: "Ahli", href: route('ahli-dashboard-acount') },
        { label: "E-Wallet", href: route('ahli-ewallet-show') },
        { label: "Tambah E-Wallet" },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);

        router.post(route('ahli-ewallet-store'), formData, {
            onFinish: () => setIsLoading(false),
        });
    };

    return (
        <>
            <Head title="Tambah E-Wallet" />
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
                                    Tambah E-Wallet Baru
                                </h1>
                                <p className="text-muted-foreground">
                                    Isi detail e-wallet Anda di bawah ini.
                                </p>
                            </div>
                            <Button variant="outline" asChild>
                                <Link href={route("ahli-ewallet-show")}>
                                    Kembali
                                </Link>
                            </Button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            <Card className="hover:shadow-lg transition-shadow duration-300 max-w-2xl mx-auto">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Wallet className="h-5 w-5" />
                                        Form E-Wallet
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="nama_e_wallet">Nama E-Wallet</Label>
                                            <Input
                                                id="nama_e_wallet"
                                                name="nama_e_wallet"
                                                placeholder="Contoh: GoPay, OVO, Dana"
                                                required
                                                value={formData.nama_e_wallet}
                                                onChange={handleChange}
                                                className={errors.nama_e_wallet ? 'border-red-500' : ''}
                                            />
                                            {errors.nama_e_wallet && <p className="text-red-500 text-xs mt-1">{errors.nama_e_wallet}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="nomor_e_wallet">Nomor E-Wallet</Label>
                                            <Input
                                                id="nomor_e_wallet"
                                                name="nomor_e_wallet"
                                                placeholder="Contoh: 081234567890"
                                                required
                                                value={formData.nomor_e_wallet}
                                                onChange={handleChange}
                                                className={errors.nomor_e_wallet ? 'border-red-500' : ''}
                                            />
                                            {errors.nomor_e_wallet && <p className="text-red-500 text-xs mt-1">{errors.nomor_e_wallet}</p>}
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                                                {isLoading ? (
                                                    "Menyimpan..."
                                                ) : (
                                                    <>
                                                        <Save className="h-4 w-4 mr-2" />
                                                        Simpan E-Wallet
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </main>
                </div>
            </div>
        </>
    );
} 