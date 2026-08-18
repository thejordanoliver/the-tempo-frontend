import React from "react";
import { StyleSheet, View } from "react-native";
import DraftNewsList from "./DraftNewsList";

type Props = {
  safeYear: string;
  league: string;
};

export default function DraftNewsTab({ safeYear, league }: Props) {
  return (
    <View style={styles.container}>
      <DraftNewsList year={safeYear} league={league} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
