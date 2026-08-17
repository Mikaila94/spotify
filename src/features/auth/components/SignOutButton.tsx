"use client";

import { Button, Text, VStack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MdLogout } from "react-icons/md";

export default function SignOutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut() {
    setError(null);
    setIsSigningOut(true);

    try {
      const response = await fetch("/api/signout", {
        method: "POST",
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error("Unable to sign out");
      }

      router.replace("/sign-in");
      router.refresh();
    } catch {
      setError("Unable to sign out. Please try again.");
      setIsSigningOut(false);
    }
  }

  return (
    <VStack align="stretch" gap={2}>
      <Button
        variant="ghost"
        color="gray.400"
        justifyContent="flex-start"
        px={3}
        loading={isSigningOut}
        loadingText="Signing out"
        onClick={handleSignOut}
        _hover={{ bg: "gray.800", color: "white" }}
      >
        <MdLogout />
        Sign out
      </Button>
      {error && (
        <Text role="alert" color="red.300" fontSize="xs" px={3}>
          {error}
        </Text>
      )}
    </VStack>
  );
}
