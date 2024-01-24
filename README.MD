# Cyber Chaos Cards - CCC

A Cards against Humanity clone online game.

## Project Structure

This project is divided into two primary sections:

- `client`: This is the frontend of the application powered by Next.js.
- `server`: This is the backend of the application handling API and data-related operations.

Additionally, there's a `types` folder which contains shared types and utilities that both the `client` and `server` might need access to.



## Pre requisites

Before starting, ensure you have the following installed:

1. [NodeJS](https://nodejs.org/en/download/) (version 20 or higher)
2. [pnpm](https://pnpm.io/installation) (Performance-focused package manager)

## Setting up the Project

1. **Clone the Repository**

   Use the following command to clone the repository:

   ```bash
   git clone https://github.com/IgorBayerl/CCC-Cards-Game.git
   ```

2. **Install Dependencies**

   After cloning, navigate to the project directory and install the dependencies using pnpm:

   ```bash
   pnpm install
   ```

3. **Start the Development Servers**

   To start the development servers:

   - For both `client` and `server`:

     ```bash
     pnpm dev
     ```

   - For only the `server`:

     ```bash
     pnpm dev-server
     ```

   - For only the `client`:

     ```bash
     pnpm dev-client
     ```



**Happy coding!**

---

## Game Flow Diagram

![Game Flow Diagram](./docs/game_flow.svg)
