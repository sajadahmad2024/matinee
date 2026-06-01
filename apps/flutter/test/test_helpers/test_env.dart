import 'package:flutter_boilerplate/config/environment_config.dart';

Future<void> initTestEnvironment() async {
  // Pick the environment that matches your config setup.
  // Usually `Environment.dev` or `Environment.test` if you have it.
  await EnvironmentConfig.initialize(environment: Environment.dev);

  // If your EnvironmentConfig supports flags, set them for tests:
  // EnvironmentConfig.instance.useFirebase = false;  // only if mutable
}
