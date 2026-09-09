import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:matinee/app/router/app_routes.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/back_disc_button.dart';
import 'package:matinee/di/service_locator.dart';
import 'package:matinee/features/auth/data/auth_repository.dart';
import 'package:matinee/features/auth/data/models/auth_outcome.dart';
import 'package:matinee/features/auth/presentation/auth_validators.dart';
import 'package:matinee/features/auth/presentation/cubit/auth_cubit.dart';
import 'package:matinee/features/auth/presentation/cubit/auth_state.dart';
import 'package:matinee/features/auth/presentation/widgets/auth_flow_listener.dart';
import 'package:matinee/features/auth/presentation/widgets/auth_heading.dart';
import 'package:matinee/features/auth/presentation/widgets/auth_scaffold.dart';
import 'package:matinee/features/auth/presentation/widgets/auth_submit_button.dart';
import 'package:matinee/features/auth/presentation/widgets/otp_input.dart';

class VerifyOtpScreen extends StatelessWidget {
  const VerifyOtpScreen({required this.dialCode, required this.phoneNumber, super.key});

  /// The dialling code without its '+', as the path carries it.
  final String dialCode;

  final String phoneNumber;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => AuthCubit(getIt<AuthRepository>()),
      child: VerifyOtpView(dialCode: dialCode, phoneNumber: phoneNumber),
    );
  }
}

@visibleForTesting
class VerifyOtpView extends StatefulWidget {
  const VerifyOtpView({required this.dialCode, required this.phoneNumber, super.key});

  /// The dialling code without its '+', as the path carries it.
  final String dialCode;

  final String phoneNumber;

  @override
  State<VerifyOtpView> createState() => _VerifyOtpViewState();
}

class _VerifyOtpViewState extends State<VerifyOtpView> {
  ///
  /// How long the resend link stays locked after a code goes out, so a user
  /// cannot spend the whole quota of codes in a few seconds.
  ///
  static const Duration _resendCooldown = Duration(seconds: 60);

  String _code = '';
  Timer? _ticker;
  int _secondsLeft = _resendCooldown.inSeconds;

  @override
  void initState() {
    super.initState();
    _startCooldown();
  }

  @override
  void dispose() {
    _ticker?.cancel();
    super.dispose();
  }

  void _startCooldown() {
    _ticker?.cancel();
    setState(() => _secondsLeft = _resendCooldown.inSeconds);
    _ticker = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsLeft <= 1) {
        timer.cancel();
      }
      setState(() => _secondsLeft = _secondsLeft - 1);
    });
  }

  bool get _isComplete => AuthValidators.otp(_code, context.l10n) == null;

  ///
  /// The row submits itself the moment it fills up, so a correction typed
  /// while the first attempt is still running must not start a second one.
  ///
  void _submit() {
    final cubit = context.read<AuthCubit>();
    if (!_isComplete || cubit.state is AuthLoading) {
      return;
    }
    unawaited(cubit.verifyOtp(phoneNumber: '+${widget.dialCode}${widget.phoneNumber}', code: _code));
  }

  void _resend() {
    final cubit = context.read<AuthCubit>();
    if (cubit.state is AuthLoading) {
      return;
    }
    unawaited(cubit.requestOtp('+${widget.dialCode}${widget.phoneNumber}'));
  }

  String get _dialledNumber => '+${widget.dialCode} ${groupedNumber(widget.phoneNumber)}';

  void _onOutcome(AuthOutcome outcome) {
    switch (outcome) {
      case AuthOutcome.otpVerified:
        const CreateAccountRoute().go(context);
      case AuthOutcome.otpSent:
        // The cooldown starts from the code that actually went out, so a
        // resend that failed does not lock the link for half a minute.
        _startCooldown();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(context.l10n.authOtpResent)),
        );
      case AuthOutcome.accountCreated:
      case AuthOutcome.subscribed:
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return AuthFlowListener(
      onSuccess: _onOutcome,
      child: AuthScaffold(
        title: l10n.authVerifyHeader,
        leading: BackDiscButton(tooltip: l10n.authBack, onPressed: () => const SignInRoute().go(context)),
        children: [
          AuthHeading(
            title: l10n.authVerifyTitle,
            subtitle: l10n.authVerifySubtitle(AuthValidators.otpLength, _dialledNumber),
            subtitleEmphasis: _dialledNumber,
          ),
          OtpInput(
            length: AuthValidators.otpLength,
            onChanged: (code) => setState(() => _code = code),
            onCompleted: _submit,
          ),
          BlocBuilder<AuthCubit, AuthState>(
            builder: (context, state) => _ResendLink(
              secondsLeft: _secondsLeft,
              onResend: state is AuthLoading ? null : _resend,
            ),
          ),
          BlocBuilder<AuthCubit, AuthState>(
            builder: (context, state) => AuthSubmitButton(
              label: l10n.authContinue,
              isLoading: state is AuthLoading,
              onPressed: _isComplete ? _submit : null,
            ),
          ),
        ],
      ),
    );
  }
}

///
/// The number as the design writes it, in two five-digit groups. Lengths the
/// grouping does not divide are left as they came.
///
String groupedNumber(String phoneNumber) {
  const groupSize = 5;
  if (phoneNumber.length != groupSize * 2) {
    return phoneNumber;
  }
  return '${phoneNumber.substring(0, groupSize)} ${phoneNumber.substring(groupSize)}';
}

class _ResendLink extends StatelessWidget {
  const _ResendLink({required this.secondsLeft, required this.onResend});

  final int secondsLeft;

  /// Null while a code is already on its way.
  final VoidCallback? onResend;

  ///
  /// The remaining wait as m:ss, which is how the design writes it.
  ///
  static String _countdown(int seconds) {
    return '${seconds ~/ 60}:${(seconds % 60).toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final colors = context.appColors;
    if (secondsLeft > 0) {
      final countdown = '${_countdown(secondsLeft)}s';
      final base = Theme.of(context).textTheme.bodySmall?.copyWith(color: colors.auth.onSurfaceVariant);
      return Text.rich(
        TextSpan(
          children: emphasise(l10n.authOtpResendIn(countdown), countdown, base?.copyWith(color: colors.text.link)),
        ),
        textAlign: TextAlign.center,
        style: base,
      );
    }
    return Center(
      child: TextButton(onPressed: onResend, child: Text(l10n.authOtpResend)),
    );
  }
}
