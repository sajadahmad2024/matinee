///
/// A remaining span as the design's clock, zero-padded to two digits a field.
///
/// Hours can run past a day, so they are not taken modulo 24.
///
String clockLabel(Duration remaining) {
  String pad(int value) => value.toString().padLeft(2, '0');
  return '${pad(remaining.inHours)}:'
      '${pad(remaining.inMinutes % Duration.minutesPerHour)}:'
      '${pad(remaining.inSeconds % Duration.secondsPerMinute)}';
}
