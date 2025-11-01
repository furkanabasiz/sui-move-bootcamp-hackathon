import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConnectButton } from "@mysten/dapp-kit";
import { Box, Container, Flex, Heading, Button } from "@radix-ui/themes";
import { Toaster } from "sonner";
import { Home } from "./pages/Home";
import { CreatePoll } from "./pages/CreatePoll";
import { PollDetails } from "./pages/PollDetails";
import Admin from "./pages/Admin";

function App() {
  return (
    <>
      <Flex
        position="sticky"
        px="4"
        py="2"
        justify="between"
        align="center"
        style={{
          borderBottom: "1px solid var(--gray-a2)",
        }}
      >
        <Box>
          <Heading>Voting Platform</Heading>
        </Box>

        <Flex gap="3" align="center">
          <Button variant="ghost" onClick={() => window.location.href = "/admin"}>
            Admin
          </Button>
          <ConnectButton />
        </Flex>
      </Flex>
      <Container>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreatePoll />} />
            <Route path="/poll/:id" element={<PollDetails />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </BrowserRouter>
      </Container>
      <Toaster position="top-right" />
    </>
  );
}

export default App;