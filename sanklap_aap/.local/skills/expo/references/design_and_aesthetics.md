# Design

This is the MOST CRITICAL aspect of mobile app development. Make designs beautiful, not cookie cutter.
Draw inspiration from iOS, Instagram, Airbnb, popular habit trackers, Coinbase.
Mobile designs should feel mobile and clean - use mobile-native design patterns, not web-like designs.

- NEVER use emojis in the application
- BUTTONS: Prefer icon buttons over text buttons (e.g., checkmark icon instead of "Done", X icon instead of "Cancel"). Text buttons often don't render well on mobile. Use @expo/vector-icons for button icons. Do NOT add backgroundColor or borderRadius to icon buttons.

## Frontend Aesthetics

Avoid generic "AI slop" aesthetics - make creative, distinctive frontends that surprise and delight.

Color & Theme:

- Commit to a cohesive aesthetic. Use variables for consistency.
- Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- Avoid clichéd color schemes (particularly purple gradients on white backgrounds).

Motion:

- Use animations for effects and micro-interactions.
- Prioritize react-native-reanimated solutions.
- Focus on high-impact moments: animated elements (progress bars), micro-interactions (button press animations, haptics).

Backgrounds:

- Create atmosphere and depth rather than defaulting to solid colors.
- Layer gradients, use geometric patterns, or add contextual effects.

Avoid:

- Predictable layouts and component patterns
- Cookie-cutter design that lacks context-specific character
- Converging on common choices (Space Grotesk, etc.) - think outside the box

## Icons

- Use @expo/vector-icons for icons (built into Expo)
- Available icon sets: Ionicons, MaterialIcons, Feather, FontAwesome, MaterialCommunityIcons, etc.
- Example:

```tsx
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';

<Ionicons name="home" size={24} color="#000" />
<Feather name="settings" size={24} color="#000" />
<MaterialIcons name="person" size={24} color="#000" />
```

- Browse available icons at: <https://icons.expo.fyi>

## Animations

- Use react-native-reanimated for animations (pre-installed)
- Provides better performance than the basic Animated API
- Note: Layout animations don't work on web
- IMPORTANT - useAnimatedStyle HOOKS RULE:
  - NEVER call useAnimatedStyle inside .map(), .filter(), or any loop
  - NEVER call useAnimatedStyle conditionally (inside if statements)
  - This causes "rendered more hooks than during previous render" error
  - SOLUTION: Extract animated items into separate components

BAD - calling hook inside map:

```tsx
items.map(item => {
  const style = useAnimatedStyle(() => ({}));
  return <Animated.View style={style} />;
})
```

GOOD - extract to component:

```tsx
function AnimatedItem({ item }) {
  const style = useAnimatedStyle(() => ({}));
  return <Animated.View style={style} />;
}
// Then: items.map(item => <AnimatedItem item={item} />)
```
