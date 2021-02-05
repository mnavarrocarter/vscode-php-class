import * as vscode from 'vscode';
import * as writer from 'php-writer';
import * as fs from 'fs';

import TemplatesRepository from '../templatesRepository';

import { getPath } from './helpers';

import PhpClass from '../entities/phpClass';
import PathManager from '../pathManager';
import InputManager from '../inputManager';

export function run(
    templatesRepository: TemplatesRepository,
    pathManager: PathManager,
    inputManager: InputManager,
    args: any
) {
    const template = templatesRepository.findByName('PHPClass');
    const phpClass = new PhpClass(new writer(template));

    getPath(args && args.fsPath).then(async (targetFolder: string) => {

        const namespace = pathManager.resolveNamespace(targetFolder);
        const realNamespace = namespace.getRealNamespace(targetFolder);

        const name = await inputManager.getInput(inputManager.getNamingOptions(realNamespace));
        
        if (!name) {
            return;
        }

        // We prepare the default path based on the namespace.
        const filename = namespace.filenameForType(name);
        if (fs.existsSync(filename)) {
            vscode.window.showErrorMessage('File with name "' + filename + '" already exists.');
            return;
        }

        let parent = await inputManager.getInput({ prompt: 'Extends' });
        let interfaces = '';

        if (parent === undefined) {
            parent = '';
        } else { 
            interfaces = await inputManager.getInput({ prompt: 'Implements' }) || '';
        }

        

        phpClass
            .setName(name)
            .setExtends(parent)
            .setImplements(interfaces)
            .save(filename);
            
        const textDocument = await vscode.workspace.openTextDocument(filename);
        const editor = vscode.window.showTextDocument(textDocument);
    });
}
