import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_boilerplate/core/services/localization/l10n/app_localizations.dart';
import 'package:flutter_boilerplate/modules/home/presentation/bloc/home_bloc.dart';
import 'package:flutter_boilerplate/modules/home/presentation/bloc/home_event.dart';
import 'package:flutter_boilerplate/modules/home/presentation/bloc/home_state.dart';

/// Home page that displays a simple counter using [HomeBloc].
///
/// This widget is part of the presentation layer and demonstrates
/// how to connect a BLoC to a screen without any data layer calls.
class MyHomePage extends StatelessWidget {
  const MyHomePage({super.key, required this.title});

  /// Title shown in the app bar.
  final String title;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text(title),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Text(l10n.hello),
            const Text('You have pushed the button this many times:'),
            BlocBuilder<HomeBloc, HomeState>(
              builder: (context, state) {
                return Text(
                  '${state.counter}',
                  style: Theme.of(context).textTheme.headlineMedium,
                );
              },
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          context.read<HomeBloc>().add(const HomeCounterIncrementRequested());
        },
        tooltip: 'Increment',
        child: const Icon(Icons.add),
      ),
    );
  }
}
