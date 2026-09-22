import 'package:bloc_test/bloc_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:matinee/features/rewards/data/models/exclusive_content.dart';
import 'package:matinee/features/rewards/presentation/cubit/exclusive_library_cubit.dart';
import 'package:matinee/features/rewards/presentation/cubit/exclusive_library_state.dart';
import 'package:matinee/features/rewards/presentation/exclusive_library_screen.dart';
import 'package:matinee/features/rewards/presentation/widgets/exclusive_tile.dart';
import 'package:mocktail/mocktail.dart';

import '../../../helpers/helpers.dart';

class _MockExclusiveLibraryCubit extends MockCubit<ExclusiveLibraryState> implements ExclusiveLibraryCubit {}

class _MockGoRouter extends Mock implements GoRouter {}

void main() {
  group(ExclusiveLibraryView, () {
    late ExclusiveLibraryCubit cubit;
    late _MockGoRouter router;

    const locked = ExclusiveItem(
      id: 'ex-2',
      title: 'BTS Video',
      category: 'Horror',
      unlockCost: 500,
      preview: 'Behind the scenes.',
      castAndCrew: 'Christopher Nolan',
      imageAsset: 'assets/images/exclusive-1.jpg',
    );
    const unlocked = ExclusiveItem(
      id: 'ex-1',
      title: 'Night Shift',
      category: 'Thriller',
      unlockCost: 500,
      preview: 'Behind the scenes.',
      castAndCrew: 'Christopher Nolan',
      imageAsset: 'assets/images/exclusive-1.jpg',
      isUnlocked: true,
    );
    const library = ExclusiveLibrary(
      filters: ['Recommended', 'Horror'],
      selectedFilter: 'Recommended',
      items: [unlocked, locked],
    );

    setUp(() {
      cubit = _MockExclusiveLibraryCubit();
      router = _MockGoRouter();
      when(() => cubit.selectFilter(any())).thenAnswer((_) async {});
    });

    Future<void> pumpView(WidgetTester tester) {
      tester.view.physicalSize = const Size(1170, 2532);
      tester.view.devicePixelRatio = 3;
      addTearDown(tester.view.reset);
      return tester.pumpApp(
        InheritedGoRouter(
          goRouter: router,
          child: BlocProvider<ExclusiveLibraryCubit>.value(
            value: cubit,
            child: const ExclusiveLibraryView(),
          ),
        ),
      );
    }

    group('renders', () {
      testWidgets('a tile per item and a chip per filter', (tester) async {
        when(() => cubit.state).thenReturn(const ExclusiveLibraryState.success(library));
        await pumpView(tester);

        expect(find.byType(ExclusiveTile), findsNWidgets(2));
        expect(find.text('Recommended'), findsOneWidget);
        expect(find.text('Horror'), findsOneWidget);
      });
    });

    group('calls selectFilter', () {
      testWidgets('when another chip is tapped', (tester) async {
        when(() => cubit.state).thenReturn(const ExclusiveLibraryState.success(library));
        await pumpView(tester);

        await tester.tap(find.text('Horror'));
        await tester.pump();

        verify(() => cubit.selectFilter('Horror')).called(1);
      });
    });

    group('navigates', () {
      testWidgets('to the unlock screen from a locked tile', (tester) async {
        when(() => cubit.state).thenReturn(const ExclusiveLibraryState.success(library));
        when(() => router.push<void>(any())).thenAnswer((_) async {});
        await pumpView(tester);

        await tester.tap(find.byType(ExclusiveTile).last);
        await tester.pump();

        verify(() => router.push<void>('/rewards/exclusive/ex-2/unlock')).called(1);
      });

      testWidgets('nowhere from an unlocked tile, which has no player yet', (tester) async {
        when(() => cubit.state).thenReturn(const ExclusiveLibraryState.success(library));
        await pumpView(tester);

        await tester.tap(find.byType(ExclusiveTile).first);
        await tester.pump();

        verifyNever(() => router.push<void>(any()));
      });
    });
  });
}
