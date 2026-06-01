library;

import '../repositories/auth_repository.dart';
import '../../../../core/usecases/usecase.dart';

/// Use case for user logout
///
/// Handles user sign out and clears authentication data.
/// Uses [NoParams] as it doesn't require any input.
class Logout implements UseCase<void, NoParams> {
  final AuthRepository repository;

  Logout(this.repository);

  @override
  Future<void> call(NoParams params) async {
    return repository.signOut();
  }
}
