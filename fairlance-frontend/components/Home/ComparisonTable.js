import React from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Button,
  Image,
  Flex,
} from "@chakra-ui/react";
import { CheckIcon, LinkIcon } from "@chakra-ui/icons";

const ComparisonTable = () => {
  return (
    <Flex justifyContent={"center"} mb={32}>
      <Box
        position="relative"
        maxWidth="70%"
        _before={{
          content: '""',
          position: "absolute",
          top: "-4px",
          left: "-4px",
          right: "-4px",
          bottom: "-4px",
          borderRadius: "md",
          bgGradient: "linear(to-r, blue.500, purple.300)",
          zIndex: -1,
        }}
      >
        <Box
          p={8}
          border="2px"
          borderColor="transparent"
          borderRadius="md"
          overflow="hidden"
          boxShadow="lg"
          backgroundColor="#061e30"
        >
          <Text
            fontSize="4xl"
            fontWeight="bold"
            bgGradient="linear(to-r, purple.300, blue.500)"
            bgClip="text"
            textAlign="center"
            mb={8}
          >
            Compare Fairlance with Other Freelancing Platforms
          </Text>
          <br />
          <Table variant="simple" border={0}>
            <Thead>
              <Tr>
                <Th border={0}></Th>
                <Th
                  textAlign="center"
                  fontSize="lg"
                  textColor={"white"}
                  border={0}
                >
                  <Image src="/img/logo.svg" alt="N" width="300" height="200" />
                </Th>
                <Th
                  textAlign="center"
                  fontSize="lg"
                  textColor={"white"}
                  border={0}
                >
                  <Image
                    src="/img/home/freelancer.svg"
                    alt="N"
                    width="100"
                    height="100"
                  />
                </Th>
                <Th
                  textAlign="center"
                  fontSize="lg"
                  textColor={"white"}
                  border={0}
                >
                  <Image
                    src="/img/home/upwork.svg"
                    alt="N"
                    width="100"
                    height="100"
                  />
                </Th>
                <Th
                  textAlign="center"
                  fontSize="lg"
                  textColor={"white"}
                  border={0}
                >
                  <Image
                    src="/img/home/fiverr.svg"
                    alt="N"
                    width="100"
                    height="100"
                  />
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr backgroundColor={"#032a47"} border={0}>
                <Th borderStartRadius={50} border={0}>
                  Client Fee
                </Th>
                <Td
                  textAlign="center"
                  fontWeight="bold"
                  color="green.700"
                  textColor={"white"}
                  border={0}
                >
                  0
                </Td>
                <Td textAlign="center" textColor={"white"} border={0}>
                  3%
                </Td>
                <Td textAlign="center" textColor={"white"} border={0}>
                  3.5%
                </Td>
                <Td
                  textAlign="center"
                  textColor={"white"}
                  borderEndRadius={50}
                  border={0}
                >
                  20%
                </Td>
              </Tr>
              <Tr border={0}>
                <Th borderStartRadius={50} border={0}>
                  Freelancer Fee
                </Th>
                <Td
                  textAlign="center"
                  fontWeight="bold"
                  color="green.700"
                  textColor={"white"}
                  border={0}
                >
                  5%
                </Td>
                <Td textAlign="center" textColor={"white"} border={0}>
                  10%
                </Td>
                <Td textAlign="center" textColor={"white"} border={0}>
                  20%
                </Td>
                <Td
                  textAlign="center"
                  textColor={"white"}
                  borderEndRadius={50}
                  border={0}
                >
                  20%
                </Td>
              </Tr>
              <Tr backgroundColor={"#032a47"} border={0}>
                <Th borderStartRadius={50} border={0}>
                  Withdrawal Fee
                </Th>
                <Td
                  textAlign="center"
                  fontWeight="bold"
                  color="green.700"
                  textColor={"white"}
                  border={0}
                >
                  Crypto
                </Td>
                <Td textAlign="center" textColor={"white"} border={0}>
                  Min Payout $100
                </Td>
                <Td textAlign="center" textColor={"white"} border={0}>
                  Min Payout $100
                </Td>
                <Td
                  textAlign="center"
                  textColor={"white"}
                  borderEndRadius={50}
                  border={0}
                >
                  Min Payout $100
                </Td>
              </Tr>
              <Tr>
                <Th border={0}>Decentralized</Th>
                <Td
                  textAlign="center"
                  fontWeight="bold"
                  color="green.700"
                  textColor={"white"}
                  border={0}
                >
                  Yes
                </Td>
                <Td textAlign="center" textColor={"white"} border={0}>
                  No
                </Td>
                <Td textAlign="center" textColor={"white"} border={0}>
                  No
                </Td>
                <Td textAlign="center" textColor={"white"} border={0}>
                  No
                </Td>
              </Tr>
              <Tr backgroundColor={"#032a47"}>
                <Th border={0} borderStartRadius={50}>
                  Content Ownership
                </Th>
                <Td
                  textAlign="center"
                  fontWeight="bold"
                  color="green.700"
                  textColor={"white"}
                  border={0}
                >
                  Yes
                </Td>
                <Td textAlign="center" textColor={"white"} border={0}>
                  No
                </Td>
                <Td textAlign="center" textColor={"white"} border={0}>
                  No
                </Td>
                <Td
                  textAlign="center"
                  textColor={"white"}
                  border={0}
                  borderEndRadius={50}
                >
                  No
                </Td>
              </Tr>
              <Tr>
                <Th border={0}>Instant Withdrawals</Th>
                <Td
                  textAlign="center"
                  fontWeight="bold"
                  color="green.700"
                  textColor={"white"}
                  border={0}
                >
                  Yes
                </Td>
                <Td textAlign="center" textColor={"white"} border={0}>
                  No
                </Td>
                <Td textAlign="center" textColor={"white"} border={0}>
                  No
                </Td>
                <Td textAlign="center" textColor={"white"} border={0}>
                  No
                </Td>
              </Tr>
              <Tr backgroundColor={"#032a47"}>
                <Th border={0} borderStartRadius={50}>
                  Global Access
                </Th>
                <Td
                  textAlign="center"
                  fontWeight="bold"
                  color="green.700"
                  textColor={"white"}
                  border={0}
                >
                  World Wide
                </Td>
                <Td textAlign="center" textColor={"white"} border={0}>
                  Banned countries
                </Td>
                <Td textAlign="center" textColor={"white"} border={0}>
                  Banned countries
                </Td>
                <Td
                  textAlign="center"
                  textColor={"white"}
                  border={0}
                  borderEndRadius={50}
                >
                  Banned countries
                </Td>
              </Tr>
              <Tr>
                <Th border={0}>Prizes on Achivments</Th>
                <Td
                  textAlign="center"
                  fontWeight="bold"
                  color="green.700"
                  textColor={"white"}
                  border={0}
                >
                  Yes
                </Td>
                <Td textAlign="center" textColor={"white"} border={0}>
                  No
                </Td>
                <Td textAlign="center" textColor={"white"} border={0}>
                  No
                </Td>
                <Td textAlign="center" textColor={"white"} border={0}>
                  No
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>
      </Box>
    </Flex>
  );
};

export default ComparisonTable;
