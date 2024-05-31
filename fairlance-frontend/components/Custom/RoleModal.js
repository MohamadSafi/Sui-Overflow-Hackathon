import { useState } from "react";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  Text,
} from "@chakra-ui/react";

const RoleSelectionModal = ({ isOpen, onClose, onSave }) => {
  const [role, setRole] = useState("");

  const handleSave = () => {
    onSave(role);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bg={"#061e30"} borderRadius={30}>
        <ModalHeader color={"white"}>Select Your Role</ModalHeader>
        <ModalBody color={"white"}>
          <Text mb={4}>Please select your role:</Text>
          <Select
            placeholder="Select your role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="Client">Client</option>
            <option value="Freelancer">Freelancer</option>
          </Select>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            bg={"#3a82d0"}
            mr={3}
            onClick={handleSave}
            disabled={!role}
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RoleSelectionModal;
