import React from "react";
import { Text } from "@chakra-ui/react";

const MessageDisplay = React.memo(({ message }: { message: string }) => (
  <Text
    fontSize="3xl"
    fontWeight="bold"
    textAlign="center"
    bg="blue.500"
    color="white"
    borderRadius="md"
    px={8}
    py={4}
    position="absolute"
    top="10px"
    left="52%"
    transform="translateX(-50%)"
    zIndex={0}
    whiteSpace="nowrap"
    maxWidth="300px"
    overflow="hidden"
    textOverflow="ellipsis"
    boxShadow="lg"
  >
    {message}
  </Text>
));

MessageDisplay.displayName = "MessageDisplay";

export default MessageDisplay;
