import { Box, Button, Text } from "@chakra-ui/react";

const Hero = () => {
  return (
    <Box className="flex flex-col items-center justify-start mb-36 min-h-full">
      <Box
        position="absolute"
        top="4%"
        left="40%"
        width="300px"
        height="300px"
        bgGradient="radial(teal.500, transparent)"
        filter="blur(50px)"
        zIndex={-1}
      ></Box>
      <Box
        position="absolute"
        top="20%"
        left="0"
        width="300px"
        height="300px"
        bgGradient="radial(blue.700, transparent)"
        filter="blur(200px)"
        zIndex={-1}
      ></Box>
      <Box
        position="absolute"
        top="3%"
        right="0"
        zIndex={-1}
        width="300px"
        height="300px"
        bgGradient="radial(blue.700, transparent)"
        filter="blur(200px)"
      ></Box>

      <Text
        fontSize="6xl"
        fontWeight="bold"
        bgGradient="linear(to-r, blue.500, purple.300)"
        bgClip="text"
        textAlign="center"
        className="mb-8"
      >
        Welcome to Farilance
      </Text>
      <Box className="relative w-full max-w-4xl mt-8">
        <img
          src="img/home/hero.png"
          alt="Hero Image"
          className="w-full h-auto rounded-lg shadow-lg"
        />
        <Box className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 text-white p-8 rounded-lg">
          <Text
            fontSize="4xl"
            fontWeight="bold"
            textAlign="center"
            className="mb-4"
          >
            Find and Post Freelancing Jobs With No Fees and From Anywhere in The
            World
          </Text>
          <Button
            colorScheme="blue"
            bg={"#3a82d0"}
            size="lg"
            sx={{
              "&:hover": {
                bg: "transparent",
              },
              "&:focus": {
                bg: "transparent",
              },
            }}
          >
            Get started
          </Button>
        </Box>
      </Box>
      <Box position="absolute" top="10%" left="0">
        <img
          src="img/home/lines-left.png"
          alt="Hero Image"
          className="w-full h-auto rounded-lg "
        />
      </Box>
      <Box position="absolute" top="0%" right="0" zIndex={-1}>
        <img
          src="img/home/space-lines.png"
          alt="Hero Image"
          className="w-full h-auto rounded-lg"
        />
      </Box>
    </Box>
  );
};

export default Hero;
