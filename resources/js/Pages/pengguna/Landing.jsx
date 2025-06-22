"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Header } from "../../layout/header";
import { Footer } from "../../layout/footer";
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
} from "lucide-react";
import { Link, Head, usePage, router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { useAlert } from "../../components/myalert";
import { useEffect } from "react";
import { Separator } from "@/components/ui/separator";

export default function LandingPage() {
    const [openFaq, setOpenFaq] = useState(null);
    const { flash, articles, experts, user } = usePage().props;
    const { showSuccess, AlertContainer } = useAlert();
    useEffect(() => {
        if (flash.success) {
            showSuccess("Berhasil", flash.success);
        }
    }, [flash.success]);

    const faqs = [
        {
            id: 1,
            question: "Bagaimana cara memulai konsultasi?",
            answer: "Anda dapat memilih ahli herbal yang sesuai dengan kebutuhan Anda, kemudian klik tombol 'Mulai Konsultasi'. Setelah itu, Anda akan diarahkan ke halaman chat untuk berkomunikasi langsung dengan ahli herbal tersebut.",
        },
        {
            id: 2,
            question: "Apakah konsultasi berbayar?",
            answer: "Konsultasi pertama dengan setiap ahli herbal adalah gratis selama 15 menit. Untuk konsultasi lanjutan atau sesi yang lebih panjang, akan dikenakan biaya sesuai dengan tarif masing-masing ahli herbal.",
        },
        {
            id: 3,
            question: "Berapa lama waktu respons ahli herbal?",
            answer: "Ahli herbal kami berkomitmen untuk merespons dalam waktu 1-24 jam setelah konsultasi dimulai. Untuk kasus urgent, biasanya respons diberikan dalam waktu kurang dari 2 jam.",
        },
        {
            id: 4,
            question: "Apakah resep herbal yang diberikan aman?",
            answer: "Semua ahli herbal di platform kami telah tersertifikasi dan berpengalaman. Resep yang diberikan telah melalui pertimbangan yang matang berdasarkan kondisi kesehatan Anda. Namun, selalu konsultasikan dengan dokter jika Anda memiliki kondisi medis tertentu.",
        },
        {
            id: 5,
            question: "Bagaimana cara mendapatkan obat herbal yang diresepkan?",
            answer: "Setelah mendapat resep dari ahli herbal, Anda dapat membeli bahan-bahan herbal di apotek terdekat atau toko herbal terpercaya. Kami juga menyediakan layanan pengiriman untuk beberapa produk herbal tertentu.",
        },
    ];

    const features = [
        {
            icon: <Users className="h-12 w-12 text-blue-600" />,
            title: "Ahli Terpercaya",
            description:
                "Konsultasi dengan ahli herbal bersertifikat dan berpengalaman",
        },
        {
            icon: <BookOpen className="h-12 w-12 text-green-600" />,
            title: "Artikel Terbaru",
            description:
                "Akses artikel kesehatan herbal terbaru dan terpercaya",
        },
        {
            icon: <MessageCircle className="h-12 w-12 text-purple-600" />,
            title: "Konsultasi Online",
            description: "Konsultasi mudah dan praktis melalui platform online",
        },
    ];

    const toggleFaq = (faqId) => {
        setOpenFaq(openFaq === faqId ? null : faqId);
    };

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

    return (
        <>
            <div className="fixed z-[500] ">
                <AlertContainer />
            </div>

            <Head title="Beranda" />
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
                <Header />

                {/* Hero Banner */}
                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-20"
                >
                    <div className="container mx-auto px-4 text-center">
                        <motion.h1
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{
                                delay: 0.2,
                                duration: 0.8,
                                ease: "easeOut",
                            }}
                            className="text-4xl md:text-6xl font-bold mb-6"
                        >
                            Konsultasi Herbal Terpercaya
                        </motion.h1>
                        <motion.p
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{
                                delay: 0.4,
                                duration: 0.8,
                                ease: "easeOut",
                            }}
                            className="text-xl mb-8 max-w-2xl mx-auto"
                        >
                            Dapatkan solusi kesehatan alami dari ahli herbal
                            berpengalaman
                        </motion.p>
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{
                                delay: 0.6,
                                duration: 0.8,
                                ease: "easeOut",
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button size="lg" variant="secondary" asChild>
                                <Link
                                    href={route('list-ahli-herbal')}
                                    className="flex items-center gap-2"
                                >
                                    Mulai Konsultasi
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                            </Button>
                        </motion.div>
                    </div>
                </motion.section>

                {/* Features Section */}
                <motion.section
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="py-16 bg-muted/30"
                >
                    <div className="container mx-auto px-4">
                        <motion.div
                            className="text-center mb-12"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl font-bold mb-4">
                                Mengapa Memilih HerbalCare?
                            </h2>
                            <p className="text-muted-foreground text-lg">
                                Platform terpercaya untuk konsultasi kesehatan
                                herbal
                            </p>
                        </motion.div>

                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-3 gap-8"
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    whileHover={{
                                        scale: 1.05,
                                        transition: { duration: 0.2 },
                                    }}
                                    className="text-center p-6 bg-background rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                                >
                                    <motion.div
                                        whileHover={{ rotate: 360 }}
                                        transition={{ duration: 0.5 }}
                                        className="flex justify-center mb-4"
                                    >
                                        {feature.icon}
                                    </motion.div>
                                    <h3 className="text-xl font-semibold mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {feature.description}
                                    </p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </motion.section>

                {/* About Section */}
                <motion.section
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="py-16"
                >
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto text-center">
                            <motion.h2
                                className="text-3xl font-bold mb-6"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                Tentang Kami
                            </motion.h2>
                            <motion.p
                                className="text-lg text-muted-foreground leading-relaxed"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                            >
                                HerbalCare adalah platform konsultasi herbal
                                terdepan yang menghubungkan Anda dengan ahli
                                herbal berpengalaman. Kami berkomitmen untuk
                                memberikan solusi kesehatan alami yang aman dan
                                efektif berdasarkan kearifan tradisional dan
                                penelitian modern.
                            </motion.p>
                        </div>
                    </div>
                </motion.section>

                {/* Latest Articles */}
                <motion.section
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="py-16 bg-muted/50"
                >
                    <div className="container mx-auto px-4">
                        <motion.div
                            className="text-center mb-12"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl font-bold mb-4">
                                Artikel Terbaru
                            </h2>
                            <p className="text-muted-foreground">
                                Pelajari lebih lanjut tentang pengobatan herbal
                            </p>
                        </motion.div>

                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            {articles.map((article, index) => (
                                <motion.div
                                    key={article.id}
                                    variants={itemVariants}
                                    whileHover={{
                                        scale: 1.03,
                                        transition: { duration: 0.2 },
                                    }}
                                >
                                    <Card className="h-full hover:shadow-lg transition-all duration-300 group">
                                        <div className="aspect-video w-full rounded-t-lg overflow-hidden p-3">
                                            <img
                                                src={article.image}
                                                className="rounded-t-lg w-full"
                                            ></img>
                                        </div>
                                        <CardHeader>
                                            <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                                                <Calendar className="h-4 w-4" />
                                                <span>{article.date}</span>
                                            </div>
                                            <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors duration-200">
                                                {article.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-muted-foreground mb-4 line-clamp-3">
                                                {article.excerpt}
                                            </p>
                                            <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <Button
                                                    variant="outline"
                                                    asChild
                                                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200"
                                                >
                                                    <Link
                                                        href={route(
                                                            "detail-artikel",
                                                            article.id
                                                        )}
                                                        className="flex items-center gap-2"
                                                    >
                                                        Baca Artikel
                                                        <ArrowRight className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </motion.div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>

                        <motion.div
                            className="text-center mt-8"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                        >
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button variant="outline" asChild>
                                    <Link
                                        href={route("list-artikel")}
                                        className="flex items-center gap-2"
                                    >
                                        Lihat Semua Artikel
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.section>

                {/* Herbal Experts */}
                <motion.section
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="py-16"
                >
                    <div className="container mx-auto px-4">
                        <motion.div
                            className="text-center mb-12"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl font-bold mb-4">
                                Ahli Herbal Kami
                            </h2>
                            <p className="text-muted-foreground">
                                Konsultasi dengan ahli herbal berpengalaman
                            </p>
                        </motion.div>

                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            {experts.map((expert) => (
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
                            ))}
                        </motion.div>

                        <motion.div
                            className="text-center mt-8"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                        >
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button variant="outline" asChild>
                                    <Link
                                        href={route("list-ahli-herbal")}
                                        className="flex items-center gap-2"
                                    >
                                        Lihat Semua Ahli
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.section>

                {/* Enhanced Interactive FAQ Section */}
                <motion.section
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="py-16 bg-muted/50"
                >
                    <div className="container mx-auto px-4">
                        <motion.div
                            className="text-center mb-12"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl font-bold mb-4">
                                Frequently Asked Questions
                            </h2>
                            <p className="text-muted-foreground">
                                Pertanyaan yang sering diajukan tentang layanan
                                kami
                            </p>
                        </motion.div>

                        <motion.div
                            className="max-w-3xl mx-auto space-y-4"
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            {faqs.map((faq, index) => (
                                <motion.div
                                    key={faq.id}
                                    variants={itemVariants}
                                    whileHover={{
                                        scale: 1.01,
                                        transition: { duration: 0.2 },
                                    }}
                                >
                                    <Collapsible
                                        open={openFaq === faq.id}
                                        onOpenChange={() => toggleFaq(faq.id)}
                                    >
                                        <Card className="hover:shadow-md transition-all duration-300 overflow-hidden">
                                            <CollapsibleTrigger asChild>
                                                <motion.div
                                                    className="w-full p-6 text-left cursor-pointer hover:bg-muted/30 transition-colors duration-200"
                                                    whileHover={{
                                                        backgroundColor:
                                                            "hsl(var(--muted))",
                                                    }}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="text-lg font-semibold pr-4">
                                                            {faq.question}
                                                        </h3>
                                                        <motion.div
                                                            animate={{
                                                                rotate:
                                                                    openFaq ===
                                                                    faq.id
                                                                        ? 180
                                                                        : 0,
                                                            }}
                                                            transition={{
                                                                duration: 0.3,
                                                                ease: "easeInOut",
                                                            }}
                                                            className="flex-shrink-0"
                                                        >
                                                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                                        </motion.div>
                                                    </div>
                                                </motion.div>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <motion.div
                                                    initial={{
                                                        opacity: 0,
                                                        height: 0,
                                                    }}
                                                    animate={{
                                                        opacity:
                                                            openFaq === faq.id
                                                                ? 1
                                                                : 0,
                                                        height:
                                                            openFaq === faq.id
                                                                ? "auto"
                                                                : 0,
                                                    }}
                                                    transition={{
                                                        duration: 0.3,
                                                        ease: "easeInOut",
                                                    }}
                                                    className="px-6 pb-6"
                                                >
                                                    <div className="border-t pt-4">
                                                        <p className="text-muted-foreground leading-relaxed">
                                                            {faq.answer}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            </CollapsibleContent>
                                        </Card>
                                    </Collapsible>
                                </motion.div>
                            ))}
                        </motion.div>

                        <motion.div
                            className="text-center mt-8"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                        ></motion.div>
                    </div>
                </motion.section>

                <Footer />
            </div>
        </>
    );
}
