import {  Text, Flex, Box } from "@chakra-ui/react"
import { useWallet } from "@solana/wallet-adapter-react"
import { usePlayerState } from "@/contexts/PlayerStateProvider"
import { getTwentyOneProgram, useAnchorProvider } from "@/Utils/anchor"
import { ellipsify } from "../../ui/ui-layout"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"
import { ExplorerLink } from "../../cluster/cluster-ui"

const DisplayPlayerState = () => {
  // Hook for fetching publickey for sending transaction using connected wallet
  const { publicKey } = useWallet()
  
  const provider = useAnchorProvider();
  var program = getTwentyOneProgram(provider);
  // Custom hook for fetching PlayerData from context
  const { playerState, playerDataPDA } = usePlayerState()

  if (!playerState || !playerDataPDA || !publicKey) return null;

  const stats = [
    { label: "Balance", value: `${(Number(playerState.balance) / LAMPORTS_PER_SOL).toFixed(3)} SOL` },
    {
      label: "Account ID",
      value: (
        <ExplorerLink
          path={`account/${playerDataPDA.toBase58()}`}
          label={ellipsify(playerDataPDA.toBase58())}
        />
      ),
    },
    { 
      label: "Authority", 
      value: (
        <ExplorerLink
          path={`account/${playerState.authority.toBase58()}`}
          label={ellipsify(playerState.authority.toBase58())}
        />
      ),
    },
    { label: "Total Winnings", value: `${(Number(playerState.totalWinnings) / LAMPORTS_PER_SOL).toFixed(3)} SOL` },
    { label: "Total Losses", value: `${(Number(playerState.totalLosses) / LAMPORTS_PER_SOL).toFixed(3)} SOL` },
    { label: "Wins", value: Number(playerState.wins)},
    { label: "Draws", value: Number(playerState.draws) },
    { label: "Losses", value: Number(playerState.loses)},
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
        <Flex direction="row" align="center" h="100%" gap={7}>
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
    </>
  );
}

export default DisplayPlayerState
