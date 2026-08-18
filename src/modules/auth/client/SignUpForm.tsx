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

export function SignUpForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | ErrorResponse
          | null;
        throw new Error(data?.error ?? "Unable to create account");
      }

      router.replace("/");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to create account",
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
        maxW="520px"
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
                Create your account
              </Heading>
              <Text color="gray.400">
                Register to start building your personal music library.
              </Text>
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

            <Stack direction={{ base: "column", md: "row" }} gap={4}>
              <Field.Root required flex={1}>
                <Field.Label>
                  First name
                  <Field.RequiredIndicator />
                </Field.Label>
                <Input
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  autoComplete="given-name"
                  disabled={isSubmitting}
                />
              </Field.Root>

              <Field.Root required flex={1}>
                <Field.Label>
                  Last name
                  <Field.RequiredIndicator />
                </Field.Label>
                <Input
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  autoComplete="family-name"
                  disabled={isSubmitting}
                />
              </Field.Root>
            </Stack>

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
                autoComplete="new-password"
                minLength={8}
                placeholder="At least 8 characters"
                disabled={isSubmitting}
              />
              <Field.HelperText>Use at least 8 characters.</Field.HelperText>
            </Field.Root>

            <Button
              type="submit"
              colorPalette="green"
              size="lg"
              loading={isSubmitting}
              loadingText="Creating account"
            >
              Create account
            </Button>

            <Text color="gray.400" textAlign="center">
              Already have an account?{" "}
              <Link asChild color="green.300" fontWeight="semibold">
                <NextLink href="/sign-in">Sign in</NextLink>
              </Link>
            </Text>
          </Stack>
        </form>
      </Box>
    </Box>
  );
}
