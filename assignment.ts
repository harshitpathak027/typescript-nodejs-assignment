import express, { Request, Response } from 'express';
import * as crypto from 'crypto';

interface User {
    username: string;
    publicKey: string;
    privateKey: string;
}

interface EncryptFile {
    filename: string;
    content: string;
    access: string[];
}

class FileSharing {
    private users: User[] = [];
    private files: EncryptFile[] = [];


    registerUser(req: Request, res: Response): void {
        const { username } = req.body;

        // Check if the username already exists
        if (this.users.some(user => user.username === username)) {
            res.status(400).json({ error: "Username already exists" });
            return;
        }

        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
        });

        this.users.push({ username, publicKey, privateKey });
        res.json({ message: "User registered successfully" });
    }

    createEncrypt(req: Request, res: Response): void {
        const { content, username } = req.body;

        const user = this.users.find(user => user.username === username);

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        const encryptedContent = crypto.publicEncrypt(user.publicKey, Buffer.from(content, 'utf-8')).toString('base64');

        const result = crypto.randomBytes(16).toString('hex');
        this.files.push({ filename: result, content: encryptedContent, access: [user.username] });
        res.json({ message: "File created successfully", filename: result });
    
    }


    addUser(req: Request, res: Response): void {
        const { usertoadd,username, filename } = req.body;

    const file = this.files.find(file => file.filename === filename);
    if (!file) {
         res.status(404).json({ error: "File not found" });
         return;
    }

    const owner = this.users.find(user => user.username === file.access[0]);
    if (!owner) {
        res.status(404).json({ error: "Owner not found" });
        return;
    }

    if (owner.username !== req.body.username) {
        res.status(403).json({ error: "User is not the owner of the file" });
        return
    }

    if (!file.access.includes(usertoadd)) {
        file.access.push(usertoadd);
    }

    res.json({ message: "User added successfully" });
    }



    decrypted(req: Request, res: Response): void {
        const { username, filename } = req.body;

        const file = this.files.find(file => file.filename === filename && file.access.includes(username));
        if (!file) {
            res.status(404).json({ error: "File not found or user doesn't have access" });
            return;
        }

        const user = this.users.find(user => user.username === username);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return
        }

        const decryptedContent = crypto.privateDecrypt(user.privateKey, Buffer.from(file.content, 'base64')).toString('utf-8');
        res.json({ content: decryptedContent });
    }


    viewfiles(req: Request, res: Response): void {
        const { username } = req.body;
    
        // Check if the user exists
        const user = this.users.find(user => user.username === username);
        if (!user) {
             res.status(404).json({ error: "User not found" });
             return;
        }
    
        // Map files to include decrypted content if user has access, "Access denied" otherwise
        const decryptedFiles = this.files.map(file => ({
            filename: file.filename,
            content: file.access.includes(username) ?
                crypto.privateDecrypt(user.privateKey, Buffer.from(file.content, 'base64')).toString('utf-8') :
                "Access denied"
        }));
    
        res.json({ files: decryptedFiles });
    }
}


const app = express();
const file = new FileSharing();


app.use(express.json());


app.post('/register', (req, res) => file.registerUser(req, res));
app.post('/create', (req, res) => file.createEncrypt(req, res));
app.post('/addUser', (req, res) => file.addUser(req, res));
app.post('/dec', (req, res) => file.decrypted(req, res));
app.post('/viewAll', (req, res) => file.viewfiles(req, res));




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
