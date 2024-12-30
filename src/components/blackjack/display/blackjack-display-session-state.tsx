import React, { useEffect, useState, useRef } from "react";
import {
  Text,
  Flex,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  Box,
} from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { ExplorerLink } from "../../cluster/cluster-ui";
import { useSessionState } from "@/contexts/SessionStateProvider";
import { ellipsify } from "../../ui/ui-layout";

const DisplaySessionState = () => {
  const { publicKey } = useWallet();
  const { sessionState, sessionDataPDA } = useSessionState();

  const previousStatsRef = useRef<{ wins: number; draws: number; losses: number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState("");
  const toast = useToast();

  // Current values
  const wins = sessionState?.wins || 0;
  const draws = sessionState?.draws || 0;
  const losses = sessionState?.loses || 0;

  useEffect(() => {
    if (!sessionState) return; 

    const previousStats = previousStatsRef.current;

    if (previousStats === null) {
      // Initialize previousStats on the first render when sessionState is available
      previousStatsRef.current = { wins, draws, losses };
      return;
    }

    let message = null;

    if (wins > previousStats.wins) {
      message = "You Won!";
    } else if (draws > previousStats.draws) {
      message = "It's a Draw!";
    } else if (losses > previousStats.losses) {
      message = "You Lost!";
    }

    if (message) {
      showNotification(message);
    }

    // Update previousStats after processing changes
    previousStatsRef.current = { wins, draws, losses };
  }, [wins, draws, losses]);


  const showNotification = (message: string) => {
    setNotification(message);
    setIsModalOpen(true);

    toast({
      title: message,
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  if (!sessionState || !sessionDataPDA || !publicKey) return null;

  const stats = [
    {
      label: "Balance",
      value: `${(Number(sessionState.balance) / LAMPORTS_PER_SOL).toFixed(3)} SOL`,
    },
    {
      label: "Account ID",
      value: (
        <ExplorerLink
          path={`account/${sessionDataPDA.toBase58()}`}
          label={ellipsify(sessionDataPDA.toBase58())}
        />
      ),
    },
    {
      label: "Authority",
      value: (
        <ExplorerLink
          path={`account/${sessionState.authority.toBase58()}`}
          label={ellipsify(sessionState.authority.toBase58())}
        />
      ),
    },
    { label: "Current State", value: sessionState.state ? "Active" : "Inactive" },
    {
      label: "Initial Bank",
      value: `${(Number(sessionState.initialBank) / LAMPORTS_PER_SOL).toFixed(3)} SOL`,
    },
    {
      label: "Bet",
      value: `${(Number(sessionState.bet) / LAMPORTS_PER_SOL).toFixed(3)} SOL`,
    },
    { label: "Wins", value: Number(sessionState.wins) },
    { label: "Draws", value: Number(sessionState.draws) },
    { label: "Losses", value: Number(sessionState.loses) },
  ];



  return (
    <>
      {/* Adjusted Box with Flexible Element Spacing */}
      <Box
        w="760px"
        h="35px"
        bg="rgba(255, 255, 255, 0)" // Transparent background
        borderRadius="md"
        p={1}
      >
        <Flex direction="row" align="center" h="100%" gap={5}>
          {stats.map(({ label, value }) => (
            <Flex
              key={label}
              direction="column"
              align="center"
              justify="center"
              textAlign="center"
            >
              <Text fontWeight="bold" fontSize="sm" mb={1}>
                {label}
              </Text>
              <Text fontSize="sm" fontWeight="medium" lineHeight="1">
                {value}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Box>
  
      {/* Modal for notification */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center" fontSize="2xl">
            Session Update
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction="column" align="center" justify="center">
              <Text fontSize="2xl" textAlign="center" mb={4} fontWeight="bold">
                {notification}
              </Text>
              <Button mt={4} colorScheme="blue" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default DisplaySessionState;
