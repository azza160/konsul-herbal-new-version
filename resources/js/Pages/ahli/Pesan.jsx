"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ExpertSidebar } from "../../layout/ahli-sidebar";
import { AdminHeader } from "../../layout/admin-header";
import { Breadcrumb } from "../../components/breadcrump";
import { Send, Search, ArrowLeft, Image as ImageIcon, X, Loader2, MoreVertical, Trash2, Bell } from "lucide-react"
import { Head, router, usePage } from "@inertiajs/react"
import { Input } from "@/components/ui/input"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { route } from "ziggy-js"
import axios from 'axios'

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState(null)
  const [message, setMessage] = useState("")
  const [isMobileView, setIsMobileView] = useState(false)
  const [showChatList, setShowChatList] = useState(true)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const {chatList,chatMessages,user} = usePage().props
  const [chatMessagesState, setChatMessagesState] = useState(chatMessages || {});
  const [currentMessages, setCurrentMessages] = useState([]);
  const pollingIntervalRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const chatContainerRef = useRef(null);
  const lastMessageCountRef = useRef(0);
  const hasNewMessagesRef = useRef(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const fileInputRef = useRef(null);
  const [loadingImages, setLoadingImages] = useState({});
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [deletingMessage, setDeletingMessage] = useState(null);

  // Check if mobile view
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileView(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  const breadcrumbItems = [
    { label: "Ahli", href: route('ahli-dashboard-acount') },
    { label: "Pesan" },
];

  // Polling effect
  useEffect(() => {
    if (selectedChat && chatList && chatList.length > 0) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      // Initial fetch to get current messages
      axios.get(route('ahli-pesan-latest'), {
        params: {
          consultation_id: selectedChat
        }
      })
      .then(response => {
        const newMessages = response.data.messages;
        setCurrentMessages(newMessages);
        lastMessageCountRef.current = newMessages.length;
        
        // Update chat messages state
        setChatMessagesState(prev => ({
          ...prev,
          [selectedChat]: newMessages
        }));
      })
      .catch(error => {
        console.error('Error fetching initial messages:', error);
      });

      // Start polling
      pollingIntervalRef.current = setInterval(() => {
        axios.get(route('ahli-pesan-latest'), {
          params: {
            consultation_id: selectedChat
          }
        })
        .then(response => {
          const newMessages = response.data.messages;
          const previousCount = lastMessageCountRef.current;
          lastMessageCountRef.current = newMessages.length;
          
          // Check if there are new messages
          if (newMessages.length > previousCount) {
            hasNewMessagesRef.current = true;
            setCurrentMessages(newMessages);
            
            // Update chat messages state to keep it in sync
            setChatMessagesState(prev => ({
              ...prev,
              [selectedChat]: newMessages
            }));
            
            // Auto scroll only if we're at the bottom
            const chatContainer = chatContainerRef.current;
            if (chatContainer) {
              const { scrollTop, scrollHeight, clientHeight } = chatContainer;
              const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
              
              if (isAtBottom) {
                setTimeout(() => {
                  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }
            }
          } else {
            setCurrentMessages(newMessages);
            // Update chat messages state even if no new messages
            setChatMessagesState(prev => ({
              ...prev,
              [selectedChat]: newMessages
            }));
          }
        })
        .catch(error => {
          console.error('Error fetching messages:', error);
        });
      }, 3000);

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [selectedChat, chatList]);

  // Add polling for unread counts
  useEffect(() => {
    const fetchUnreadCounts = () => {
      axios.get(route('ahli.notifications.get'))
        .then(response => {
          console.log('Ahli notifications response:', response.data); // Debug
          const counts = {};
          response.data.notifications
            .filter(n => n.type === 'new_message' && !n.is_read)
            .forEach(n => {
              counts[n.related_id] = (counts[n.related_id] || 0) + 1;
            });
          console.log('Ahli unread counts:', counts); // Debug
          setUnreadCounts(counts);
        })
        .catch(error => {
          console.error('Error fetching unread counts:', error);
        });
    };

    // Initial fetch
    fetchUnreadCounts();

    // Set up polling
    const interval = setInterval(fetchUnreadCounts, 5000);

    return () => clearInterval(interval);
  }, []); // Remove selectedChat dependency to keep polling active

  // Mark notifications as read when chat is opened
  useEffect(() => {
    if (selectedChat) {
      axios.post(route('ahli.notifications.read-all'))
        .then(() => {
          setUnreadCounts(prev => ({
            ...prev,
            [selectedChat]: 0
          }));
        })
        .catch(error => {
          console.error('Error marking notifications as read:', error);
        });
    }
  }, [selectedChat]);

  // Safely filter chat list, providing a fallback empty array if chatList is undefined
  const filteredChatList = (chatList || []).filter(chat => 
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
  
    if (!message.trim() && !selectedImage) return;
  
    const formData = new FormData();
    formData.append('consultation_id', selectedChat);
    if (message.trim()) {
      formData.append('message', message.trim());
    }
    if (selectedImage) {
      formData.append('image', selectedImage);
    }

    // Create optimistic message
    const optimisticMessage = {
      id: 'temp-' + Date.now(),
      sender: 'expert',
      sender_id: user.id,
      content: message.trim(),
      image: selectedImage ? URL.createObjectURL(selectedImage) : null,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      isOptimistic: true
    };

    // Add optimistic message to current messages
    setCurrentMessages(prev => [...prev, optimisticMessage]);
    
    // Update chat messages state
    setChatMessagesState(prev => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), optimisticMessage]
    }));

    // Clear input immediately
    const messageText = message.trim();
    const imageFile = selectedImage;
    setMessage("");
    setSelectedImage(null);
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }
  
    router.post(route('ahli-pesan-kirim'), formData, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => {
        // Remove optimistic message and let polling handle the real message
        setCurrentMessages(prev => prev.filter(msg => !msg.isOptimistic));
        setChatMessagesState(prev => ({
          ...prev,
          [selectedChat]: (prev[selectedChat] || []).filter(msg => !msg.isOptimistic)
        }));
        
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      },
      onError: () => {
        // Remove optimistic message on error
        setCurrentMessages(prev => prev.filter(msg => !msg.isOptimistic));
        setChatMessagesState(prev => ({
          ...prev,
          [selectedChat]: (prev[selectedChat] || []).filter(msg => !msg.isOptimistic)
        }));
        
        // Restore the message and image
        setMessage(messageText);
        setSelectedImage(imageFile);
      }
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage(e);
    }
  }

  const handleChatSelect = (chatId) => {
    setSelectedChat(chatId);
    lastMessageCountRef.current = 0;
    setIsLoadingMessages(true);
  
    // Clear current messages first
    setCurrentMessages([]);
    
    // Don't rely on initial chatMessages, let polling handle it
    // const messages = chatMessagesState[chatId] || chatMessages[chatId] || [];
    // setCurrentMessages(messages);
    
    // Update lastMessageCountRef to match current message count
    // lastMessageCountRef.current = messages.length;
  
    if (isMobileView) {
      setShowChatList(false);
    }

    // Scroll to bottom when selecting a new chat
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setIsLoadingMessages(false);
    }, 100);
  };

  const handleBackToList = () => {
    setShowChatList(true)
  }

  const selectedChatData = chatList.find((chat) => chat.id === selectedChat)
  const isConsultationCompleted = selectedChatData?.status === 'selesai';

  const handleImageLoad = (messageId) => {
    setLoadingImages(prev => ({
      ...prev,
      [messageId]: false
    }));
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Handle delete message
  const handleDeleteMessage = (message) => {
    setDeletingMessage(message);
  };

  const confirmDeleteMessage = () => {
    // Optimistically remove the message from UI
    setCurrentMessages(prev => 
      prev.filter(msg => msg.id !== deletingMessage.id)
    );
    
    // Update chat messages state
    setChatMessagesState(prev => ({
      ...prev,
      [selectedChat]: (prev[selectedChat] || []).filter(msg => msg.id !== deletingMessage.id)
    }));
    
    axios.delete(route('ahli-pesan-delete'), {
      data: { message_id: deletingMessage.id }
    })
    .then(response => {
      // Message already removed optimistically, just clear the deleting state
      setDeletingMessage(null);
    })
    .catch(error => {
      console.error('Error deleting message:', error);
      // Restore the message if deletion failed
      setCurrentMessages(prev => [...prev, deletingMessage]);
      setChatMessagesState(prev => ({
        ...prev,
        [selectedChat]: [...(prev[selectedChat] || []), deletingMessage]
      }));
      setDeletingMessage(null);
    });
  };

  return (
    <>
      <Head title="pesan" />
      <div className="flex flex-col min-h-screen bg-background">
        <AdminHeader />
        <div className="flex flex-1 overflow-hidden">
            <ExpertSidebar activeLink={route("ahli-pesan")} />

            <main  className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 lg:p-8">
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />
            <div className="flex-1 container mx-auto px-2 sm:px-4 py-4 sm:py-6 flex flex-col">
              <div className="flex-1 flex flex-col h-[calc(100vh-200px)]">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-4 h-full">
                  {/* Chat List */}
                  {(!isMobileView || showChatList) && (
                    <motion.div
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="lg:col-span-1 h-full"
                    >
                      <Card className="h-full flex flex-col">
                        <CardHeader className="border-b">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Pesan</CardTitle>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="relative"
                            >
                              <Bell className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="relative mt-2">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                              placeholder="Cari pesan..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-10 w-full"
                            />
                          </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-0">
                          <div className="space-y-1">
                            {filteredChatList.map((chat, index) => (
                              <motion.div
                                key={chat.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`p-3 sm:p-4 cursor-pointer transition-colors ${
                                  selectedChat === chat.id
                                    ? "bg-primary/10 border-l-4 border-primary"
                                    : "hover:bg-muted/50"
                                }`}
                                onClick={() => handleChatSelect(chat.id)}
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="relative">
                                    <Avatar>
                                      <AvatarImage src={chat.avatar || "/placeholder.svg"} />
                                      <AvatarFallback>{chat.expertName[0]}</AvatarFallback>
                                    </Avatar>
                                    {unreadCounts[chat.id] > 0 && (
                                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {unreadCounts[chat.id]}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <p className="font-medium truncate text-sm sm:text-base">{chat.expertName}</p>
                                      <span className="text-xs text-muted-foreground">{chat.time}</span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* Chat Window */}
                  {(!isMobileView || !showChatList) && (
                    <motion.div
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="lg:col-span-2 h-full"
                    >
                      <Card className="h-full flex flex-col max-h-[calc(100vh-200px)]">
                        {/* Chat Header */}
                        {
                          selectedChat ? (
                            <>
                            <CardHeader className="border-b py-3 px-3 sm:px-4">
                              <div className="flex items-center space-x-3">
                                {isMobileView && (
                                  <Button variant="ghost" size="icon" onClick={handleBackToList} className="mr-1">
                                    <ArrowLeft className="h-5 w-5" />
                                  </Button>
                                )}
                                <Avatar>
                                  <AvatarImage src={selectedChatData?.avatar || "/placeholder.svg"} />
                                  <AvatarFallback>{selectedChatData?.expertName?.[0] || "U"}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <CardTitle className="text-base sm:text-lg truncate">
                                    {selectedChatData?.expertName}
                                  </CardTitle>
                                </div>
                              </div>
                            </CardHeader>

                            {/* Messages */}
                            <CardContent 
                              ref={chatContainerRef}
                              className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 max-h-[calc(100vh-300px)]"
                            >
                              {isLoadingMessages ? (
                                <div className="flex justify-center items-center h-full">
                                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                              ) : (
                                currentMessages && currentMessages.map((msg, index) => (
                                  <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                                  >
                                    <div className="relative">
                                      <div
                                        className={`max-w-[280px] sm:max-w-xs lg:max-w-md p-3 rounded-lg break-words ${
                                          msg.sender === "user"
                                            ? "bg-primary text-primary-foreground ml-auto"
                                            : "bg-muted text-foreground"
                                        }`}
                                      >
                                        {msg.image && (
                                          <div className="mb-2 relative">
                                            {loadingImages[msg.id] !== false && (
                                              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                                                <Loader2 className="h-8 w-8 animate-spin text-white" />
                                              </div>
                                            )}
                                            <img
                                              src={msg.image}
                                              alt="Shared image"
                                              className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                              style={{ maxHeight: '200px' }}
                                              onClick={() => setFullscreenImage(msg.image)}
                                              onLoad={() => handleImageLoad(msg.id)}
                                            />
                                          </div>
                                        )}
                                        {msg.content && (
                                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                        )}
                                        <p
                                          className={`text-xs mt-1 ${
                                            msg.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                                          }`}
                                        >
                                          {msg.time}
                                        </p>
                                      </div>
                                      
                                      {/* Message actions for expert's own messages only - Always visible */}
                                      {msg.sender_id === user.id && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleDeleteMessage(msg)}
                                          className="absolute -top-2 -right-2 h-6 w-6 bg-background border shadow-sm text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      )}
                                    </div>
                                  </motion.div>
                                ))
                              )}
                              <div ref={messagesEndRef} />
                            </CardContent>

                            {/* Fullscreen Image Modal */}
                            <AnimatePresence>
                              {fullscreenImage && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                                  onClick={() => setFullscreenImage(null)}
                                >
                                  <button
                                    className="absolute top-4 right-4 text-white hover:text-gray-300"
                                    onClick={() => setFullscreenImage(null)}
                                  >
                                    <X className="h-6 w-6" />
                                  </button>
                                  <img
                                    src={fullscreenImage}
                                    alt="Fullscreen"
                                    className="max-h-[90vh] max-w-[90vw] object-contain"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Message Input */}
                            <div className="border-t p-3 sm:p-4 bg-background w-full">
                              {isConsultationCompleted ? (
                                <div className="text-center py-4">
                                  <div className="bg-muted/50 rounded-lg p-4">
                                    <p className="text-sm text-muted-foreground font-medium">
                                      Konsultasi ini telah selesai dan tidak dapat dilanjutkan.
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Anda masih dapat melihat riwayat pesan, tetapi tidak dapat mengirim pesan baru.
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <form onSubmit={handleSendMessage} className="flex items-end space-x-2 w-full">
                                  <Textarea
                                    ref={textareaRef}
                                    placeholder="Ketik pesan..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="flex-1 min-w-0 resize-none overflow-y-hidden"
                                    rows={1}
                                  />
                                  <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageSelect}
                                    accept="image/*"
                                    className="hidden"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="h-10 w-10 flex-shrink-0"
                                  >
                                    <ImageIcon className="h-5 w-5" />
                                  </Button>
                                  <Button type="submit" disabled={!message.trim() && !selectedImage} className="h-10 px-4 flex-shrink-0">
                                    <Send className="h-4 w-4" />
                                  </Button>
                                </form>
                              )}
                              {selectedImage && !isConsultationCompleted && (
                                <div className="mt-2 relative inline-block">
                                  <img
                                    src={URL.createObjectURL(selectedImage)}
                                    alt="Selected"
                                    className="h-20 w-20 object-cover rounded"
                                  />
                                  <button
                                    onClick={() => setSelectedImage(null)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                  >
                                    ×
                                  </button>
                                </div>
                              )}
                            </div>
                            </>
                          ) : (
                            <div className="flex flex-col justify-center items-center h-full text-muted-foreground py-5 px-4 text-center">
                              <p>Pilih percakapan dari daftar untuk mulai mengirim pesan.</p>
                            </div>
                          )
                        }
                      </Card>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
            </main>
        </div>
      </div>

      {/* Delete Message Confirmation */}
      <AlertDialog open={!!deletingMessage} onOpenChange={() => setDeletingMessage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pesan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pesan ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setDeletingMessage(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDeleteMessage}>
              Hapus
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
