import { Text, Box, Flex, Image } from "@chakra-ui/react";
import React from "react";

const stats = [
  {
    title: "Services Offered",
    count: "--",
    icon: "img/auth/ServicesOffered.png",
  },
  {
    title: "Completed Services",
    count: "--",
    icon: "img/auth/CompletedIcon.png",
  },
  {
    title: "In Queue Services",
    count: "--",
    icon: "img/auth/QueueServices.png",
  },
  {
    title: "Total Review",
    count: "--",
    icon: "img/auth/reviews.png",
  },
];

const Card = ({ title, count, subtext, icon }) => {
  return (
    <Box className="p-4 border rounded-lg shadow-lg">
      <Flex className="mt-4" justifyContent={"space-evenly"}>
        <div className="w-12 h-12 flex items-center justify-center">
          <img src={icon} />
        </div>
        <Text
          fontSize="2xl"
          fontWeight="bold"
          bgGradient="linear(to-r, purple.300, blue.500)"
          bgClip="text"
          textAlign="center"
          className="mb-8"
        >
          {title}
        </Text>
      </Flex>
      <Flex justifyContent={"center"}>
        <Text
          fontSize="2xl"
          fontWeight="bold"
          bgGradient="linear(to-r, purple.300, blue.500)"
          bgClip="text"
          textAlign="center"
          className="mb-8"
        >
          {count}
        </Text>
      </Flex>
    </Box>
  );
};

const DashboardCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mx-16">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          title={stat.title}
          count={stat.count}
          subtext={stat.subtext}
          icon={stat.icon}
        />
      ))}
    </div>
  );
};

export default DashboardCards;
