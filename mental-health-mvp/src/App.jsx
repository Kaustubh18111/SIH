import { useState, useEffect, useRef, lazy } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from "./Login";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";
// Firebase SDK imports
import { onAuthStateChanged, signOut } from "firebase/auth";
import { onSnapshot } from "firebase/firestore";
import { auth, db, appId } from './firebase';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';
const ResourceHub = lazy(() => import('./ResourceHub'));
const AdminDashboard = lazy(() => import('./AdminDashboard'));

// Initialize the Generative AI API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// View constants for better readability
const VIEW_CHAT = 'chat';
const VIEW_RESOURCES = 'resources';
const VIEW_ADMIN = 'admin';

// Component for the main chat interface
const ChatInterface = ({ user, db }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (user && db) {
      const chatDocRef = doc(db, "chats", user.uid);
      const unsubscribe = onSnapshot(chatDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setMessages(docSnap.data().messages || []);
        }
      });
      return () => unsubscribe();
    }
  }, [user, db]);

  const handleSend = async () => {
    if (input.trim() !== "" && user) {
      const userMessage = { text: input, sender: "user" };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput("");
      setLoading(true);

      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const chat = model.startChat({
          history: [
            { role: "user", parts: [{ text: "You are a compassionate mental health support chatbot..." }] },
            { role: "model", parts: [{ text: "I understand. How are you feeling today?" }] },
            ...newMessages.map(msg => ({
              role: msg.sender === 'user' ? 'user' : 'model',
              parts: [{ text: msg.text }]
            }))
          ]
        });
        const result = await chat.sendMessage(userMessage.text);
        const text = result.response.text();
        
        const botMessage = { text, sender: "bot" };
        const finalMessages = [...newMessages, botMessage];
        setMessages(finalMessages);

        if (db) {
          const chatDocRef = doc(db, "chats", user.uid);
          await setDoc(chatDocRef, { messages: finalMessages }, { merge: true });
        }
      } catch (error) {
        console.error('Gemini chatbot error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Auto-scroll to bottom whenever messages or loading changes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Futuristic light-mode chat UI integrated with existing state
  return (
    <div className="h-full w-full flex flex-col p-4">
      {/* Main container for chat, centers content */}
      <div className="w-full max-w-4xl mx-auto h-full flex flex-col">

        {/* Conditional Welcome Screen (uses your 'messages' state) */}
        {messages.length === 0 && !loading && (
          <div className="text-center my-auto">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
              Hello, {user?.displayName || 'there'}.
            </h1>
            <p className="text-4xl font-semibold text-gray-400 mt-2">How can I help you today?</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 text-left">
              {/* Suggestion Cards that now set the input state */}
              <div onClick={() => setInput('Plan a trip to Mahabaleshwar')} className="bg-white p-4 rounded-xl border border-gray-200 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <p className="font-semibold text-gray-700">Plan a trip</p>
                <p className="text-sm text-gray-500">to Mahabaleshwar</p>
              </div>
              <div onClick={() => setInput('Write a short story about a robot who discovers music')} className="bg-white p-4 rounded-xl border border-gray-200 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <p className="font-semibold text-gray-700">Write a short story</p>
                <p className="text-sm text-gray-500">about a robot and music</p>
              </div>
            </div>
          </div>
        )}

        {/* Chat History (uses your 'messages' state) */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-4" ref={chatContainerRef}>
          {Array.isArray(messages) && messages.map((message, index) => {
            const sender = message?.sender;
            const text = message?.text ?? message?.content ?? '';
            const isUser = sender === 'user';
            const isModel = sender === 'model' || sender === 'bot';
            return (
              <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xl p-3 rounded-2xl ${isUser ? 'bg-indigo-500 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
                  {isModel ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose max-w-none">
                      {text}
                    </ReactMarkdown>
                  ) : (
                    text
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Loading Indicator (uses your 'loading' state) */}
          {loading && (
            <div className="flex justify-start">
              <div className="p-3 rounded-2xl bg-white border border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input Bar (wired to your state and handlers) */}
        <div className="mt-auto pt-2">
          <div className="relative">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
              <div className="flex items-center bg-white rounded-xl p-2 shadow-md border border-gray-200 transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-400">
                <input
                  type="text"
                  className="w-full bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 px-3"
                  placeholder="Message Unmute AI..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="submit"
                  className="p-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 disabled:bg-gray-300 transition-colors"
                  disabled={loading || !input.trim()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// Layout wrapper component
const DashboardLayout = ({ children, user }) => {
  const location = useLocation();
  const shouldShowSidebar = !location.pathname.includes('/login');

  return (
    <div className="flex min-h-screen">
      {shouldShowSidebar && <Sidebar />}
      <div className={`flex-1 bg-gray-100 ${shouldShowSidebar ? 'ml-64' : ''}`}>
        {children}
      </div>
    </div>
  );
};

function App() {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setUserId(firebaseUser ? firebaseUser.uid : null);
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
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successBookingDetails, setSuccessBookingDetails] = useState(null);

  const timeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM",
  ];

  useEffect(() => {
    if (!db || !userId) return;
    const chatDocRef = doc(db, "chats", userId);
    const unsub = onSnapshot(chatDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setBookings(data.bookings || []);
      } else {
        setBookings([]);
      }
    });
    return () => unsub();
  }, [db, userId]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    console.log("=== BOOKING SUBMISSION START ===");
    console.log("Form data:", { serviceType, appointmentDate, appointmentTime, note });
    console.log("Firebase state:", { db: !!db, userId, appId });
    
    // Safety timeout to reset loading state after 10 seconds
    const timeoutId = setTimeout(() => {
      console.log("TIMEOUT: Resetting loading state");
      setIsSubmittingBooking(false);
      setBookingStatus("Request timed out. Please try again.");
      setTimeout(() => setBookingStatus(""), 5000);
    }, 10000);
    
    if (!db || !userId || !appId) {
      console.log("VALIDATION FAILED: Missing required Firebase data");
      clearTimeout(timeoutId);
      return;
    }
    
    setIsSubmittingBooking(true);
    
    // Check online status
    if (!navigator.onLine) {
      console.log("NETWORK: User appears to be offline");
      clearTimeout(timeoutId);
      setIsSubmittingBooking(false);
      return;
    }
    
    try {
      console.log("FIREBASE: Attempting to save to Firestore...");
      console.log("NETWORK: Online status =", navigator.onLine);
      
      // Use the EXACT same path as chat messages which we know works
      const chatDocRef = doc(db, "chats", userId);
      console.log("FIREBASE: Using existing chats document = chats/" + userId);
      
      const newBooking = {
        id: Date.now().toString(),
        serviceType,
        appointmentDate,
        appointmentTime,
        message: note,
        createdAt: new Date().toISOString(),
      };
      console.log("FIREBASE: New booking data =", newBooking);
      
      // Get existing chat document
      const chatDocSnap = await getDoc(chatDocRef);
      const existingData = chatDocSnap.exists() ? chatDocSnap.data() : {};
      const existingBookings = existingData.bookings || [];
      
      // Add new booking to array
      const updatedBookings = [...existingBookings, newBooking];
      
      // Save updated bookings array to the same document as chat messages
      await setDoc(chatDocRef, { 
        ...existingData,
        bookings: updatedBookings 
      }, { merge: true });
      
      console.log("SUCCESS: Booking saved with ID:", newBooking.id);
      clearTimeout(timeoutId);
      setIsBookingModalOpen(false);
      
      // Store booking details for success popup
      setSuccessBookingDetails({
        ...newBooking,
        counselorName: serviceType === 'counselor' ? 'Prince Vaishnav' : 'Helpline Support',
        counselorContact: serviceType === 'counselor' ? '9699190093' : 'N/A'
      });
      setShowSuccessPopup(true);
      
      // Clear form
      setServiceType("");
      setAppointmentDate("");
      setAppointmentTime("");
      setNote("");
      
    } catch (err) {
      console.error("ERROR: Booking submission failed");
      console.error("Error details:", err);
      console.error("Error message:", err?.message || "Unknown error");
      console.error("Error code:", err?.code || "No code");
      clearTimeout(timeoutId);
      
      // Error handling can be enhanced here if needed
      console.log("Booking failed - user will see loading stop");
    }
    
    console.log("CLEANUP: Resetting loading state");
    setIsSubmittingBooking(false);
    console.log("=== BOOKING SUBMISSION END ===");
  };

  const BookingModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-center text-2xl font-bold">{t('booking_modal_title')}</h2>
        <form onSubmit={handleBookingSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('service_type_label')}</label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              required
              className="w-full rounded border border-gray-300 px-3 py-2"
            >
              <option value="">{t('service_type_placeholder')}</option>
              <option value="counselor">{t('service_counselor')}</option>
              <option value="helpline">{t('service_helpline')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('date_label')}</label>
            <input
              type="date"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              required
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('time_label')}</label>
            <select
              value={appointmentTime}
              onChange={(e) => setAppointmentTime(e.target.value)}
              required
              className="w-full rounded border border-gray-300 px-3 py-2"
            >
              <option value="">{t('time_placeholder')}</option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('message_label')}</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('message_placeholder')}
              rows={3}
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmittingBooking}
              className={`flex-1 rounded px-4 py-2 text-white ${
                isSubmittingBooking 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isSubmittingBooking ? 'Submitting...' : t('submit_button')}
            </button>
            <button
              type="button"
              onClick={() => setIsBookingModalOpen(false)}
              disabled={isSubmittingBooking}
              className={`rounded px-4 py-2 ${
                isSubmittingBooking
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {t('cancel_button')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const SuccessPopup = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Successful!</h2>
          <p className="text-gray-600">Your confidential session has been scheduled.</p>
        </div>
        
        {successBookingDetails && (
          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Service:</span>
                <span className="text-gray-900">{successBookingDetails.serviceType === 'counselor' ? 'On-campus Counselor' : 'Mental Health Helpline'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Date:</span>
                <span className="text-gray-900">{successBookingDetails.appointmentDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Time:</span>
                <span className="text-gray-900">{successBookingDetails.appointmentTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Counselor:</span>
                <span className="text-gray-900">{successBookingDetails.counselorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Contact:</span>
                <span className="text-gray-900">{successBookingDetails.counselorContact}</span>
              </div>
            </div>
          </div>
        )}
        
        <button
          onClick={() => {
            setShowSuccessPopup(false);
            setSuccessBookingDetails(null);
          }}
          className="w-full rounded bg-green-600 px-4 py-2 text-white font-medium hover:bg-green-700"
        >
          Done
        </button>
      </div>
    </div>
  );

  // Note: Chat handling is encapsulated in ChatInterface

  // Note: Enter-to-send handling is implemented inside ChatInterface input.

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<Login setUser={setUser} />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <DashboardLayout user={user}>
        <Routes>
          <Route path="/" element={
            <div className="p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('chatbot_title')}</h1>
                <p className="text-gray-600">{t('chatbot_subtitle')}</p>
              </div>
              <ChatInterface user={user} db={db} />
              <div className="mt-6">
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="rounded bg-green-600 px-6 py-3 text-white font-medium hover:bg-green-700"
                >
                  {t('book_session_button')}
                </button>
              </div>
              {isBookingModalOpen && <BookingModal />}
              {showSuccessPopup && <SuccessPopup />}
            </div>
          } />
          <Route path="/admin" element={<AdminDashboard user={user} db={db} />} />
          <Route path="/assess" element={
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Assessment Center</h1>
              <p className="text-gray-600">Coming soon...</p>
            </div>
          } />
          <Route path="/track" element={
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Progress Tracking</h1>
              <p className="text-gray-600">Coming soon...</p>
            </div>
          } />
          <Route path="/resources" element={<ResourceHub />} />
          <Route path="/community" element={
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Community</h1>
              <p className="text-gray-600">Coming soon...</p>
            </div>
          } />
          <Route path="/settings" element={
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Settings</h1>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
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
                </div>
                <button
                  onClick={() => signOut(auth)}
                  className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </div>
          } />
        </Routes>
      </DashboardLayout>
    </Router>
  );
}

export default App;