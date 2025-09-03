"use client"

import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"
import { useEffect, useState } from "react";

export function Provider(props: ColorModeProviderProps) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
       // this forces a rerender
      setHydrated(true)
  }, [])

  if (!hydrated) {
      // this returns null on first render, so the client and server match
      return null
  } 

  return (
    <ChakraProvider value={defaultSystem}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  )
}

