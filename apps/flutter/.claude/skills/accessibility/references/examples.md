# Accessibility — Extended Examples

Detailed code examples for each accessibility category. Every snippet was analyzed with `flutter analyze --fatal-infos` on Flutter 3.47. Colours come from `Theme.of(context).colorScheme` and strings are shown as literals only for brevity; production widgets use `context.l10n`.

`SemanticsRole` and `SemanticsService` need `import 'package:flutter/semantics.dart'`.

---

## Semantics & Screen Reader — Extended Examples

### Custom Semantics for Complex Widgets

A rating bar that provides a single semantic description instead of exposing individual star icons.

```dart
class AccessibleRatingBar extends StatelessWidget {
  const AccessibleRatingBar({required this.rating, required this.maxRating, super.key});

  final int rating;
  final int maxRating;

  @override
  Widget build(BuildContext context) {
    final color = Theme.of(context).colorScheme.primary;
    return Semantics(
      label: 'Rating: $rating out of $maxRating stars',
      child: ExcludeSemantics(
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: List.generate(
            maxRating,
            (index) => Icon(index < rating ? Icons.star : Icons.star_border, color: color),
          ),
        ),
      ),
    );
  }
}
```

### Status Updates with Roles

`SemanticsRole.status` is a polite live region and `SemanticsRole.alert` an assertive one. Setting `liveRegion: true` on the same node is an assertion failure.

```dart
enum UploadStatus { idle, uploading, success, error }

class UploadStatusIndicator extends StatelessWidget {
  const UploadStatusIndicator({required this.status, super.key});

  final UploadStatus status;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final icon = switch (status) {
      UploadStatus.idle => const SizedBox.shrink(),
      UploadStatus.uploading => const SizedBox(
        width: 16,
        height: 16,
        child: CircularProgressIndicator(strokeWidth: 2),
      ),
      UploadStatus.success => Icon(Icons.check_circle, color: scheme.primary),
      UploadStatus.error => Icon(Icons.error, color: scheme.error),
    };
    final label = switch (status) {
      UploadStatus.idle => '',
      UploadStatus.uploading => 'Uploading',
      UploadStatus.success => 'Upload complete',
      UploadStatus.error => 'Upload failed',
    };

    // The status role is a polite live region; alert is the assertive one.
    // Do not add liveRegion: true on top of either role.
    return Semantics(
      role: status == UploadStatus.error ? SemanticsRole.alert : SemanticsRole.status,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        spacing: 8,
        children: [icon, Text(label)],
      ),
    );
  }
}
```

### One-off Announcement (Fallback Only)

`SemanticsService.announce` is deprecated since Flutter 3.35. Prefer a live region; use the replacement only where the platform supports announcements.

```dart
Future<void> announce(BuildContext context, String message) async {
  // TalkBack on Android 14+ ignores announcements; prefer a live region and
  // fall back to a one-off announcement only where the platform supports it.
  if (!MediaQuery.supportsAnnounceOf(context)) {
    return;
  }
  await SemanticsService.sendAnnouncement(View.of(context), message, Directionality.of(context));
}
```

### Headings

```dart
class SectionHeading extends StatelessWidget {
  const SectionHeading(this.text, {super.key});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      header: true,
      headingLevel: 2,
      child: Text(text, style: Theme.of(context).textTheme.titleMedium),
    );
  }
}
```

---

## Target Sizes — Extended Examples

### Expanding Small Icons to Meet the 48 dp Baseline

```dart
class AccessibleTapTarget extends StatelessWidget {
  const AccessibleTapTarget({
    required this.onTap,
    required this.semanticLabel,
    required this.child,
    super.key,
  });

  final VoidCallback onTap;
  final String semanticLabel;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: semanticLabel,
      button: true,
      child: InkWell(
        onTap: onTap,
        child: ConstrainedBox(
          constraints: const BoxConstraints(minWidth: 48, minHeight: 48),
          child: Center(child: child),
        ),
      ),
    );
  }
}

// Usage
AccessibleTapTarget(
  onTap: _onClose,
  semanticLabel: 'Close dialog',
  child: const Icon(Icons.close, size: 16),
)
```

---

## Focus & Keyboard — Extended Examples

### Custom Focus Traversal for a Form

`autofillHints` satisfies 1.3.5 Identify Input Purpose and, with paste allowed, 3.3.8 Accessible Authentication.

