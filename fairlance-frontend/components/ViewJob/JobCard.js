// components/JobCard.js
import { Box, Image, Text, Badge, VStack } from "@chakra-ui/react";

const JobCard = ({ job }) => {
  return (
    <Box
      borderWidth="0px"
      borderRadius="lg"
      overflow="hidden"
      bgGradient="linear(to-r, #1d88e5, #5045e4)"
      transition="transform 0.2s, background 0.2s"
      _hover={{
        bgGradient: "linear(to-r, #5045e4, #1d88e5)",
        transform: "scale(1.02)",
        cursor: "pointer",
      }}
    >
      <Image
        src={`/img/jobs/${job.image}`}
        alt={job.jobTitle}
        boxSize="150px"
        width={"100%"}
      />
      <Box p={4}>
        <VStack align="start" mt={4}>
          <Text fontWeight="bold" fontSize="xl" isTruncated maxW="full">
            {job.jobTitle}
          </Text>
          <Badge colorScheme="blue" maxW="full" isTruncated>
            {job.skillsRequired}
          </Badge>
          <Text noOfLines={2}>{job.jobDescription}</Text>
          <Text>Budget: ${job.budget}</Text>
          <Text>Deadline: {job.deadline}</Text>
        </VStack>
      </Box>
    </Box>
  );
};

export default JobCard;
