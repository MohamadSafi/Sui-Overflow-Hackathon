import React, { useRef } from "react";
import { Box, Text, Image, Button } from "@chakra-ui/react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";

const ROTATION_RANGE = 32.5;
const HALF_ROTATION_RANGE = 32.5 / 2;

const JobCard = ({ job }) => {
  const ref = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x);
  const ySpring = useSpring(y);

  const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`;

  const handleMouseMove = (e) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    const mouseX = (e.clientX - rect.left) * ROTATION_RANGE;
    const mouseY = (e.clientY - rect.top) * ROTATION_RANGE;

    const rX = (mouseY / height - HALF_ROTATION_RANGE) * -1;
    const rY = mouseX / width - HALF_ROTATION_RANGE;

    x.set(rX);
    y.set(rY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        transform,
        width: "330px",
        height: "100%",
      }}
      className="relative rounded-xl bg-gradient-to-br from-blue-500 to-purple-300"
    >
      <Box
        style={{
          transform: "translateZ(75px)",
          transformStyle: "preserve-3d",
        }}
        className="absolute inset-4 grid rounded-xl bg-white shadow-lg"
        width="90%"
        height="100%"
      >
        <Image
          src={job.image}
          alt={job.title}
          borderRadius="md"
          mb={2}
          width="100%"
          height="180px"
          objectFit="cover"
          borderBottomRadius={0}
        />
        <Box px={4}>
          <Text fontSize="xl" fontWeight="bold" mb={2}>
            {job.title}
          </Text>
          <Text fontSize="sm" color="gray.500" mb={2}>
            {job.category}
          </Text>
          <Text fontSize="lg" fontWeight="semibold" mb={2}>
            {job.price}
          </Text>
          <Text fontSize="sm" color="gray.700" mb={4} isTruncated noOfLines={3}>
            {job.description}
          </Text>
          <Button
            colorScheme="teal"
            size="sm"
            bg={"#3a82d0"}
            sx={{
              "&:hover": {
                bg: "blue",
              },
              "&:focus": {
                bg: "blue",
              },
            }}
          >
            Apply Now
          </Button>
        </Box>
      </Box>
    </motion.div>
  );
};

export default JobCard;
