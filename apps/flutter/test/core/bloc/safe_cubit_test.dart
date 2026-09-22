import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/bloc/safe_cubit.dart';

class _CounterCubit extends SafeCubit<int> {
  _CounterCubit() : super(0);

  void bump() => emit(state + 1);

  Future<void> bumpAfter(Future<void> work) async {
    await work;
    emit(state + 1);
  }
}

void main() {
  group(SafeCubit, () {
    late _CounterCubit cubit;

    setUp(() => cubit = _CounterCubit());

    group('emit', () {
      test('updates the state before close', () {
        cubit.bump();

        expect(cubit.state, 1);
      });

      test('does not throw after close, and leaves the state as it was', () async {
        cubit.bump();
        await cubit.close();

        expect(cubit.bump, returnsNormally);
        expect(cubit.state, 1);
      });

      test('does not throw when an in-flight future completes after close', () async {
        final inFlight = Future<void>.delayed(Duration.zero);
        final pending = cubit.bumpAfter(inFlight);
        await cubit.close();

        await expectLater(pending, completes);
        expect(cubit.state, 0);
      });
    });
  });
}
