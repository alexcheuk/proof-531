import type { ReactNode } from 'react';
import Svg, { Circle, Line, Path, Polygon, Polyline, Rect } from 'react-native-svg';
import { colors } from '../tokens';

type GlyphRenderer = (color: string, stroke: number) => ReactNode;

const strokeProps = (color: string, stroke: number) => ({
  fill: 'none' as const,
  stroke: color,
  strokeWidth: stroke,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

const fillProps = (color: string) => ({
  fill: color,
  stroke: 'none' as const,
});

export const ICONS = {
  check: (c, s) => <Polyline points="20 6 9 17 4 12" {...strokeProps(c, s)} />,
  x: (c, s) => (
    <>
      <Line x1="18" y1="6" x2="6" y2="18" {...strokeProps(c, s)} />
      <Line x1="6" y1="6" x2="18" y2="18" {...strokeProps(c, s)} />
    </>
  ),
  'arrow-right': (c, s) => (
    <>
      <Line x1="5" y1="12" x2="19" y2="12" {...strokeProps(c, s)} />
      <Polyline points="12 5 19 12 12 19" {...strokeProps(c, s)} />
    </>
  ),
  'arrow-left': (c, s) => (
    <>
      <Line x1="19" y1="12" x2="5" y2="12" {...strokeProps(c, s)} />
      <Polyline points="12 19 5 12 12 5" {...strokeProps(c, s)} />
    </>
  ),
  'arrow-up': (c, s) => (
    <>
      <Line x1="12" y1="19" x2="12" y2="5" {...strokeProps(c, s)} />
      <Polyline points="5 12 12 5 19 12" {...strokeProps(c, s)} />
    </>
  ),
  plus: (c, s) => (
    <>
      <Line x1="12" y1="5" x2="12" y2="19" {...strokeProps(c, s)} />
      <Line x1="5" y1="12" x2="19" y2="12" {...strokeProps(c, s)} />
    </>
  ),
  minus: (c, s) => <Line x1="5" y1="12" x2="19" y2="12" {...strokeProps(c, s)} />,
  play: (c) => <Polygon points="6 4 20 12 6 20" {...fillProps(c)} />,
  pause: (c, s) => (
    <>
      <Rect x="6" y="4" width="4" height="16" {...strokeProps(c, s)} />
      <Rect x="14" y="4" width="4" height="16" {...strokeProps(c, s)} />
    </>
  ),
  flame: (c, s) => (
    <Path
      d="M14 12c-.6-2-2-3-2-6 0-1.5 1-3 1-3-3 1-7 4-7 9 0 3.3 2.7 6 6 6s6-2.7 6-6c0-2-1-3.5-2-5"
      {...strokeProps(c, s)}
    />
  ),
  'chevron-down': (c, s) => <Polyline points="6 9 12 15 18 9" {...strokeProps(c, s)} />,
  'chevron-right': (c, s) => <Polyline points="9 6 15 12 9 18" {...strokeProps(c, s)} />,
  circle: (c, s) => <Circle cx="12" cy="12" r="9" {...strokeProps(c, s)} />,
  dot: (c) => <Circle cx="12" cy="12" r="3" {...fillProps(c)} />,
  home: (c, s) => (
    <Path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1z" {...strokeProps(c, s)} />
  ),
  dumbbell: (c, s) => (
    <>
      <Path d="M6 5v14M3 8v8M21 8v8M18 5v14" {...strokeProps(c, s)} />
      <Line x1="6" y1="12" x2="18" y2="12" {...strokeProps(c, s)} />
    </>
  ),
  calendar: (c, s) => (
    <>
      <Rect x="3" y="5" width="18" height="16" rx="2" {...strokeProps(c, s)} />
      <Line x1="3" y1="10" x2="21" y2="10" {...strokeProps(c, s)} />
      <Line x1="8" y1="3" x2="8" y2="7" {...strokeProps(c, s)} />
      <Line x1="16" y1="3" x2="16" y2="7" {...strokeProps(c, s)} />
    </>
  ),
  history: (c, s) => (
    <>
      <Circle cx="12" cy="12" r="9" {...strokeProps(c, s)} />
      <Polyline points="12 7 12 12 15 14" {...strokeProps(c, s)} />
    </>
  ),
  settings: (c, s) => (
    <>
      <Circle cx="12" cy="12" r="3" {...strokeProps(c, s)} />
      <Path
        d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4.9a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.5a7 7 0 0 0-2 1.2l-2.4-.9-2 3.4 2 1.6A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-.9a7 7 0 0 0 2 1.2L10 21h4l.5-2.5a7 7 0 0 0 2-1.2l2.4.9 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z"
        {...strokeProps(c, s)}
      />
    </>
  ),
  'trending-up': (c, s) => (
    <>
      <Polyline points="3 17 9 11 13 15 21 7" {...strokeProps(c, s)} />
      <Polyline points="14 7 21 7 21 14" {...strokeProps(c, s)} />
    </>
  ),
  menu: (c, s) => (
    <>
      <Line x1="4" y1="7" x2="20" y2="7" {...strokeProps(c, s)} />
      <Line x1="4" y1="12" x2="20" y2="12" {...strokeProps(c, s)} />
      <Line x1="4" y1="17" x2="20" y2="17" {...strokeProps(c, s)} />
    </>
  ),
  note: (c, s) => (
    <>
      <Path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z" {...strokeProps(c, s)} />
      <Polyline points="14 3 14 9 20 9" {...strokeProps(c, s)} />
    </>
  ),
  timer: (c, s) => (
    <>
      <Circle cx="12" cy="13" r="8" {...strokeProps(c, s)} />
      <Polyline points="12 9 12 13 14 15" {...strokeProps(c, s)} />
      <Line x1="9" y1="3" x2="15" y2="3" {...strokeProps(c, s)} />
    </>
  ),
  edit: (c, s) => (
    <>
      <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" {...strokeProps(c, s)} />
      <Path d="M18.5 2.5a2.1 2.1 0 113 3L12 15l-4 1 1-4z" {...strokeProps(c, s)} />
    </>
  ),
  list: (c, s) => (
    <>
      <Line x1="8" y1="6" x2="21" y2="6" {...strokeProps(c, s)} />
      <Line x1="8" y1="12" x2="21" y2="12" {...strokeProps(c, s)} />
      <Line x1="8" y1="18" x2="21" y2="18" {...strokeProps(c, s)} />
      <Circle cx="4" cy="6" r="1" {...strokeProps(c, s)} />
      <Circle cx="4" cy="12" r="1" {...strokeProps(c, s)} />
      <Circle cx="4" cy="18" r="1" {...strokeProps(c, s)} />
    </>
  ),
  trophy: (c, s) => (
    <Path
      d="M8 21h8M12 17v4M17 4H7v6a5 5 0 0010 0zM17 4h3v3a3 3 0 01-3 3M7 4H4v3a3 3 0 003 3"
      {...strokeProps(c, s)}
    />
  ),
  lightning: (c, s) => (
    <Polygon points="13 2 4 14 11 14 10 22 19 10 12 10" {...strokeProps(c, s)} />
  ),
} as const satisfies Record<string, GlyphRenderer>;

export type IconName = keyof typeof ICONS;

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  stroke?: number;
}

export function Icon({ name, size = 24, color = colors.ink0, stroke = 1.6 }: IconProps) {
  const render = ICONS[name];
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      accessibilityRole="image"
      accessibilityLabel={name}
    >
      {render(color, stroke)}
    </Svg>
  );
}

export const ICON_NAMES = Object.keys(ICONS) as IconName[];

export default Icon;
