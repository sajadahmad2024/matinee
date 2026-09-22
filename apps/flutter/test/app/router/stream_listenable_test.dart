import 'dart:async';

import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/app/router/stream_listenable.dart';

void main() {
  group(StreamListenable, () {
    late StreamController<int> controller;

    setUp(() {
      controller = StreamController<int>();
    });

    tearDown(() async {
      await controller.close();
    });

    test('notifies listeners for every stream event', () async {
      final subject = StreamListenable(controller.stream);
      var notifications = 0;
      subject.addListener(() => notifications++);

      controller
        ..add(1)
        ..add(2);
      await Future<void>.delayed(Duration.zero);

      expect(notifications, 2);
      subject.dispose();
    });
  });
}
