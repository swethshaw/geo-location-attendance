import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');


const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

/**
 * Scales a size based on the screen's width.
 * Best for horizontal margins, paddings, and widths.
 */
export const scale = (size: number) => (SCREEN_WIDTH / guidelineBaseWidth) * size;

/**
 * Scales a size based on the screen's height.
 * Best for vertical margins, paddings, and heights.
 */
export const verticalScale = (size: number) => (SCREEN_HEIGHT / guidelineBaseHeight) * size;

/**
 * Moderately scales a size. It grows, but not as fast as the screen grows.
 * Best for typography and border radii to prevent them from looking clownishly large on tablets.
 * @param factor Control how much the size should scale (default is 0.5)
 */
export const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

/**
 * Scales font sizes responsively using PixelRatio for accessibility.
 */
export const fontScale = (size: number) => {
  const scaledSize = moderateScale(size);
  return Math.round(PixelRatio.roundToNearestPixel(scaledSize));
};

export const SCREEN = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
};
