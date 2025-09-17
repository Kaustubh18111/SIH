
import { motion } from 'framer-motion';
import { FiCompass, FiCode, FiMessageSquare, FiSend, FiMic } from 'react-icons/fi';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const UnmuteAiPage = () => {
  return (
    <div className="relative flex flex-col h-full w-full p-4 md:p-8 overflow-hidden">
      <motion.div
        className="flex flex-col items-center justify-start flex-grow text-center px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Greeting Section */}
        <motion.div variants={itemVariants} className="my-24">
          <h1 className="text-4xl md:text-6xl font-semibold text-gray-800">
            Hello, Ananya
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-500">
            How can I help you today?
          </p>
        </motion.div>

        {/* Suggestion Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl"
        >
          <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} className="bg-slate-100 p-4 rounded-xl cursor-pointer h-48 flex flex-col justify-between">
            <p className="text-left font-medium text-gray-700">Suggest beautiful places to see on an upcoming road trip</p>
            <FiCompass className="self-end text-2xl text-gray-500" />
          </motion.div>
          <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} className="bg-slate-100 p-4 rounded-xl cursor-pointer h-48 flex flex-col justify-between">
            <p className="text-left font-medium text-gray-700">Briefly summarize this concept: urban planning</p>
            <FiMessageSquare className="self-end text-2xl text-gray-500" />
          </motion.div>
          <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} className="bg-slate-100 p-4 rounded-xl cursor-pointer h-48 flex flex-col justify-between">
            <p className="text-left font-medium text-gray-700">Help me debug a python script for web scraping</p>
            <FiCode className="self-end text-2xl text-gray-500" />
          </motion.div>
          <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} className="bg-slate-100 p-4 rounded-xl cursor-pointer h-48 flex flex-col justify-between">
            <p className="text-left font-medium text-gray-700">Write a thank-you note to my interviewer</p>
            <FiSend className="self-end text-2xl text-gray-500" />
          </motion.div>
        </motion.div>
      </motion.div>
      {/* Futuristic Chat Input Bar */}
      <motion.div
        className="w-full max-w-3xl mx-auto"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="relative flex items-center bg-slate-200/70 backdrop-blur-sm rounded-full p-2 shadow-lg border border-gray-200">
          <textarea
            rows="1"
            placeholder="Enter a prompt here..."
            className="flex-grow bg-transparent border-none focus:ring-0 resize-none outline-none p-2 text-gray-800 placeholder-gray-500"
          />
          <button className="p-2 rounded-full hover:bg-gray-300/50 transition-colors">
            <FiMic className="text-xl text-gray-600" />
          </button>
          <button className="ml-2 p-2 bg-slate-800 rounded-full hover:bg-slate-900 transition-colors">
            <FiSend className="text-xl text-white" />
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          This AI is for informational purposes. Please verify important information.
        </p>
      </motion.div>
    </div>
  );
};

export default UnmuteAiPage;
