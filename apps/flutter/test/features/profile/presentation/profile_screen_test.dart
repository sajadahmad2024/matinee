import 'package:bloc_test/bloc_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/core/widgets/error_view.dart';
import 'package:matinee/features/profile/data/models/profile.dart';
import 'package:matinee/features/profile/presentation/cubit/profile_cubit.dart';
import 'package:matinee/features/profile/presentation/cubit/profile_state.dart';
import 'package:matinee/features/profile/presentation/profile_screen.dart';
import 'package:matinee/features/profile/presentation/widgets/profile_avatar.dart';
import 'package:matinee/features/profile/presentation/widgets/profile_menu_row.dart';
import 'package:matinee/features/profile/presentation/widgets/profile_stat_card.dart';
import 'package:mocktail/mocktail.dart';

import '../../../helpers/helpers.dart';

class _MockProfileCubit extends MockCubit<ProfileState> implements ProfileCubit {}

void main() {
  group(ProfileView, () {
    late ProfileCubit cubit;

    final profile = Profile(
      name: 'Sarah Smith',
      email: 'sarah.smith@example.com',
      phoneNumber: '+91 98765 43210',
      totalPoints: 2500,
      streaks: 257,
      rank: 260,
      referralCode: 'CH8362',
      planName: 'Pro plan',
      planExpiresOn: DateTime.utc(2026, 6, 30),
    );

    setUp(() => cubit = _MockProfileCubit());

    Future<void> pumpView(WidgetTester tester) {
      tester.view.physicalSize = const Size(1170, 2532);
      tester.view.devicePixelRatio = 3;
      addTearDown(tester.view.reset);
      return tester.pumpApp(
        BlocProvider<ProfileCubit>.value(value: cubit, child: const ProfileView()),
      );
    }

    testWidgets('lifts the avatar to the height the frame draws it at', (tester) async {
      // The frame puts the avatar 72 below the status bar, the header row and
      // its 24 of clearance. A gap above the bell's own 48 tap target pushed
      // everything 16 lower than that.
      when(() => cubit.state).thenReturn(ProfileState.success(profile));
      tester.view.physicalSize = const Size(1170, 2532);
      tester.view.devicePixelRatio = 3;
      addTearDown(tester.view.reset);
      await tester.pumpApp(
        MediaQuery(
          data: const MediaQueryData(padding: EdgeInsets.only(top: 44)),
          child: BlocProvider<ProfileCubit>.value(value: cubit, child: const ProfileView()),
        ),
      );

      expect(tester.getRect(find.byType(ProfileAvatar)).top - 44, 72);
    });

    group('renders', () {
      testWidgets('the three counters and the full menu once loaded', (tester) async {
        when(() => cubit.state).thenReturn(ProfileState.success(profile));
        await pumpView(tester);

        expect(find.byType(ProfileStatCard), findsNWidgets(3));
        expect(find.byType(ProfileMenuRow), findsNWidgets(6));
      });

      testWidgets('the counters with a thousands separator, as the design writes them', (tester) async {
        when(() => cubit.state).thenReturn(ProfileState.success(profile));
        await pumpView(tester);

        expect(find.text('2,500'), findsOneWidget);
        expect(find.text('#260'), findsOneWidget);
      });

      testWidgets('an $ErrorView when the profile could not be fetched', (tester) async {
        when(() => cubit.state).thenReturn(const ProfileState.failure(NetworkException()));
        await pumpView(tester);

        expect(find.byType(ErrorView), findsOneWidget);
      });

      testWidgets('a spinner while the profile is on its way', (tester) async {
        when(() => cubit.state).thenReturn(const ProfileState.loading());
        await pumpView(tester);

        expect(find.byType(CircularProgressIndicator), findsOneWidget);
      });
    });

    group('leaves inert', () {
      testWidgets('the rows whose screens do not exist yet', (tester) async {
        when(() => cubit.state).thenReturn(ProfileState.success(profile));
        await pumpView(tester);

        List<ProfileMenuRow> rowsWhere(bool Function(ProfileMenuRow row) test) =>
            tester.widgetList<ProfileMenuRow>(find.byType(ProfileMenuRow)).where(test).toList();

        // My Earns, Notifications and Logout have nowhere to go for now.
        expect(rowsWhere((row) => row.onTap == null), hasLength(3));
        expect(rowsWhere((row) => row.onTap != null), hasLength(3));
      });
    });
  });
}
