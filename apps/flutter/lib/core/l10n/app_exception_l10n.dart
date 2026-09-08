import 'package:template/core/error/app_exception.dart';
import 'package:template/l10n/gen/app_localizations.dart';

///
/// The one mapping from a failure to the sentence the user reads. Feature
/// screens call this instead of composing their own error text.
///
extension AppExceptionL10n on AppException {
  String localizedMessage(AppLocalizations l10n) => switch (this) {
    NetworkException() => l10n.errorNetwork,
    CancelledException() => l10n.errorCancelled,
    AuthException() => l10n.errorAuth,
    NotFoundException() => l10n.errorNotFound,
    ValidationException(:final message) => message ?? l10n.errorValidation,
    ServerException() => l10n.errorServer,
  };
}
