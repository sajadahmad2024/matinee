import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:matinee/app/router/app_routes.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/widgets/back_disc_button.dart';
import 'package:matinee/di/service_locator.dart';
import 'package:matinee/features/auth/data/auth_repository.dart';
import 'package:matinee/features/auth/presentation/auth_validators.dart';
import 'package:matinee/features/auth/presentation/cubit/auth_cubit.dart';
import 'package:matinee/features/auth/presentation/cubit/auth_state.dart';
import 'package:matinee/features/auth/presentation/widgets/auth_field.dart';
import 'package:matinee/features/auth/presentation/widgets/auth_flow_listener.dart';
import 'package:matinee/features/auth/presentation/widgets/auth_heading.dart';
import 'package:matinee/features/auth/presentation/widgets/auth_scaffold.dart';
import 'package:matinee/features/auth/presentation/widgets/auth_submit_button.dart';

class CreateAccountScreen extends StatelessWidget {
  const CreateAccountScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => AuthCubit(getIt<AuthRepository>()),
      child: const CreateAccountView(),
    );
  }
}

@visibleForTesting
class CreateAccountView extends StatefulWidget {
  const CreateAccountView({super.key});

  @override
  State<CreateAccountView> createState() => _CreateAccountViewState();
}

class _CreateAccountViewState extends State<CreateAccountView> {
  final TextEditingController _name = TextEditingController();
  final TextEditingController _referralCode = TextEditingController();

  @override
  void dispose() {
    _name.dispose();
    _referralCode.dispose();
    super.dispose();
  }

  ///
  /// The keyboard's Done submits as well as the button, so a second press
  /// while the first request is still running must not start another one.
  ///
  void _submit() {
    final l10n = context.l10n;
    final cubit = context.read<AuthCubit>();
    final name = _name.text.trim();
    final referralCode = _referralCode.text.trim();
    if (cubit.state is AuthLoading ||
        AuthValidators.name(name, l10n) != null ||
        AuthValidators.referralCode(referralCode, l10n) != null) {
      return;
    }
    unawaited(
      cubit.createAccount(
        name: name,
        referralCode: referralCode.isEmpty ? null : referralCode,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return AuthFlowListener(
      onSuccess: (_) => const SubscribeRoute().go(context),
      child: AuthScaffold(
        title: l10n.authCreateAccountHeader,
        blockGap: AppSpacing.xxl,
        leading: BackDiscButton(tooltip: l10n.authBack, onPressed: () => const SignInRoute().go(context)),
        // The design lifts this CTA out of the content block and pins it to
        // the bottom of the screen.
        footer: ListenableBuilder(
          listenable: Listenable.merge([_name, _referralCode]),
          builder: (context, _) {
            final isValid =
                AuthValidators.name(_name.text, l10n) == null &&
                AuthValidators.referralCode(_referralCode.text, l10n) == null;
            return BlocBuilder<AuthCubit, AuthState>(
              builder: (context, state) => AuthSubmitButton(
                label: l10n.authCreateAccount,
                isLoading: state is AuthLoading,
                onPressed: isValid ? _submit : null,
              ),
            );
          },
        ),
        children: [
          AuthHeading(title: l10n.authCreateAccountTitle, subtitle: l10n.authCreateAccountSubtitle),
          Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            spacing: AppSpacing.xl,
            children: [
              AuthField(
                label: l10n.authNameLabel,
                hintText: l10n.authNameHint,
                controller: _name,
                validator: (value) => AuthValidators.name(value, l10n),
                textCapitalization: TextCapitalization.words,
                autofillHints: const [AutofillHints.name],
                inputFormatters: [LengthLimitingTextInputFormatter(AuthValidators.nameMaxLength)],
              ),
              AuthField(
                label: l10n.authReferralLabel,
                labelSuffix: l10n.authFieldOptional,
                hintText: l10n.authReferralHint,
                controller: _referralCode,
                validator: (value) => AuthValidators.referralCode(value, l10n),
                textCapitalization: TextCapitalization.characters,
                textInputAction: TextInputAction.done,
                inputFormatters: [
                  LengthLimitingTextInputFormatter(AuthValidators.referralCodeMaxLength),
                ],
                onSubmitted: _submit,
              ),
            ],
          ),
        ],
      ),
    );
  }
}
