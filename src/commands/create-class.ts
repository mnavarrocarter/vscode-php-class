import { FileSystem, window, workspace, Uri } from 'vscode';
import { PhpFileWriter } from "../writer";
import { Composer } from "../composer";

export default class CreateClassCommand
{
    private fs: FileSystem;
    private composer: Composer;
    private writer: PhpFileWriter;
    
    public constructor(fs: FileSystem, composer: Composer, writer: PhpFileWriter)
    {
        this.fs = fs;
        this.composer = composer;
        this.writer = writer;
    }

    /**
     * @param uri The uri of the folder where the file being created is.
     */
    public async run(uri: Uri)
    {
        const rootNamespace = await this.composer.findRootNamespaceFor(uri);
        const nsString = rootNamespace.createRealNamespaceFor(uri);
        
        const fqcn = await window.showInputBox({
            prompt: 'Name',
            value: nsString.concat('\\'),
            valueSelection: [nsString.length + 1, nsString.length + 1]
        });

        if (!fqcn) {
            return;
        }
        
        const type = await window.showQuickPick(['Class', 'Interface', 'Trait'], {
            canPickMany: false,
            placeHolder: 'Select the type of class file you want to create' 
        });

        const targetUri = rootNamespace.createUriFor(fqcn);
        
        try {
            const _ = await this.fs.stat(targetUri);
            window.showErrorMessage('File with name "' + targetUri.fsPath + '" already exists.');
            return;
        } catch (e) {
            // File does not exist, so we are cool.
        }

        await this.writer.write(targetUri, fqcn, type.toLowerCase());
        await workspace.openTextDocument(targetUri);
        window.showTextDocument(targetUri);
    }
}