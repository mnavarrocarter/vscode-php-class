'use strict';
import { commands, workspace, ExtensionContext, Uri, window } from 'vscode';
import { Composer } from './composer';
import { CreateClassCommand } from './commands';
import ComposerPhpFileWriter from './composer/writer';

export function activate(context: ExtensionContext) {   

    const openedFolders = workspace.workspaceFolders;
    if (!openedFolders) {
        // If there are not any folders opened in vs code, we don't load anything.
        return;
    }
    const vsCodeFs = workspace.fs;
    
    const rootUri = openedFolders[0].uri;
    const composerUri = Uri.joinPath(rootUri, 'composer.json');

    const composer = new Composer(vsCodeFs, composerUri);
    const fileWriter = new ComposerPhpFileWriter(vsCodeFs, composer);
    const command  = new CreateClassCommand(vsCodeFs, composer, fileWriter);

    const clearCahe = (uri: Uri) => {
        if (uri.toString() === composerUri.toString()) {
            window.showInformationMessage('Changes in composer.json detected. Rebuilding namespace information.')
            composer.rebuildCache();
        }
    };

    const watcher = workspace.createFileSystemWatcher('**/*.json');

    context.subscriptions.push(commands.registerCommand(
        'extension.createClass', args => command.run(args)
    ));
    context.subscriptions.push(watcher.onDidChange(clearCahe));
    context.subscriptions.push(watcher.onDidDelete(clearCahe));
    context.subscriptions.push(watcher);
}

export function deactivate() {;
    // TODO: Register decativation
}
