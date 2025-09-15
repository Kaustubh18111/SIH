import { useState, useEffect } from "react";
import Login from "./Login";
import { doc, setDoc, getDoc } from "firebase/firestore";
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
  const [user, setUser] = useState(null);
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
    if (!firebaseConfig) return;
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    const _db = getFirestore(app);
    const _auth = getAuth(app);
    setDb(_db);
    setAuth(_auth);
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(_auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser && _db) {
        // Fetch chat history from Firestore
        const chatDocRef = doc(_db, "chats", firebaseUser.uid);
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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start p-4">
      {/* ...existing code... */}
    </div>
  );
}

export default App;
