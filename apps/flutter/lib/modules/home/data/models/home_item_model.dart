library;

import '../../domain/entities/home_item.dart';

/// Data model for home items used in the data layer.
///
/// Responsible for serialization and mapping to/from the [HomeItem] entity.
class HomeItemModel {
  /// Unique identifier for the item.
  final String id;

  /// Display title for the item.
  final String title;

  /// Optional description text.
  final String? description;

  /// Create a [HomeItemModel].
  const HomeItemModel({
    required this.id,
    required this.title,
    this.description,
  });

  /// Create model from JSON map.
  factory HomeItemModel.fromJson(Map<String, dynamic> json) {
    return HomeItemModel(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
    );
  }

  /// Convert to JSON map.
  Map<String, dynamic> toJson() => <String, dynamic>{
        'id': id,
        'title': title,
        'description': description,
      };

  /// Convert this model to the domain [HomeItem] entity.
  HomeItem toEntity() {
    return HomeItem(
      id: id,
      title: title,
      description: description,
    );
  }

  /// Create from domain [HomeItem] entity.
  factory HomeItemModel.fromEntity(HomeItem entity) {
    return HomeItemModel(
      id: entity.id,
      title: entity.title,
      description: entity.description,
    );
  }
}

