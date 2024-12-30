import { createContext, useContext, useEffect, useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  SessionData,
  SESSION_SEED,
  useAnchorProvider,
  getTwentyOneProgram,
  derivePDA,
} from "@/Utils/anchor";
import toast from "react-hot-toast";

const SessionStateContext = createContext<{
  sessionDataPDA: PublicKey | null;
  sessionState: SessionData | null;
  setSessionState: React.Dispatch<React.SetStateAction<SessionData | null>>;
  setSessionData: React.Dispatch<React.SetStateAction<PublicKey | null>>;
}>({
  sessionDataPDA: null,
  sessionState: null,
  setSessionState: () => {},
  setSessionData: () => {},
});

export const useSessionState = () => useContext(SessionStateContext);

export const SessionStateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Get cluster
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const provider = useAnchorProvider();
  var program = getTwentyOneProgram(provider);

  const [sessionDataPDA, setSessionData] = useState<PublicKey | null>(null);
  const [sessionState, setSessionState] = useState<SessionData | null>(null);

  useEffect(() => {
    setSessionState(null);
    if (!publicKey) {
      return;
    }
    
    const pda = derivePDA(SESSION_SEED, program.programId, publicKey);

    setSessionData(pda);

    program.account.sessionData
      .fetch(pda)
      .then((data) => {
        setSessionState(data);
      })
      .catch((error) => {
        // window.alert("No session data found, please initialize session account!");
      });

    connection.onAccountChange(pda, (account) => {
      const newSessionData = program.coder.accounts.decode("sessionData", account.data);
      setSessionState(newSessionData);
    });
  }, [publicKey]);

  
  return (
    <SessionStateContext.Provider
      value={{
        sessionDataPDA,
        sessionState: sessionState,
        setSessionState,
        setSessionData,
      }}
    >
      {children}
    </SessionStateContext.Provider>
  );
};

export async function checkSessionAccount(
  connection: Connection,
  sessionDataPDA: PublicKey | null
): Promise<boolean> {
  if (!sessionDataPDA) return false;

  try {
    const accountInfo = await connection.getAccountInfo(sessionDataPDA);

    if (!accountInfo) {
      toast.error("Session account no longer exists!");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to check session account existence:", error);
    toast.error("An error occurred while checking the session account.");
    return false;
  }
}