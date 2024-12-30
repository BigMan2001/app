"use client";

import { useCallback } from "react";
import { Button, Flex, VStack } from "@chakra-ui/react";
import { useBet } from "../bet-input/blackjack-bet-context";

export function StartButton() {
  
  const betContext = useBet();
  if (!betContext) {
    throw new Error("BetInput must be used within a BetProvider");
  }
  const { start, setStart } = betContext;


  const handleClick = useCallback(async () => {
    // Toggle start state
    setStart((prev) => !prev);
  }, [
    setStart,
  ]);


  return (
    <Flex justify="center" align="center" direction="column" width="100%">
      <VStack spacing={4} align="center">
        <Button
          onClick={handleClick}
          p={6}
          fontSize="md"
          width="150px"
          border="3px solid"
          borderColor="black"
        >
          {start ? "Stop" : "Start"}
        </Button>
      </VStack>
    </Flex>
  );
}

export default StartButton;
