import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

class OptimizedImage extends StatelessWidget {
  final String imageUrl;
  final double? width;
  final double? height;
  final BoxFit fit;
  final Widget? placeholder;
  final Widget? errorWidget;

  const OptimizedImage({
    Key? key,
    required this.imageUrl,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
    this.placeholder,
    this.errorWidget,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return CachedNetworkImage(
      imageUrl: imageUrl,
      width: width,
      height: height,
      fit: fit,

      // Memory cache optimization
      memCacheWidth: width != null ? (width! * 2).toInt() : null,
      memCacheHeight: height != null ? (height! * 2).toInt() : null,

      // Disk cache optimization
      maxWidthDiskCache: 800,
      maxHeightDiskCache: 800,

      // Placeholder
      placeholder: (context, url) =>
          placeholder ??
          const Center(child: CircularProgressIndicator(strokeWidth: 2)),

      // Error widget
      errorWidget: (context, url, error) =>
          errorWidget ?? Icon(Icons.error_outline, color: Colors.grey[400]),
    );
  }
}

// Avatar variant
class OptimizedAvatar extends StatelessWidget {
  final String imageUrl;
  final double radius;

  const OptimizedAvatar({Key? key, required this.imageUrl, this.radius = 20})
    : super(key: key);

  @override
  Widget build(BuildContext context) {
    return CircleAvatar(
      radius: radius,
      child: ClipOval(
        child: OptimizedImage(
          imageUrl: imageUrl,
          width: radius * 2,
          height: radius * 2,
          fit: BoxFit.cover,
        ),
      ),
    );
  }
}
