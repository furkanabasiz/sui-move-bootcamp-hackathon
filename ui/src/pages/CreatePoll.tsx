import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import {
  Box,
  Button,
  Card,
  Container,
  Flex,
  Heading,
  Text,
  TextField,
  TextArea,
} from "@radix-ui/themes";
import { PACKAGE_ID, PLATFORM_CONFIG_ID } from "../constants";
import { createVoting } from "../utility/voting/createVoting.ptb";
import { toast } from "sonner";

export function CreatePoll() {
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } = useSignAndExecuteTransaction();

  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [options, setOptions] = useState(["", ""]);

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!account) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!question.trim()) {
      toast.error("Question is required");
      return;
    }

    const validOptions = options.filter((opt) => opt.trim());
    if (validOptions.length < 2) {
      toast.error("At least 2 options are required");
      return;
    }

    try {
      const tx = createVoting(
        PACKAGE_ID,
        PLATFORM_CONFIG_ID,
        question,
        description.trim() || null,
        imageUrl.trim() || null,
        validOptions,
        null // endTime - null means no expiry
      );

      const result = await signAndExecute({ transaction: tx });
      toast.success("Poll created successfully!");
      console.log("Transaction result:", result);
      navigate("/");
    } catch (error: any) {
      console.error("Error creating poll:", error);
      toast.error(`Failed to create poll: ${error.message || "Unknown error"}`);
    }
  };

  return (
    <Container size="3" py="6">
      <Flex direction="column" gap="6">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeftIcon />
          Back to Home
        </Button>

        <Heading size="8">Create New Poll</Heading>

        <form onSubmit={handleSubmit}>
          <Card p="6">
            <Flex direction="column" gap="4">
              <Box>
                <Text as="label" size="2" weight="bold" mb="2">
                  Question *
                </Text>
                <TextField.Root
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g., What is your favorite programming language?"
                  required
                />
              </Box>

              <Box>
                <Text as="label" size="2" weight="bold" mb="2">
                  Description
                </Text>
                <TextArea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description of your poll..."
                  rows={4}
                />
              </Box>

              <Box>
                <Text as="label" size="2" weight="bold" mb="2">
                  Image URL
                </Text>
                <TextField.Root
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Optional image URL..."
                />
              </Box>

              <Box>
                <Flex justify="between" align="center" mb="2">
                  <Text as="label" size="2" weight="bold">
                    Options *
                  </Text>
                  <Button type="button" size="1" onClick={handleAddOption}>
                    Add Option
                  </Button>
                </Flex>
                {options.map((option, index) => (
                  <TextField.Root
                    key={index}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    mb="2"
                  />
                ))}
              </Box>

              <Button type="submit" size="3" disabled={isPending || !account}>
                {isPending ? "Creating..." : "Create Poll"}
              </Button>
            </Flex>
          </Card>
        </form>
      </Flex>
    </Container>
  );
}
