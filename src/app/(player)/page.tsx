import { Box, Heading, Text } from "@chakra-ui/react";

export default function Home() {
  return (
    <Box>
      <Heading color="white" mb={4}>
        Good evening
      </Heading>
      <Text color="gray.400" mb={6}>
        Your music, your way
      </Text>

      <Box>
        <Heading size="md" color="white" mb={4}>
          Recently played
        </Heading>
        <Text color="gray.400">
          Your recently played tracks will appear here
        </Text>
      </Box>
    </Box>
  );
}
