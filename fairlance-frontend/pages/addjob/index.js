// pages/addjob.js
import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  Text,
  InputLeftElement,
  InputGroup,
} from "@chakra-ui/react";
import { MdTitle, MdWork, MdAttachMoney, MdDateRange } from "react-icons/md";
import Navbar from "../../components/Navbars/navbar";
import Footer from "../../components/Navbars/footer";
import SlideInNotifications from "../../components/AddJob/Notification";

const AddJob = () => {
  const [jobData, setJobData] = useState({
    jobTitle: "",
    skillsRequired: "",
    jobDescription: "",
    budget: "",
    deadline: "",
    image: null,
  });

  const [notifications, setNotifications] = useState([]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setJobData({
        ...jobData,
        image: files[0],
      });
    } else {
      setJobData({
        ...jobData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const jobDataToSave = { ...jobData, image: jobData.image?.name };
    const response = await fetch("/api/saveJob", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jobDataToSave),
    });

    if (response.ok) {
      setNotifications((prev) => [
        { id: Math.random(), text: "Job saved successfully!" },
        ...prev,
      ]);
      // Clear the form
      setJobData({
        jobTitle: "",
        skillsRequired: "",
        jobDescription: "",
        budget: "",
        deadline: "",
        image: null,
      });
    } else {
      setNotifications((prev) => [
        { id: Math.random(), text: "Failed to save job" },
        ...prev,
      ]);
    }
  };

  const removeNotif = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <>
      <Navbar />

      <Box
        maxW="800px"
        mx="auto"
        mt="5"
        p="5"
        className="text-white"
        border={0}
      >
        <Text
          fontSize="6xl"
          fontWeight="bold"
          bgGradient="linear(to-r, purple.300, blue.500)"
          bgClip="text"
        >
          Create New Job!
        </Text>
        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            <FormControl id="jobTitle" isRequired className="mt-8">
              <FormLabel>Job Title</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <MdTitle color="gray" />
                </InputLeftElement>
                <Input
                  name="jobTitle"
                  placeholder="Enter job title"
                  onChange={handleChange}
                  value={jobData.jobTitle}
                />
              </InputGroup>
            </FormControl>

            <FormControl id="skillsRequired" isRequired>
              <FormLabel>Skills Required</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <MdWork color="gray" />
                </InputLeftElement>
                <Input
                  name="skillsRequired"
                  placeholder="Enter required skills"
                  onChange={handleChange}
                  value={jobData.skillsRequired}
                />
              </InputGroup>
            </FormControl>

            <FormControl id="jobDescription" isRequired>
              <FormLabel>Job Description</FormLabel>

              <Textarea
                name="jobDescription"
                placeholder="Enter job description"
                onChange={handleChange}
                value={jobData.jobDescription}
                className="min-h-44"
              />
            </FormControl>

            <FormControl id="image">
              <FormLabel>Upload Image</FormLabel>

              <Input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                p={1}
              />
            </FormControl>

            <FormControl id="budget" isRequired>
              <FormLabel>Budget</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <MdAttachMoney color="gray" />
                </InputLeftElement>
                <Input
                  name="budget"
                  type="number"
                  placeholder="Enter budget"
                  onChange={handleChange}
                  value={jobData.budget}
                />
              </InputGroup>
            </FormControl>

            <FormControl id="deadline" isRequired>
              <FormLabel>Deadline</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <MdDateRange color="gray" />
                </InputLeftElement>
                <Input
                  name="deadline"
                  type="date"
                  onChange={handleChange}
                  value={jobData.deadline}
                />
              </InputGroup>
            </FormControl>

            <Button
              colorScheme="teal"
              size="lg"
              type="submit"
              bg={"#3a82d0"}
              sx={{
                "&:hover": {
                  bg: "#135fb0",
                },
                "&:focus": {
                  bg: "#135fb0",
                },
              }}
            >
              Post Job
            </Button>
          </VStack>
        </form>
      </Box>
      <SlideInNotifications
        notifications={notifications}
        removeNotif={removeNotif}
      />
      <Box position="absolute" top="5%" left="5px" width={"30%"}>
        <img
          src="/img/addJob/job.svg"
          alt="Your SVG"
          style={{ width: "100%", height: "100%" }}
        />
      </Box>
      <Box position="absolute" top="37%" right="5px" width={"30%"}>
        <img
          src="/img/addJob/job2.svg"
          alt="Your SVG"
          style={{ width: "100%", height: "100%" }}
        />
      </Box>
      <Footer />
    </>
  );
};

export default AddJob;
