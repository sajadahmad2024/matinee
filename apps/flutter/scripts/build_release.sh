echo "🏗️  Building optimized release..."

# Android
flutter build appbundle \
  --release \
  --obfuscate \
  --split-debug-info=./debug-info/android

# iOS
flutter build ipa \
  --release \
  --obfuscate \
  --split-debug-info=./debug-info/ios

echo "✅ Build complete!"