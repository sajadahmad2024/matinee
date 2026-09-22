---
paths:
  - "**/test/**/*.dart"
---

# Testing conventions

`bloc_test` and `mocktail` only. Never `mockito`. Every feature ships its cubit test; the failure path is mandatory.

## Structure

- `test/` mirrors `lib/`: `lib/features/orders/presentation/cubit/orders_cubit.dart` is tested by `test/features/orders/presentation/cubit/orders_cubit_test.dart`.
- Top-level `group(TypeName, ...)` for the class, a nested `group('methodName', ...)` per method, one `test` or `blocTest` per behaviour. Concatenated descriptions read as a sentence.
- Type references in names use interpolation: `'throws $NotFoundException when the server returns 404'`, so renames propagate.
- All `setUp`, `tearDown` and `late` declarations live inside a `group`, never at the top level of `main()`. Each test gets fresh instances; no static or top-level mutable state.
- `registerFallbackValue` goes in `setUpAll` inside the group that needs it.

## Mocks

- One private mock class per dependency at the top of the file: `class _MockOrdersRepository extends Mock implements OrdersRepository {}`. Never import a mock from another test file.
- Cubits in widget tests are mocked with `class _MockOrdersCubit extends MockCubit<OrdersState> implements OrdersCubit {}` and provided with `BlocProvider.value`. Real cubits never appear in widget tests.
- Stub with `when(repository.fetch).thenAnswer((_) async => value)`, `thenThrow(const NetworkException())`. Verify with `verify(...).called(1)` only when the call itself is the behaviour under test.

## Cubit tests

```dart
blocTest<OrdersCubit, OrdersState>(
  'emits [loading, failure] when the repository throws an $AppException',
  setUp: () => when(repository.fetch).thenThrow(const NetworkException()),
  build: () => OrdersCubit(repository),
  act: (cubit) => cubit.load(),
  expect: () => const [OrdersState.loading(), OrdersState.failure(NetworkException())],
);
```

States are freezed, so expected states are compared with `==`; use `isA<OrdersFailure>()` only when the payload is not constructible in the test.

## Widget tests

- Wrap with `tester.pumpApp(widget)` from `test/helpers/helpers.dart`; never an inline `MaterialApp`. It provides the theme and localisations.
- Nested groups are named by behaviour: `renders`, `navigates`, `calls <method>`, `updates`.
- Navigation is asserted through a mocked router: `class _MockGoRouter extends Mock implements GoRouter {}`, wrap the widget in `InheritedGoRouter(goRouter: router, child: ...)`, then `verify(() => router.go(const OrdersRoute().location))`.
- Prefer `find.byType`, then `find.text` for user-visible content, `find.byKey` last.
- Test behaviour (what is shown, what is called, where it navigates), not padding or colours. Visual appearance is a golden test, and goldens exist only for reusable design-system components.
- `pump()` after every interaction; `pumpAndSettle()` only when an animation must finish and no indefinite animation is on screen.
- Golden tests are tagged at library level with `@Tags([TestTag.golden])` followed by a bare `library;` directive. `TestTag` lives in `test/helpers/test_tags.dart` and is exported by `helpers.dart`; a raw string tag such as `tags: 'golden'` is a review finding.

## Commands

```bash
flutter test
flutter test test/features/orders
flutter test --tags golden --update-goldens
```
