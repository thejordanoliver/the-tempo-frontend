import React from "react";
import { StyleSheet, View } from "react-native";
import DraftNewsList from "./DraftNewsList";

type Props = {
  active?: boolean;
  safeYear: string;
  league: string;
};

export default function DraftNewsTab({
  safeYear,
  league,
  active = true,
}: Props) {
  return (
    <View style={styles.container}>
      <DraftNewsList year={safeYear} league={league} active={active} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
