import { useMemo, useState } from "react";
import { Button, Flex, VStack } from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { SessionWalletInterface, useSessionWallet } from "@magicblock-labs/gum-react-sdk";
import { useSessionState } from "@/contexts/SessionStateProvider";
import { usePlayerState } from "@/contexts/PlayerStateProvider";
import { getTwentyOneProgram, TWENTY_ONE_PROGRAM_ID, txOpts, useAnchorProvider } from "@/Utils/anchor";
import * as anchor from "@coral-xyz/anchor";
import { Transaction } from "@solana/web3.js";
import toast from "react-hot-toast";

const SessionKeyButton = () => {
  const { publicKey } = useWallet();
  const { playerState } = usePlayerState();
  const { sessionState } = useSessionState();
  const sessionWallet = useSessionWallet();
  const provider = useAnchorProvider();
  const myProgram = useMemo(() => getTwentyOneProgram(provider), [provider]);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateSession = async () => {
    setIsLoading(true);
    const topUp = true;
    const expiryInMinutes = 1000;
    // Convert SOL to lamports
    const amountLamports = 1 * anchor.web3.LAMPORTS_PER_SOL;
    let session: SessionWalletInterface | undefined;
    
    try {
      session = await sessionWallet.createSession(
        TWENTY_ONE_PROGRAM_ID,
        topUp,
        expiryInMinutes
      );
      console.log("Session created:", session);
      console.log("Session Wallet", session!.publicKey);
    } catch (error) {
      console.error("Failed to create session:", error);
    } finally {
      setIsLoading(false);
    }

    try {
      // Create SOL transfer instruction
      const transferRandomnessIx = anchor.web3.SystemProgram.transfer({
        fromPubkey: publicKey!,
        toPubkey: session!.publicKey!,
        lamports: amountLamports,
      });

      const transaction = new Transaction().add(transferRandomnessIx);
      
      const txid = await myProgram.provider.sendAndConfirm!(transaction, [], txOpts);

      console.log("Transfer to session transaction Signature:", txid);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Transfer to session transaction failed");
    } finally {
      setIsLoading(false);
    }
    
  };

  const handleRevokeSession = async () => {
    setIsLoading(true);
    try {
      await sessionWallet.revokeSession();
      console.log("Session revoked");
    } catch (error) {
      console.error("Failed to revoke session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex justify="center" align="center" direction="column" width="100%">
      <VStack spacing={4} align="center">
        {publicKey && playerState && (
          <Button
            onClick={
              sessionWallet && sessionWallet.sessionToken == null
                ? handleCreateSession
                : handleRevokeSession
            }
            isLoading={isLoading}
            disabled={isLoading} // Disable button while loading
            colorScheme={isLoading ? "gray" : "blue"} // Adjust color scheme dynamically
            p={6}
            fontSize="md"
            border="3px solid"
            borderColor="black"
            width="150px"
            
          >
            {sessionWallet && sessionWallet.sessionToken == null
              ? "Create Session"
              : "Revoke Session"}
          </Button>
        )}
      </VStack>
    </Flex>
  );
}
export default SessionKeyButton;
