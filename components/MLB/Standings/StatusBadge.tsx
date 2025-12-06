// StatusBadge.tsx
import React from "react";
import { View, Text } from "react-native";

type StatusBadgeProps = {
  code?: string | null;
  clinchedConference?: boolean; // <--- add this
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ code, clinchedConference }) => {
  return (
    <View
      style={{
        paddingHorizontal: 4,
        paddingVertical: 2,
        backgroundColor: clinchedConference ? "gold" : "gray",
        borderRadius: 4,
        marginLeft: 4,
      }}
    >
      <Text style={{ fontSize: 10, fontWeight: "bold", color: "#000" }}>
        {clinchedConference ? "C" : code}
      </Text>
    </View>
  );
};
