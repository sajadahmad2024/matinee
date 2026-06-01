library;

import 'package:equatable/equatable.dart';
import '../entities/user.dart';
import '../repositories/auth_repository.dart';
import '../../../../core/usecases/usecase.dart';

/// Parameters for register use case
class RegisterParams extends Equatable {
  final String email;
  final String password;
  final String name;

  const RegisterParams({
    required this.email,
    required this.password,
    required this.name,
  });

  @override
  List<Object?> get props => [email, password, name];
}

/// Use case for user registration
///
/// Handles new user registration with email, password, and name.
/// Returns the newly created [User] on success.
class Register implements UseCase<User, RegisterParams> {
  final AuthRepository repository;

  Register(this.repository);

  @override
  Future<User> call(RegisterParams params) async {
    return repository.registerWithEmailAndPassword(
      email: params.email,
      password: params.password,
      name: params.name,
    );
  }
}
