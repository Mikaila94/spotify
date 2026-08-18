"use client";

import {
  Box,
  Button,
  Field,
  Heading,
  Input,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

type ErrorResponse = {
  error?: string;
};

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | ErrorResponse
          | null;
        throw new Error(data?.error ?? "Unable to sign in");
      }

      router.replace("/");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to sign in",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Box
      minH="calc(100vh - 120px)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
    >
      <Box
        w="full"
        maxW="440px"
        bg="gray.900"
        borderWidth="1px"
        borderColor="gray.700"
        borderRadius="xl"
        p={{ base: 6, md: 8 }}
        boxShadow="xl"
      >
        <form onSubmit={handleSubmit}>
          <Stack gap={6}>
            <Box>
              <Heading size="2xl" mb={2}>
                Welcome back
              </Heading>
              <Text color="gray.400">Sign in to continue to your music.</Text>
            </Box>

            {error && (
              <Box
                role="alert"
                aria-live="polite"
                bg="red.950"
                borderWidth="1px"
                borderColor="red.800"
                borderRadius="md"
                px={4}
                py={3}
                color="red.200"
              >
                {error}
              </Box>
            )}

            <Field.Root required>
              <Field.Label>
                Email
                <Field.RequiredIndicator />
              </Field.Label>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
                disabled={isSubmitting}
              />
            </Field.Root>

            <Field.Root required>
              <Field.Label>
                Password
                <Field.RequiredIndicator />
              </Field.Label>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="Enter your password"
                disabled={isSubmitting}
              />
            </Field.Root>

            <Button
              type="submit"
              colorPalette="green"
              size="lg"
              loading={isSubmitting}
              loadingText="Signing in"
            >
              Sign in
            </Button>

            <Text color="gray.400" textAlign="center">
              New to Spotify?{" "}
              <Link asChild color="green.300" fontWeight="semibold">
                <NextLink href="/sign-up">Create an account</NextLink>
              </Link>
            </Text>
          </Stack>
        </form>
      </Box>
    </Box>
  );
}
