import { Box } from "@chakra-ui/react";
import { redirect } from "next/navigation";
import PlayerLayout from "@/components/PlayerLayout/PlayerLayout";
import Sidebar from "@/components/Sidebar/Sidebar";
import { MusicPlayerProvider } from "@/contexts/MusicPlayerContext";
import { getSession } from "@/features/auth/session";

const SIDEBAR_WIDTH = "250px";
const PLAYER_HEIGHT = "88px";

export default async function PlayerShellLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <MusicPlayerProvider>
      <Box
        as="aside"
        position="fixed"
        left={0}
        top={0}
        width={SIDEBAR_WIDTH}
        height={`calc(100vh - ${PLAYER_HEIGHT})`}
        bg="gray.900"
        color="white"
        p={4}
        overflowY="auto"
      >
        <Sidebar />
      </Box>

      <Box
        as="footer"
        position="fixed"
        left={0}
        right={0}
        bottom={0}
        height={PLAYER_HEIGHT}
        bg="gray.900"
        borderTop="1px solid"
        borderColor="gray.700"
      >
        <PlayerLayout />
      </Box>

      <Box
        as="main"
        ml={SIDEBAR_WIDTH}
        pb={PLAYER_HEIGHT}
        height="100vh"
        overflowY="auto"
        bg="gray.800"
        color="white"
        p={4}
      >
        {children}
      </Box>
    </MusicPlayerProvider>
  );
}
