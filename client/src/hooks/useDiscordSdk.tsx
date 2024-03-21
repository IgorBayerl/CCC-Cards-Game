'use client'

import { useState, useEffect } from 'react';
import { type DiscordSDK } from '@discord/embedded-app-sdk';
import { useSearchParams } from 'next/navigation'
import isRunningInDiscord from '~/lib/isDiscord';

function useDiscordSdk() {
  const [discordSdk, setDiscordSdk] = useState<DiscordSDK | null>(null);
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!isRunningInDiscord()) return

    const discordSdkClientId = '1219394178379681842';

    const loadDiscordSDK = async () => {
      const DiscordSDK = (await import('@discord/embedded-app-sdk')).DiscordSDK;
      const sdk = new DiscordSDK(discordSdkClientId);
      setDiscordSdk(sdk);
    };

    void loadDiscordSDK()
  }, [searchParams]);

  return discordSdk;
}

export default useDiscordSdk;
