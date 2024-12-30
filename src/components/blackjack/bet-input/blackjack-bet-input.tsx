import React, { useState, useRef, useEffect } from "react";
import { Box, Text } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { useSessionState } from "@/contexts/SessionStateProvider";

import { useWallet } from "@solana/wallet-adapter-react";
import { useBet } from "./blackjack-bet-context";


const CHIP_SIZE = 100; // Size of the chip buttons (width and height)
const CHIP_STACK_OFFSET_X = 20;
const CHIP_STACK_OFFSET_Y = -70;

// Generate chip positioning animation
const positionAnimation = (offsetX: number, offsetY: number) => keyframes`
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(${offsetX}px, ${offsetY}px);
  }
`;

const chipAnimation = (
  startX: number,
  startY: number,
  reverse: boolean = false, // Optional flag, default is false
  isWinChips: boolean = false,
) => {

  if (reverse) {
    // Swap the coordinates if reverse is true
    return keyframes`
      0% {
        opacity: 1;
        transform: translate(${isWinChips ? (CHIP_STACK_OFFSET_X + 135) : (CHIP_STACK_OFFSET_X + 5) }px, ${isWinChips ? (CHIP_STACK_OFFSET_Y + 150) : (CHIP_STACK_OFFSET_Y + 90) }px) scale(1);
      }
      100% {
        opacity: 0.3;
        transform: translate(${startX}px, ${startY}px) scale(0.7);
      }
    `;
  }

  // Default behavior
  return keyframes`
    0% {
      opacity: 1;
      transform: translate(${startX}px, ${startY}px) scale(1);
    }
    100% {
      opacity: ${isWinChips ? 0.7 : 0.3};
      transform: translate(${isWinChips ? (CHIP_STACK_OFFSET_X + 135) : (CHIP_STACK_OFFSET_X + 5) }px, ${isWinChips ? (CHIP_STACK_OFFSET_Y + 150) : (CHIP_STACK_OFFSET_Y + 90) }px) scale(1);
    }

  `;
};


type Chip = {
  id: number;
  label: string;
  value: number;
  image: string; // Path to the chip image
  startX: number; // Starting X position
  startY: number; // Starting Y position
  offsetX: number; // Final X position offset
  offsetY: number; // Final Y position offset
  stackSize: number; // Number of background chips
  tupleX: number[]; // X offsets for background chips
  tupleY: number[]; // Y offsets for background chips
};

