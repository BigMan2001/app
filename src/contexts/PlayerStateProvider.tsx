import { createContext, useContext, useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  PlayerData,
  PLAYER_SEED,
  useAnchorProvider,
  getTwentyOneProgram,
  derivePDA,
} from "@/Utils/anchor";

const PlayerStateContext = createContext<{
  playerDataPDA: PublicKey | null;
  playerState: PlayerData | null
}>({
  playerDataPDA: null,
  playerState: null
});

export const usePlayerState = () => useContext(PlayerStateContext);

export const PlayerStateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const provider = useAnchorProvider();
  var program = getTwentyOneProgram(provider);

  const [playerDataPDA, setPlayerData] = useState<PublicKey | null>(null);
  const [playerState, setPlayerState] = useState<PlayerData | null>(null);

  useEffect(() => {
    setPlayerState(null);
    if (!publicKey) {
      return;
    }
    
    const pda = derivePDA(PLAYER_SEED, program.programId, publicKey);
    setPlayerData(pda);

    program.account.playerData
      .fetch(pda)
      .then((data) => {
        setPlayerState(data);
      })
      .catch((error) => {
        // window.alert("No player data found, please initialize player account!");
      });

    connection.onAccountChange(pda, (account) => {
      const newPlayerData = program.coder.accounts.decode("playerData", account.data);
      setPlayerState(newPlayerData);

    });
  }, [publicKey]);

  return (
    <PlayerStateContext.Provider
      value={{
        playerDataPDA,
        playerState: playerState,
      }}
    >
      {children}
    </PlayerStateContext.Provider>
  );
};
