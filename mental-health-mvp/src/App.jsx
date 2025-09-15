import { useState, useEffect } from "react";
import Login from "./Login";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";
// Firebase SDK imports
import { onAuthStateChanged, signInWithCustomToken, signInAnonymously, signOut } from "firebase/auth";
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
  // State variable to manage current view
  const [currentView, setCurrentView] = useState(VIEW_CHAT);
  const [userId, setUserId] = useState(null);

  // One-time initialization for Firebase
  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setUserId(firebaseUser ? firebaseUser.uid : null);
      if (firebaseUser && db) {
        // Fetch chat history from Firestore
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

  // ========================
  // Booking Modal & Form
  // ========================
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [serviceType, setServiceType] = useState("");
  const [appointmentDate, setAppointmentDate] = useState(""); // YYYY-MM-DD
  const [appointmentTime, setAppointmentTime] = useState(""); // e.g., 10:00 AM
  const [note, setNote] = useState("");
  const [bookingStatus, setBookingStatus] = useState(""); // success/error banner
  const [bookings, setBookings] = useState([]);

  const timeSlots = [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
  ];

  // Real-time listener for user's bookings
  useEffect(() => {
    if (!db || !userId) return;
    const bookingsRef = collection(db, `artifacts/${appId}/users/${userId}/bookings`);
    const unsub = onSnapshot(bookingsRef, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setBookings(items);
    });
    return () => unsub();
  }, [db, userId]);

  // Submit booking to Firestore
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
      // reset form
      setServiceType("");
      setAppointmentDate("");
      setAppointmentTime("");
      setNote("");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Booking error:", err);
      setBookingStatus("Error booking session. Please try again.");
    }
  };

  // Modal component
  const BookingModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-center text-2xl font-bold">{t('booking_modal_title')}</h2>
        <form onSubmit={handleBookingSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">{t('service_type_label')}</label>
            <select
              className="w-full rounded border px-3 py-2"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              required
            >
              <option value="" disabled>
                {t('service_type_placeholder')}
              </option>
              <option value="On-campus Counselor">{t('service_counselor')}</option>
              <option value="Mental Health Helpline">{t('service_helpline')}</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t('date_label')}</label>
            <input
              type="date"
              className="w-full rounded border px-3 py-2"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t('time_label')}</label>
            <select
              className="w-full rounded border px-3 py-2"
              value={appointmentTime}
              onChange={(e) => setAppointmentTime(e.target.value)}
              required
            >
              <option value="" disabled>
                {t('time_placeholder')}
              </option>
              {timeSlots.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t('message_label')}</label>
            <textarea
              className="w-full rounded border px-3 py-2"
              rows={3}
              placeholder={t('message_placeholder')}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <div className="mt-6 flex items-center justify-between">
            <button
              type="submit"
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              {t('submit_button')}
            </button>
            <button
              type="button"
              onClick={() => setIsBookingModalOpen(false)}
              className="rounded bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300"
            >
              {t('cancel_button')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const handleSend = async () => {
    if (input.trim() !== "") {
      const userMessage = input;
      setInput("");
      // Add user message to chat
      const newMessages = [...messages, { text: userMessage, sender: "user" }];
      setMessages(newMessages);
      // Save to Firestore
      if (db && user) {
        const chatDocRef = doc(db, "chats", user.uid);
        await setDoc(chatDocRef, { messages: newMessages }, { merge: true });
      }
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const systemPrompt = "You are a compassionate mental health support chatbot. Provide empathetic, supportive, and helpful responses. Always encourage professional help when appropriate and never provide medical advice. Be kind, understanding, and non-judgmental.";
        const chat = model.startChat({
          history: [
            {
              role: "user",
              parts: [{ text: systemPrompt }],
            },
            {
              role: "model", 
              parts: [{ text: "I understand. I'm here to provide supportive conversation and a safe space for you to share your thoughts and feelings. How are you doing today?" }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        });
        const result = await chat.sendMessage(userMessage);
        const text = result.response.text();
        const updatedMessages = [...newMessages, { text: text, sender: "bot" }];
        setMessages(updatedMessages);
        // Save updated chat to Firestore
        if (db && user) {
          const chatDocRef = doc(db, "chats", user.uid);
          await setDoc(chatDocRef, { messages: updatedMessages }, { merge: true });
        }
      } catch (error) {
        console.error('Gemini chatbot error:', error);
        let errorMessage = "I apologize, but I'm having trouble responding right now. Please try again.";
        if (error.message && error.message.includes('API key')) {
          errorMessage = "There seems to be an issue with the API configuration. Please check back soon.";
        } else if (error.message && error.message.includes('quota')) {
          errorMessage = "I'm currently experiencing high demand. Please try again in a few moments.";
        } else if (error.message && error.message.includes('network') || error.name === 'NetworkError') {
          errorMessage = "I'm having trouble connecting right now. Please check your internet connection and try again.";
        }
        const updatedMessages = [...newMessages, { text: errorMessage, sender: "bot" }];
        setMessages(updatedMessages);
        // Save error message to Firestore
        if (db && user) {
          const chatDocRef = doc(db, "chats", user.uid);
          await setDoc(chatDocRef, { messages: updatedMessages }, { merge: true });
        }
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Conditional rendering for authentication
  if (!user) {
    return <Login setUser={setUser} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header with title, navigation, language selector, and logout */}
      <header className="w-full bg-white shadow">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
          {/* App Title */}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{t('chatbot_title')}</h1>
            <p className="text-sm text-gray-500">{t('chatbot_subtitle')}</p>
          </div>

          {/* Nav Buttons */}
          <nav className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView(VIEW_CHAT)}
              className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
                currentView === VIEW_CHAT
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {t('nav_chat')}
            </button>
            <button
              onClick={() => setCurrentView(VIEW_RESOURCES)}
              className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
                currentView === VIEW_RESOURCES
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {t('nav_resources')}
            </button>
            <button
              onClick={() => setCurrentView(VIEW_ADMIN)}
              className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
                currentView === VIEW_ADMIN
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {t('nav_admin')}
            </button>
          </nav>

          {/* Language + Logout */}
          <div className="flex items-center gap-2">
            <select
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="rounded border border-gray-300 px-3 py-2 text-sm"
              aria-label={t('language_label')}
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="bn">বাংলা (Bengali)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="mr">मराठी (Marathi)</option>
              <option value="ta">தமிழ் (Tamil)</option>
            </select>
            <button
              onClick={() => auth && signOut(auth).catch(() => {})}
              className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-4xl flex-1 p-4">
        {currentView === VIEW_CHAT && (
          <section>
            {/* Messages Display */}
            <div className="h-[28rem] w-full overflow-y-auto rounded-lg bg-white p-4 shadow">
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-gray-400">
                  {t('loading_text')}
                </div>
              ) : (
                <ul className="space-y-3">
                  {messages.map((msg, idx) => (
                    <li
                      key={idx}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded px-3 py-2 text-sm ${
                          msg.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Input and Actions */}
            <form
              className="mt-4 flex flex-col gap-3 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={t('chat_input_placeholder')}
                className="flex-1 rounded border border-gray-300 px-3 py-2"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  {t('chat_send_button')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(true)}
                  className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                >
                  {t('book_session_button')}
                </button>
              </div>
            </form>
          </section>
        )}

        {currentView === VIEW_RESOURCES && <ResourceHub />}
        {currentView === VIEW_ADMIN && (
          <AdminDashboard onBackToMain={() => setCurrentView(VIEW_CHAT)} />
        )}
      </main>

      {/* Booking Modal */}
      {isBookingModalOpen && <BookingModal />}
    </div>
  );
}

export default App;
