import NamespaceResolver from "../resolver";
import { FileSystem, window, workspace, Uri } from 'vscode';
import { PhpFileWriter } from "../writer";

export default class CreateClassCommand
{
    private fs: FileSystem;
    private resolver: NamespaceResolver;
    private writer: PhpFileWriter;
    
    public constructor(fs: FileSystem, resolver: NamespaceResolver, writer: PhpFileWriter)
    {
        this.fs = fs;
        this.resolver = resolver;
        this.writer = writer;
    }

    /**
     * @param uri The uri of the folder where the file being created is.
     */
    public async run(uri: Uri)
    {
        const namespace = await this.resolver.resolve(uri);
        const realNamespace = namespace.getRealNamespace(uri);

        const name = await window.showInputBox({
            prompt: 'Name',
            value: realNamespace.concat('\\'),
            valueSelection: [realNamespace.length + 1, realNamespace.length + 1]
        });

        if (!name) {
            return;
        }
        
        const type = await window.showQuickPick(['Class', 'Interface', 'Trait'], {
            canPickMany: false,
            placeHolder: 'Select the type of class file you want to create' 
        });

        // We prepare the default path based on the namespace.
        const targetUri = namespace.filenameForType(name);
        
        try {
            const _ = await this.fs.stat(targetUri);
            window.showErrorMessage('File with name "' + targetUri.fsPath + '" already exists.');
            return;
        } catch (e) {
            // File does not exist, so we are cool.
        }

        await this.writer.write(targetUri, name, type.toLowerCase());
        await workspace.openTextDocument(targetUri);
        window.showTextDocument(targetUri);
    }
}