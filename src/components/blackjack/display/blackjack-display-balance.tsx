import React from "react";
import {
  VStack,
  Text,
  Box,
} from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useSessionState } from "@/contexts/SessionStateProvider";

const DisplayBalance = () => {
  const { publicKey } = useWallet();
  const { sessionState } = useSessionState();

  if (!sessionState || !publicKey) return null;

  // Stats array with only Balance and Bet
  const stats = [
    {
      label: "Balance",
      value: `${(Number(sessionState.balance) / LAMPORTS_PER_SOL).toFixed(3)} SOL`,
    },
  ];

  return (
    <>
      {/* VStack to stack Balance and Bet */}
      <VStack spacing={120} w="220px" position="relative" top="20px"> {/* Move down with 'top' */}
        {stats.map(({ label, value }) => (
          <Box
            key={label}
            w="160px" /* Same width as previous Box */
            h="80px" /* Same height as previous Box */
            bg="gray.700"
            borderRadius="md"
            border="0px solid"
            borderColor="blue.500"
            display="flex" /* Center content */
            alignItems="center" /* Center vertically */
            justifyContent="center" /* Center horizontally */
            color="white"
            textAlign="center"
            userSelect="none" /* Prevent text selection */
            boxShadow="sm"
          >
            <Box>
              <Text fontSize="lg" fontWeight="bold" pointerEvents="none">
                {label}
              </Text>
              <Text fontSize="lg" fontWeight="bold" pointerEvents="none">
                  {value}
              </Text>
            </Box>
          </Box>
        ))}
      </VStack>
    </>
  );  
}
  
export default DisplayBalance;
