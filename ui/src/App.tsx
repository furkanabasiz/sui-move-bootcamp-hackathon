import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConnectButton } from "@mysten/dapp-kit";
import { Box, Container, Flex, Heading } from "@radix-ui/themes";
import { Toaster } from "sonner";
import { Home } from "./pages/Home";
import { CreatePoll } from "./pages/CreatePoll";
import { PollDetails } from "./pages/PollDetails";

function App() {
  return (
    <>
      <Flex
        position="sticky"
        px="4"
        py="2"
        justify="between"
        style={{
          borderBottom: "1px solid var(--gray-a2)",
        }}
      >
        <Box>
          <Heading>Voting Platform</Heading>
        </Box>

        <Box>
          <ConnectButton />
        </Box>
      </Flex>
      <Container>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreatePoll />} />
            <Route path="/poll/:id" element={<PollDetails />} />
          </Routes>
        </BrowserRouter>
      </Container>
      <Toaster position="top-right" />
    </>
  );
}

export default App;