// components/Notification.js
import React, { useEffect, useState } from "react";
import { FiCheckSquare, FiX } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";

const Notification = ({ text, id, removeNotif }) => {
  useEffect(() => {
    const timeoutRef = setTimeout(() => {
      removeNotif(id);
    }, 5000); // Notification TTL

    return () => clearTimeout(timeoutRef);
  }, [id, removeNotif]);

  return (
    <motion.div
      layout
      initial={{ y: -15, scale: 0.95 }}
      animate={{ y: 0, scale: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="p-2 flex items-start rounded gap-2 text-xs font-medium shadow-lg text-white bg-gradient-to-r from-purple-300 to-blue-500 pointer-events-auto"
    >
      <FiCheckSquare className="mt-0.5" />
      <span>{text}</span>
      <button onClick={() => removeNotif(id)} className="ml-auto mt-0.5">
        <FiX />
      </button>
    </motion.div>
  );
};

const SlideInNotifications = ({ notifications, removeNotif }) => (
  <div className="flex flex-col gap-1 w-72 fixed top-2 right-2 z-50 pointer-events-none">
    <AnimatePresence>
      {notifications.map((n) => (
        <Notification removeNotif={removeNotif} {...n} key={n.id} />
      ))}
    </AnimatePresence>
  </div>
);

export default SlideInNotifications;
