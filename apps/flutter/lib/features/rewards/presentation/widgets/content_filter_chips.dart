import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_spacing.dart';

///
/// The scrolling filter row above the exclusive-content grid. Chip colours,
/// shape and padding come from the chip theme.
///
class ContentFilterChips extends StatelessWidget {
  const ContentFilterChips({
    required this.filters,
    required this.selected,
    required this.onSelected,
    super.key,
  });

  final List<String> filters;
  final String selected;
  final ValueChanged<String> onSelected;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: AppScreenPadding.main),
      child: Row(
        spacing: AppSpacing.chipGap,
        children: [
          for (final filter in filters)
            ChoiceChip(
              label: Text(filter),
              selected: filter == selected,
              onSelected: (_) => onSelected(filter),
            ),
        ],
      ),
    );
  }
}
