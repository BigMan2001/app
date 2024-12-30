import React, { useEffect, useState } from "react";
import InitPlayerButton from "./buttons/blackjack-init-player-button";
import DisplayPlayerState from "./display/blackjack-display-player-state";
import { useWallet } from "@solana/wallet-adapter-react";
import { usePlayerState } from "@/contexts/PlayerStateProvider";
import InitSessionButton from "./buttons/blackjack-init-session-button";
import { useSessionState } from "@/contexts/SessionStateProvider";
import DisplaySessionState from "./display/blackjack-display-session-state";
import HitButton from "./buttons/blackjack-hit-button";
import DisplayHands from "./display/blackjack-display-hands";
import StandButton from "./buttons/blackjack-stand-button";
import CloseSessionButton from "./buttons/blackjack-close-session-button";
import SessionKeyButton from "./buttons/SessionKeyButton";
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  VStack,
  HStack,
  Text,
  Flex,
} from '@chakra-ui/react';
import { BetProvider } from "./bet-input/blackjack-bet-context";
import BetInput from "./bet-input/blackjack-bet-input";
import DisplayBalance from "./display/blackjack-display-balance";
import StartButton from "./buttons/blackjack-start";
import FundPlayerButton from "./buttons/blackjack-fund-button";
import WithdrawPlayerButton from "./buttons/blackjack-withdraw-button";


const PageStruct = () => {
  // Hook for fetching publickey for sending transaction using connected wallet
  const { publicKey } = useWallet();

  const { playerState } = usePlayerState();
  const { sessionState } = useSessionState();
  const [menuVisible, setMenuVisible] = useState(false); // Modal visibility state

  const toggleMenu = () => setMenuVisible((prev) => !prev);


  const [playerPopup, setPlayerPopup] = useState<{ visible: boolean; x: number; y: number }>({
    visible: false,
    x: 0,
    y: 0,
  });
  const [sessionPopup, setSessionPopup] = useState<{ visible: boolean; x: number; y: number }>({
    visible: false,
    x: 0,
    y: 0,
  });

  const popupPlayerRef = React.useRef<HTMLDivElement>(null);
  const popupSessionRef = React.useRef<HTMLDivElement>(null);

  const togglePlayerPopup = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const buttonRect = event.currentTarget.getBoundingClientRect();
    const popupHeight = popupPlayerRef.current?.offsetHeight || 50; // Default to 50px if height not available
    setPlayerPopup((prev) => ({
      visible: !prev.visible,
      x: buttonRect.right + window.scrollX + 10, // Place to the right of the button
      y: buttonRect.top + window.scrollY + buttonRect.height / 2 - popupHeight / 2 - 72, // Center alignment
    }));
  };
  
  
  const toggleSessionPopup = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const buttonRect = event.currentTarget.getBoundingClientRect();
    const popupHeight = popupSessionRef.current?.offsetHeight || 50; // Default to 50px if height not available
    setSessionPopup((prev) => ({
      visible: !prev.visible,
      x: buttonRect.right + window.scrollX + 10, // Place to the right of the button
      y: buttonRect.top + window.scrollY + buttonRect.height / 2 - popupHeight / 2 - 72, // Center alignment
    }));
  };

  type ButtonType = "hit" | "stand" | "closeSession";

  // Centralized state for button states
  const [buttonStates, setButtonStates] = useState<Record<ButtonType, boolean>>({
    hit: false,
    stand: false,
    closeSession: false,
  });
  
  const setButtonState = (button: ButtonType, state: React.SetStateAction<boolean>) => {
    setButtonStates((prev) => ({  
      ...prev,
      [button]: typeof state === "function" ? state(prev[button]) : state,
    }));
  };
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuVisible((prev) => !prev); // Toggle the menu visibility
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);


  if (!publicKey) return null;

  return (
    <BetProvider>
      <Box
        position="absolute"
        top="70px"
        left="0px"
        w="calc(100% - 50px)"
        h="calc(100% - 100px)"
      >
        {/* Floating Buttons */}
        <FloatingButton
          label="Menu"
          x={1390}
          y={5}
          colorScheme="purple"
          onClick={toggleMenu}
        />
        <FloatingButton
          label="Player Stats"
          x={10}
          y={5}
          colorScheme="purple"
          onClick={(e) => togglePlayerPopup(e)}
        />
        <FloatingButton
          label="Session Stats"
          x={10}
          y={65}
          colorScheme="purple"
          onClick={(e) => toggleSessionPopup(e)}
        />

        {/* Display Balance */}
        <Box position="absolute" left="-20px" top="40%" transform="translateY(-50%)">
          <DisplayBalance />
        </Box>

        {/* Bet Input */}
        <Box position="absolute" left="200px" top="75%" transform="translateY(-50%)">
          <BetInput />
        </Box>

        {/* Main Content */}
        <Flex justify="center" align="center" direction="column" width="100%" mt={0}>
          {!playerState?.authority ? (
            <VStack spacing={6} align="center">
              <Text fontSize="lg" color="white" textAlign="center">
                Create a new account by clicking the <strong>&quot;Create Player&quot;</strong> button.
              </Text>
              <InitPlayerButton />
            </VStack>
          ) : (
            <VStack spacing={6} align="center">
              {sessionState ? (
                <VStack spacing={4} align="center">
                  <DisplayHands />
                  {/* Hit and Stand Buttons */}
                  <Box position="absolute" top="480px" left="50%" transform="translateX(-50%)">
                    <HStack spacing={12}>
                      <HitButton
                        isLoading={buttonStates.hit}
                        setIsLoading={(state) => setButtonState("hit", state)}
                        disabled={buttonStates.stand}
                        width="140px" // Custom width for the HitButton
                        height="140px" // Custom height for the HitButton
                      />
                      <StandButton
                        isLoading={buttonStates.stand}
                        setIsLoading={(state) => setButtonState("stand", state)}
                        disabled={buttonStates.hit}
                        width="195px" // Custom width for the StandButton
                        height="165px" // Custom height for the StandButton
                      />
                    </HStack>
                  </Box>
               </VStack>
              ) : (
                <VStack spacing={4} align="center">
                  <Text
                    fontSize="lg"
                    color="white"
                    textAlign="center"
                    userSelect="none" // Prevents text selection
                  >
                    To begin playing, start a session with a minimum deposit of 0.15 SOL.
                  </Text>
                  <InitSessionButton />
                </VStack>
              )}
            </VStack>
          )}
        </Flex>
        {/* Menu Modal */}
        <Modal isOpen={menuVisible} onClose={toggleMenu}>
          <ModalOverlay />
          <ModalContent
            position="absolute" // Positioning the modal
            bottom="160" // Move to bottom
            transform="translateX(-50%)" // Adjust for centering
            bg="lightblue" // Light blue background for the modal
            borderRadius="md" // Add slight border radius
            width="60%" // Optional: make it wide
            maxW="400px" // Optional: set max width
            p={2} // Padding inside the modal
          >
            <ModalHeader>Main</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <FundPlayerButton />
                <WithdrawPlayerButton />
                <SessionKeyButton />
                <CloseSessionButton
                  isLoading={buttonStates.closeSession}
                  setIsLoading={(state) => setButtonState("closeSession", state)}
                  disabled={buttonStates.hit || buttonStates.stand}
                />
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" onClick={toggleMenu}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Player Stats Popup */}
        {playerPopup.visible && (
          <Popup
            x={playerPopup.x}
            y={playerPopup.y}
            onClose={() => setPlayerPopup({ visible: false, x: 0, y: 0 })}
          >
            <DisplayPlayerState />
          </Popup>
        )}

        {/* Session Stats Popup */}
        {sessionPopup.visible && (
          <Popup
            x={sessionPopup.x}
            y={sessionPopup.y}
            onClose={() => setSessionPopup({ visible: false, x: 0, y: 0 })}
          >
            <DisplaySessionState />
          </Popup>
        )}
      </Box>
    </BetProvider>
  );
};


