import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiAlertCircle } from "react-icons/fi";
import { Select, Text } from "@chakra-ui/react";

const RoleSelectionModal = ({ isOpen, onClose, onSave }) => {
  const [role, setRole] = useState("");

  const handleSave = () => {
    onSave(role);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="bg-slate-900/20 backdrop-blur p-8 fixed inset-0 z-50 grid place-items-center overflow-y-scroll cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0, rotate: "12.5deg" }}
            animate={{ scale: 1, rotate: "0deg" }}
            exit={{ scale: 0, rotate: "0deg" }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-6 rounded-lg w-full max-w-lg shadow-xl cursor-default relative overflow-hidden"
          >
            <FiAlertCircle className="text-white/10 rotate-12 text-[250px] absolute z-0 -top-24 -left-24" />
            <div className="relative z-10">
              <div className="bg-white w-16 h-16 mb-2 rounded-full text-3xl text-indigo-600 grid place-items-center mx-auto">
                <FiAlertCircle />
              </div>
              <h3 className="text-3xl font-bold text-center mb-2">
                Select Your Role
              </h3>
              <div className="text-center mb-6">
                <Text mb={4}>Please select your role:</Text>
                <Select
                  placeholder="Select your role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  bg={"#061e30"}
                  borderRadius={10}
                  color={"white"}
                >
                  <option value="Client">Client</option>
                  <option value="Freelancer">Freelancer</option>
                </Select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="bg-white hover:opacity-90 transition-opacity text-indigo-600 font-semibold w-full py-2 rounded"
                  disabled={!role}
                >
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RoleSelectionModal;
