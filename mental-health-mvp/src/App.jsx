import { useState, useEffect } from "react";
import Login from "./Login";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";
// Firebase SDK imports
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { auth, db, appId } from './firebase';
import { useTranslation } from 'react-i18next';
import ResourceHub from './ResourceHub';
import AdminDashboard from './AdminDashboard';

// Initialize the Generative AI API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// View constants for better readability
const VIEW_CHAT = 'chat';
const VIEW_RESOURCES = 'resources';
const VIEW_ADMIN = 'admin';

function App() {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState(VIEW_CHAT);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setUserId(firebaseUser ? firebaseUser.uid : null);
      if (firebaseUser && db) {
        const chatDocRef = doc(db, "chats", firebaseUser.uid);
        const chatDocSnap = await getDoc(chatDocRef);
        if (chatDocSnap.exists()) {
          setMessages(chatDocSnap.data().messages || []);
        } else {
          await setDoc(chatDocRef, { messages: [] });
          setMessages([]);
        }
      } else {
        setMessages([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [serviceType, setServiceType] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [note, setNote] = useState("");
  const [bookingStatus, setBookingStatus] = useState("");
  const [bookings, setBookings] = useState([]);

  const timeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM",
  ];

  useEffect(() => {
    if (!db || !userId) return;
    const bookingsRef = collection(db, `artifacts/${appId}/users/${userId}/bookings`);
    const unsub = onSnapshot(bookingsRef, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setBookings(items);
    });
    return () => unsub();
  }, [db, userId]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!db || !userId) {
      setBookingStatus("Unable to book right now. Please try again shortly.");
      return;
    }
    setBookingStatus("");
    try {
      const bookingsRef = collection(db, `artifacts/${appId}/users/${userId}/bookings`);
      await addDoc(bookingsRef, {
        serviceType,
        appointmentDate,
        appointmentTime,
        message: note,
        createdAt: new Date().toISOString(),
      });
      setIsBookingModalOpen(false);
      setBookingStatus("Your session has been booked confidentially.");
      setServiceType("");
      setAppointmentDate("");
      setAppointmentTime("");
      setNote("");
    } catch (err) {
      console.error("Booking error:", err);
      setBookingStatus("Error booking session. Please try again.");
    }
  };

  const BookingModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-center text-2xl font-bold">{t('booking_modal_title')}</h2>
        <form onSubmit={handleBookingSubmit} className="space-y-4">
          {/* Form fields... */}
        </form>
      </div>
    </div>
  );

  const handleSend = async () => {
    if (input.trim() !== "" && user) {
      const userMessage = { text: input, sender: "user" };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages); // Update the UI immediately
      setInput("");
  
      // Use newMessages directly for the API call
      const chatHistory = [
        { role: "user", parts: [{ text: "You are a compassionate mental health support chatbot..." }] },
        { role: "model", parts: [{ text: "I understand. How are you feeling today?" }] },
        ...newMessages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }))
      ];
      
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const chat = model.startChat({ history: chatHistory });
        const result = await chat.sendMessage(userMessage.text);
        const response = await result.response;
        const text = response.text();
        
        const botMessage = { text, sender: "bot" };
        const finalMessages = [...newMessages, botMessage];
        setMessages(finalMessages);
  
        if (db) {
          const chatDocRef = doc(db, "chats", user.uid);
          await setDoc(chatDocRef, { messages: finalMessages }, { merge: true });
        }
      } catch (error) {
        console.error('Gemini chatbot error:', error);
        // ... (error handling)
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user) {
    return <Login setUser={setUser} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header and UI... */}
      <header className="w-full bg-white shadow">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-6 justify-start">
            <img src="/logo.png" alt="Unmute.ai Logo" className="h-36 w-36 object-contain" style={{ boxShadow: 'none', border: 'none', borderRadius: 0, background: 'none' }} />
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl font-bold text-gray-800 leading-tight">{t('chatbot_title')}</h1>
              <p className="text-sm text-gray-500 leading-tight">{t('chatbot_subtitle')}</p>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView(VIEW_CHAT)}
              className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
                currentView === VIEW_CHAT ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {t('nav_chat')}
            </button>
            <button
              onClick={() => setCurrentView(VIEW_RESOURCES)}
              className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
                currentView === VIEW_RESOURCES ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {t('nav_resources')}
            </button>
            <button
              onClick={() => setCurrentView(VIEW_ADMIN)}
              className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
                currentView === VIEW_ADMIN ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {t('nav_admin')}
            </button>
          </nav>
          <div className="flex items-center gap-2">
            <select
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="bn">বাংলা (Bengali)</option>
              <option value="mr">मराठी (Marathi)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="te">తెలుగు (Telugu)</option>
            </select>
            <button
              onClick={() => signOut(auth)}
              className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 p-4">
        {currentView === VIEW_CHAT && (
          <section>
            <div className="h-[28rem] w-full overflow-y-auto rounded-lg bg-white p-4 shadow">
              {/* Messages Display */}
              <ul className="space-y-3">
                {messages.map((msg, idx) => (
                  <li key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded px-3 py-2 text-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                      {msg.text}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyPress} placeholder={t('chat_input_placeholder')} className="flex-1 rounded border border-gray-300 px-3 py-2"/>
              <div className="flex gap-2">
                <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">{t('chat_send_button')}</button>
                <button type="button" onClick={() => setIsBookingModalOpen(true)} className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">{t('book_session_button')}</button>
              </div>
            </form>
          </section>
        )}
        {currentView === VIEW_RESOURCES && <ResourceHub />}
        {currentView === VIEW_ADMIN && <AdminDashboard onBackToMain={() => setCurrentView(VIEW_CHAT)} />}
      </main>
      {isBookingModalOpen && <BookingModal />}
    </div>
  );
}

export default App;