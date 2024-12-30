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
import { fundPlayer } from "@/Utils/user-instructions";
import { getTwentyOneProgram, txOpts } from "@/Utils/anchor";

export function FundPlayerButton() {
  const { publicKey } = useWallet();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const myProgram = useMemo(() => getTwentyOneProgram(provider), [provider]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);

  const [depositInput, setDepositInput] = useState("");
  const { playerState, playerDataPDA } = usePlayerState();

  const handleConfirm = useCallback(async () => {
    if (!publicKey || !playerDataPDA || !playerState) return;

    let deposit = 0;
    try {
      const depositSol = parseFloat(depositInput);
      if (isNaN(depositSol) || depositSol <= 0) {
        toast.error("Please enter a valid deposit amount.");
        return;
      }
      deposit = Math.floor(depositSol * anchor.web3.LAMPORTS_PER_SOL);
    } catch (err) {
      toast.error("Invalid deposit amount");
      return;
    }

    try {
      setIsLoading(true);

      const txSig = await fundPlayer(
        myProgram,
        publicKey,
        playerDataPDA,
        new anchor.BN(deposit),
        txOpts
      );

      transactionToast(txSig);
      onClose(); // Close the modal after a successful transaction
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Fund player account transaction failed");
    } finally {
      setIsLoading(false);
    }
  }, [
    publicKey,
    playerDataPDA,
    myProgram,
    depositInput,
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
        Fund Player
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
          <ModalHeader>Fund Player</ModalHeader>
          <ModalBody>
            <VStack spacing={4} align="center">
              <Input
                placeholder="Enter deposit in SOL"
                type="number"
                value={depositInput}
                onChange={(e) => setDepositInput(e.target.value)}
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

export default FundPlayerButton;
