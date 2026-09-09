import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:matinee/core/l10n/app_exception_l10n.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/features/auth/data/models/auth_outcome.dart';
import 'package:matinee/features/auth/presentation/cubit/auth_cubit.dart';
import 'package:matinee/features/auth/presentation/cubit/auth_state.dart';

///
/// Turns the cubit's one-shot outcomes into screen effects.
///
/// The auth screens are forms, not fetches, so a failure surfaces as a message
/// over the form the user already filled in rather than as the ErrorView that
/// would replace it and lose their input.
///
class AuthFlowListener extends StatelessWidget {
  const AuthFlowListener({required this.onSuccess, required this.child, super.key});

  final ValueChanged<AuthOutcome> onSuccess;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthCubit, AuthState>(
      listener: (context, state) {
        switch (state) {
          case AuthSuccess(:final outcome):
            onSuccess(outcome);
          case AuthFailure(:final error):
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(error.localizedMessage(context.l10n))),
            );
          case AuthInitial():
          case AuthLoading():
            break;
        }
      },
      child: child,
    );
  }
}
