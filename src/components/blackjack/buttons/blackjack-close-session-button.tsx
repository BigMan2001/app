"use client";

import { bankPDA, getTwentyOneProgram } from "@/Utils/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { useAnchorProvider } from "../../solana/solana-provider";
import { useTransactionToast } from "../../ui/ui-layout";
import { usePlayerState } from "@/contexts/PlayerStateProvider";
import { Button,Flex, VStack } from "@chakra-ui/react";
import { checkSessionAccount, useSessionState } from "@/contexts/SessionStateProvider";
import { txOpts } from "@/Utils/anchor";
import { closeSession  } from "@/Utils/user-instructions";

export function CloseSessionButton({
  isLoading,
  setIsLoading,
  disabled,
}: {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  disabled: boolean;
}) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const myProgram = useMemo(() => getTwentyOneProgram(provider), [provider]);


  const { playerState, playerDataPDA } = usePlayerState();
  const { sessionState, sessionDataPDA, setSessionState } = useSessionState();


  const handleClick = useCallback(async () => {
    if (!publicKey || !playerDataPDA || !playerState || !sessionDataPDA || !sessionState || sessionState.state) return;

  
    try {
      setIsLoading(true);
      const txSig = await closeSession(
        myProgram,
        publicKey,
        playerDataPDA,
        sessionDataPDA,
        bankPDA,
        txOpts
      )

      transactionToast(txSig);
      
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Close session transaction failed");
    } finally {
      setIsLoading(false);
    }

     // Check session account after transactions
     const accountExists = await checkSessionAccount(connection, sessionDataPDA);
     if (!accountExists) {
       setSessionState(null)
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
      <Flex justify="center" align="center" direction="column" width="100%">
      <VStack spacing={4} align="center">
        <Button
          onClick={handleClick}
          isLoading={isLoading}
          disabled={isLoading || disabled} // Disable when loading or explicitly disabled
          colorScheme={disabled ? "gray" : "blue"} // Change color when disabled
          p={6}
          fontSize="md"
          width="150px"
          border="3px solid"
          borderColor="black"
        >
          Close session
        </Button>
      </VStack>
    </Flex>
  );
}
export default CloseSessionButton;
