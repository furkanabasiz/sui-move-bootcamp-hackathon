import { useParams, useNavigate } from "react-router-dom";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { ArrowLeftIcon, TrashIcon, LockClosedIcon } from "@radix-ui/react-icons";
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
import { PACKAGE_ID, PLATFORM_CONFIG_ID } from "../constants";
import { vote, deleteVoting, closeVoting } from "../utility/voting";
import { useVotingData } from "../hooks/useVotingData";
import { toast } from "sonner";

export function PollDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } = useSignAndExecuteTransaction();
  
  const { data: pollData, isPending: isLoadingData } = useVotingData(id || "");

  const handleVote = async (optionIndex: number) => {
    if (!account || !id) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      const tx = vote(PACKAGE_ID, PLATFORM_CONFIG_ID, id, optionIndex);
      const result = await signAndExecute({ transaction: tx });
      toast.success("Vote cast successfully!");
      console.log("Transaction result:", result);
    } catch (error: any) {
      console.error("Error casting vote:", error);
      toast.error(`Failed to cast vote: ${error.message || "Unknown error"}`);
    }
  };

  const handleClose = async () => {
    if (!account || !id || !window.confirm("Are you sure you want to close this poll?")) {
      return;
    }

    try {
      const tx = closeVoting(PACKAGE_ID, id);
      await signAndExecute({ transaction: tx });
      toast.success("Poll closed successfully!");
    } catch (error: any) {
      console.error("Error closing poll:", error);
      toast.error(`Failed to close poll: ${error.message || "Unknown error"}`);
    }
  };

  const handleDelete = async () => {
    if (!account || !id || !window.confirm("Are you sure you want to delete this poll?")) {
      return;
    }

    try {
      const tx = deleteVoting(PACKAGE_ID, id);
      await signAndExecute({ transaction: tx });
      toast.success("Poll deleted successfully!");
      navigate("/");
    } catch (error: any) {
      console.error("Error deleting poll:", error);
      toast.error(`Failed to delete poll: ${error.message || "Unknown error"}`);
    }
  };

  if (isLoadingData) {
    return (
      <Container size="3" py="6">
        <Text>Loading poll...</Text>
      </Container>
    );
  }

  if (!pollData) {
    return (
      <Container size="3" py="6">
        <Text>Poll not found</Text>
      </Container>
    );
  }

  const maxVotes = Math.max(...pollData.vote_counts, 1);
  const isCreator = pollData.creator === account?.address;

  return (
    <Container size="3" py="6">
      <Flex direction="column" gap="6">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeftIcon />
          Back to Home
        </Button>

        <Card style={{ padding: "1.5rem" }}>
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
              <Badge color={pollData.is_closed ? "red" : "green"} variant="soft">
                {pollData.is_closed ? "Closed" : "Active"}
              </Badge>
            </Flex>

            {pollData.image_url && (
              <Box>
                <img
                  src={pollData.image_url}
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
                Total Votes: {pollData.total_votes}
              </Text>

              {pollData.options.map((option, index) => {
                const votes = pollData.vote_counts[index] || 0;
                const percentage = maxVotes > 0 ? (votes / maxVotes) * 100 : 0;
                const votePercentage =
                  pollData.total_votes > 0 ? (votes / pollData.total_votes) * 100 : 0;

                return (
                  <Card key={index} mb="3" style={{ padding: "0.75rem" }}>
                    <Flex direction="column" gap="2">
                      <Flex justify="between" align="center">
                        <Text weight="bold">{option}</Text>
                        <Text size="2" color="gray">
                          {votes} votes ({votePercentage.toFixed(1)}%)
                        </Text>
                      </Flex>
                      <Progress value={percentage} />
                      {!pollData.is_closed && (
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

            {isCreator && (
              <Flex gap="2" mt="2">
                {!pollData.is_closed && (
                  <Button
                    variant="soft"
                    color="orange"
                    onClick={handleClose}
                    disabled={isPending}
                  >
                    <LockClosedIcon />
                    Close Poll
                  </Button>
                )}
                {pollData.is_closed && (
                  <Button
                    variant="soft"
                    color="red"
                    onClick={handleDelete}
                    disabled={isPending}
                  >
                    <TrashIcon />
                    Delete Poll
                  </Button>
                )}
              </Flex>
            )}
          </Flex>
        </Card>
      </Flex>
    </Container>
  );
}