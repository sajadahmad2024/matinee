import 'package:flutter_test/flutter_test.dart';
import 'test_helpers/test_env.dart';
import 'test_helpers/test_injection_container.dart';
import 'test_helpers/test_app_wrapper.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUpAll(() async {
    await initTestEnvironment();
    await initTestDependencies(); // your GetIt reset/no-op registrations
  });

  testWidgets('app boots in test environment', (tester) async {
    await tester.pumpWidget(const TestAppWrapper());
    await tester.pump();
    expect(true, isTrue);
  });
}
