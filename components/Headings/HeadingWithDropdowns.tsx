import { Dropdown } from "components/Dropdown";
import { Colors } from "constants/Styles";
import React from "react";
import { StyleSheet, useColorScheme, View } from "react-native";
import HeadingTwo from "./Heading";

type DropdownOption = {
  label: string;
  value: string;
};

type HeadingWithDropdownsProps = {
  title: string;
  dropdowns?: {
    options: DropdownOption[];
    selectedValue: string;
    onSelect: (value: string) => void;
  }[];
  lighter?: boolean;
};

const HeadingWithDropdowns: React.FC<HeadingWithDropdownsProps> = ({
  title,
  dropdowns = [],
  lighter = false,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View style={styles.container}>
      <HeadingTwo style={styles.heading} lighter={lighter}>
        {title}
      </HeadingTwo>

      {dropdowns.length > 0 && (
        <View style={styles.dropdownRow}>
          {dropdowns.slice(0, 2).map((d, i) => (
            <Dropdown
              key={i}
              options={d.options}
              selectedValue={d.selectedValue}
              onSelect={d.onSelect}
              isDark={isDark}
              style={i === 1 ? { marginLeft: 8 } : undefined}
              absolute={false} // ⚡ normal flow for alignment
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.midTone,
    paddingBottom: 8,
    marginBottom: 12,
  },
  heading: {
    flexShrink: 1, // allow wrapping on small screens
  },
  dropdownRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default HeadingWithDropdowns;
