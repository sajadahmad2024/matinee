import 'package:flutter_boilerplate/modules/auth/domain/entities/user.dart';
import 'package:flutter_boilerplate/modules/auth/data/models/user_model.dart';

class UserBuilder {
  String _id = '1';
  String _email = 'test@example.com';
  String _name = 'Test User';

  UserBuilder withId(String id) {
    _id = id;
    return this;
  }

  UserBuilder withEmail(String email) {
    _email = email;
    return this;
  }

  UserBuilder withName(String name) {
    _name = name;
    return this;
  }

  User build() {
    return User(id: _id, email: _email, name: _name, createdAt: DateTime.now());
  }

  UserModel buildModel() {
    return UserModel(
      id: _id,
      email: _email,
      name: _name,
      createdAt: DateTime.now(),
    );
  }
}

// Usage:
// final user = UserBuilder()
//   .withEmail('john@example.com')
//   .withName('John Doe')
//   .build();
