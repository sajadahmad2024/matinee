///
/// Which step of the flow a successful call completed. One cubit serves all
/// four auth screens, so this is what tells a screen the success is its own.
///
enum AuthOutcome { otpSent, otpVerified, accountCreated, subscribed }
