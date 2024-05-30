import React from "react";
import { Box, Grid, Text } from "@chakra-ui/react";

import JobCard from "./JobCard";

const jobOffers = [
  {
    id: 1,
    title: "Web Developer",
    category: "Development",
    price: "$500",
    description: "Looking for an experienced ",
    image: "/img/home/web-developer.jpeg",
  },
  {
    id: 2,
    title: "Graphic Designer",
    category: "Design",
    price: "$300",
    description: "Need a creative graphic designer.",
    image: "/img/home/graphic-design.jpeg",
  },
  {
    id: 3,
    title: "Content Writer",
    category: "Writing",
    price: "$200",
    description: "Seeking a skilled content writer.",
    image: "/img/home/content-writer.jpeg",
  },
  {
    id: 4,
    title: "SEO Specialist",
    category: "Marketing",
    price: "$400",
    description: "Looking for an SEO specialist.",
    image: "/img/home/seo.jpeg",
  },
];

const JobCardsSection = () => {
  return (
    <Box className="my-32">
      <Text
        fontSize="4xl"
        fontWeight="bold"
        bgGradient="linear(to-r, blue.500, purple.300)"
        bgClip="text"
        textAlign="center"
        className="mb-8"
      >
        Take a look at the posted jobs!
      </Text>
      <Box p={8} mx={16}>
        <Grid
          templateColumns={{ sm: "1fr", md: "1fr 1fr", lg: "repeat(4, 1fr)" }}
          gap={16}
        >
          {jobOffers.map((job) => (
            <Box key={job.id} height="400px">
              <JobCard job={job} />
            </Box>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default JobCardsSection;
