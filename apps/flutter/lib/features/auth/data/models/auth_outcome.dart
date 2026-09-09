///
/// Which step of the flow a successful call completed. One cubit serves all
/// four auth screens, so the outcome is what tells a screen the success it is
/// listening for is its own and not, say, a resent code.
///
enum AuthOutcome { otpSent, otpVerified, accountCreated, subscribed }
