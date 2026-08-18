"use client";

import {
  LinkBox,
  LinkOverlay,
  List,
  Separator,
  Text,
  VStack,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { MdHome, MdMusicNote } from "react-icons/md";
import { SignOutButton } from "@/modules/auth/client";

const navMenu = [
  { name: "Home", icon: MdHome, route: "/" },
  { name: "Songs", icon: MdMusicNote, route: "/songs" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <VStack align="stretch" gap={0} color="white" h="100%">
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

      <nav>
        <List.Root mb={6} unstyled>
          {navMenu.map(({ name, icon: Icon, route }) => (
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
                  color={pathname === route ? "white" : "gray.400"}
                  bg={pathname === route ? "gray.800" : "transparent"}
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

      <Separator borderColor="gray.700" mt="auto" mb={4} />
      <SignOutButton />
    </VStack>
  );
}
