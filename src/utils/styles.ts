// src/utils/styles.ts
import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { COLORS } from '../constants/theme';

type Styles = ViewStyle & TextStyle & ImageStyle;

const staticStyles: Record<string, Styles> = {
  // Flex
  'flex-1': { flex: 1 },
  'flex-row': { flexDirection: 'row' },
  'flex-col': { flexDirection: 'column' },
  'flex-wrap': { flexWrap: 'wrap' },
  
  // Align items
  'items-center': { alignItems: 'center' },
  'items-start': { alignItems: 'flex-start' },
  'items-end': { alignItems: 'flex-end' },
  'items-stretch': { alignItems: 'stretch' },
  
  // Justify Content
  'justify-center': { justifyContent: 'center' },
  'justify-between': { justifyContent: 'space-between' },
  'justify-start': { justifyContent: 'flex-start' },
  'justify-end': { justifyContent: 'flex-end' },
  'justify-around': { justifyContent: 'space-around' },
  
  // Text Align
  'text-center': { textAlign: 'center' },
  'text-left': { textAlign: 'left' },
  'text-right': { textAlign: 'right' },
  
  // Font Weights
  'font-bold': { fontWeight: 'bold' },
  'font-semibold': { fontWeight: '600' },
  'font-medium': { fontWeight: '500' },
  'font-normal': { fontWeight: 'normal' },
  'font-light': { fontWeight: '300' },

  // Background Colors
  'bg-background': { backgroundColor: COLORS.background },
  'bg-surface': { backgroundColor: COLORS.surface },
  'bg-primary': { backgroundColor: COLORS.primary },
  'bg-primaryDark': { backgroundColor: COLORS.primaryDark },
  'bg-error': { backgroundColor: COLORS.error },
  'bg-warning': { backgroundColor: COLORS.warning },
  'bg-black': { backgroundColor: '#000000' },
  'bg-white': { backgroundColor: '#ffffff' },
  'bg-zinc-800': { backgroundColor: '#27272a' },
  'bg-transparent': { backgroundColor: 'transparent' },

  // Text Colors
  'text-primary': { color: COLORS.primary },
  'text-textHigh': { color: COLORS.textHigh },
  'text-textMuted': { color: COLORS.textMuted },
  'text-error': { color: COLORS.error },
  'text-warning': { color: COLORS.warning },
  'text-white': { color: '#ffffff' },
  'text-black': { color: '#000000' },
  
  // Font Sizes
  'text-xs': { fontSize: 12 },
  'text-sm': { fontSize: 14 },
  'text-base': { fontSize: 16 },
  'text-lg': { fontSize: 18 },
  'text-xl': { fontSize: 20 },
  'text-2xl': { fontSize: 24 },
  'text-3xl': { fontSize: 30 },

  // Self alignments
  'self-center': { alignSelf: 'center' },
  'self-stretch': { alignSelf: 'stretch' },
  'self-start': { alignSelf: 'flex-start' },
  'self-end': { alignSelf: 'flex-end' },

  // Borders
  'border': { borderWidth: 1, borderColor: COLORS.border },
  'border-2': { borderWidth: 2, borderColor: COLORS.border },
  'border-b': { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  'border-t': { borderTopWidth: 1, borderTopColor: COLORS.border },
  'border-primary': { borderColor: COLORS.primary },
  'border-primaryDark': { borderColor: COLORS.primaryDark },
  'border-error': { borderColor: COLORS.error },
  'border-warning': { borderColor: COLORS.warning },
  'border-transparent': { borderColor: 'transparent' },
  
  // Width & Height utilities
  'w-full': { width: '100%' },
  'w-1/2': { width: '50%' },
  'w-1/3': { width: '33.333333%' },
  'w-2/3': { width: '66.666667%' },
  'w-1/4': { width: '25%' },
  'w-3/4': { width: '75%' },
  'h-full': { height: '100%' },
  
  // Display
  'overflow-hidden': { overflow: 'hidden' },
  'position-absolute': { position: 'absolute' },
};

const cache: Record<string, Styles> = {};

// Tailwind Utility Compiler
export const tw = (...classes: (string | undefined | null | false | Record<string, boolean>)[]): Styles => {
  const classList: string[] = [];

  for (const c of classes) {
    if (!c) continue;
    if (typeof c === 'string') {
      classList.push(...c.split(/\s+/));
    } else if (typeof c === 'object') {
      for (const [key, value] of Object.entries(c)) {
        if (value) {
          classList.push(...key.split(/\s+/));
        }
      }
    }
  }

  const cacheKey = classList.sort().join(' ');
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  let merged: Styles = {};

  for (const cls of classList) {
    if (!cls) continue;

    // Check static lookup first
    if (staticStyles[cls]) {
      merged = { ...merged, ...staticStyles[cls] };
      continue;
    }

    // Dynamic pattern processing

    // Padding (p, px, py, pt, pb, pl, pr)
    let m = cls.match(/^(p[xytrbl]?)-(\d+)$/);
    if (m) {
      const type = m[1];
      const val = parseInt(m[2], 10) * 4;
      const mapping: Record<string, Styles> = {
        p: { padding: val },
        px: { paddingHorizontal: val },
        py: { paddingVertical: val },
        pt: { paddingTop: val },
        pb: { paddingBottom: val },
        pl: { paddingLeft: val },
        pr: { paddingRight: val },
      };
      merged = { ...merged, ...mapping[type] };
      continue;
    }

    // Margin (m, mx, my, mt, mb, ml, mr)
    m = cls.match(/^(m[xytrbl]?)-(\d+)$/);
    if (m) {
      const type = m[1];
      const val = parseInt(m[2], 10) * 4;
      const mapping: Record<string, Styles> = {
        m: { margin: val },
        mx: { marginHorizontal: val },
        my: { marginVertical: val },
        mt: { marginTop: val },
        mb: { marginBottom: val },
        ml: { marginLeft: val },
        mr: { marginRight: val },
      };
      merged = { ...merged, ...mapping[type] };
      continue;
    }

    // Border Radius (rounded, rounded-sm, rounded-md, etc.)
    m = cls.match(/^rounded-(sm|md|lg|xl|2xl|3xl|full)$/);
    if (m) {
      const size = m[1];
      const mapping: Record<string, number> = {
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
        '2xl': 24,
        '3xl': 32,
        full: 9999,
      };
      merged = { ...merged, borderRadius: mapping[size] };
      continue;
    }
    if (cls === 'rounded') {
      merged = { ...merged, borderRadius: 4 };
      continue;
    }

    // Width (w-N)
    m = cls.match(/^w-(\d+)$/);
    if (m) {
      merged = { ...merged, width: parseInt(m[1], 10) * 4 };
      continue;
    }

    // Height (h-N)
    m = cls.match(/^h-(\d+)$/);
    if (m) {
      merged = { ...merged, height: parseInt(m[1], 10) * 4 };
      continue;
    }

    // Gap (gap-N)
    m = cls.match(/^gap-(\d+)$/);
    if (m) {
      merged = { ...merged, gap: parseInt(m[1], 10) * 4 };
      continue;
    }

    // Opacity (opacity-N)
    m = cls.match(/^opacity-(\d+)$/);
    if (m) {
      merged = { ...merged, opacity: parseInt(m[1], 10) / 100 };
      continue;
    }
  }

  cache[cacheKey] = merged;
  return merged;
};

export default tw;
