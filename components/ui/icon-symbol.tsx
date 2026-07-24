// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'book.fill': 'book',
  'bookmark.fill': 'bookmark',
  'bell.fill': 'notifications',
  'chevron.left': 'arrow-back',
  'person.fill': 'person',
  'person.3.fill': 'groups',
  'square.grid.2x2.fill': 'dashboard',
  'graduationcap.fill': 'school',
  'books.vertical.fill': 'library-books',
  'megaphone.fill': 'campaign',
  'plus.rectangle.fill': 'note-add',
  'pencil': 'edit',
  'globe': 'public',
  'info.circle.fill': 'info-outline',
  'lock.fill': 'lock',
  'magnifyingglass': 'search',
  'xmark': 'close',
  'checkmark': 'check',
  'chevron.down': 'keyboard-arrow-down',
  'line.3.horizontal.decrease.circle': 'filter-list',
  'chart.bar.fill': 'bar-chart',
  'doc.text.fill': 'description',
  headphones: 'headset',
  'speaker.wave.2.fill': 'volume-up',
  'bubble.left.fill': 'chat-bubble',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'rectangle.portrait.and.arrow.right': 'logout',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
