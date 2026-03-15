import Svg, { Circle, Path } from "react-native-svg";

interface TennisBallProps {
  size?: number;
  color?: string;
}

export function TennisBall({ size = 64, color = "#00BFFF" }: TennisBallProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Circle cx="32" cy="32" r="30" fill={color} />
      <Path
        d="M18 8C22 20 22 44 18 56"
        stroke="rgba(0,0,0,0.3)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M46 8C42 20 42 44 46 56"
        stroke="rgba(0,0,0,0.3)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}
