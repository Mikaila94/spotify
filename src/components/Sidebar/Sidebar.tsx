import {
  VStack,
  Text,
  Separator,
  LinkBox,
  LinkOverlay,
  List,
  Box,
} from "@chakra-ui/react";
import {
  MdHome,
  MdSearch,
  MdLibraryMusic,
  MdPlaylistAdd,
  MdFavorite,
} from "react-icons/md";
import NextLink from "next/link";

const navMenu = [
  { name: "Home", icon: MdHome, route: "/" },
  { name: "Search", icon: MdSearch, route: "/search" },
  { name: "Your Library", icon: MdLibraryMusic, route: "/library" },
];

const musicMenu = [
  { name: "Create Playlist", icon: MdPlaylistAdd, route: "/" },
  { name: "Favorites", icon: MdFavorite, route: "/favorites" },
];

const playlists = new Array(30).fill(1).map((_, i) => `Playlist ${i + 1}`);

export default function Sidebar() {
  return (
    <VStack align="stretch" gap={0} color="white" h="100%">
      {/* Logo */}
      <LinkBox mb={6}>
        <LinkOverlay asChild>
          <NextLink href="/">
            <Text
              fontSize="xl"
              fontWeight="bold"
              cursor="pointer"
              _hover={{ color: "green.400" }}
              transition="color 0.2s"
            >
              Spotify
            </Text>
          </NextLink>
        </LinkOverlay>
      </LinkBox>

      {/* Main Navigation */}
      <nav>
        <List.Root mb={6} unstyled>
          {navMenu.map(({ name, icon: Icon, route }, index) => (
            <List.Item key={route} p="0">
              <LinkBox>
                <LinkOverlay
                  asChild
                  display="flex"
                  alignItems="center"
                  gap="3"
                  w="100%"
                  px="3"
                  py="3"
                  borderRadius="md"
                  color={index === 0 ? "white" : "gray.400"}
                  _hover={{ bg: "gray.800", color: "white" }}
                  fontWeight="medium"
                  transition="all 0.2s"
                >
                  <NextLink href={route}>
                    <>
                      <List.Indicator asChild color="inherit">
                        <Icon size={20} />
                      </List.Indicator>
                      {name}
                    </>
                  </NextLink>
                </LinkOverlay>
              </LinkBox>
            </List.Item>
          ))}
        </List.Root>
      </nav>

      <Separator borderColor="gray.700" mb={4} />

      {/* Music Menu */}
      <nav>
        <List.Root unstyled>
          {musicMenu.map(({ name, icon: Icon, route }) => (
            <List.Item key={route} p="0">
              <LinkBox>
                <LinkOverlay
                  asChild
                  display="flex"
                  alignItems="center"
                  gap="3"
                  w="100%"
                  px="3"
                  py="3"
                  borderRadius="md"
                  color="gray.400"
                  _hover={{ bg: "gray.800", color: "white" }}
                  fontWeight="medium"
                  fontSize="sm"
                  transition="all 0.2s"
                >
                  <NextLink href={route}>
                    <>
                      <List.Indicator asChild color="inherit">
                        <Icon size={18} />
                      </List.Indicator>
                      {name}
                    </>
                  </NextLink>
                </LinkOverlay>
              </LinkBox>
            </List.Item>
          ))}
        </List.Root>
      </nav>

      <Separator borderColor="gray.700" mb={4} />

      <Box height="66%" overflowY="auto">
        <List.Root>
          {playlists.map((playlist, index) => (
            <List.Item key={playlist + index}>{playlist}</List.Item>
          ))}
        </List.Root>
      </Box>
    </VStack>
  );
}
