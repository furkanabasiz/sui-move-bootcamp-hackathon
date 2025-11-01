import { Box, Button, Container, Flex, Heading, Text, Card } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";
import { PlusIcon } from "@radix-ui/react-icons";

export function Home() {
  const navigate = useNavigate();

  return (
    <Container size="3" py="6">
      <Flex direction="column" gap="6">
        <Box>
          <Heading size="8" mb="2">Voting Platform</Heading>
          <Text size="4" color="gray">
            Create polls and let the community vote
          </Text>
        </Box>

        <Card p="4">
          <Flex direction="column" gap="4">
            <Heading size="5">Get Started</Heading>
            <Text>
              Create your first voting poll by clicking the button below.
              You can add a question, options, and set an end time.
            </Text>
            <Button size="3" onClick={() => navigate("/create")}>
              <PlusIcon />
              Create New Poll
            </Button>
          </Flex>
        </Card>

        <Box>
          <Heading size="5" mb="4">Latest Polls</Heading>
          <Text color="gray">No polls yet. Create one to get started!</Text>
        </Box>
      </Flex>
    </Container>
  );
}
