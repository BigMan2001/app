import { useState, useEffect, useRef } from "react";
import { VStack } from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { fetchSessionDetails } from "@/Utils/anchor";
import { useSessionState } from "@/contexts/SessionStateProvider";
import { useBet } from "../bet-input/blackjack-bet-context";
import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import MessageDisplay from "./blackjack-display-message";

const cardAnimation = (endX: number, endY: number) => keyframes`
  0% {
    transform: translate(500px, -800px) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(${endX}px, ${endY}px) scale(1);
    opacity: 1;
  }
`;

const cardEraseAnimation = (startX: number, startY: number) => keyframes`
  0% {
    transform: translate(${startX}px, ${startY}px) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(1000px, -500px) scale(1);
    opacity: 1;
  }
`;


const AnimatedCard = styled.div<{
  endX: number;
  endY: number;
  imagePath: string;
}>`
  position: absolute;
  width: 100px;
  height: 160px;
  background: url(${(props) => props.imagePath}) no-repeat center center;
  background-size: cover;
  border: 1px solid black;
  border-radius: 8px;
  animation: ${(props) => cardAnimation(props.endX, props.endY)} 1s ease-in-out
    forwards;
`;


const ErasingCard = styled.div<{
  imagePath: string;
  startX: number;
  startY: number;
}>`
  position: absolute;
  width: 100px;
  height: 160px;
  background: url(${(props) => props.imagePath}) no-repeat center center;
  background-size: cover;
  border: 1px solid black;
  border-radius: 8px;
  animation: ${(props) => cardEraseAnimation(props.startX, props.startY)} 1s ease-in-out forwards;
`;

interface ErasedCard {
  card: string;
  endX: number;
  endY: number;
}


