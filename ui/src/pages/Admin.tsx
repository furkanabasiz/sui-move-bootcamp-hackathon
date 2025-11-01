import { useState } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClientQuery } from "@mysten/dapp-kit";
import { Button, Card, Container, Flex, Heading, Text, TextField, Badge } from "@radix-ui/themes";
import { PACKAGE_ID, PLATFORM_CONFIG_ID } from "../constants";
import { pausePlatform, unpausePlatform, updatePlatformFee, transferAdmin } from "../utility/admin";
import { toast } from "sonner";

interface PlatformConfig {
  admin: string;
  platform_fee: string;
  paused: boolean;
}

function Admin() {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const [newFee, setNewFee] = useState("");
  const [newAdmin, setNewAdmin] = useState("");

  const { data: configData } = useSuiClientQuery(
    "getObject",
    {
      id: PLATFORM_CONFIG_ID,
      options: {
        showContent: true,
      },
    },
    {
      enabled: true,
    }
  );

  const config: PlatformConfig | null = configData?.data?.content
    ? parseConfigObject(configData.data.content)
    : null;

  const isAdmin = config?.admin === account?.address;

  const handlePause = async () => {
    if (!account || !isAdmin) {
      toast.error("Only admin can pause the platform");
      return;
    }

    try {
      const adminCapId = await getAdminCapId();
      if (!adminCapId) {
        toast.error("Admin capability not found");
        return;
      }

      const tx = pausePlatform(PACKAGE_ID, adminCapId, PLATFORM_CONFIG_ID);
      await signAndExecute({ transaction: tx });
      toast.success("Platform paused successfully!");
    } catch (error: any) {
      console.error("Error pausing platform:", error);
      toast.error(`Failed to pause platform: ${error.message || "Unknown error"}`);
    }
  };

  const handleUnpause = async () => {
    if (!account || !isAdmin) {
      toast.error("Only admin can unpause the platform");
      return;
    }

    try {
      const adminCapId = await getAdminCapId();
      if (!adminCapId) {
        toast.error("Admin capability not found");
        return;
      }

      const tx = unpausePlatform(PACKAGE_ID, adminCapId, PLATFORM_CONFIG_ID);
      await signAndExecute({ transaction: tx });
      toast.success("Platform unpaused successfully!");
    } catch (error: any) {
      console.error("Error unpausing platform:", error);
      toast.error(`Failed to unpause platform: ${error.message || "Unknown error"}`);
    }
  };

  const handleUpdateFee = async () => {
    if (!account || !isAdmin) {
      toast.error("Only admin can update platform fee");
      return;
    }

    const fee = parseInt(newFee);
    if (isNaN(fee) || fee < 0 || fee > 1000) {
      toast.error("Fee must be between 0 and 1000 basis points");
      return;
    }

    try {
      const adminCapId = await getAdminCapId();
      if (!adminCapId) {
        toast.error("Admin capability not found");
        return;
      }

      const tx = updatePlatformFee(PACKAGE_ID, adminCapId, PLATFORM_CONFIG_ID, fee);
      await signAndExecute({ transaction: tx });
      toast.success("Platform fee updated successfully!");
      setNewFee("");
    } catch (error: any) {
      console.error("Error updating fee:", error);
      toast.error(`Failed to update fee: ${error.message || "Unknown error"}`);
    }
  };

  const handleTransferAdmin = async () => {
    if (!account || !isAdmin || !newAdmin) {
      toast.error("Only admin can transfer admin role");
      return;
    }

    if (!window.confirm("Are you sure you want to transfer admin role?")) {
      return;
    }

    try {
      const adminCapId = await getAdminCapId();
      if (!adminCapId) {
        toast.error("Admin capability not found");
        return;
      }

      const tx = transferAdmin(PACKAGE_ID, adminCapId, PLATFORM_CONFIG_ID, newAdmin);
      await signAndExecute({ transaction: tx });
      toast.success("Admin role transferred successfully!");
      setNewAdmin("");
    } catch (error: any) {
      console.error("Error transferring admin:", error);
      toast.error(`Failed to transfer admin: ${error.message || "Unknown error"}`);
    }
  };

  if (!isAdmin) {
    return (
      <Container size="3" py="6">
        <Card style={{ padding: "1.5rem" }}>
          <Heading size="6" mb="4">Admin Panel</Heading>
          <Text>Only the platform admin can access this page.</Text>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="3" py="6">
      <Heading size="8" mb="6">Admin Panel</Heading>

      <Flex direction="column" gap="6">
        <Card style={{ padding: "1.5rem" }}>
          <Heading size="5" mb="4">Platform Status</Heading>
          <Flex direction="column" gap="3">
            <Flex justify="between" align="center">
              <Text>Platform Status:</Text>
              <Badge color={config?.paused ? "red" : "green"} variant="soft">
                {config?.paused ? "Paused" : "Active"}
              </Badge>
            </Flex>
            <Flex justify="between" align="center">
              <Text>Platform Fee:</Text>
              <Text weight="bold">{config?.platform_fee} basis points</Text>
            </Flex>
            <Flex justify="between" align="center">
              <Text>Admin Address:</Text>
              <Text size="2" color="gray">{config?.admin}</Text>
            </Flex>
          </Flex>
        </Card>

        <Card style={{ padding: "1.5rem" }}>
          <Heading size="5" mb="4">Platform Control</Heading>
          <Flex direction="column" gap="3">
            {config?.paused ? (
              <Button onClick={handleUnpause} disabled={isPending}>
                Unpause Platform
              </Button>
            ) : (
              <Button onClick={handlePause} disabled={isPending} color="red">
                Pause Platform
              </Button>
            )}
          </Flex>
        </Card>

        <Card style={{ padding: "1.5rem" }}>
          <Heading size="5" mb="4">Update Platform Fee</Heading>
          <Flex direction="column" gap="3">
            <TextField.Root
              value={newFee}
              onChange={(e) => setNewFee(e.target.value)}
              placeholder="Fee in basis points (0-1000)"
              type="number"
            />
            <Button onClick={handleUpdateFee} disabled={isPending || !newFee}>
              Update Fee
            </Button>
            <Text size="2" color="gray">
              Current fee: {config?.platform_fee} basis points (1 basis point = 0.01%)
            </Text>
          </Flex>
        </Card>

        <Card style={{ padding: "1.5rem" }}>
          <Heading size="5" mb="4">Transfer Admin Role</Heading>
          <Flex direction="column" gap="3">
            <TextField.Root
              value={newAdmin}
              onChange={(e) => setNewAdmin(e.target.value)}
              placeholder="New admin address"
            />
            <Button onClick={handleTransferAdmin} disabled={isPending || !newAdmin}>
              Transfer Admin
            </Button>
            <Text size="2" color="red">
              Warning: This will permanently transfer admin rights to another address.
            </Text>
          </Flex>
        </Card>
      </Flex>
    </Container>
  );
}

function parseConfigObject(content: any): PlatformConfig | null {
  try {
    if (content.dataType !== "moveObject") {
      return null;
    }

    const fields = content.fields;

    return {
      admin: fields.admin || "",
      platform_fee: fields.platform_fee || "0",
      paused: fields.paused || false,
    };
  } catch (error) {
    console.error("Error parsing config object:", error);
    return null;
  }
}

async function getAdminCapId(): Promise<string | null> {
  // TODO: Implement logic to find admin cap ID
  // This should query the blockchain for AdminCap owned by the current account
  return null;
}

export default Admin;
