"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Header } from "../../layout/header";
import { Footer } from "../../layout/footer";
import { Breadcrumb } from "../../components/breadcrump";
import {
    Calendar,
    Star,
    Mail,
    ArrowRight,
    Phone,
    Users,
    BookOpen,
    MessageCircle,
    ChevronDown,
    Plus,
    User,
    Briefcase,
    Award,
    MapPin,
    Eye,
    Send,
    GraduationCap,
    Search,
    AlertTriangle
} from "lucide-react";
import { Head, usePage,router, Link } from "@inertiajs/react";
import { Separator } from "@/components/ui/separator";
import { route } from "ziggy-js";

export default function ExpertsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 3;
    const { experts, spesialisasiList, user } = usePage().props;
    const [selectedSpesialisasi, setSelectedSpesialisasi] = useState("all");

    const breadcrumbItems = [{ label: "Ahli Herbal" }];

    // Filter berdasarkan spesialisasi
    const filteredExperts = experts.filter((expert) => {
      const matchesSearch =
        expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expert.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    
      const matchesSpesialisasi =
        selectedSpesialisasi === "all" || expert.specialty === selectedSpesialisasi;
    
      return matchesSearch && matchesSpesialisasi;
    });
    

    const totalPages = Math.ceil(filteredExperts.length / perPage);
    const paginatedExperts = filteredExperts.slice(
        (currentPage - 1) * perPage,
        currentPage * perPage
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut",
            },
        },
    };

    // Reset ke halaman 1 saat filter berubah
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedSpesialisasi]);

    return (
        <>
            <Head title="list-ahli" />
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
                <Header />

                <div className="container mx-auto px-4 py-6">
                    <Breadcrumb items={breadcrumbItems} />
                </div>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="container mx-auto px-4 pb-8"
                >
                    {/* Page Header */}
                    <motion.div
                        variants={itemVariants}
                        className="text-center mb-8"
                    >
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">
                            Ahli Herbal
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Konsultasi dengan ahli herbal berpengalaman dan
                            terpercaya
                        </p>
                    </motion.div>

                    {/* Search and Filter */}
                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col md:flex-row gap-4 mb-8"
                    >
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Cari ahli herbal..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <Select value={selectedSpesialisasi} onValueChange={setSelectedSpesialisasi}>
  <SelectTrigger className="w-full md:w-64">
    <SelectValue placeholder="Filter Spesialisasi" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">Semua Spesialisasi</SelectItem>
    {spesialisasiList.map((item) => (
      <SelectItem key={item.id} value={item.nama_spesialisasi}>
        {item.nama_spesialisasi}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

                    </motion.div>

                    {/* Experts Grid */}
                    {
                      paginatedExperts.length > 0 ? (
                        <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                        variants={containerVariants}
                    >     {

                          paginatedExperts.map((expert, index) => (
                            <motion.div
                                key={expert.id}
                                variants={itemVariants}
                                whileHover={{
                                    scale: 1.02,
                                    transition: { duration: 0.3 },
                                }}
                            >
                                <Card className="h-full hover:shadow-2xl transition-all duration-500 group border-0 shadow-lg overflow-hidden bg-white">
                                    {/* Image Section with Padding */}
                                    <div className="p-3 sm:p-4 md:p-5">
                                        <div className="relative overflow-hidden rounded-xl">
                                            <div className="aspect-[4/3] w-full">
                                                <img
                                                    src={
                                                        expert.image ||
                                                        "/placeholder.svg"
                                                    }
                                                    alt={expert.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 rounded-xl"
                                                />
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent rounded-xl" />

                                            {/* Specialty Badge */}
                                            <Badge className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 bg-white/95 text-gray-900 hover:bg-white text-xs sm:text-sm px-2 sm:px-3 py-1 shadow-lg">
                                                <Award className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                                {expert.specialty}
                                            </Badge>

                                            {/* Name overlay */}
                                            <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-2 sm:left-3 md:left-4 right-2 sm:right-3 md:right-4">
                                                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg">
                                                    {expert.name}
                                                </h3>
                                                <p className="text-green-100 text-xs sm:text-sm leading-relaxed line-clamp-2">
                                                    {
                                                        expert.specialty_description
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <CardContent className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
                                        <div className="space-y-2 sm:space-y-3">
                                            <div className="flex items-center gap-2 sm:gap-3 text-gray-600">
                                                <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 flex-shrink-0" />
                                                <span className="text-xs sm:text-sm truncate">
                                                    {expert.telp}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 sm:gap-3 text-gray-600">
                                                <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 flex-shrink-0" />
                                                <span className="text-xs sm:text-sm truncate">
                                                    {expert.email}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 sm:gap-3 text-gray-600">
                                                <User className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 flex-shrink-0" />
                                                <span className="text-xs sm:text-sm">
                                                    {expert.jk === "laki-laki"
                                                        ? "Laki-laki"
                                                        : "Perempuan"}{" "}
                                                    •{" "}
                                                    {new Date().getFullYear() -
                                                        new Date(
                                                            expert.tgl_lahir
                                                        ).getFullYear()}{" "}
                                                    tahun
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-col gap-2 sm:gap-3 pt-2 sm:pt-3">
                                                    <motion.div
                                                        whileHover={{
                                                            scale: 1.02,
                                                        }}
                                                        whileTap={{
                                                            scale: 0.98,
                                                        }}
                                                    >
                                                 <Button asChild className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 group-hover:shadow-xl transition-all duration-300 text-xs sm:text-sm md:text-base py-2 sm:py-3">
                                                     <Link href={route("detail-ahli-herbal", { id: expert.id })}>
                                                            <Eye className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-2" />
                                                            Lihat Detail
                                                     </Link>
                                                        </Button>
                                                    </motion.div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    }             
                    </motion.div>

                      ) : (
                        <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        variants={containerVariants}
                        className="text-center py-10 w-full"
                      >
                        <div className="flex justify-center mb-4">
                          <AlertTriangle className="w-10 h-10 text-yellow-500" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2 text-muted-foreground">
                          Tidak ditemukan
                        </h2>
                        <p className="text-sm text-gray-500">
                          Kami tidak menemukan ahli herbal yang sesuai dengan pencarian atau filter Anda.
                        </p>
                        <p className="mt-2 text-sm text-gray-400">
                          Coba ubah kata kunci atau pilih spesialisasi lain.
                        </p>
                      </motion.div>
                      )
                    }
                  
                    {/* Pagination */}
                    <div className="flex justify-center gap-2 mt-6">
                        <Button
                            variant="outline"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => prev - 1)}
                        >
                            Previous
                        </Button>

                        {Array.from({ length: totalPages }, (_, i) => (
                            <Button
                                key={i}
                                variant={
                                    currentPage === i + 1
                                        ? "default"
                                        : "outline"
                                }
                                onClick={() => setCurrentPage(i + 1)}
                            >
                                {i + 1}
                            </Button>
                        ))}

                        <Button
                            variant="outline"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </motion.div>

                <Footer />
            </div>
        </>
    );
}