export default PageStruct;

const FloatingButton = ({
  label,
  x,
  y,
  colorScheme,
  onClick,
}: {
  label: string;
  x: number;
  y: number;
  colorScheme: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}) => (
  <Box position="absolute" top={`${y}px`} left={`${x}px`} w="120px" h="50px">
    <Button
      colorScheme={colorScheme}
      onClick={onClick}
      width="100%" // Make the button fill the Box's width
      height="100%" // Make the button fill the Box's height
      border="3px solid black" // Add thick black border
      borderRadius="md" // Optional: Keep button corners slightly rounded
      fontWeight="bold" // Optional: Make label text bold
    >
      {label}
    </Button>
  </Box>
);


const Popup = ({
  x,
  y,
  children,
  popupRef,
}: {
  x: number;
  y: number;
  onClose: () => void;
  children: React.ReactNode;
  popupRef?: React.RefObject<HTMLDivElement>; // Ref for dynamic height
}) => (
  <Box
    ref={popupRef} // Attach ref for dynamic height
    position="absolute"
    top={`${y}px`}
    left={`${x}px`}
    bg="rgba(102, 198, 214, 0.8)" // Transparent background
    border="1px solid gray"
    borderRadius="md"
    p={2}
    shadow="md"
    zIndex="popover"
    backdropFilter="blur(6px)" // Optional blur effect
    minW="200px" // Optional: define a minimum width
  >
    {children}
  </Box>
);

