import { Box, Button, Container, Flex, Heading, Text, Card } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";
import { PlusIcon } from "@radix-ui/react-icons";
import { useVotingEvents } from "../hooks/useEvents";
import { useCurrentAccount } from "@mysten/dapp-kit";

export function Home() {
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const { data: votings, loading: isPending } = useVotingEvents();

  return (
    <Container size="3" py="6">
      <Flex direction="column" gap="6">
        <Box>
          <Heading size="8" mb="2">Voting Platform</Heading>
          <Text size="4" color="gray">
            Create polls and let the community vote
          </Text>
        </Box>

        <Card style={{ padding: "1rem" }}>
          <Flex direction="column" gap="4">
            <Heading size="5">Get Started</Heading>
            <Text>
              Create your first voting poll by clicking the button below.
              You can add a question, options, and set an end time.
            </Text>
            <Button size="3" onClick={() => navigate("/create")} disabled={!account}>
              <PlusIcon />
              Create New Poll
            </Button>
            {!account && (
              <Text size="2" color="gray">
                Please connect your wallet to create a poll
              </Text>
            )}
          </Flex>
        </Card>

        <Box>
          <Heading size="5" mb="4">
            Latest Polls {votings && `(${votings.length})`}
          </Heading>

          {isPending ? (
            <Text>Loading polls...</Text>
          ) : !votings || votings.length === 0 ? (
            <Card style={{ padding: "1rem" }}>
              <Text color="gray">No polls yet. Create one to get started!</Text>
            </Card>
          ) : (
            <Flex direction="column" gap="3">
              {votings.map((voting) => (
                <Card key={voting.voting_id} style={{ padding: "1rem" }}>
                  <Flex direction="column" gap="3">
                    <Flex justify="between" align="start">
                      <Flex direction="column" gap="1" style={{ flex: 1 }}>
                        <Heading size="4">{voting.question}</Heading>
                        <Text size="2" color="gray">
                          Created by {voting.creator.slice(0, 8)}...
                        </Text>
                      </Flex>
                    </Flex>

                    <Text size="2" color="gray">
                      {voting.options_count} options
                    </Text>

                    <Button
                      variant="soft"
                      onClick={() => navigate(`/poll/${voting.voting_id}`)}
                    >
                      View Details
                    </Button>
                  </Flex>
                </Card>
              ))}
            </Flex>
          )}
        </Box>
      </Flex>
    </Container>
  );
}