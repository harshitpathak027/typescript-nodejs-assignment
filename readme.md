
# Feature

- **User Registration**: User can register with a username and their RSA key pair i.e. public and private keys will be generated and stored securely.
- **File Encryption**: User can create encrypted files by providing content. The content will be encrypted using the user's public key and stored in the secure way.
- **Access Control**: User can provide access to other users. Access is controlled through a list of usernames.
- **File Decryption**: User can decrypt files they have access to using their private key.
- **View Files**: User can view all files.

## Installation Guide

1. Clone this repository:


- git clone <repository-url>


2. install Dependencies:

- npm install

3. run the server
-npm run dev


The server will start running on http://localhost:3000 by default.

### API Endpoints
- POST /register: Register a new user with body as{username:"usertoregister"}
- POST /create: Create an encrypted file with body as { "content": "plain_text_content" }
- POST /addUser: Add user to provide access for encrypted file with body as { "username": "username_to_add" }.
- GET /dec: View decrypted file content. { "username": "authorised user","filename":"name of the file" }
- GET /viewAll: View all files.
#### Usage
- Register a new user using the /register endpoint.
- Create an encrypted file using the /create endpoint.
- Grant access to other users for specific files using the /addUser endpoint.
- View decrypted file content using the /dec endpoint.
- View all files available on the server using the /viewAll endpoint.
##### Dependencies
- express: ^4.17.1
- crypto: built-in module