const DisplayHands = () => {
  const { publicKey } = useWallet();
  const { sessionState, sessionDataPDA } = useSessionState();
  const betContext = useBet();
  if (!betContext) {
    throw new Error("BetInput must be used within a BetProvider");
  }
  const { betInput, setBetInput, showMessage, setShowMessage  } = betContext;
  
  const [prevSessionState, setPrevSessionState] = useState(sessionState);
  const [prevPlayerHand, setPrevPlayerHand] = useState<(string | number)[]>([]);
  const [prevDealerHand, setPrevDealerHand] = useState<(string | number)[]>([]);
  const [erasedPlayerCards, setErasedPlayerCards] = useState<ErasedCard[]>([]);
  const [erasedDealerCards, setErasedDealerCards] = useState<ErasedCard[]>([]);
  const [animatedPlayerCards, setAnimatedPlayerCards] = useState<string[]>([]);
  const [animatedDealerCards, setAnimatedDealerCards] = useState<string[]>([]);

  const [resultMessage, setResultMessage] = useState("");

  const isPageRefreshed = useRef(true);

  const previousSessionRef = useRef({
    wins: 0,
    draws: 0,
    loses: 0,
  });

  const initialCardPool: Record<string, string[]> = {
    K: ["KC", "KD", "KH", "KS"],
    Q: ["QC", "QD", "QH", "QS"],
    J: ["JC", "JD", "JH", "JS"],
    A: ["AC", "AD", "AH", "AS"],
    "6": ["6C", "6D", "6H", "6S"],
    "7": ["7C", "7D", "7H", "7S"],
    "8": ["8C", "8D", "8H", "8S"],
    "9": ["9C", "9D", "9H", "9S"],
    "10": ["10C", "10D", "10H", "10S"],
  };

  const [cardPool, setCardPool] = useState(initialCardPool);


  

  const getRandomCard = (nominal: string): string | null => {
    const suits = cardPool[nominal];
    if (suits && suits.length > 0) {
      const randomIndex = Math.floor(Math.random() * suits.length);
      const card = suits[randomIndex];
      suits.splice(randomIndex, 1); // Remove the selected card
      setCardPool({ ...cardPool }); // Update the state
      return card;
    }
    return null;
  };

  const drawCards = async (
    hand: { nominal: string | number; target: "player" | "dealer" }[],
  ): Promise<{ playerCards: string[]; dealerCards: string[] }> => {
    const playerCardsCopy: string[] = [...animatedPlayerCards];
    const dealerCardsCopy: string[] = [...animatedDealerCards];
  
    for (let i = 0; i < hand.length; i++) {
      const { nominal, target } = hand[i];
      const card = getRandomCard(String(nominal));
      if (card) {
        await new Promise((resolve) => setTimeout(resolve, 500)); // Delay for 500ms
        if (target === "player") {
          setAnimatedPlayerCards((prev) => {
            const updated = [...prev, card];
            playerCardsCopy.push(card); // Add to the copy
            return updated;
          });
        } else if (target === "dealer") {
          setAnimatedDealerCards((prev) => {
            const updated = [...prev, card];
            dealerCardsCopy.push(card); // Add to the copy
            return updated;
          });
        }
      }
    }
    // Use setTimeout directly for the delay
    setTimeout(() => {
      handleGameEnd();
    }, 2000);
    
    return { playerCards: playerCardsCopy, dealerCards: dealerCardsCopy };
  };
  

  const calculateDifference = (
    previousHand: (string | number)[],
    newHand: (string | number)[]
  ) => {
    const prevCopy = [...previousHand];
    const addedCards: (string | number)[] = [];

    for (const card of newHand) {
      const index = prevCopy.indexOf(card);
      if (index !== -1) {
        prevCopy.splice(index, 1);
      } else {
        addedCards.push(card);
      }
    }

    return addedCards;
  };

  const generateAlternatingCards = (
    playerCards: (string | number)[],
    dealerCards: (string | number)[]
  ): { nominal: string | number; target: "player" | "dealer" }[] => {
    const combinedCards: { nominal: string | number; target: "player" | "dealer" }[] = [];
    const maxLength = Math.max(playerCards.length, dealerCards.length);
  
    for (let i = 0; i < maxLength; i++) {
      if (i < playerCards.length) {
        combinedCards.push({ nominal: playerCards[i], target: "player" });
      }
      if (i < dealerCards.length) {
        combinedCards.push({ nominal: dealerCards[i], target: "dealer" });
      }
    }
  
    return combinedCards;
  };

  const resetGame = (playerCards: string[], dealerCards: string[]) => {

    // Erase player cards one by one
    const erasePlayerCards = (index: number) => {
      if (index < playerCards.length) {
        setAnimatedPlayerCards((prev) => {
            setErasedPlayerCards((prevErased) => [
              ...prevErased,
              { card: playerCards[playerCards.length - 1 - index], endX: (-150 + (playerCards.length - 1 - index) * 20), endY: 130 },
            ]);

          return prev.filter((animatedCard) => animatedCard !== playerCards[playerCards.length - 1 - index]);
        });

        setTimeout(() => erasePlayerCards(index + 1), 500); // Adjust interval as needed
      } else {
        eraseDealerCards(0); // Start erasing dealer cards after player cards are done
      }
    };

    // Erase dealer cards one by one
    const eraseDealerCards = (index: number) => {
      if (index < dealerCards.length) {
        setAnimatedDealerCards((prev) => {
          setErasedDealerCards((prevErased) => [
            ...prevErased,
            { card: dealerCards[dealerCards.length - 1 - index], endX: (150 + (dealerCards.length - index - 1) * 20), endY: 130 },
          ]);

        return prev.filter((animatedCard) => animatedCard !== dealerCards[dealerCards.length - 1 - index]);
        });

        setTimeout(() => eraseDealerCards(index + 1), 500); // Adjust interval as needed
      } else {
        setErasedPlayerCards([]);
        setErasedDealerCards([]);
        setCardPool(initialCardPool);
      }
    };

    erasePlayerCards(0); // Start erasing player cards
  };

  const handleGameEnd = () => {
    if (prevSessionState && sessionState) {
      if (sessionState.wins > prevSessionState.wins) {
        setResultMessage("You Win!");
      } else if (sessionState.loses > prevSessionState.loses) {
        setResultMessage("You Lose!");
      } else if (sessionState.draws > prevSessionState.draws) {
        setResultMessage("It's a Draw!");
      }
    }
  
    if (prevSessionState?.state === true && sessionState?.state === false) {
      setBetInput(0);
    }
  
    setPrevSessionState(sessionState);
  };

  useEffect(() => {
  
    if (!sessionState || !sessionDataPDA || !publicKey) return;

    const fetchHands = async () => {

      const [fetchedPlayerHand, fetchedDealerHand] = await fetchSessionDetails(sessionState);


      const addedPlayerCards = calculateDifference(prevPlayerHand, fetchedPlayerHand);
      const addedDealerCards = calculateDifference(prevDealerHand, fetchedDealerHand);

      const combinedCards = generateAlternatingCards(addedPlayerCards, addedDealerCards);
      console.log("COMBINED CARDS", combinedCards)

      let playerCards: string[];
      let dealerCards: string[];
  
      if (isPageRefreshed.current && !sessionState.state) {
        console.log("Page was refreshed");
      } else  {
        ({ playerCards, dealerCards } = await drawCards(combinedCards));
      } 
    
      
      setPrevPlayerHand(fetchedPlayerHand);
      setPrevDealerHand(fetchedDealerHand);

      // Check if session state has changed
      const { wins, draws, loses } = sessionState;
      const previousSession = previousSessionRef.current;

      if (isPageRefreshed.current) {
        isPageRefreshed.current = false; 
        return
      }

      if (!sessionState.state && 
        (wins > previousSession.wins || 
         draws > previousSession.draws || 
         loses > previousSession.loses)) {
        setTimeout(() => setShowMessage(true), combinedCards.length * 1000);
        setTimeout(() => {
          resetGame(playerCards, dealerCards);
          console.log("Game reset after 5 seconds.");
        }, 5000);
      }
    
      
      // Update the previous session state
      previousSessionRef.current = { wins, draws, loses };
    };

    fetchHands();

  }, [publicKey, sessionState, sessionDataPDA]);
  

  useEffect(() => {
    if (showMessage) {
      const timer = setTimeout(() => setShowMessage(false), 5000); // Hide message after 5 seconds
      return () => clearTimeout(timer); // Cleanup timeout on unmount
    }
  }, [showMessage]);


  return (
    <VStack spacing={6} align="center" width="100%" position="relative" height="600px">
      {/* Display result message */}
      {showMessage && <MessageDisplay message={resultMessage} />}

      {/* Player Cards */}
      {animatedPlayerCards.map((card, index) => (
        <AnimatedCard
          key={`player-${index}`}
          endX={-150 + index * 20}
          endY={130}
          imagePath={`/cards/${card}.png`}
        />
      ))}
      {/* Erasing Player Cards */}
      {erasedPlayerCards.map((erasedCard, index) => (
        <ErasingCard
          key={`erased-player-${index}`}
          imagePath={`/cards/${erasedCard.card}.png`}
          startX={erasedCard.endX}
          startY={erasedCard.endY}
        />
      ))}
      {/* Dealer Cards */}
      {animatedDealerCards.map((card, index) => {
        return (
          <AnimatedCard
            key={`dealer-${index}`}
            endX={150 + index * 20}
            endY={130}
            imagePath={`/cards/${card}.png`}
          />
        );
      })}

      {/* Erasing Dealer Cards */}
      {erasedDealerCards.map((erasedCard, index) => (
        <ErasingCard
          key={`erased-dealer-${index}`}
          imagePath={`/cards/${erasedCard.card}.png`}
          startX={erasedCard.endX}
          startY={erasedCard.endY}
        />
      ))}
    </VStack>
  );
};

export default DisplayHands;
