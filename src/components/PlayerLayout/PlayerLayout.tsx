import { Box, Flex, Button, Text, Stack } from "@chakra-ui/react";
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaVolumeUp } from "react-icons/fa";

export default function PlayerLayout(){
    return (
        <Box p={4} h="80px">
            <Flex align="center" justify="space-between" h="100%">
                {/* Left section - Currently playing */}
                <Flex align="center" w="300px">
                    <Box w="48px" h="48px" bg="gray.600" borderRadius="md" mr={3}>
                        {/* Album art placeholder */}
                    </Box>
                    <Box>
                        <Text color="white" fontSize="sm" fontWeight="medium">
                            Song Title
                        </Text>
                        <Text color="gray.400" fontSize="xs">
                            Artist Name
                        </Text>
                    </Box>
                </Flex>

                {/* Center section - Player controls */}
                <Flex direction="column" align="center" flex="1" maxW="600px">
                    <Stack direction="row" gap={4} mb={2}>
                        <Button
                            aria-label="Previous"
                            variant="ghost"
                            color="gray.400"
                            size="sm"
                            _hover={{ color: "white" }}
                            minW="auto"
                            p={2}
                        >
                            <FaStepBackward />
                        </Button>
                        <Button
                            aria-label="Play/Pause"
                            variant="solid"
                            colorScheme="green"
                            borderRadius="full"
                            size="md"
                            minW="auto"
                            p={3}
                        >
                            <FaPlay />
                        </Button>
                        <Button
                            aria-label="Next"
                            variant="ghost"
                            color="gray.400"
                            size="sm"
                            _hover={{ color: "white" }}
                            minW="auto"
                            p={2}
                        >
                            <FaStepForward />
                        </Button>
                    </Stack>
                    <Stack direction="row" gap={3} w="100%" align="center">
                        <Text color="gray.400" fontSize="xs">0:00</Text>
                        <Box flex="1" h="4px" bg="gray.600" borderRadius="full" position="relative">
                            <Box w="30%" h="100%" bg="green.500" borderRadius="full" />
                        </Box>
                        <Text color="gray.400" fontSize="xs">3:45</Text>
                    </Stack>
                </Flex>

                {/* Right section - Volume */}
                <Flex align="center" w="200px" justify="flex-end">
                    <Stack direction="row" gap={2} align="center">
                        <FaVolumeUp color="gray.400" size="14px" />
                        <Box w="100px" h="4px" bg="gray.600" borderRadius="full" position="relative">
                            <Box w="70%" h="100%" bg="green.500" borderRadius="full" />
                        </Box>
                    </Stack>
                </Flex>
            </Flex>
        </Box>
    );
}