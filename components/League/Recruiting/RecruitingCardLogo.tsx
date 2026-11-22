import { useEffect, useState, type ReactNode } from "react";
import { Animated, Easing, View } from "react-native";
import { sportsCardBackgroundStyles } from "styles/SportsCardBackgroundStyles";

function AnimatedLogo({
  index,
  children,
}: {
  index: number;
  children: ReactNode;
}) {
  const [slideX] = useState(() => new Animated.Value(70));
  const [fade] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const config = {
      duration: 650,
      delay: index * 60,
      useNativeDriver: true,
      isInteraction: false,
    };
    const animation = Animated.parallel([
      Animated.timing(slideX, {
        ...config,
        toValue: 0,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(fade, {
        ...config,
        toValue: 1,
        easing: Easing.out(Easing.ease),
      }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [fade, index, slideX]);

  return (
    <Animated.View
      style={[
        sportsCardBackgroundStyles.logoContainer,
        { opacity: fade, transform: [{ translateX: slideX }] },
      ]}
    >
      {children}
    </Animated.View>
  );
}

export default function RecruitingCardLogo({
  animationIndex,
  children,
}: {
  animationIndex?: number;
  children: ReactNode;
}) {
  if (animationIndex === undefined) {
    return (
      <View style={sportsCardBackgroundStyles.logoContainer}>{children}</View>
    );
  }

  return <AnimatedLogo index={animationIndex}>{children}</AnimatedLogo>;
}
