import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:matinee/core/l10n/app_exception_l10n.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/responsive/responsive.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/back_disc_button.dart';
import 'package:matinee/core/widgets/error_view.dart';
import 'package:matinee/di/service_locator.dart';
import 'package:matinee/features/profile/data/models/profile.dart';
import 'package:matinee/features/profile/data/profile_repository.dart';
import 'package:matinee/features/profile/presentation/cubit/profile_cubit.dart';
import 'package:matinee/features/profile/presentation/cubit/profile_state.dart';
import 'package:matinee/features/profile/presentation/profile_validators.dart';
import 'package:matinee/features/profile/presentation/widgets/profile_avatar.dart';
import 'package:matinee/features/profile/presentation/widgets/profile_field.dart';

class EditProfileScreen extends StatelessWidget {
  const EditProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) {
        final cubit = ProfileCubit(getIt<ProfileRepository>());
        unawaited(cubit.load());
        return cubit;
      },
      child: const EditProfileView(),
    );
  }
}

@visibleForTesting
class EditProfileView extends StatefulWidget {
  const EditProfileView({super.key});

  @override
  State<EditProfileView> createState() => _EditProfileViewState();
}

class _EditProfileViewState extends State<EditProfileView> {
  ///
  /// The profile the form was built from, kept once it arrives. A save emits
  /// loading and then success or failure, and rebuilding the body on any of
  /// those would throw away what the user typed.
  ///
  Profile? _loaded;

  @override
  void initState() {
    super.initState();
    // The listener below only fires on a change, so a cubit that already holds
    // a profile when this screen mounts would never hand one over.
    final state = context.read<ProfileCubit>().state;
    if (state is ProfileSuccess) {
      _loaded = state.profile;
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: ContentContainer(
          maxWidth: ContentContainer.form,
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.only(
                  left: AppScreenPadding.main,
                  top: AppSpacing.sm,
                  right: AppScreenPadding.main,
                  bottom: AppSpacing.lg,
                ),
                child: Row(
                  spacing: AppSpacing.md,
                  children: [
                    BackDiscButton(
                      tooltip: l10n.authBack,
                      onPressed: Navigator.of(context).pop,
                    ),
                    Expanded(
                      child: Text(
                        l10n.editProfileTitle,
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: BlocConsumer<ProfileCubit, ProfileState>(
                  listenWhen: (previous, current) => current is ProfileSuccess && _loaded == null,
                  listener: (context, state) {
                    setState(() => _loaded = (state as ProfileSuccess).profile);
                  },
                  builder: (context, state) {
                    if (_loaded case final profile?) {
                      return _Form(profile: profile);
                    }
                    return switch (state) {
                      ProfileLoading() => const Center(child: CircularProgressIndicator()),
                      ProfileFailure(:final error) => ErrorView(
                        message: error.localizedMessage(l10n),
                        onRetry: () => unawaited(context.read<ProfileCubit>().load()),
                      ),
                      ProfileInitial() || ProfileSuccess() => const SizedBox.shrink(),
                    };
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Form extends StatefulWidget {
  const _Form({required this.profile});

  final Profile profile;

  @override
  State<_Form> createState() => _FormState();
}

class _FormState extends State<_Form> {
  bool _showErrors = false;

  late final TextEditingController _name = TextEditingController(text: widget.profile.name);
  late final TextEditingController _email = TextEditingController(text: widget.profile.email);
  late final TextEditingController _phone = TextEditingController(text: widget.profile.phoneNumber);

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _phone.dispose();
    super.dispose();
  }

  void _submit() {
    final l10n = context.l10n;
    if (ProfileValidators.name(_name.text, l10n) != null ||
        ProfileValidators.email(_email.text, l10n) != null ||
        ProfileValidators.phoneNumber(_phone.text, l10n) != null) {
      // A value can arrive already invalid, in which case no field has been
      // touched and none would otherwise say why the save did nothing.
      setState(() => _showErrors = true);
      return;
    }
    unawaited(
      context.read<ProfileCubit>().save(
        name: _name.text.trim(),
        email: _email.text.trim(),
        phoneNumber: _phone.text.trim(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final colors = context.appColors;
    return BlocListener<ProfileCubit, ProfileState>(
      listenWhen: (previous, current) => previous is ProfileLoading,
      listener: (context, state) {
        switch (state) {
          case ProfileSuccess():
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(l10n.editProfileSaved)),
            );
            Navigator.of(context).pop();
          case ProfileFailure(:final error):
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(error.localizedMessage(l10n))),
            );
          case ProfileInitial():
          case ProfileLoading():
            break;
        }
      },
      child: SingleChildScrollView(
        padding: EdgeInsets.only(
          left: AppScreenPadding.onboarding,
          right: AppScreenPadding.onboarding,
          bottom: context.bottomInset(AppSpacing.screenBottom),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: ProfileAvatar(
                name: widget.profile.name,
                imageUrl: widget.profile.avatarUrl,
                editBadge: true,
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(top: AppSpacing.xxxl, bottom: AppSpacing.lg),
              child: Text(
                l10n.editProfileAboutYou.toUpperCase(),
                style: AppTextStyle.overline.copyWith(color: colors.text.secondary),
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              spacing: AppSpacing.lg,
              children: [
                ProfileField(
                  label: l10n.editProfileNameLabel,
                  controller: _name,
                  showError: _showErrors,
                  validator: (value) => ProfileValidators.name(value, l10n),
                  textCapitalization: TextCapitalization.words,
                  autofillHints: const [AutofillHints.name],
                ),
                ProfileField(
                  label: l10n.editProfileEmailLabel,
                  controller: _email,
                  showError: _showErrors,
                  validator: (value) => ProfileValidators.email(value, l10n),
                  keyboardType: TextInputType.emailAddress,
                  autofillHints: const [AutofillHints.email],
                ),
                ProfileField(
                  label: l10n.editProfilePhoneLabel,
                  controller: _phone,
                  showError: _showErrors,
                  validator: (value) => ProfileValidators.phoneNumber(value, l10n),
                  keyboardType: TextInputType.phone,
                  textInputAction: TextInputAction.done,
                  autofillHints: const [AutofillHints.telephoneNumber],
                ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.only(top: AppSpacing.xxxl),
              child: BlocBuilder<ProfileCubit, ProfileState>(
                builder: (context, state) => FilledButton(
                  onPressed: state is ProfileLoading ? null : _submit,
                  child: Text(l10n.editProfileSave),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
