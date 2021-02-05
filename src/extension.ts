'use strict';
import { commands, workspace, ExtensionContext, Uri } from 'vscode';
import { Composer, ComposerNamespaceResolver } from './composer';
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
    const nsResolver = new ComposerNamespaceResolver(rootUri, composer);
    const fileWriter = new ComposerPhpFileWriter(vsCodeFs, composer);
    const command  = new CreateClassCommand(vsCodeFs, nsResolver, fileWriter);

    context.subscriptions.push(commands.registerCommand(
        'extension.createClass', args => command.run(args)
    ));
}

export function deactivate() {;
    // TODO: Register decativation
}
