"use client";

import { bankPDA, getTwentyOneProgram, getTwentyOneProgramId, loadSbProgram, setupQueue, txOpts } from "@/Utils/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Cluster, Keypair } from "@solana/web3.js";
import { useMemo, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useCluster } from "../../cluster/cluster-data-access";
import { useAnchorProvider } from "../../solana/solana-provider";
import { useTransactionToast } from "../../ui/ui-layout";
import { usePlayerState } from "@/contexts/PlayerStateProvider";
import { Button, Flex, Input, VStack } from "@chakra-ui/react";
import * as anchor from "@coral-xyz/anchor";
import { useSessionState } from "@/contexts/SessionStateProvider";
import { createRandomnessAccount, initSession } from "@/Utils/user-instructions";
import { useSessionWallet } from "@magicblock-labs/gum-react-sdk";



export function InitSessionButton() {
  const { cluster } = useCluster();
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const myProgramId = useMemo(
    () => getTwentyOneProgramId(cluster.network as Cluster),
    [cluster]
  );

  const myProgram = useMemo(() => getTwentyOneProgram(provider), [provider]);

  // Hook to connect session wallet for skipping manual tx signing
  const sessionWallet = useSessionWallet();
  
  const [isLoading, setIsLoading] = useState(false);
  const [depositInput, setDepositInput] = useState("");
  const { playerState, playerDataPDA } = usePlayerState();
  const { sessionState, sessionDataPDA } = useSessionState();


  const handleClick = useCallback(async () => {
    if (!publicKey || !playerDataPDA || !playerState || !sessionDataPDA) return;

    const sbProgram = await loadSbProgram(provider);
    let queue = await setupQueue(sbProgram);

    let depositLamports = 0;
    // Generate randomness keypair
    const rngKp = Keypair.generate();
    

    try {
      const depositSol = parseFloat(depositInput);
      if (isNaN(depositSol) || depositSol < 0.15) {
        toast.error("Please enter a valid deposit amount.");
        return;
      }
      depositLamports = Math.floor(depositSol * anchor.web3.LAMPORTS_PER_SOL);
    } catch (err) {
      toast.error("Invalid deposit amount");
      return;
    }

    try {
      setIsLoading(true);
      const txSig = await createRandomnessAccount(
        sbProgram,
        connection,
        queue,
        rngKp,
        sessionWallet,
      );
      toast.success("Randomness account and session account created successfully");
      transactionToast(txSig);
    
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Create randomness account transaction failed");
    } finally {
      setIsLoading(false);
    }


    try {
      setIsLoading(true);
      const txSig = await initSession(
        myProgram,
        rngKp.publicKey,
        publicKey,
        sessionDataPDA,
        playerDataPDA,
        bankPDA,
        new anchor.BN(depositLamports),
        txOpts
      );

      transactionToast(txSig);
      toast.success("Session account created successfully");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Session account transaction failed");
    } finally {
      setIsLoading(false);
    }
    

  }, [
    publicKey,
    sessionDataPDA,
    playerDataPDA,
    bankPDA,
    connection,
    depositInput,
    myProgram,
    sendTransaction,
    transactionToast,
  ]);


  if (!publicKey || sessionState) return null;

  return (
      <Flex justify="center" align="center" direction="column" width="100%">
      <VStack spacing={4} align="center">
        <Input
          placeholder="Enter deposit in SOL"
          type="number"
          color="white"
          value={depositInput}
          onChange={(e) => setDepositInput(e.target.value)}
          width="200px"
        />
        <Button onClick={handleClick} isLoading={isLoading} colorScheme="blue">
          Start Session
        </Button>
      </VStack>
    </Flex>
  );
}

export default InitSessionButton;
