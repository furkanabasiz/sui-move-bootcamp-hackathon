import { useParams, useNavigate } from "react-router-dom";
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClientQuery } from "@mysten/dapp-kit";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import {
  Box,
  Button,
  Card,
  Container,
  Flex,
  Heading,
  Text,
  Progress,
  Badge,
} from "@radix-ui/themes";
import { PACKAGE_ID } from "../constants";
import { vote } from "../utility/voting/vote.ptb";
import { toast } from "sonner";

interface PollData {
  question: string;
  description: string | null;
  imageUrl: string | null;
  options: string[];
  voteCounts: number[];
  totalVotes: number;
  isClosed: boolean;
  creator: string;
}

export function PollDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } = useSignAndExecuteTransaction();

  // TODO: Fetch actual poll data using the voting ID
  const pollData: PollData | null = null; // This should be fetched from the blockchain

  const handleVote = async (optionIndex: number) => {
    if (!account || !id) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      const tx = vote(PACKAGE_ID, "", id, optionIndex);

      const result = await signAndExecute({ transaction: tx });
      toast.success("Vote cast successfully!");
      console.log("Transaction result:", result);
    } catch (error: any) {
      console.error("Error casting vote:", error);
      toast.error(`Failed to cast vote: ${error.message || "Unknown error"}`);
    }
  };

  if (!pollData) {
    return (
      <Container size="3" py="6">
        <Text>Poll not found or loading...</Text>
      </Container>
    );
  }

  const maxVotes = Math.max(...pollData.voteCounts, 1);

  return (
    <Container size="3" py="6">
      <Flex direction="column" gap="6">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeftIcon />
          Back to Home
        </Button>

        <Card p="6">
          <Flex direction="column" gap="4">
            <Flex justify="between" align="start">
              <Box>
                <Heading size="7">{pollData.question}</Heading>
                {pollData.description && (
                  <Text color="gray" mt="2">
                    {pollData.description}
                  </Text>
                )}
              </Box>
              <Badge color={pollData.isClosed ? "red" : "green"} variant="soft">
                {pollData.isClosed ? "Closed" : "Active"}
              </Badge>
            </Flex>

            {pollData.imageUrl && (
              <Box>
                <img
                  src={pollData.imageUrl}
                  alt={pollData.question}
                  style={{
                    maxWidth: "100%",
                    borderRadius: "8px",
                    marginTop: "1rem",
                  }}
                />
              </Box>
            )}

            <Box mt="4">
              <Text size="3" weight="bold" mb="4">
                Total Votes: {pollData.totalVotes}
              </Text>

              {pollData.options.map((option, index) => {
                const votes = pollData.voteCounts[index] || 0;
                const percentage = maxVotes > 0 ? (votes / maxVotes) * 100 : 0;
                const votePercentage =
                  pollData.totalVotes > 0 ? (votes / pollData.totalVotes) * 100 : 0;

                return (
                  <Card key={index} mb="3" p="3">
                    <Flex direction="column" gap="2">
                      <Flex justify="between" align="center">
                        <Text weight="bold">{option}</Text>
                        <Text size="2" color="gray">
                          {votes} votes ({votePercentage.toFixed(1)}%)
                        </Text>
                      </Flex>
                      <Progress value={percentage} />
                      {!pollData.isClosed && (
                        <Button
                          size="2"
                          onClick={() => handleVote(index)}
                          disabled={isPending || !account}
                        >
                          Vote
                        </Button>
                      )}
                    </Flex>
                  </Card>
                );
              })}
            </Box>
          </Flex>
        </Card>
      </Flex>
    </Container>
  );
}
