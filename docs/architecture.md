# System Architecture

## Overview

The Real Estate Platform follows a modular monolithic architecture with the following key components:

```mermaid
graph TB
    Client[Client Applications]
    API[Express API]
    Auth[Auth Module]
    Prop[Property Module]
    Search[Search Module]
    DB[(MongoDB)]
    Static[Static File Storage]

    Client --> API
    API --> Auth
    API --> Prop
    API --> Search
    Auth --> DB
    Prop --> DB
    Search --> DB
    Prop --> Static
```

This modular monolithic approach allows for simpler deployment while maintaining separation of concerns through well-defined modules.

## Component Architecture

### Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant A as Auth Module
    participant D as Database
    
    C->>A: Login Request
    A->>D: Validate Credentials
    D-->>A: User Data
    A->>A: Generate JWT
    A-->>C: Return Token
```

### Property Creation Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant API as API Module
    participant P as Property Module
    participant Static as Static Storage
    participant DB as MongoDB

    C->>API: Create Property Request
    API->>P: Forward Request
    P->>Static: Store Images (if any)
    Static-->>P: Image Paths
    P->>DB: Save Property Data
    DB-->>P: Confirmation
    P-->>API: Success Response
    API-->>C: Final Response
```

### Search Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant API as API Module
    participant S as Search Module
    participant DB as MongoDB

    C->>API: Search Request
    API->>S: Forward Search
    S->>DB: Query Database
    DB-->>S: Raw Results
    S->>S: Process Results
    S-->>API: Return Results
    API-->>C: Send Response
```

## System Components

### API Layer
```mermaid
graph LR
    A[Express API] --> B[Rate Limiting]
    A --> C[Authentication]
    A --> D[Request Validation]
    A --> E[Error Handling]
    A --> F[Swagger Documentation]
```

### Property Module
```mermaid
graph LR
    A[Property Module] --> B[CRUD Operations]
    A --> C[Validation]
    A --> D[Filtering]
    A --> E[Pagination]
```

### Search Module
```mermaid
graph LR
    A[Search Module] --> B[Full-text Search]
    A --> C[Filtering]
    A --> D[Pagination]
    A --> E[Sorting]
```

## Data Flow

### User Registration
```mermaid
graph TD
    A[Client Request] --> B[Input Validation]
    B --> C[Password Hashing]
    C --> D[Create User]
    D --> E[Generate JWT Token]
    E --> F[Return Response]
```

### Property Listing
```mermaid
graph TD
    A[Upload Property Data] --> B[Validate Data]
    B --> C[Store Property Data]
    C --> D[Return Response]
```

## Infrastructure

### Production Environment
```mermaid
graph TB
    LB[Load Balancer]
    API[Express API Server]
    DB[(MongoDB)]
    Static[Static File Storage]

    LB --> API
    API --> DB
    API --> Static
```

### Monitoring Setup
```mermaid
graph LR
    A[Application Logs] --> C[Log Storage]
    M[Metrics] --> C
    C --> G[Monitoring Dashboard]
```

## Security Architecture

### Authentication Flow
```mermaid
sequenceDiagram
    participant U as User
    participant A as Auth Module
    participant D as Database

    U->>A: Login Request
    A->>D: Verify Credentials
    D-->>A: User Data
    A->>A: Generate JWT Token
    A-->>U: Return Token
```

### Authorization Flow
```mermaid
graph TD
    A[Request] --> B{Has Token?}
    B -- Yes --> C{Valid Token?}
    B -- No --> D[Reject]
    C -- Yes --> E{Has Permission?}
    C -- No --> D
    E -- Yes --> F[Allow]
    E -- No --> D
```

## Deployment Architecture

### CI/CD Pipeline
```mermaid
graph LR
    A[Code Push] --> B[Tests]
    B --> C[Build]
    C --> D[Deploy]
```

This deployment architecture is designed to be simple and efficient, allowing for rapid iterations and continuous delivery of new features. 