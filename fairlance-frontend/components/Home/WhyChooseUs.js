import { useState, useEffect } from "react";
import { Box, Text, Flex, Image, Button } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";

const reasons = [
  {
    title: "Pay and Get Paid With Crypto Currencies on Sui Network",
    content:
      "Experience the ease of transactions with cryptocurrencies on the Sui Network. Fairlance allows you to pay and get paid seamlessly and securely with various cryptocurrencies, ensuring fast and efficient transactions without the traditional banking hassles.",
    image: "img/home/pay-with-crypto.png",
  },
  {
    title: "Post As Much Jobs As You Want With Zero Fees",
    content:
      "Enjoy the benefits of blockchain technology without worrying about gas fees. Thanks to Sui Network's sponsored transactions, Fairlance covers the transaction fees for you, allowing you to post unlimited jobs and focus on what matters most - getting the work done.",
    image: "img/home/zero-fees.png",
  },
  {
    title: "Get Prizes on Achievements by Delivering Jobs",
    content:
      "Earn more than just payment for your work. With Fairlance, freelancers and clients receive airdrop rewards when they achieve certain milestones on the platform, making your freelancing journey both productive and rewarding.",
    image: "img/home/win-prizes.png",
  },
  {
    title: "Super Easy and Secure Login",
    content:
      "Log in quickly and securely with ZKlogin on the Sui Network. Fairlance uses zero-knowledge proof technology to ensure your login process is fast and secure, protecting your personal information while giving you instant access to your account.",
    image: "img/home/ease-login.png",
  },
];

const WhyChooseUs = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % reasons.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const handleItemClick = (index) => {
    setActiveIndex(index);
    setIsRunning(false);
  };

  return (
    <>
      <Text
        fontSize="4xl"
        fontWeight="bold"
        bgGradient="linear(to-r, purple.300, blue.500)"
        bgClip="text"
        textAlign="center"
        className="mb-8"
      >
        Why to Choose Us?
      </Text>
      <Box
        display={"flex"}
        direction="row"
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        {/* <Flex direction="row" gap={1} alignItems={"center"}> */}
        <Box minWidth={"50%"} pl={24}>
          <Flex direction="column" flex="1" minWidth="xl">
            {/* <Box mr={4}> */}
            {reasons.map((reason, index) => (
              <Button
                key={index}
                variant="outline"
                border={0}
                onClick={() => handleItemClick(index)}
                colorScheme={index === activeIndex ? "blue" : "purple"}
                mb={2}
                textAlign="left"
                fontSize={index === activeIndex ? 22 : 21}
                textColor={index === activeIndex ? "#3a82d0" : "#ffffff"}
                justifyContent="flex-start"
                fontWeight={index === activeIndex ? 900 : 600}
                sx={{
                  "&:hover": {
                    bg: "transparent",
                  },
                  "&:focus": {
                    bg: "transparent",
                  },
                }}
              >
                {reason.title}
              </Button>
            ))}
            {/* </Box> */}
          </Flex>
        </Box>

        <Box minWidth={"50%"}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Flex direction="row" flex="2" px={8} py={8} borderRadius="md">
                <Image
                  src={reasons[activeIndex].image}
                  alt={reasons[activeIndex].title}
                  borderRadius="md"
                  width={200}
                  height={200}
                />
                <Box mt={2} alignContent={"center"}>
                  <Text fontSize="2xl" fontWeight="bold" mb={4} color={"white"}>
                    {/* {reasons[activeIndex].title} */}
                  </Text>
                  <Text mb={4} color={"white"}>
                    {reasons[activeIndex].content}
                  </Text>
                </Box>
              </Flex>
            </motion.div>
          </AnimatePresence>
        </Box>
        {/* </Flex> */}
      </Box>
    </>
  );
};

export default WhyChooseUs;
