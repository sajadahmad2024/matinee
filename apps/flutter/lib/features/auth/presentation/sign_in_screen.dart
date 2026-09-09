import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:matinee/app/router/app_routes.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/di/service_locator.dart';
import 'package:matinee/features/auth/data/auth_repository.dart';
import 'package:matinee/features/auth/data/models/dial_code.dart';
import 'package:matinee/features/auth/presentation/auth_validators.dart';
import 'package:matinee/features/auth/presentation/cubit/auth_cubit.dart';
import 'package:matinee/features/auth/presentation/cubit/auth_state.dart';
import 'package:matinee/features/auth/presentation/widgets/auth_field.dart';
import 'package:matinee/features/auth/presentation/widgets/auth_flow_listener.dart';
import 'package:matinee/features/auth/presentation/widgets/auth_heading.dart';
import 'package:matinee/features/auth/presentation/widgets/auth_labelled_divider.dart';
import 'package:matinee/features/auth/presentation/widgets/auth_legal_text.dart';
import 'package:matinee/features/auth/presentation/widgets/auth_scaffold.dart';
import 'package:matinee/features/auth/presentation/widgets/auth_social_button.dart';
import 'package:matinee/features/auth/presentation/widgets/auth_submit_button.dart';
import 'package:matinee/features/auth/presentation/widgets/dial_code_picker.dart';
import 'package:matinee/l10n/gen/app_localizations.dart';
import 'package:url_launcher/url_launcher.dart';

///
/// PLACEHOLDER. Both legal documents point here until the real pages exist.
///
const String _legalDocumentUrl = 'https://google.com';

///
/// The four-colour Google mark. Multi-colour marks ship as SVG so they stay
/// crisp at any size and keep the brand's exact colours; the icon font covers
/// the single-colour glyphs.
///
const String _googleMarkAsset = 'assets/icons/google.svg';

///
/// The localised country name for an ISO code. A switch rather than a map so a
/// country added to the menu without a string fails to compile.
///
String countryNameOf(AppLocalizations l10n, String countryCode) {
  return switch (countryCode) {
    'IN' => l10n.authCountryIN,
    'US' => l10n.authCountryUS,
    'GB' => l10n.authCountryGB,
    'AU' => l10n.authCountryAU,
    'SG' => l10n.authCountrySG,
    'AE' => l10n.authCountryAE,
    _ => countryCode,
  };
}

class SignInScreen extends StatelessWidget {
  const SignInScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => AuthCubit(getIt<AuthRepository>()),
      child: const SignInView(),
    );
  }
}

@visibleForTesting
class SignInView extends StatefulWidget {
  const SignInView({super.key});

  @override
  State<SignInView> createState() => _SignInViewState();
}

class _SignInViewState extends State<SignInView> {
  final TextEditingController _phone = TextEditingController();

  DialCode _dialCode = DialCodes.india;

  ///
  /// The number the code actually went to. The field stays editable while the
  /// request is in flight, so the verify screen has to be handed the number
  /// that was sent rather than whatever the field holds when the reply lands.
  ///
  String _requestedNumber = '';

  ///
  /// The dialling code the request went out under, held for the same reason as
  /// the number itself.
  ///
  DialCode _requestedDialCode = DialCodes.india;

  @override
  void dispose() {
    _phone.dispose();
    super.dispose();
  }

  ///
  /// Opens the legal document. The failure a launch can report is a platform
  /// one, so it is left to the global net rather than caught into a message
  /// the user could do nothing with.
  ///
  Future<void> _openLegalDocument() async {
    await launchUrl(Uri.parse(_legalDocumentUrl), mode: LaunchMode.externalApplication);
  }

  void _submit() {
    final phoneNumber = _phone.text.trim();
    if (AuthValidators.phoneNumber(phoneNumber, context.l10n, digits: _dialCode.digits) != null) {
      return;
    }
    _requestedNumber = phoneNumber;
    _requestedDialCode = _dialCode;
    unawaited(context.read<AuthCubit>().requestOtp('${_dialCode.code}$phoneNumber'));
  }

  ///
  /// Switching country changes how long a valid number is, so the field starts
  /// again rather than carrying a number that belonged to the old code.
  ///
  void _onDialCodeChanged(DialCode dialCode) {
    setState(() {
      _dialCode = dialCode;
      _phone.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return AuthFlowListener(
      onSuccess: (_) => VerifyOtpRoute(
        dialCode: _requestedDialCode.code.replaceFirst('+', ''),
        phoneNumber: _requestedNumber,
      ).go(context),
      child: AuthScaffold(
        title: l10n.authSignInHeader,
        footer: AuthLegalText(
          onTermsTap: () => unawaited(_openLegalDocument()),
          onPrivacyTap: () => unawaited(_openLegalDocument()),
          // The markers go back in unchanged so the sentence stays one
          // translatable unit and the widget can style the two names.
          sentence: l10n.authLegal('{terms}', '{privacy}'),
          termsLabel: l10n.authLegalTerms,
          privacyLabel: l10n.authLegalPrivacy,
        ),
        children: [
          AuthHeading(title: l10n.authSignInTitle, subtitle: l10n.authSignInSubtitle),
          AuthField(
            // Rebuilt from scratch per country so an error raised against the
            // old country's length does not outlive the switch.
            key: ValueKey(_dialCode.countryCode),
            label: l10n.authPhoneLabel,
            hintText: l10n.authPhoneHint,
            controller: _phone,
            validator: (value) => AuthValidators.phoneNumber(value, l10n, digits: _dialCode.digits),
            keyboardType: TextInputType.phone,
            inputFormatters: [
              FilteringTextInputFormatter.digitsOnly,
              LengthLimitingTextInputFormatter(_dialCode.digits),
            ],
            textInputAction: TextInputAction.done,
            autofillHints: const [AutofillHints.telephoneNumberNational],
            leading: DialCodePicker(
              value: _dialCode,
              onChanged: _onDialCodeChanged,
              tooltip: l10n.authDialCodeLabel,
              sheetTitle: l10n.authDialCodeSheetTitle,
              countryName: (countryCode) => countryNameOf(l10n, countryCode),
            ),
            onSubmitted: _submit,
          ),
          ListenableBuilder(
            listenable: _phone,
            builder: (context, _) => BlocBuilder<AuthCubit, AuthState>(
              builder: (context, state) => AuthSubmitButton(
                label: l10n.authGetOtp,
                isLoading: state is AuthLoading,
                onPressed: AuthValidators.phoneNumber(_phone.text, l10n, digits: _dialCode.digits) == null
                    ? _submit
                    : null,
              ),
            ),
          ),
          AuthLabelledDivider(label: l10n.authDividerLabel),
          Column(
            spacing: AppSpacing.md,
            children: [
              // No provider SDK is wired up, so the mocked social paths land
              // where a verified provider account would: straight at the name
              // step, skipping the code.
              AuthSocialButton(
                icon: SvgPicture.asset(
                  _googleMarkAsset,
                  width: AppIconSize.md,
                  height: AppIconSize.md,
                  excludeFromSemantics: true,
                ),
                label: l10n.authContinueWithGoogle,
                onPressed: () => const CreateAccountRoute().go(context),
              ),
              AuthSocialButton(
                icon: const Icon(Icons.apple),
                label: l10n.authContinueWithApple,
                onPressed: () => const CreateAccountRoute().go(context),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
