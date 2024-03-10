# Starting with Node.js 18 Alpine for a lightweight image
FROM node:20-alpine AS client

# Enable Corepack to use PNPM
RUN corepack enable

# Set the working directory in the Docker container
WORKDIR /app

# Copy the necessary files to install dependencies
# Including the pnpm-lock.yaml at the root to respect monorepo dependency resolutions
COPY pnpm-lock.yaml* ./
COPY package.json ./

# Copy the entire monorepo to properly resolve internal dependencies like `types`
# Note: This might include more than necessary for just the client build, but it ensures
# that pnpm can correctly link local packages. Adjustments may be needed based on your exact structure.
COPY . .

# Install dependencies using PNPM, ensuring to work within the context of a monorepo
RUN pnpm install --frozen-lockfile


# Copying the rest of the client application files might not be necessary if you've already copied the entire monorepo
# However, if you adjust to be more selective in what you copy to the Docker context (for efficiency),
# ensure all necessary files for your client application are copied here.

# Next.js collects completely anonymous telemetry data about general usage. Learn more here: https://nextjs.org/telemetry
# Uncomment the following line to disable telemetry during runtime
# ENV NEXT_TELEMETRY_DISABLED 1

# The port that your Next.js app will run on (default is 3000)
EXPOSE 3000

# Start the Next.js development server
CMD ["pnpm", "dev-client"]
