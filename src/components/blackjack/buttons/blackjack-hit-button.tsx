import { bankPDA, getTwentyOneProgram, loadSbProgram, setupQueue } from "@/Utils/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useMemo, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useAnchorProvider } from "../../solana/solana-provider";
import { useTransactionToast } from "../../ui/ui-layout";
import { usePlayerState } from "@/contexts/PlayerStateProvider";
import { Flex, Box, Image, HStack } from "@chakra-ui/react";
import * as anchor from "@coral-xyz/anchor";
import { checkSessionAccount, useSessionState } from "@/contexts/SessionStateProvider";
import { txOpts } from "@/Utils/anchor";
import * as sb from "@switchboard-xyz/on-demand";
import { drawCards, shuffleCards } from "@/Utils/user-instructions";
import { useSessionWallet } from "@magicblock-labs/gum-react-sdk";
import { useBet } from "../bet-input/blackjack-bet-context";

export function HitButton({
  isLoading,
  setIsLoading,
  disabled,
  width = "130px", // Default width
  height = "130px", // Default height
}: {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  disabled: boolean;
  width?: string; // Optional width prop
  height?: string; // Optional height pro
}) {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const myProgram = useMemo(() => getTwentyOneProgram(provider), [provider]);

  const sessionWallet = useSessionWallet();

  const betContext = useBet();
  if (!betContext) {
    throw new Error("BetInputHandler must be used within a BetProvider");
  }

  const { betInput } = betContext;
  const { playerState, playerDataPDA } = usePlayerState();
  const { sessionState, sessionDataPDA, setSessionState } = useSessionState();


  const [isTweaked, setIsTweaked] = useState(false);

  const handleClick = useCallback(async () => {
    setIsTweaked(true);
    setTimeout(() => setIsTweaked(false), 200);
    if (!publicKey || !playerDataPDA || !playerState || !sessionDataPDA || !sessionState || !sessionWallet) return;

    const sbProgram = await loadSbProgram(provider);
    let queue = await setupQueue(sbProgram);
    const randomnessPublicKey = sessionState.randomnessAccount;
    const randomness = new sb.Randomness(sbProgram, randomnessPublicKey);

    let bet = 0;

    if (!sessionState.state) {
      try {
        const betSol = betInput;
        if (isNaN(betSol) || betSol < 0.05 || betSol > 50) {
          toast.error("Please enter a valid bet amount.");
          return;
        }
        bet = Math.floor(betSol * anchor.web3.LAMPORTS_PER_SOL);
      } catch (err) {
        toast.error("Invalid bet amount");
        return;
      }
    }

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
        txOpts,
        sessionState,
        new anchor.BN(bet)
      );

      transactionToast(txSig);

    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Shuffle cards transaction failed");
    }

    try {
      const txSig = await drawCards(
        myProgram,
        randomness,
        randomnessPublicKey,
        sessionWallet,
        playerDataPDA,
        sessionDataPDA,
        bankPDA,
        txOpts
      );

      transactionToast(txSig);

    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Draw cards transaction failed");
    } finally {
      setIsLoading(false);
    }

    const accountExists = await checkSessionAccount(connection, sessionDataPDA);
    if (!accountExists) {
      console.error("Session account no longer exists after transactions.");
      setSessionState(null);
    }
  }, [
    publicKey,
    sessionDataPDA,
    playerDataPDA,
    bankPDA,
    connection,
    betInput,
    myProgram,
    transactionToast,
    setIsLoading,
  ]);

  if (!publicKey || !playerState || !sessionState) return null;

  return (
    <Flex
      direction="column"
      justify="flex-end" // Pushes content to the bottom
      align="center"
      width="100%"
      height="18vh" // Ensures the Flex container takes full viewport height
      padding={0} // Optional: Adds some padding from the bottom
    >
      <HStack spacing={4} align="center">
        <Box
          onClick={isLoading || disabled ? undefined : handleClick}
          cursor={isLoading || disabled ? "not-allowed" : "pointer"}
          opacity={isLoading || disabled ? 0.5 : 1}
          transition="transform 0.1s"
          transform={isTweaked ? "scale(0.95)" : "scale(1)"}
        >
          <Image
            src="/buttons/hit-2.png" // Replace with your button image path
            alt="Hit Button"
            width={width} // Dynamically set the width
            height={height} // Dynamically set the height
          />
        </Box>
      </HStack>
    </Flex>
  );
}

export default HitButton;
