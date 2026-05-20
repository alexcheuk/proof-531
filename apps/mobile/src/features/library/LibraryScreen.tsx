import { Caps } from '@/design/primitives/Caps';
import { Card } from '@/design/primitives/Card';
import { Text } from '@/design/primitives/Text';
import { colors, shape } from '@/design/tokens';
import { ScrollView, View } from 'react-native';
import { CATEGORY_LABEL, CATEGORY_ORDER, LIBRARY, type LibraryItem } from './library-data';

/**
 * Per-category accent dot color. Mirrors `ASSISTANCE_COLOR` from
 * `design-reference/screens-main.jsx:599`. All token names verified to
 * exist in `src/design/tokens.ts`.
 */
const CATEGORY_COLOR: Record<LibraryItem['category'], string> = {
  push: colors.hot,
  pull: colors.lime,
  legs: colors.ice,
  core: colors.amber,
};

function slugify(name: string): string {
  return name.replace(/\s+/g, '-').toLowerCase();
}

function formatReps(reps: LibraryItem['defaultReps']): string {
  return typeof reps === 'number' ? String(reps) : reps;
}

export function LibraryScreen() {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg0 }}
      contentContainerStyle={{ padding: shape.rLg, gap: shape.rLg }}
      testID="library-screen"
    >
      <View style={{ gap: shape.rXs }}>
        <Caps>50-100 reps each</Caps>
        <Text variant="title">Library</Text>
      </View>

      {CATEGORY_ORDER.map((cat) => {
        const items = LIBRARY.filter((x) => x.category === cat);
        return (
          <View key={cat} style={{ gap: shape.rSm }}>
            <View
              testID={`library-section-${cat}`}
              style={{ flexDirection: 'row', alignItems: 'center', gap: shape.rSm }}
            >
              <View
                style={{
                  width: shape.rXs,
                  height: shape.rXs,
                  borderRadius: shape.rXs,
                  backgroundColor: CATEGORY_COLOR[cat],
                }}
              />
              <Caps>{CATEGORY_LABEL[cat]}</Caps>
            </View>

            <View style={{ gap: shape.rSm }}>
              {items.map((item) => (
                <Card key={item.name} padded testID={`library-item-${slugify(item.name)}`}>
                  <View style={{ gap: shape.rXs }}>
                    <Text>{item.name}</Text>
                    <Caps>
                      {item.defaultSets} × {formatReps(item.defaultReps)}
                    </Caps>
                  </View>
                </Card>
              ))}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

export default LibraryScreen;
