"use client";

import { bankPDA, getTwentyOneProgram, loadSbProgram, setupQueue } from "@/Utils/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useMemo, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useAnchorProvider } from "../../solana/solana-provider";
import { useTransactionToast } from "../../ui/ui-layout";
import { usePlayerState } from "@/contexts/PlayerStateProvider";
import { Image, Flex, HStack, Box } from "@chakra-ui/react";
import { checkSessionAccount, useSessionState } from "@/contexts/SessionStateProvider";
import { txOpts } from "@/Utils/anchor";
import * as sb from "@switchboard-xyz/on-demand";
import { shuffleCards, stand } from "@/Utils/user-instructions";
import { useSessionWallet } from "@magicblock-labs/gum-react-sdk";
import { useBet } from "../bet-input/blackjack-bet-context";

export function StandButton({
  isLoading,
  setIsLoading,
  disabled,
  width = "140px", // Default width
  height = "130px", // Default height
}: {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  disabled: boolean;
  width?: string; // Optional width prop
  height?: string; // Optional height prop
}) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const myProgram = useMemo(() => getTwentyOneProgram(provider), [provider]);

  // Hook to connect session wallet for skipping manual tx signing
  const sessionWallet = useSessionWallet();

  const { playerState, playerDataPDA } = usePlayerState();
  const { sessionState, sessionDataPDA, setSessionState } = useSessionState();


  const betContext = useBet();
  if (!betContext) {
    throw new Error("BetInput must be used within a BetProvider");
  }
  const { betInput, setBetInput } = betContext;


  const [isTweaked, setIsTweaked] = useState(false);


  const handleClick = useCallback(async () => {
    setIsTweaked(true);
    setTimeout(() => setIsTweaked(false), 200);
    if (!publicKey || !playerDataPDA || !playerState || !sessionDataPDA || !sessionState || !sessionState.state) return;

    const sbProgram = await loadSbProgram(provider);
    let queue = await setupQueue(sbProgram);
    const randomnessPublicKey = sessionState.randomnessAccount;
    const randomness = new sb.Randomness(sbProgram, randomnessPublicKey);

  
    try {
      setIsLoading(true);
      const txSig = await shuffleCards(
        myProgram,
        sbProgram,
        randomness,
        randomnessPublicKey,
        queue,
        sessionWallet,
        sessionDataPDA,
        playerDataPDA,
        txOpts
      );


      transactionToast(txSig);
      
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Shuffle cards transaction failed");
    }

    try {
      const txSig = await stand(
        myProgram,
        randomness,
        randomnessPublicKey,
        sessionWallet,
        playerDataPDA,
        sessionDataPDA,
        bankPDA,
        txOpts,
      )

      transactionToast(txSig);
      
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Stand transaction failed");
    } finally {
      setIsLoading(false);
    }


     // Check session account after transactions
     const accountExists = await checkSessionAccount(connection, sessionDataPDA);
     if (!accountExists) {
       console.error("Session account no longer exists after transactions.");
       setSessionState(null)
       setBetInput(0)
     }

  }, [
    publicKey,
    sessionDataPDA,
    playerDataPDA,
    bankPDA,
    connection,
    myProgram,
    sendTransaction,
    transactionToast,
    setIsLoading,
  ]);



  if (!publicKey || !playerState || !sessionState ) return null;

  return (
    
    <Flex
      direction="column"
      justify="flex-end" // Pushes content to the bottom
      align="center"
      width="100%"
      height="22vh" // Ensures the Flex container takes full viewport height
      padding={0} // Optional: Adds some padding from the bottom
    >
      <HStack spacing={4} align="center">
          <Box
            onClick={isLoading || disabled ? undefined : handleClick}
            cursor={isLoading || disabled ? "not-allowed" : "pointer"}
            opacity={isLoading || disabled ? 0.5 : 1}
            color="white"
            transition="transform 0.05s" // Smooth transition for the tweak
            transform={isTweaked ? "scale(0.95)" : "scale(1)"} // Shrink effect
          >
          <Image
            src="/buttons/stand-1.png" // Replace with your image path
            alt="Stand Button"
            onClick={!isLoading && !disabled ? handleClick : undefined}
            cursor={isLoading || disabled ? "not-allowed" : "pointer"}
            opacity={isLoading || disabled ? 0.6 : 1.0}
            width={width} // Dynamically set the width
            height={height} // Dynamically set the height
          />
        </Box>
      </HStack>
    </Flex>
  );
}

export default StandButton;
