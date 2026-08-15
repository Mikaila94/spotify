import { Box } from "@chakra-ui/react";
import "./globals.css";
import { Provider } from "@/components/ui/provider";
import PlayerLayout from "@/components/PlayerLayout/PlayerLayout";
import Sidebar from "@/components/Sidebar/Sidebar";
import { MusicPlayerProvider } from "@/contexts/MusicPlayerContext";

const SIDEBAR_W = "250px";
const PLAYER_H = "88px"; // keep in sync with your PlayerLayout's actual height

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Provider>
          <MusicPlayerProvider>
            {/* Fixed Sidebar */}
            <Box
            as="aside"
            position="fixed"
            left={0}
            top={0}
            width={SIDEBAR_W}
            // Sidebar height excludes the player height to prevent overlap
            height={`calc(100vh - ${PLAYER_H})`}
            bg="gray.900"
            color="white"
            p={4}
            overflowY="auto"
          >
            <Sidebar />
          </Box>

          {/* Fixed Player (full width, bottom) */}
          <Box
            as="footer"
            position="fixed"
            left={0}
            right={0}
            bottom={0}
            height={PLAYER_H}
            bg="gray.900"
            borderTop="1px solid"
            borderColor="gray.700"
            // Optional: if PlayerLayout needs internal padding
            // p={3}
          >
            <PlayerLayout />
          </Box>

          {/* Scrollable Main Content */}
          <Box
            as="main"
            // Leave space for fixed sidebar and player
            ml={SIDEBAR_W}
            pb={PLAYER_H}
            height="100vh"
            overflowY="auto"
            bg="gray.800"
            color="white"
            p={4}
          >
            {children}
          </Box>
          </MusicPlayerProvider>
        </Provider>
      </body>
    </html>
  );
}
