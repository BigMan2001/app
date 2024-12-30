"use client";

import { getTwentyOneProgram, getTwentyOneProgramId } from "@/Utils/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Cluster, PublicKey, SystemProgram } from "@solana/web3.js";
import { useMemo, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useCluster } from "../../cluster/cluster-data-access";
import { useAnchorProvider } from "../../solana/solana-provider";
import { useTransactionToast } from "../../ui/ui-layout";
import { usePlayerState } from "@/contexts/PlayerStateProvider";
import { Button, Center, Text, Flex, Input, VStack } from "@chakra-ui/react";
import * as anchor from "@coral-xyz/anchor";

export function InitPlayerButton() {
  // Get cluster
  const { cluster } = useCluster();
  // Connection to the Solana Network
  const { connection } = useConnection();
  // Fetch PublicKey, Wallet and sendTransaction from connected Wallet
  const { publicKey, sendTransaction } = useWallet();
  // Toast for transaction signature
  const transactionToast = useTransactionToast();
  // Anchor provider
  const provider = useAnchorProvider();
  // Fetches the program ID dynamically based on the cluster
  const programId = useMemo(
    () => getTwentyOneProgramId(cluster.network as Cluster),
    [cluster]
  );
  // Initialize the Anchor program
  const program = useMemo(() => getTwentyOneProgram(provider), [provider]);

  // Track loading state
  const [isLoading, setIsLoading] = useState(false);
  // Track deposit input (as a string to easily parse floats)
  const [depositInput, setDepositInput] = useState("");

  // Grab game state from context
  const { playerState, playerDataPDA } = usePlayerState();

  // Handler for button click
  const handleClick = useCallback(async () => {
    if (!publicKey || !playerDataPDA) return;
    // Parse deposit input from SOL to lamports
    let depositLamports = 0;
    try {
      const depositSol = parseFloat(depositInput);
      if (isNaN(depositSol) || depositSol <= 0) {
        toast.error("Please enter a valid deposit amount.");
        return;
      }
      depositLamports = Math.floor(depositSol * anchor.web3.LAMPORTS_PER_SOL);
    } catch (err) {
      toast.error("Invalid deposit amount");
      return;
    }

    setIsLoading(true);
    try {
      // Build transaction
      const transaction = await program.methods
        .initPlayer(new anchor.BN(depositLamports))
        .accountsStrict({
          player: playerDataPDA,
          signer: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .transaction();

      // Send the transaction
      const txSig = await sendTransaction(transaction, connection, {
        skipPreflight: true,
      });

      // Show a toast with the explorer link
      transactionToast(txSig);
      
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Init player transaction failed");
    } finally {
      setIsLoading(false);
    }
  }, [
    publicKey,
    playerDataPDA,
    connection,
    depositInput,
    program,
    sendTransaction,
    transactionToast,
  ]);


  if (!publicKey || playerState) return null;

  return (
      <Flex justify="center" align="center" direction="column" width="100%">
      <VStack spacing={4} align="center">
        <Input
          placeholder="Enter deposit in SOL"
          color="white"
          type="number"
          value={depositInput}
          onChange={(e) => setDepositInput(e.target.value)}
          width="200px"
        />
        <Button onClick={handleClick} isLoading={isLoading} colorScheme="blue">
          Create Player
        </Button>
      </VStack>
    </Flex>
  );
}

export default InitPlayerButton;
