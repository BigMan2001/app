import {
  Button,
  Flex,
  VStack,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMemo, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useAnchorProvider } from "../../solana/solana-provider";
import { useTransactionToast } from "../../ui/ui-layout";
import { usePlayerState } from "@/contexts/PlayerStateProvider";
import * as anchor from "@coral-xyz/anchor";
import { withdrawPlayer } from "@/Utils/user-instructions";
import { getTwentyOneProgram, txOpts } from "@/Utils/anchor";

export function WithdrawPlayerButton() {

  const { publicKey } = useWallet();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const myProgram = useMemo(() => getTwentyOneProgram(provider), [provider]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);

  const [amountInput, setAmountInput] = useState("");
  const { playerState, playerDataPDA } = usePlayerState();

  const handleConfirm = useCallback(async () => {
    if (!publicKey || !playerDataPDA || !playerState) return;

    let amount = 0;
    try {
      const amountSol = parseFloat(amountInput);
      if (isNaN(amountSol) || amountSol <= 0) {
        toast.error("Please enter a valid withdrawal amount.");
        return;
      }
      amount = Math.floor(amountSol * anchor.web3.LAMPORTS_PER_SOL);
    } catch (err) {
      toast.error("Invalid withdrawal amount");
      return;
    }

    try {
      setIsLoading(true);

      const txSig = await withdrawPlayer(
        myProgram,
        publicKey,
        playerDataPDA,
        new anchor.BN(amount),
        txOpts
      );

      transactionToast(txSig);
      onClose(); // Close the modal after a successful transaction
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Withdraw player account transaction failed");
    } finally {
      setIsLoading(false);
    }
  }, [
    publicKey,
    playerDataPDA,
    myProgram,
    amountInput,
    transactionToast,
    onClose,
  ]);

  if (!publicKey || !playerState) return null;

  return (
    <Flex justify="center" align="center" direction="column" width="100%">
      <Button
        onClick={onOpen}
        colorScheme="blue"
        size="md"
        p={6}
        border="3px solid"
        borderColor="black"
        fontSize="md"
        width="150px"
      >
        Withdraw Player
      </Button>

      {/* Modal for input */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent
          position="absolute"
          top="5%"
          left="35%"
          transform="translate(-50%, -20%)"
        >
          <ModalHeader>Withdraw Player</ModalHeader>
          <ModalBody>
            <VStack spacing={4} align="center">
              <Input
                placeholder="Enter withdrawal amount in SOL"
                type="number"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                width="100%"
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={handleConfirm}
              isLoading={isLoading}
              colorScheme="blue"
              mr={3}
            >
              Confirm
            </Button>
            <Button onClick={onClose} colorScheme="gray">
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default WithdrawPlayerButton;