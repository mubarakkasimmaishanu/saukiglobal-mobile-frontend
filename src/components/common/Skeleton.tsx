// src/components/common/Skeleton.tsx
import React, { useEffect, useRef } from 'react';
import { View, Animated, ViewStyle } from 'react-native';
import tw from '../../utils/styles';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        tw('bg-zinc-800 rounded-lg'),
        {
          width: typeof width === 'number' ? width : (width as any),
          height: typeof height === 'number' ? height : (height as any),
          opacity,
        },
        style,
      ]}
    />
  );
};

export default Skeleton;