```dart
class AccessibleForm extends StatelessWidget {
  const AccessibleForm({super.key});

  @override
  Widget build(BuildContext context) {
    return FocusTraversalGroup(
      policy: OrderedTraversalPolicy(),
      child: Column(
        spacing: 16,
        children: [
          FocusTraversalOrder(
            order: const NumericFocusOrder(1),
            child: TextFormField(
              decoration: const InputDecoration(labelText: 'Email'),
              keyboardType: TextInputType.emailAddress,
              autofillHints: const [AutofillHints.email],
              textInputAction: TextInputAction.next,
            ),
          ),
          FocusTraversalOrder(
            order: const NumericFocusOrder(2),
            child: TextFormField(
              decoration: const InputDecoration(labelText: 'Password'),
              obscureText: true,
              autofillHints: const [AutofillHints.password],
              textInputAction: TextInputAction.done,
            ),
          ),
          FocusTraversalOrder(
            order: const NumericFocusOrder(3),
            child: FilledButton(onPressed: () {}, child: const Text('Sign in')),
          ),
        ],
      ),
    );
  }
}
```

### Drag Alternatives

A `ReorderableListView` or `Dismissible` needs a single-pointer alternative (2.5.7). Give each item an overflow menu with "Move up", "Move down" and "Remove" actions that call the same callbacks the drag handlers use. `Slider` already exposes keyboard steps.

---

## Color Contrast — Extended Examples

### Verifying the Theme

The theme is generated from `docs/design/` and is not overridden per widget. Contrast is verified, not hand-tuned: pump the screen with the real theme and run `textContrastGuideline` (see [testing.md](testing.md)). A failure goes to the **Material Theming** skill as a token change.

### Status Indicators Without Color Dependency

```dart
enum TaskStatus { pending, active, complete, error }

class AccessibleStatusBadge extends StatelessWidget {
  const AccessibleStatusBadge({required this.status, super.key});

  final TaskStatus status;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final (icon, label, color) = switch (status) {
      TaskStatus.pending => (Icons.hourglass_empty, 'Pending', scheme.onSurfaceVariant),
      TaskStatus.active => (Icons.play_circle, 'Active', scheme.primary),
      TaskStatus.complete => (Icons.check_circle, 'Complete', scheme.tertiary),
      TaskStatus.error => (Icons.error, 'Error', scheme.error),
    };

    // Colour is never the only signal; the icon and label always render.
    return Row(
      mainAxisSize: MainAxisSize.min,
      spacing: 4,
      children: [
        Icon(icon, color: color, size: 20),
        Text(label),
      ],
    );
  }
}
```

### High Contrast Setting

```dart
class HighContrastAwareDivider extends StatelessWidget {
  const HighContrastAwareDivider({super.key});

  @override
  Widget build(BuildContext context) {
    // Thicken hairlines when the OS high-contrast setting is on.
    final thickness = MediaQuery.highContrastOf(context) ? 2.0 : 1.0;
    return Divider(thickness: thickness);
  }
}
```

---

## Text Scaling — Extended Examples

### Adaptive Card Layout

```dart
class AdaptiveInfoCard extends StatelessWidget {
  const AdaptiveInfoCard({required this.title, required this.description, super.key});

  final String title;
  final String description;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          spacing: 8,
          children: [
            // No fixed height anywhere: text grows with the user's scale factor.
            Text(title, style: textTheme.titleMedium),
            Text(description, style: textTheme.bodyMedium),
          ],
        ),
      ),
    );
  }
}
```

---

## Animation & Motion — Extended Examples

### Route Transition Respecting Reduced Motion

The app navigates with typed `go_router` routes, so the transition decision lives in `buildPage`.

```dart
class DetailsRoute extends GoRouteData {
  const DetailsRoute();

  @override
  Page<void> buildPage(BuildContext context, GoRouterState state) {
    // Skip the route transition entirely when the user asked for reduced motion.
    if (MediaQuery.disableAnimationsOf(context)) {
      return const NoTransitionPage<void>(child: DetailsScreen());
    }
    return const MaterialPage<void>(child: DetailsScreen());
  }
}
```

### Hero Animation with Reduced-Motion Support

```dart
class AccessibleHero extends StatelessWidget {
  const AccessibleHero({required this.tag, required this.child, super.key});

  final Object tag;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    if (MediaQuery.disableAnimationsOf(context)) {
      return child;
    }
    return Hero(tag: tag, child: child);
  }
}
```

---

## Web — Enabling the Semantics Tree

On web the semantics tree is off until requested. Without this call a screen reader sees an empty canvas until the user finds Flutter's hidden "Enable accessibility" button. Call it once during bootstrap and keep the handle for the life of the app.

```dart
final SemanticsHandle semanticsHandle = SemanticsBinding.instance.ensureSemantics();
```
