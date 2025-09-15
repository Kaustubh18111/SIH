import { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
// Firebase SDK imports
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithCustomToken, signInAnonymously } from "firebase/auth";
import { getFirestore, collection, addDoc, onSnapshot } from "firebase/firestore";
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
  
  // State variable to manage current view
  const [currentView, setCurrentView] = useState(VIEW_CHAT);

  // ========================
  // Firebase Setup & Auth
  // ========================
  // Globals provided by the host environment
  const firebaseConfig = window.__firebase_config;
  const initialAuthToken = window.__initial_auth_token;
  const appId = firebaseConfig?.appId || "mental-health-mvp";

  // Hold initialized services and current user id
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);

  // One-time initialization for Firebase
  useEffect(() => {
    if (!firebaseConfig) return; // If no config is provided, skip init

    // Initialize (support HMR by reusing existing app)
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    const _db = getFirestore(app);
    const _auth = getAuth(app);
    setDb(_db);
    setAuth(_auth);

    // Auth flow: custom token if available, otherwise anonymous
    const unsubscribe = onAuthStateChanged(_auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        return;
      }
      try {
        if (initialAuthToken) {
          const cred = await signInWithCustomToken(_auth, initialAuthToken);
          setUserId(cred.user.uid);
        } else {
          const anon = await signInAnonymously(_auth);
          setUserId(anon.user.uid);
        }
      } catch (err) {
        // Fallback to anonymous if custom token fails
        try {
          const anon = await signInAnonymously(_auth);
          setUserId(anon.user.uid);
        } catch (e) {
          // Keep unauthenticated state; UI will remain read-only
          // eslint-disable-next-line no-console
          console.error("Firebase auth failed", e);
        }
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
      setInput(""); // Clear input immediately for better UX
      
      // Add user message to chat
      setMessages(prev => [...prev, { text: userMessage, sender: "user" }]);
      
      try {
        // Initialize the model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // Create a system prompt for mental health support
        const systemPrompt = "You are a compassionate mental health support chatbot. Provide empathetic, supportive, and helpful responses. Always encourage professional help when appropriate and never provide medical advice. Be kind, understanding, and non-judgmental.";
        
        // Start a chat session
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

        // Send message and get response
        const result = await chat.sendMessage(userMessage);
        console.log("API result:", result);
        
        const text = result.response.text();
        
        setMessages(prev => [...prev, { 
          text: text,
          sender: "bot" 
        }]);
      } catch (error) {
        console.error("Error details:", error);
        
        let errorMessage = "I apologize, but I'm having trouble responding right now. Please try again.";
        
        // Provide more specific error messages based on the error type
        if (error.message && error.message.includes('API key')) {
          errorMessage = "There seems to be an issue with the API configuration. Please check back soon.";
        } else if (error.message && error.message.includes('quota')) {
          errorMessage = "I'm currently experiencing high demand. Please try again in a few moments.";
        } else if (error.message && error.message.includes('network') || error.name === 'NetworkError') {
          errorMessage = "I'm having trouble connecting right now. Please check your internet connection and try again.";
        }
        
        setMessages(prev => [...prev, { 
          text: errorMessage, 
          sender: "bot" 
        }]);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start p-4">
      {/* Global Header with Navigation and Language Selector */}
      <div className="w-full max-w-6xl mb-6">
        <div className="flex justify-between items-center bg-white rounded-lg shadow-md p-4">
          {/* Navigation Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentView(VIEW_CHAT)}
              className={`px-4 py-2 rounded transition-colors ${
                currentView === VIEW_CHAT 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('chat_tab_button')}
            </button>
            <button
              onClick={() => setCurrentView(VIEW_RESOURCES)}
              className={`px-4 py-2 rounded transition-colors ${
                currentView === VIEW_RESOURCES 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('resources_tab_button')}
            </button>
            <button
              onClick={() => setCurrentView(VIEW_ADMIN)}
              className={`px-4 py-2 rounded transition-colors ${
                currentView === VIEW_ADMIN 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('admin_tab_button')}
            </button>
          </div>
          
          {/* Global Language Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{t('language_label')}</span>
            <select 
              value={i18n.language} 
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="bn">বাংলা (Bengali)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="mr">मराठी (Marathi)</option>
              <option value="ta">தமிழ் (Tamil)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chat Interface - conditional rendering */}
      {currentView === VIEW_CHAT && (
        <>
          
          <div className="max-w-lg w-full bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="bg-blue-600 p-4">
          <h1 className="text-xl font-semibold text-white">{t('chatbot_title')}</h1>
          <p className="text-blue-100 text-sm">{t('chatbot_subtitle')}</p>
        </div>
        
        <div className="flex flex-col h-[500px]">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-gray-100 text-gray-800 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('chat_input_placeholder')}
                rows="2"
              />
              <button
                onClick={handleSend}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {t('chat_send_button')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking button */}
      <div className="max-w-lg w-full flex flex-col items-stretch">
        <button
          onClick={() => setIsBookingModalOpen(true)}
          className="mb-3 rounded-lg bg-green-600 px-6 py-3 font-medium text-white shadow hover:bg-green-700"
        >
          {t('book_session_button')}
        </button>

        {bookingStatus && (
          <div className="mb-4 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-blue-800">
            {bookingStatus}
          </div>
        )}

        {/* Upcoming bookings list */}
        {bookings && bookings.length > 0 && (
          <div className="rounded-lg bg-white p-4 shadow">
            <h3 className="mb-2 text-lg font-semibold">{t('upcoming_bookings_title')}</h3>
            <ul className="space-y-2">
              {bookings
                .filter((b) => (b.appointmentDate || "") >= new Date().toISOString().slice(0, 10))
                .sort((a, b) => (a.appointmentDate || "").localeCompare(b.appointmentDate || ""))
                .map((b) => (
                  <li key={b.id} className="border-b pb-2 last:border-b-0">
                    <div className="font-medium">{b.serviceType}</div>
                    <div className="text-sm text-gray-600">
                      {b.appointmentDate} at {b.appointmentTime}
                    </div>
                    {b.message && (
                      <div className="mt-1 text-xs text-gray-500">{b.message}</div>
                    )}
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>

          {/* Booking modal */}
          {isBookingModalOpen && <BookingModal />}
        </>
      )}

      {/* Resource Hub - conditional rendering */}
      {currentView === VIEW_RESOURCES && (
        <div className="w-full">
          <ResourceHub />
        </div>
      )}

      {/* Admin Dashboard - conditional rendering */}
      {currentView === VIEW_ADMIN && (
        <div className="w-full">
          <AdminDashboard onBackToMain={() => setCurrentView(VIEW_CHAT)} />
        </div>
      )}
    </div>
  );
}

export default App;