const BetInput = () => {
  const betContext = useBet();
  if (!betContext) {
    throw new Error("BetInput must be used within a BetProvider");
  }
  const { betInput, setBetInput, isMovingChips, setIsMovingChips, showMessage, setShowMessage } = betContext;
  const { sessionState, sessionDataPDA } = useSessionState();
  const { publicKey } = useWallet();
  
  const [activeChips, setActiveChips] = useState<Chip[]>([]);
  const [activeToChips, setActiveToChips] = useState<Chip[]>([]);
  const [stackChips, setStackChips] = useState<Chip[]>([]);


  const [winChips, setWinChips] = useState<Chip[]>([]);
  const [winToChips, setWinToChips] = useState<Chip[]>([]);
  const [stackWinChips, setStackWinChips] = useState<Chip[]>([]);

  const [prevShowMessage, setPreShowMessage] = useState(showMessage);
  const [prevSessionState, setPrevSessionState] = useState(sessionState);
  const containerRef = useRef<HTMLDivElement>(null);
  // Ref to store the incremental ID
  const chipIdRef = useRef<number>(0);
  
  // Chip values with images and offsets
  let chips: Omit<Chip, "id">[] = [
    { label: "0.05", value: 0.05, image: "/chips/chip-0.05-sol.png", offsetX: 40, offsetY: 462, startX: -20, startY: 270, stackSize: 2, tupleX: [-11, -6], tupleY: [6, 4] },
    { label: "0.1", value: 0.1, image: "/chips/chip-0.1-sol.png", offsetX: -150, offsetY: 310, startX: -200, startY: 220, stackSize: 2, tupleX: [-6.5, -4], tupleY: [9, 5] },
    { label: "0.25", value: 0.25, image: "/chips/chip-0.25-sol.png", offsetX: -60, offsetY: 235, startX: -110, startY: 235, stackSize: 1, tupleX: [-5], tupleY: [4]  },
    { label: "0.5", value: 0.5, image: "/chips/chip-0.5-sol.png", offsetX: -43, offsetY: 215, startX: -100, startY: 315, stackSize: 2, tupleX: [4, -4], tupleY: [4, -4] },
    { label: "1", value: 1, image: "/chips/chip-1-sol.png", offsetX: -140, offsetY: 110, startX: -190, startY: 305, stackSize: 3, tupleX: [5, -5, -4], tupleY: [5, -5, 4] },
  ];

  useEffect(() => {  
      if (
        (prevShowMessage === false && showMessage === true) || 
        (prevSessionState?.state === true && sessionState == null) 
      ) {
      setIsMovingChips(true);
      setBetInput(0); // Reset bet input
  
      let outcome = "";

      let chipsToMove: Chip[] = [...stackChips];
      let chipsWinToMove: Chip[] = [];
      try {
        outcome =
        sessionState!.wins > prevSessionState!.wins
          ? "win"
          : sessionState!.loses > prevSessionState!.loses
          ? "lose"
          : "draw";
      } catch(error) {
        console.log(error)
        outcome = "lose";
      }
      

      const losePosition = { x: 2000, y: -400 };
      const winPosition = { x: 2000, y: -400 };

    
      // Dynamically create new chips for win with all properties from chips
      const newChipsForWin: Omit<Chip, "id">[] = stackChips.map((chip) => ({
        ...chip,
        startX: winPosition.x,
        startY: winPosition.y,
        indicator: 1,
      }))
      .reverse();


      const addChips = (index: number = 0): void => {

        if (index >= newChipsForWin.length) {
          setTimeout(() => {
            MoveChips(0); // Begin erasing chips
            MoveWinChips(0); // Begin erasing chips
          }, 1350); // Delay before starting to erase chips
          return;
        }

        const id = chipIdRef.current++;
        const chip = { ...newChipsForWin[index] };
      
        // Create an active chip for animation
        const animatedChip: Chip = { ...chip, id, offsetX: 0, offsetY: 0 };
      
        // Add chip to activeChips for animation
        setWinToChips((prev) => [...prev, animatedChip]);
      
        setTimeout(() => {
          // Move chip to stack after animation
          setStackWinChips((prev) => {
            const updated = prev.some((stackChip) => stackChip.id === id)
              ? prev
              : [...prev, animatedChip];
            chipsWinToMove = updated; // Synchronize chipsToErase
            return updated;
          });
      
        // Remove chip from activeChips
        setWinToChips((prev) =>
            prev.filter((activeChip) => activeChip.id !== animatedChip.id)
          );
        }, 1400); // Match animation duration
      
        // Add the next chip
        setTimeout(() => {
          addChips(index + 1);
        }, 100); // Interval for adding chips
      };

      const MoveWinChips = (index: number = 0): void  => {
        
        if (index >= chipsWinToMove.length) return; // Stop when all chips are erased
        const chip = chipsWinToMove[chipsWinToMove.length - index -1];
        
        // Find the corresponding chip in the map to get its `startX` and `startY`
        const chipData = chips.find((c) => c.value === chip.value);
        
        const targetY = chipData!.startY;
        const targetX = chipData!.startX;

        // Add chip to activeChips for animation
        setWinChips((prev) => [
          ...prev,
          {
            ...chip,
            startX: targetX, // Return to original button X position
            startY: targetY, // Return to original button Y position
          },
        ]);

        // Remove chip from stackChips
        setStackWinChips((prev) => prev.filter((c) => c.id !== chip.id));
  
        // Clean up the chip from activeChips after animation
        setTimeout(() => {
          setWinChips((prev) => prev.filter((activeChip) => activeChip.id !== chip.id));
        }, 550); // Match animation duration
  
        // Schedule the next chip erase
        setTimeout(() => {
          MoveWinChips(index + 1);
        }, 100); // 0.3 seconds interval
      };


      const MoveChips = (index: number = 0): void  => {
        
        if (index >= chipsToMove.length) {
          setIsMovingChips(false);; // Call set() when all chips are processed
          return; // Stop further execution
        }
        const chip = chipsToMove[chipsToMove.length - index -1];
        
        // Find the corresponding chip in the map to get its `startX` and `startY`
        const chipData = chips.find((c) => c.value === chip.value);

        const targetX = outcome === "lose" ?  losePosition.x : chipData!.startX;
        const targetY = outcome === "lose" ? losePosition.y : chipData!.startY;


        // Add chip to activeChips for animation
        setActiveChips((prev) => [
          ...prev,
          {
            ...chip,
            startX: targetX, // Return to original button X position
            startY: targetY, // Return to original button Y position
          },
        ]);

        // Remove chip from stackChips
        setStackChips((prev) => prev.filter((c) => c.id !== chip.id));
  
        // Clean up the chip from activeChips after animation
        setTimeout(() => {
          setActiveChips((prev) => prev.filter((activeChip) => activeChip.id !== chip.id));
        }, 550); // Match animation duration
  
        // Schedule the next chip erase
        setTimeout(() => {
          MoveChips(index + 1);
        }, 100);
        
      };

      if (outcome === "win") {
        setTimeout(() => {
          addChips();
        }, 2000); 
      } else {
        setTimeout(() => {
          MoveChips();
        }, 2000);
      }
            
    }
    setPreShowMessage(showMessage);
    setPrevSessionState(sessionState);
  }, [showMessage]);

  
  const handleChipClick = (
    chip: Omit<Chip, "id">,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (sessionState!.state == true || isMovingChips) return;
    console.log("TUT", isMovingChips)

    // Increment the ID counter
    const id = chipIdRef.current++;

    // Add the chip value to the bet
    setBetInput((prev) => parseFloat((prev + chip.value).toFixed(2)));
  
    // Get the container and button positions
    const containerRect = containerRef.current!.getBoundingClientRect();
    const buttonRect = (event.target as HTMLElement).getBoundingClientRect();
  
    // Calculate relative positions to the container, centered on the button
    const startX =
      buttonRect.left - containerRect.left + buttonRect.width / 2 - CHIP_SIZE / 2;
    const startY =
      buttonRect.top - containerRect.top + buttonRect.height / 2 - CHIP_SIZE / 2;

    // Create an active chip for animation
    const animatedChip: Chip = { ...chip, id, startX, startY, offsetX: 0, offsetY: 0 };

    setActiveToChips((prev) => [...prev, animatedChip]);

    // Add the chip to the stack slightly before the animation ends
    setTimeout(() => {
      // Check if the chip already exists in the stack to prevent duplicates
      setStackChips((prev) =>
        prev.some((stackChip) => stackChip.id === id)
          ? prev
          : [...prev, animatedChip]
      );
    }, 350); // Add to the stack earlier than animation end

    setTimeout(() => {
      setActiveToChips((prev) => {
        const updatedChips = prev.filter((activeChip) => activeChip.id !== id);
        return updatedChips;
      });
    }, 550); // Match animation duration
  };

  const handleStackClick = () => {
    if (sessionState!.state || isMovingChips) return;
    
  
    // Get the last chip added to the stack
    const lastChip = stackChips[stackChips.length - 1];
  
    // Animate the chip back to its original button position
    setActiveChips((prev) => [
      ...prev,
      {
        ...lastChip,
      },
    ]);
  
    // Remove the chip from the stack immediately
    setStackChips((prev) => prev.slice(0, -1)); // Remove the last chip from stack
  
    // Update the bet input
    setBetInput((prev) => parseFloat((prev - lastChip.value).toFixed(2)));
  
    // Clean up the chip from activeChips after animation
    setTimeout(() => {
      setActiveChips((prev) =>
        prev.filter((activeChip) => activeChip.id !== lastChip.id)
      );
    }, 550); // Match animation duration
  };


  if (!sessionState || !publicKey) return null;

  return (
    <Box ref={containerRef} position="relative" w="100%" h="400px">
      {/* Current Bet Info */}
      <Box
        w="160px"
        h="80px"
        bg="gray.700"
        borderRadius="md"
        border="0px solid"
        borderColor="blue.500"
        p={2}
        color="white"
        textAlign="center"
        position="absolute"
        bottom="290px"
        left="-190px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        userSelect="none" // Make the text unselectable
      >
        <Box>
          <Text fontSize="lg" fontWeight="bold" pointerEvents="none">
            Current Bet
          </Text>
          <Text fontSize="lg" fontWeight="bold" pointerEvents="none">
            {betInput.toFixed(2)} SOL
          </Text>
        </Box>
      </Box>
      {/* Chip Buttons */}
      <Box position="absolute" bottom="105px" left="50%" transform="translateX(-50%)">
        {chips.map((chip) => (
          <Box key={chip.label} position="relative" w={`${CHIP_SIZE}px`} h={`${CHIP_SIZE}px`}>
            {/* Background chips */}
            {Array.from({ length: chip.stackSize }).map((_, index) => {
              const left = chip.tupleX[index] + chip.offsetX || 0;
              const top = chip.tupleY[index] + chip.offsetY || 0;

              return (
                <Box
                  key={`${chip.label}-bg-${index}`}
                  position="absolute"
                  w="100%"
                  h="100%"
                  borderRadius="50%"
                  bgImage={`url(${chip.image})`}
                  bgSize="cover"
                  bgPosition="center"
                  clipPath="circle(50%)"
                  overflow="hidden"
                  filter="brightness(0.5) blur(0px)"
                  style={{ top: `${top}px`, left: `${left}px` }}
                  zIndex={0}
                />
              );
            })}
            {/* Foreground chip */}
            <Box
              as="button"
              w="100%"
              h="100%"
              borderRadius="50%"
              bgImage={`url(${chip.image})`}
              bgSize="cover"
              bgPosition="center"
              clipPath="circle(50%)"
              overflow="hidden"
              boxShadow="lg"
              border="none"
              animation={`${positionAnimation(chip.offsetX, chip.offsetY)} 0s ease-in-out forwards`}
              _hover={{ transform: "scale(1.1)" }}
              zIndex={2}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                console.log("Clicked on chip:", chip);
                handleChipClick(chip, event); // Pass the event object here
              }}
            />
          </Box>
        ))}
      </Box>
      {/* Stack of Chips */}
      <Box
        position="absolute"
        bottom={`${CHIP_STACK_OFFSET_Y + 350}px`}
        left={`${CHIP_STACK_OFFSET_X + 60}px`}
        transform="translateX(-50%)"
        w={`${CHIP_SIZE}px`}
        h={`${CHIP_SIZE}px`}
      >
        {stackChips
          .slice(-5)
          .reverse()
          .map((chip, index) => (
          <Box
            key={chip.id}
            position="absolute"
            w="100%"
            h="100%"
            borderRadius="50%"
            bgImage={`url(${chip.image})`}
            bgSize="cover"
            bgPosition="center"
            clipPath="circle(50%)"
            overflow="hidden"
            style={{
              top: `${-index * 4}px`, // Offset each chip slightly
              left: `${index * 4}px`,
              zIndex: 5 - index, // Foreground chip has the highest zIndex
            }}
            onClick={handleStackClick} // Handle click event
          />
        ))}
      </Box>
      <Box
        position="absolute"
        bottom={`${CHIP_STACK_OFFSET_Y + 300}px`}
        left={`${CHIP_STACK_OFFSET_X + 200}px`}
        transform="translateX(-50%)"
        w={`${CHIP_SIZE}px`}
        h={`${CHIP_SIZE}px`}
      >
        {stackWinChips
          .slice(-5)
          .reverse()
          .map((chip, index) => (
          <Box
            key={chip.id}
            position="absolute"
            w="100%"
            h="100%"
            borderRadius="50%"
            bgImage={`url(${chip.image})`}
            bgSize="cover"
            bgPosition="center"
            clipPath="circle(50%)"
            overflow="hidden"
            style={{
              top: `${-index * 4}px`, // Offset each chip slightly
              left: `${index * 4}px`,
              zIndex: 5 - index, // Foreground chip has the highest zIndex
            }}
            onClick={handleStackClick} // Handle click event
          />
        ))}
      </Box>

      {/* Animated Chips */}
      <Box position="absolute" w="100%" h="100%" pointerEvents="none">
        {activeToChips.map((chip) => (
          <Box
            key={chip.id}
            w={`${CHIP_SIZE}px`}
            h={`${CHIP_SIZE}px`}
            borderRadius="50%"
            bgImage={`url(${chip.image})`}
            bgSize="cover"
            bgPosition="center"
            clipPath="circle(50%)"
            overflow="hidden"
            position="absolute"
            top="0"
            left="0"
            animation={`${chipAnimation(chip.startX, chip.startY)} 0.7s ease-in-out`}
            data-chip-id={chip.id} // Add a marker to identify this specific chip
            data-marker="active-chip" // Add a marker to indicate this is part of activeToChips
            onAnimationEnd={() => {
              // Remove chip from activeToChips when animation ends
              setActiveToChips((prev) => prev.filter((activeChip) => activeChip.id !== chip.id));
            }}
          />
        ))}
      </Box>
      <Box position="absolute" w="100%" h="100%" pointerEvents="none">
        {winToChips.map((chip) => (
          <Box
            key={chip.id}
            w={`${CHIP_SIZE}px`}
            h={`${CHIP_SIZE}px`}
            borderRadius="50%"
            bgImage={`url(${chip.image})`}
            bgSize="cover"
            bgPosition="center"
            clipPath="circle(50%)"
            overflow="hidden"
            position="absolute"
            top="0"
            left="0"
            animation={`${chipAnimation(chip.startX, chip.startY, false, true)} 1.5s ease-in-out`}
            data-chip-id={chip.id}
            data-marker="active-chip"
            onAnimationEnd={() => {
              setWinToChips((prev) => prev.filter((activeChip) => activeChip.id !== chip.id));
            }}
          />
        ))}
      </Box>
      <Box position="absolute" w="100%" h="100%" pointerEvents="none">
        {winChips.map((chip) => (
          <Box
            key={chip.id}
            w={`${CHIP_SIZE}px`}
            h={`${CHIP_SIZE}px`}
            borderRadius="50%"
            bgImage={`url(${chip.image})`}
            bgSize="cover"
            bgPosition="center"
            clipPath="circle(50%)"
            overflow="hidden"
            position="absolute"
            top="0"
            left="0"
            animation={`${chipAnimation(chip.startX, chip.startY, true, true)} 0.7s ease-in-out`}
            data-chip-id={chip.id}
            data-marker="active-chip"
            onAnimationEnd={() => {
              setWinToChips((prev) => prev.filter((activeChip) => activeChip.id !== chip.id));
            }}
          />
        ))}
      </Box>
      <Box position="absolute" w="100%" h="100%" pointerEvents="none">
        {activeChips.map((chip) => (
          <Box
            key={chip.id}
            w={`${CHIP_SIZE}px`}
            h={`${CHIP_SIZE}px`}
            borderRadius="50%"
            bgImage={`url(${chip.image})`}
            bgSize="cover"
            bgPosition="center"
            clipPath="circle(50%)"
            overflow="hidden"
            position="absolute"
            top="0"
            left="0"
            animation={`${chipAnimation(chip.startX, chip.startY, true)} 0.7s ease-in-out`}
          />
        ))}
      </Box>
    </Box>
  );
};

export default BetInput;
