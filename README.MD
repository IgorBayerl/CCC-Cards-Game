
# Cyber Chaos Cards - CCC

A Cards against Humanity clone online game.

## Project Structure

This project is divided into two primary sections:

- `client`: This is the frontend of the application powered by Next.js.
- `server`: This is the backend of the application handling API and data-related operations.

Additionally, there's a `shared` folder which contains shared types and utilities that both the `client` and `server` might need access to.

### Why the `prepare` scripts?

Due to the nature of our project structure and the dependencies involved, the `shared` folder needs to be accessed by both the `client` and `server` directories. However, certain build processes and configurations, such as the use of Next.js and its transpilation mechanisms, have made direct sharing complex.

To bypass these complexities, we've employed a simple solution: prior to starting our development environment or building our project, we copy the `shared` folder's contents to both the `client` and `server` directories. This ensures that both parts of our application have the shared utilities they need, and it also ensures that our build processes work smoothly.

This process is automated using the `prepare` scripts present in both the `client` and `server` directories. Additionally, the `prepare.sh` script at the root performs the same task but doesn't watch for changes, making it suitable for one-off preparations.

## Setting up the Project

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   ```

2. **Install Dependencies**

   Navigate to both the `client` and `server` directories in separate terminal windows/tabs and install their respective dependencies.

   ```bash
   cd client && yarn install
   cd server && yarn install
   ```

3. **Run the Prepare Script**

    ```bash
    ./prepare.sh
    ```

   This script will ensure the `shared` folder's content is available for both the `client` and `server` parts of the application.

4. **Start the Development Servers**

   In the `client` directory:

   ```bash
   yarn dev
   ```

   And in the `server` directory:

   ```bash
   yarn dev
   ```

## Using Visual Studio Code for Development

For developers using Visual Studio Code, there are predefined tasks that streamline the project setup and running process:

1. **Prepare Script**: Instead of manually running the `prepare.sh` script, you can open the Command Palette (`Ctrl + Shift + P`), type "Run Task", and select "Tasks: Run Task". Then choose "sync-shared-folder" from the list to automate the sharing process.

2. **Client**: To start the client, open the Command Palette, type "Run Task", and select "Tasks: Run Task". Choose "start-client".

3. **Server**: To start the server, follow the same procedure but select "start-server".

4. **Start All Synced**: To initiate the client, server, and synchronize the shared folder in one go, choose "start-all-synked".

---

Happy coding! 
