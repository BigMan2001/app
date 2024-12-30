'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '../solana/solana-provider'
import { AppHero } from '../ui/ui-layout'
import WalletContextProvider from '@/contexts/WalletContextProvider'
import { PlayerStateProvider } from '@/contexts/PlayerStateProvider'
import PageStruct from './blackjack-page-struct'
import { SessionStateProvider } from '@/contexts/SessionStateProvider'
import SessionProvider from '@/contexts/SessionProvider'

// Chakra UI (if using it) 
import { Box } from '@chakra-ui/react'

export default function BlackJackFeature() {
  const { publicKey } = useWallet();

  return (
    <WalletContextProvider>
      <SessionProvider>
        <PlayerStateProvider>
          <SessionStateProvider>
            <Box
              minH="100vh"
              w="100vw"
              bgImage="url('/table-1.jpg')"
              bgSize="cover"
              bgPosition="center"
              bgRepeat="no-repeat"
              display="flex"
              justifyContent="center"
              alignItems="center"
              overflow="hidden"
            >
              {publicKey ? (
                <AppHero title="" subtitle="">
                  <PageStruct />
                </AppHero>
              ) : (
                <div className="max-w-4xl mx-auto">
                  <div className="hero py-[64px]">
                    <div className="hero-content text-center">
                      <WalletButton />
                    </div>
                  </div>
                </div>
              )}
            </Box>
          </SessionStateProvider>
        </PlayerStateProvider>
      </SessionProvider>
    </WalletContextProvider>
  );
}
