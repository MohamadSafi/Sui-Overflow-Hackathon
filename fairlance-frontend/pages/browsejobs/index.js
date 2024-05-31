// pages/browsejobs.js
import { useState, useEffect } from "react";
import {
  Box,
  Input,
  SimpleGrid,
  Button,
  HStack,
  VStack,
  Text,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import JobCard from "../../components/ViewJob/JobCard";
import fs from "fs";
import path from "path";
import Navbar from "../../components/Navbars/navbar";
import CategoriesCards from "../../components/ViewJob/CategoriesCard";
import Footer from "../../components/Navbars/footer";
import { SearchIcon } from "@chakra-ui/icons";

const BrowseJobs = ({ jobs }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredJobs, setFilteredJobs] = useState([]);

  const jobsPerPage = 12;
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  useEffect(() => {
    const filtered = jobs.filter((job) =>
      job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredJobs(filtered);
  }, [searchTerm, jobs]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const currentJobs = filteredJobs.slice(
    (currentPage - 1) * jobsPerPage,
    currentPage * jobsPerPage
  );

  return (
    <>
      <Navbar />
      {/* <CategoriesCards /> */}
      <Box maxW="1200px" mx="auto" p={4} mt={16}>
        <Text
          fontSize="4xl"
          fontWeight="bold"
          bgGradient="linear(to-r, purple.300, blue.500)"
          bgClip="text"
          mb={4}
        >
          Find a job Now!
        </Text>
        <InputGroup size="lg" mb={4} w={"70%"}>
          <InputLeftElement
            pointerEvents="none"
            children={<SearchIcon color="black" />}
          />

          <Input
            placeholder="Search for jobs"
            _placeholder={{ color: "black" }}
            borderColor={"grey"}
            value={searchTerm}
            onChange={handleSearch}
            mb={4}
            size={"lg"}
            type="search"
            bg={"#bbbdbf"}
          />
        </InputGroup>

        <SimpleGrid columns={{ sm: 1, md: 2, lg: 4 }} spacing={4} mt={16}>
          {currentJobs.map((job, index) => (
            <JobCard key={index} job={job} />
          ))}
        </SimpleGrid>
        <HStack mt={12} justifyContent="center">
          {Array.from({ length: totalPages }, (_, index) => (
            <Button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              colorScheme={currentPage === index + 1 ? "blue" : "gray"}
            >
              {index + 1}
            </Button>
          ))}
        </HStack>
      </Box>
      <Footer />
    </>
  );
};

export async function getStaticProps() {
  const filePath = path.join(process.cwd(), "data", "jobs.json");
  const jsonData = fs.readFileSync(filePath);
  const jobs = JSON.parse(jsonData);

  return {
    props: {
      jobs,
    },
  };
}

export default BrowseJobs;
