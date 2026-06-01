library;

import '../entities/user.dart';
import '../repositories/auth_repository.dart';
import '../../../../core/usecases/usecase.dart';

/// Use case for getting the current authenticated user
///
/// Retrieves the currently logged-in user from the repository.
/// Uses [NoParams] as it doesn't require any input.
class GetCurrentUser implements UseCase<User?, NoParams> {
  final AuthRepository repository;

  GetCurrentUser(this.repository);

  @override
  Future<User?> call(NoParams params) async {
    return repository.getCurrentUser();
  }
}
