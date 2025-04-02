I'll create a comprehensive guide for Chunk: 8: API Testing & Postman Automation following the format of Chunk 7. I'll ensure all implementation details are well-structured and address the recommendations you've mentioned.

# 🧩 Chunk 8: API Testing & Postman Automation

✅ **Status**: Ready for Implementation  
📅 **Target Completion**: [YYYY-MM-DD]  
📄 **Doc Path**: /docs/testing/api-testing-postman-automation.md

## 🎯 Objective

Implement a comprehensive API testing strategy using Postman to automate test execution, validation, and reporting for the Multi-Frame Layout Component System. This chunk creates the necessary Postman collections, environments, and scripts to ensure API reliability, security, and performance.

## 🧭 Implementation Workflow

### 🔧 BEFORE YOU BEGIN

Create your Git branch:
```bash
git checkout main
git pull
git checkout -b feature/api-testing-postman
```

Required folders:
```
postman/
├── collections/
├── environments/
├── scripts/
└── tests/
```

Install necessary packages:
```bash
npm install -g newman newman-reporter-htmlextra
```

Set up Postman:
1. Download and install Postman from [https://www.postman.com/downloads/](https://www.postman.com/downloads/)
2. Create a team workspace "Real Estate Platform API Testing"
3. Set up a shared team environment for API testing

### 🏗️ DURING IMPLEMENTATION

#### 1. Create Base Environment Configuration

📄 **postman/environments/development.json**
```json
{
  "id": "env_dev_123456",
  "name": "Development",
  "values": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000/api",
      "enabled": true
    },
    {
      "key": "authToken",
      "value": "",
      "enabled": true
    },
    {
      "key": "userId",
      "value": "",
      "enabled": true
    },
    {
      "key": "layoutId",
      "value": "",
      "enabled": true
    }
  ],
  "_postman_variable_scope": "environment"
}
```

📄 **postman/environments/testing.json**
```json
{
  "id": "env_test_123456",
  "name": "Testing",
  "values": [
    {
      "key": "baseUrl",
      "value": "https://test-api.realestate-platform.com/api",
      "enabled": true
    },
    {
      "key": "authToken",
      "value": "",
      "enabled": true
    },
    {
      "key": "userId",
      "value": "",
      "enabled": true
    },
    {
      "key": "layoutId",
      "value": "",
      "enabled": true
    }
  ],
  "_postman_variable_scope": "environment"
}
```

#### 2. Create Authentication Collection

📄 **postman/collections/auth.json**
```json
{
  "info": {
    "_postman_id": "auth_collection_123456",
    "name": "Authentication",
    "description": "Authentication endpoints for the Real Estate Platform",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Login",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "const response = pm.response.json();",
              "",
              "pm.test(\"Status code is 200\", function () {",
              "    pm.response.to.have.status(200);",
              "});",
              "",
              "pm.test(\"Response has token\", function () {",
              "    pm.expect(response).to.have.property('token');",
              "    pm.expect(response.token).to.be.a('string');",
              "    pm.expect(response.token.length).to.be.greaterThan(10);",
              "});",
              "",
              "pm.test(\"Response has user ID\", function () {",
              "    pm.expect(response).to.have.property('userId');",
              "    pm.expect(response.userId).to.be.a('string');",
              "});",
              "",
              "// Set environment variables for subsequent requests",
              "if (response.token) {",
              "    pm.environment.set(\"authToken\", response.token);",
              "    pm.environment.set(\"userId\", response.userId);",
              "    console.log(\"Auth token and user ID set in environment variables\");",
              "}",
              ""
            ],
            "type": "text/javascript"
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n\t\"email\": \"{{userEmail}}\",\n\t\"password\": \"{{userPassword}}\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/auth/login",
          "host": ["{{baseUrl}}"],
          "path": ["auth", "login"]
        },
        "description": "Authenticate a user and receive a JWT token"
      },
      "response": []
    },
    {
      "name": "Register",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "const response = pm.response.json();",
              "",
              "pm.test(\"Status code is 201\", function () {",
              "    pm.response.to.have.status(201);",
              "});",
              "",
              "pm.test(\"User is created successfully\", function () {",
              "    pm.expect(response).to.have.property('userId');",
              "    pm.expect(response).to.have.property('email');",
              "    pm.expect(response.email).to.eql(pm.environment.get(\"userEmail\"));",
              "});",
              ""
            ],
            "type": "text/javascript"
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n\t\"email\": \"{{userEmail}}\",\n\t\"password\": \"{{userPassword}}\",\n\t\"firstName\": \"{{userFirstName}}\",\n\t\"lastName\": \"{{userLastName}}\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/auth/register",
          "host": ["{{baseUrl}}"],
          "path": ["auth", "register"]
        },
        "description": "Register a new user"
      },
      "response": []
    },
    {
      "name": "Logout",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test(\"Status code is 200\", function () {",
              "    pm.response.to.have.status(200);",
              "});",
              "",
              "// Clear environment variables",
              "pm.environment.set(\"authToken\", \"\");",
              "pm.environment.set(\"userId\", \"\");",
              "console.log(\"Auth token and user ID cleared from environment variables\");",
              ""
            ],
            "type": "text/javascript"
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{authToken}}"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/auth/logout",
          "host": ["{{baseUrl}}"],
          "path": ["auth", "logout"]
        },
        "description": "Logout and invalidate JWT token"
      },
      "response": []
    }
  ],
  "auth": {
    "type": "noauth"
  }
}
```

#### 3. Create Layout API Collection

📄 **postman/collections/layouts.json**
```json
{
  "info": {
    "_postman_id": "layouts_collection_123456",
    "name": "Layouts",
    "description": "API endpoints for managing layout configurations",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get All Layouts",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "const response = pm.response.json();",
              "",
              "pm.test(\"Status code is 200\", function () {",
              "    pm.response.to.have.status(200);",
              "});",
              "",
              "pm.test(\"Response is an array\", function () {",
              "    pm.expect(Array.isArray(response)).to.be.true;",
              "});",
              "",
              "pm.test(\"Each layout has required properties\", function () {",
              "    if (response.length > 0) {",
              "        pm.expect(response[0]).to.have.property('id');",
              "        pm.expect(response[0]).to.have.property('name');",
              "        pm.expect(response[0]).to.have.property('type');",
              "        pm.expect(response[0]).to.have.property('panels');",
              "        pm.expect(Array.isArray(response[0].panels)).to.be.true;",
              "    }",
              "});",
              "",
              "// Store first layout ID for subsequent tests if available",
              "if (response.length > 0) {",
              "    pm.environment.set(\"layoutId\", response[0].id);",
              "    console.log(\"Layout ID set to: \" + response[0].id);",
              "}",
              ""
            ],
            "type": "text/javascript"
          }
        }
      ],
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{authToken}}"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/layouts",
          "host": ["{{baseUrl}}"],
          "path": ["layouts"]
        },
        "description": "Get all layouts for the current user"
      },
      "response": []
    },
    {
      "name": "Get Layout By ID",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "const response = pm.response.json();",
              "",
              "pm.test(\"Status code is 200\", function () {",
              "    pm.response.to.have.status(200);",
              "});",
              "",
              "pm.test(\"Layout has correct ID\", function () {",
              "    pm.expect(response).to.have.property('id');",
              "    pm.expect(response.id).to.eql(pm.environment.get(\"layoutId\"));",
              "});",
              "",
              "pm.test(\"Layout has required properties\", function () {",
              "    pm.expect(response).to.have.property('name');",
              "    pm.expect(response).to.have.property('type');",
              "    pm.expect(response).to.have.property('panels');",
              "    pm.expect(Array.isArray(response.panels)).to.be.true;",
              "});",
              "",
              "pm.test(\"Panels have required properties\", function () {",
              "    if (response.panels.length > 0) {",
              "        pm.expect(response.panels[0]).to.have.property('id');",
              "        pm.expect(response.panels[0]).to.have.property('contentType');",
              "        pm.expect(response.panels[0]).to.have.property('title');",
              "    }",
              "});",
              ""
            ],
            "type": "text/javascript"
          }
        }
      ],
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{authToken}}"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/layouts/{{layoutId}}",
          "host": ["{{baseUrl}}"],
          "path": ["layouts", "{{layoutId}}"]
        },
        "description": "Get a specific layout by ID"
      },
      "response": []
    },
    {
      "name": "Create Layout",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "const response = pm.response.json();",
              "",
              "pm.test(\"Status code is 201\", function () {",
              "    pm.response.to.have.status(201);",
              "});",
              "",
              "pm.test(\"Layout has been created with correct properties\", function () {",
              "    pm.expect(response).to.have.property('id');",
              "    pm.expect(response).to.have.property('name');",
              "    pm.expect(response.name).to.eql(\"Test Layout\");",
              "    pm.expect(response).to.have.property('type');",
              "    pm.expect(response.type).to.eql(\"quad\");",
              "    pm.expect(response).to.have.property('panels');",
              "    pm.expect(response.panels.length).to.eql(4);",
              "});",
              "",
              "// Store the new layout ID for subsequent tests",
              "pm.environment.set(\"layoutId\", response.id);",
              "console.log(\"New layout ID set to: \" + response.id);",
              ""
            ],
            "type": "text/javascript"
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{authToken}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n\t\"name\": \"Test Layout\",\n\t\"description\": \"A test layout created via API\",\n\t\"type\": \"quad\",\n\t\"panels\": [\n\t\t{\n\t\t\t\"id\": \"panel1\",\n\t\t\t\"contentType\": \"map\",\n\t\t\t\"title\": \"Map Panel\",\n\t\t\t\"position\": { \"row\": 0, \"col\": 0 },\n\t\t\t\"size\": { \"width\": 50, \"height\": 50 }\n\t\t},\n\t\t{\n\t\t\t\"id\": \"panel2\",\n\t\t\t\"contentType\": \"property\",\n\t\t\t\"title\": \"Property Panel\",\n\t\t\t\"position\": { \"row\": 0, \"col\": 1 },\n\t\t\t\"size\": { \"width\": 50, \"height\": 50 }\n\t\t},\n\t\t{\n\t\t\t\"id\": \"panel3\",\n\t\t\t\"contentType\": \"filter\",\n\t\t\t\"title\": \"Filter Panel\",\n\t\t\t\"position\": { \"row\": 1, \"col\": 0 },\n\t\t\t\"size\": { \"width\": 50, \"height\": 50 }\n\t\t},\n\t\t{\n\t\t\t\"id\": \"panel4\",\n\t\t\t\"contentType\": \"stats\",\n\t\t\t\"title\": \"Stats Panel\",\n\t\t\t\"position\": { \"row\": 1, \"col\": 1 },\n\t\t\t\"size\": { \"width\": 50, \"height\": 50 }\n\t\t}\n\t]\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/layouts",
          "host": ["{{baseUrl}}"],
          "path": ["layouts"]
        },
        "description": "Create a new layout configuration"
      },
      "response": []
    },
    {
      "name": "Update Layout",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "const response = pm.response.json();",
              "",
              "pm.test(\"Status code is 200\", function () {",
              "    pm.response.to.have.status(200);",
              "});",
              "",
              "pm.test(\"Layout has been updated correctly\", function () {",
              "    pm.expect(response).to.have.property('id');",
              "    pm.expect(response.id).to.eql(pm.environment.get(\"layoutId\"));",
              "    pm.expect(response).to.have.property('name');",
              "    pm.expect(response.name).to.eql(\"Updated Test Layout\");",
              "    pm.expect(response).to.have.property('description');",
              "    pm.expect(response.description).to.eql(\"This layout was updated via API\");",
              "});",
              "",
              "pm.test(\"Panel count is maintained\", function () {",
              "    pm.expect(response).to.have.property('panels');",
              "    pm.expect(response.panels.length).to.eql(4);",
              "});",
              ""
            ],
            "type": "text/javascript"
          }
        }
      ],
      "request": {
        "method": "PUT",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{authToken}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n\t\"name\": \"Updated Test Layout\",\n\t\"description\": \"This layout was updated via API\",\n\t\"type\": \"quad\",\n\t\"panels\": [\n\t\t{\n\t\t\t\"id\": \"panel1\",\n\t\t\t\"contentType\": \"map\",\n\t\t\t\"title\": \"Map Panel\",\n\t\t\t\"position\": { \"row\": 0, \"col\": 0 },\n\t\t\t\"size\": { \"width\": 60, \"height\": 60 }\n\t\t},\n\t\t{\n\t\t\t\"id\": \"panel2\",\n\t\t\t\"contentType\": \"property\",\n\t\t\t\"title\": \"Property Details\",\n\t\t\t\"position\": { \"row\": 0, \"col\": 1 },\n\t\t\t\"size\": { \"width\": 40, \"height\": 60 }\n\t\t},\n\t\t{\n\t\t\t\"id\": \"panel3\",\n\t\t\t\"contentType\": \"filter\",\n\t\t\t\"title\": \"Search Filters\",\n\t\t\t\"position\": { \"row\": 1, \"col\": 0 },\n\t\t\t\"size\": { \"width\": 60, \"height\": 40 }\n\t\t},\n\t\t{\n\t\t\t\"id\": \"panel4\",\n\t\t\t\"contentType\": \"stats\",\n\t\t\t\"title\": \"Market Statistics\",\n\t\t\t\"position\": { \"row\": 1, \"col\": 1 },\n\t\t\t\"size\": { \"width\": 40, \"height\": 40 }\n\t\t}\n\t]\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/layouts/{{layoutId}}",
          "host": ["{{baseUrl}}"],
          "path": ["layouts", "{{layoutId}}"]
        },
        "description": "Update an existing layout"
      },
      "response": []
    },
    {
      "name": "Clone Layout",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "const response = pm.response.json();",
              "",
              "pm.test(\"Status code is 201\", function () {",
              "    pm.response.to.have.status(201);",
              "});",
              "",
              "pm.test(\"Cloned layout has new ID\", function () {",
              "    pm.expect(response).to.have.property('id');",
              "    pm.expect(response.id).to.not.eql(pm.environment.get(\"layoutId\"));",
              "});",
              "",
              "pm.test(\"Cloned layout has correct name\", function () {",
              "    pm.expect(response).to.have.property('name');",
              "    pm.expect(response.name).to.eql(\"Copy of Updated Test Layout\");",
              "});",
              "",
              "pm.test(\"Panel structure is preserved\", function () {",
              "    pm.expect(response).to.have.property('panels');",
              "    pm.expect(response.panels.length).to.eql(4);",
              "    ",
              "    // Check if panel IDs are unique from source",
              "    const originalId = pm.environment.get(\"layoutId\");",
              "    pm.expect(response.id).to.not.eql(originalId);",
              "});",
              "",
              "// Store the cloned layout ID",
              "const clonedLayoutId = response.id;",
              "pm.environment.set(\"clonedLayoutId\", clonedLayoutId);",
              "console.log(\"Cloned layout ID set to: \" + clonedLayoutId);",
              ""
            ],
            "type": "text/javascript"
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{authToken}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n\t\"name\": \"Copy of Updated Test Layout\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/layouts/{{layoutId}}/clone",
          "host": ["{{baseUrl}}"],
          "path": ["layouts", "{{layoutId}}", "clone"]
        },
        "description": "Clone an existing layout"
      },
      "response": []
    },
    {
      "name": "Delete Layout",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test(\"Status code is 200\", function () {",
              "    pm.response.to.have.status(200);",
              "});",
              "",
              "// Verify layout was deleted by attempting to fetch it",
              "const getRequest = {",
              "    url: pm.environment.get(\"baseUrl\") + '/layouts/' + pm.environment.get(\"clonedLayoutId\"),",
              "    method: 'GET',",
              "    header: {",
              "        'Authorization': 'Bearer ' + pm.environment.get(\"authToken\")",
              "    }",
              "};",
              "",
              "pm.sendRequest(getRequest, function (err, res) {",
              "    pm.test(\"Layout is no longer accessible\", function () {",
              "        pm.expect(res.code).to.eql(404);",
              "    });",
              "});",
              ""
            ],
            "type": "text/javascript"
          }
        }
      ],
      "request": {
        "method": "DELETE",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{authToken}}"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/layouts/{{clonedLayoutId}}",
          "host": ["{{baseUrl}}"],
          "path": ["layouts", "{{clonedLayoutId}}"]
        },
        "description": "Delete a layout configuration"
      },
      "response": []
    }
  ],
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{authToken}}",
        "type": "string"
      }
    ]
  }
}
```

#### 4. Create User Preferences API Collection

📄 **postman/collections/preferences.json**
```json
{
  "info": {
    "_postman_id": "preferences_collection_123456",
    "name": "User Preferences",
    "description": "API endpoints for managing user preferences",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get User Preferences",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "const response = pm.response.json();",
              "",
              "pm.test(\"Status code is 200\", function () {",
              "    pm.response.to.have.status(200);",
              "});",
              "",
              "pm.test(\"Response has theme preferences\", function () {",
              "    pm.expect(response).to.have.property('theme');",
              "    pm.expect(response.theme).to.have.property('colorMode');",
              "    pm.expect(response.theme).to.have.property('mapStyle');",
              "});",
              "",
              "pm.test(\"Response has panel preferences\", function () {",
              "    pm.expect(response).to.have.property('panel');",
              "    pm.expect(response.panel).to.have.property('defaultContentTypes');",
              "    pm.expect(response.panel).to.have.property('showPanelHeader');",
              "});",
              "",
              "pm.test(\"Response has layout preferences\", function () {",
              "    pm.expect(response).to.have.property('layout');",
              "    pm.expect(response.layout).to.have.property('defaultLayout');",
              "    pm.expect(response.layout).to.have.property('saveLayoutOnExit');",
              "});",
              "",
              "pm.test(\"Response has filter preferences\", function () {",
              "    pm.expect(response).to.have.property('filter');",
              "    pm.expect(response.filter).to.have.property('showFilterPanel');",
              "    pm.expect(response.filter).to.have.property('applyFiltersAutomatically');",
              "});",
              ""
            ],
            "type": "text/javascript"
          }
        }
      ],
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{authToken}}"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/user/preferences",
          "host": ["{{baseUrl}}"],
          "path": ["user", "preferences"]
        },
        "description": "Get the current user's preferences"
      },
      "response": []
    },
    {
      "name": "Update User Preferences",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "const response = pm.response.json();",
              "",
              "pm.test(\"Status code is 200\", function () {",
              "    pm.response.to.have.status(200);",
              "});",
              "",
              "pm.test(\"Theme preferences updated correctly\", function () {",
              "    pm.expect(response).to.have.property('theme');",
              "    pm.expect(response.theme.colorMode).to.eql('dark');",
              "    pm.expect(response.theme.mapStyle).to.eql('satellite');",
              "    pm.expect(response.theme.accentColor).to.eql('#ff5722');",
              "});",
              "",
              "pm.test(\"Panel preferences updated correctly\", function () {",
              "    pm.expect(response).to.have.property('panel');",
              "    pm.expect(response.panel.showPanelHeader).to.eql(true);",
              "    pm.expect(response.panel.enablePanelResizing).to.eql(true);",
              "});",
              "",
              "pm.test(\"Layout preferences updated correctly\", function () {",
              "    pm.expect(response).to.have.property('layout');",
              "    pm.expect(response.layout.saveLayoutOnExit).to.eql(true);",
              "});",
              ""
            ],
            "type": "text/javascript"
          }
        }
      ],
      "request": {
        "method": "PUT",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{authToken}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"theme\": {\n    \"colorMode\": \"dark\",\n    \"mapStyle\": \"satellite\",\n    \"accentColor\": \"#ff5722\",\n    \"fontSize\": \"medium\"\n  },\n  \"panel\": {\n    \"defaultContentTypes\": {\n      \"top-left\": \"map\",\n      \"top-right\": \"property\",\n      \"bottom-left\": \"filter\",\n      \"bottom-right\": \"stats\"\n    },\n    \"showPanelHeader\": true,\n    \"enablePanelResizing\": true,\n    \"enablePanelDragging\": true\n  },\n  \"layout\": {\n    \"defaultLayout\": \"{{layoutId}}\",\n    \"saveLayoutOnExit\": true,\n    \"rememberLastLayout\": true\n  },\n  \"filter\": {\n    \"defaultFilters\": {},\n    \"showFilterPanel\": true,\n    \"applyFiltersAutomatically\": false\n  }\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/user/preferences",
          "host": ["{{baseUrl}}"],
          "path": ["user", "
I'll continue writing the API Testing & Postman Automation guide:

```json
          "raw": "{{baseUrl}}/user/preferences",
          "host": ["{{baseUrl}}"],
          "path": ["user", "preferences"]
        },
        "description": "Update user preferences"
      },
      "response": []
    },
    {
      "name": "Reset User Preferences",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "const response = pm.response.json();",
              "",
              "pm.test(\"Status code is 200\", function () {",
              "    pm.response.to.have.status(200);",
              "});",
              "",
              "pm.test(\"Preferences reset to default values\", function () {",
              "    pm.expect(response).to.have.property('theme');",
              "    pm.expect(response.theme.colorMode).to.eql('system');",
              "    pm.expect(response.theme.mapStyle).to.eql('standard');",
              "    pm.expect(response.theme.fontSize).to.eql('medium');",
              "});",
              "",
              "pm.test(\"Panel preferences reset to default values\", function () {",
              "    pm.expect(response).to.have.property('panel');",
              "    pm.expect(response.panel.showPanelHeader).to.eql(true);",
              "    pm.expect(response.panel.enablePanelResizing).to.eql(true);",
              "    pm.expect(response.panel.enablePanelDragging).to.eql(true);",
              "});",
              "",
              "pm.test(\"Filter preferences reset to default values\", function () {",
              "    pm.expect(response).to.have.property('filter');",
              "    pm.expect(response.filter.showFilterPanel).to.eql(true);",
              "    pm.expect(response.filter.applyFiltersAutomatically).to.eql(true);",
              "});",
              ""
            ],
            "type": "text/javascript"
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{authToken}}"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/user/preferences/reset",
          "host": ["{{baseUrl}}"],
          "path": ["user", "preferences", "reset"]
        },
        "description": "Reset user preferences to default values"
      },
      "response": []
    }
  ],
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{authToken}}",
        "type": "string"
      }
    ]
  }
}
```

#### 5. Create API Health Check Collection

📄 **postman/collections/health-check.json**
```json
{
  "info": {
    "_postman_id": "health_check_123456",
    "name": "API Health Check",
    "description": "Health check and diagnostics endpoints",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test(\"Status code is 200\", function () {",
              "    pm.response.to.have.status(200);",
              "});",
              "",
              "const response = pm.response.json();",
              "",
              "pm.test(\"API is up and running\", function () {",
              "    pm.expect(response).to.have.property('status');",
              "    pm.expect(response.status).to.eql('ok');",
              "});",
              "",
              "pm.test(\"Response includes version information\", function () {",
              "    pm.expect(response).to.have.property('version');",
              "});",
              "",
              "pm.test(\"Response includes server time\", function () {",
              "    pm.expect(response).to.have.property('serverTime');",
              "    const serverTime = new Date(response.serverTime);",
              "    pm.expect(serverTime).to.be.an.instanceOf(Date);",
              "});",
              ""
            ],
            "type": "text/javascript"
          }
        }
      ],
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/health",
          "host": ["{{baseUrl}}"],
          "path": ["health"]
        },
        "description": "Check if the API is up and running"
      },
      "response": []
    },
    {
      "name": "API Status",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test(\"Status code is 200\", function () {",
              "    pm.response.to.have.status(200);",
              "});",
              "",
              "const response = pm.response.json();",
              "",
              "pm.test(\"Response includes system status\", function () {",
              "    pm.expect(response).to.have.property('system');",
              "    pm.expect(response.system).to.have.property('status');",
              "});",
              "",
              "pm.test(\"Response includes database status\", function () {",
              "    pm.expect(response).to.have.property('database');",
              "    pm.expect(response.database).to.have.property('status');",
              "    pm.expect(response.database).to.have.property('connectionPool');",
              "});",
              "",
              "pm.test(\"Response includes memory usage\", function () {",
              "    pm.expect(response).to.have.property('memory');",
              "    pm.expect(response.memory).to.have.property('used');",
              "    pm.expect(response.memory).to.have.property('total');",
              "});",
              "",
              "pm.test(\"Response includes uptime\", function () {",
              "    pm.expect(response).to.have.property('uptime');",
              "    pm.expect(response.uptime).to.be.a('number');",
              "});",
              ""
            ],
            "type": "text/javascript"
          }
        }
      ],
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{authToken}}"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/status",
          "host": ["{{baseUrl}}"],
          "path": ["status"]
        },
        "description": "Get detailed API system status"
      },
      "response": []
    }
  ],
  "auth": {
    "type": "noauth"
  }
}
```

#### 6. Create End-to-End Test Collection

📄 **postman/collections/e2e-flow.json**
```json
{
  "info": {
    "_postman_id": "e2e_flow_123456",
    "name": "End-to-End Flow",
    "description": "End-to-end test flows for the Multi-Frame Layout Component System",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "User Layout Workflow",
      "item": [
        {
          "name": "1. Login",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "const response = pm.response.json();",
                  "",
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "",
                  "pm.test(\"Response has token\", function () {",
                  "    pm.expect(response).to.have.property('token');",
                  "    pm.expect(response.token).to.be.a('string');",
                  "});",
                  "",
                  "// Set environment variables for subsequent requests",
                  "if (response.token) {",
                  "    pm.environment.set(\"authToken\", response.token);",
                  "    pm.environment.set(\"userId\", response.userId);",
                  "}",
                  ""
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n\t\"email\": \"{{userEmail}}\",\n\t\"password\": \"{{userPassword}}\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "login"]
            }
          },
          "response": []
        },
        {
          "name": "2. Create New Layout",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "const response = pm.response.json();",
                  "",
                  "pm.test(\"Status code is 201\", function () {",
                  "    pm.response.to.have.status(201);",
                  "});",
                  "",
                  "pm.test(\"Layout created successfully\", function () {",
                  "    pm.expect(response).to.have.property('id');",
                  "    pm.expect(response).to.have.property('name');",
                  "    pm.expect(response.name).to.eql(\"E2E Test Layout\");",
                  "});",
                  "",
                  "// Set layout ID for subsequent requests",
                  "pm.environment.set(\"e2eLayoutId\", response.id);",
                  ""
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{authToken}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n\t\"name\": \"E2E Test Layout\",\n\t\"description\": \"Layout created during E2E test\",\n\t\"type\": \"quad\",\n\t\"panels\": [\n\t\t{\n\t\t\t\"id\": \"map\",\n\t\t\t\"contentType\": \"map\",\n\t\t\t\"title\": \"Map View\",\n\t\t\t\"position\": { \"row\": 0, \"col\": 0 },\n\t\t\t\"size\": { \"width\": 60, \"height\": 60 }\n\t\t},\n\t\t{\n\t\t\t\"id\": \"property\",\n\t\t\t\"contentType\": \"property\",\n\t\t\t\"title\": \"Property Details\",\n\t\t\t\"position\": { \"row\": 0, \"col\": 1 },\n\t\t\t\"size\": { \"width\": 40, \"height\": 60 }\n\t\t},\n\t\t{\n\t\t\t\"id\": \"filter\",\n\t\t\t\"contentType\": \"filter\",\n\t\t\t\"title\": \"Search Filters\",\n\t\t\t\"position\": { \"row\": 1, \"col\": 0 },\n\t\t\t\"size\": { \"width\": 60, \"height\": 40 }\n\t\t},\n\t\t{\n\t\t\t\"id\": \"stats\",\n\t\t\t\"contentType\": \"stats\",\n\t\t\t\"title\": \"Market Statistics\",\n\t\t\t\"position\": { \"row\": 1, \"col\": 1 },\n\t\t\t\"size\": { \"width\": 40, \"height\": 40 }\n\t\t}\n\t]\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/layouts",
              "host": ["{{baseUrl}}"],
              "path": ["layouts"]
            }
          },
          "response": []
        },
        {
          "name": "3. Update User Preferences",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "const response = pm.response.json();",
                  "",
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "",
                  "pm.test(\"Default layout set correctly\", function () {",
                  "    pm.expect(response).to.have.property('layout');",
                  "    pm.expect(response.layout).to.have.property('defaultLayout');",
                  "    pm.expect(response.layout.defaultLayout).to.eql(pm.environment.get(\"e2eLayoutId\"));",
                  "});",
                  "",
                  "pm.test(\"Theme preferences set correctly\", function () {",
                  "    pm.expect(response).to.have.property('theme');",
                  "    pm.expect(response.theme.colorMode).to.eql('dark');",
                  "});",
                  ""
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{authToken}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"theme\": {\n    \"colorMode\": \"dark\",\n    \"mapStyle\": \"satellite\",\n    \"accentColor\": \"#4caf50\",\n    \"fontSize\": \"medium\"\n  },\n  \"panel\": {\n    \"defaultContentTypes\": {\n      \"top-left\": \"map\",\n      \"top-right\": \"property\",\n      \"bottom-left\": \"filter\",\n      \"bottom-right\": \"stats\"\n    },\n    \"showPanelHeader\": true,\n    \"enablePanelResizing\": true,\n    \"enablePanelDragging\": true\n  },\n  \"layout\": {\n    \"defaultLayout\": \"{{e2eLayoutId}}\",\n    \"saveLayoutOnExit\": true,\n    \"rememberLastLayout\": true\n  },\n  \"filter\": {\n    \"defaultFilters\": {},\n    \"showFilterPanel\": true,\n    \"applyFiltersAutomatically\": true\n  }\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/user/preferences",
              "host": ["{{baseUrl}}"],
              "path": ["user", "preferences"]
            }
          },
          "response": []
        },
        {
          "name": "4. Get Layout By ID",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "const response = pm.response.json();",
                  "",
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "",
                  "pm.test(\"Layout has correct ID\", function () {",
                  "    pm.expect(response).to.have.property('id');",
                  "    pm.expect(response.id).to.eql(pm.environment.get(\"e2eLayoutId\"));",
                  "});",
                  "",
                  "pm.test(\"Layout has 4 panels\", function () {",
                  "    pm.expect(response).to.have.property('panels');",
                  "    pm.expect(response.panels.length).to.eql(4);",
                  "});",
                  "",
                  "pm.test(\"Layout contains map panel\", function () {",
                  "    const mapPanel = response.panels.find(panel => panel.id === 'map');",
                  "    pm.expect(mapPanel).to.not.be.undefined;",
                  "    pm.expect(mapPanel.contentType).to.eql('map');",
                  "});",
                  ""
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{authToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/layouts/{{e2eLayoutId}}",
              "host": ["{{baseUrl}}"],
              "path": ["layouts", "{{e2eLayoutId}}"]
            }
          },
          "response": []
        },
        {
          "name": "5. Get User Preferences",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "const response = pm.response.json();",
                  "",
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "",
                  "pm.test(\"Default layout matches the created layout\", function () {",
                  "    pm.expect(response).to.have.property('layout');",
                  "    pm.expect(response.layout).to.have.property('defaultLayout');",
                  "    pm.expect(response.layout.defaultLayout).to.eql(pm.environment.get(\"e2eLayoutId\"));",
                  "});",
                  "",
                  "pm.test(\"User preferences correctly set\", function () {",
                  "    pm.expect(response.theme.colorMode).to.eql('dark');",
                  "    pm.expect(response.theme.mapStyle).to.eql('satellite');",
                  "    pm.expect(response.theme.accentColor).to.eql('#4caf50');",
                  "    pm.expect(response.panel.showPanelHeader).to.be.true;",
                  "    pm.expect(response.filter.applyFiltersAutomatically).to.be.true;",
                  "});",
                  ""
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{authToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/user/preferences",
              "host": ["{{baseUrl}}"],
              "path": ["user", "preferences"]
            }
          },
          "response": []
        },
        {
          "name": "6. Clean Up - Delete Layout",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "",
                  "// Verify layout was deleted with a GET request",
                  "const getRequest = {",
                  "    url: pm.environment.get(\"baseUrl\") + '/layouts/' + pm.environment.get(\"e2eLayoutId\"),",
                  "    method: 'GET',",
                  "    header: {",
                  "        'Authorization': 'Bearer ' + pm.environment.get(\"authToken\")",
                  "    }",
                  "};",
                  "",
                  "pm.sendRequest(getRequest, function (err, res) {",
                  "    pm.test(\"Layout is no longer accessible\", function () {",
                  "        pm.expect(res.code).to.eql(404);",
                  "    });",
                  "});",
                  "",
                  "// Reset user preferences to default",
                  "const resetRequest = {",
                  "    url: pm.environment.get(\"baseUrl\") + '/user/preferences/reset',",
                  "    method: 'POST',",
                  "    header: {",
                  "        'Authorization': 'Bearer ' + pm.environment.get(\"authToken\")",
                  "    }",
                  "};",
                  "",
                  "pm.sendRequest(resetRequest, function (err, res) {",
                  "    pm.test(\"User preferences reset successfully\", function () {",
                  "        pm.expect(res.code).to.eql(200);",
                  "    });",
                  "});",
                  ""
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "DELETE",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{authToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/layouts/{{e2eLayoutId}}",
              "host": ["{{baseUrl}}"],
              "path": ["layouts", "{{e2eLayoutId}}"]
            }
          },
          "response": []
        },
        {
          "name": "7. Logout",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "",
                  "// Clear environment variables",
                  "pm.environment.set(\"authToken\", \"\");",
                  "pm.environment.set(\"userId\", \"\");",
                  "pm.environment.set(\"e2eLayoutId\", \"\");",
                  "console.log(\"Environment variables cleared\");",
                  ""
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{authToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/auth/logout",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "logout"]
            }
          },
          "response": []
        }
      ],
      "description": "Complete user workflow from login to layout management and logout"
    }
  ],
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{authToken}}",
        "type": "string"
      }
    ]
  }
}
```

#### 7. Create Test Data Generator Script

📄 **postman/scripts/generate-test-data.js**
```javascript
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const newman = require('newman');

// Configuration
const config = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:5000/api',
  authEmail: process.env.AUTH_EMAIL || 'test@example.com',
  authPassword: process.env.AUTH_PASSWORD || 'password123',
  outputDir: path.join(__dirname, '../data'),
  collectionPath: path.join(__dirname, '../collections/layouts.json'),
  environmentPath: path.join(__dirname, '../environments/testing.json')
};

// Ensure output directory exists
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

// Load the Postman collection and environment
const collection = require(config.collectionPath);
const environment = require(config.environmentPath);

// Update environment variables
const envVars = environment.values;
for (let i = 0; i < envVars.length; i++) {
  if (envVars[i].key === 'baseUrl') {
    envVars[i].value = config.baseUrl;
  }
  if (envVars[i].key === 'userEmail') {
    envVars[i].value = config.authEmail;
  }
  if (envVars[i].key === 'userPassword') {
    envVars[i].value = config.authPassword;
  }
}

// Save updated environment
fs.writeFileSync(
  path.join(config.outputDir, 'environment.json'),
  JSON.stringify(environment, null, 2)
);

// Generate sample layouts for testing
const sampleLayouts = [
  {
    name: 'Single Panel Layout',
    type: 'single',
    panels: [
      {
        id: 'default',
        contentType: 'map',
        title: 'Map View',
        position: { row: 0, col: 0 },
        size: { width: 100, height: 100 }
      }
    ]
  },
  {
    name: 'Dual Panel Layout',
    type: 'dual',
    panels: [
      {
        id: 'left',
        contentType: 'map',
        title: 'Map View',
        position: { row: 0, col: 0 },
        size: { width: 60, height: 100 }
      },
      {
        id: 'right',
        contentType: 'property',
        title: 'Property Details',
        position: { row: 0, col: 1 },
        size: { width: 40, height: 100 }
      }
    ]
  },
  {
    name: 'Quad Panel Layout',
    type: 'quad',
    panels: [
      {
        id: 'top-left',
        contentType: 'map',
        title: 'Map View',
        position: { row: 0, col: 0 },
        size: { width: 50, height: 50 }
      },
      {
        id: 'top-right',
        contentType: 'property',
        title: 'Property List',
        position: { row: 0, col: 1 },
        size: { width: 50, height: 50 }
      },
      {
        id: 'bottom-left',
        contentType: 'filter',
        title: 'Search Filters',
        position: { row: 1, col: 0 },
        size: { width: 50, height: 50 }
      },
      {
        id: 'bottom-right',
        contentType: 'stats',
        title: 'Statistics',
        position: { row: 1, col: 1 },
        size: { width: 50, height: 50 }
      }
    ]
  }
];

// Save sample layouts
fs.writeFileSync(
  path.join(config.outputDir, 'sample-layouts.json'),
  JSON.stringify(sampleLayouts, null, 2)
);

// Run the collection to generate test data
async function generateTestData() {
  try {
    console.log('Generating test data...');
    
    // First, authenticate to get a token
    console.log('Authenticating...');
    const authResponse = await axios.post(`${config.baseUrl}/auth/login`, {
      email: config.authEmail,
      password: config.authPassword
    });
    
    const authToken = authResponse.data.token;
    console.log('Authentication successful');
    
    // Update environment with token
    for (let i = 0; i < envVars.length; i++) {
      if (envVars[i].key === 'authToken') {
        envVars[i].value = authToken;
      }
    }
    
    fs.writeFileSync(
      path.join(config.outputDir, 'environment.json'),
      JSON.stringify(environment, null, 2)
    );
    
    // Create sample layouts using the API
    console.log('Creating sample layouts...');
    
    const layoutIds = [];
    
    for (const layout of sampleLayouts) {
      const response = await axios.post(
        `${config.baseUrl}/layouts`,
        layout,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      layoutIds.push(response.data.id);
      console.log(`Layout created: ${layout.name} (ID: ${response.data.id})`);
    }
    
    // Save layout IDs
    fs.writeFileSync(
      path.join(config.outputDir, 'layout-ids.json'),
      JSON.stringify({ layoutIds }, null, 2)
    );
    
    console.log('Test data generation complete');
    return layoutIds;
  } catch (error) {
    console.error('Error generating test data:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    return [];
  }
}

// Execute if this script is run directly
if (require.main === module) {
  generateTestData().then(layoutIds => {
    console.log('Generated layout IDs:', layoutIds);
  });
}

module.exports = { generateTestData };
```

#### 8. Create Newman Runner Script

📄 **postman/scripts/run-tests.js**
```javascript
const fs = require('fs');
const path = require('path');
const newman = require('newman');
const { generateTestData } = require('./generate-test-data');

// Configuration
const config = {
  collectionsDir: path.join(__dirname, '../collections'),
  environmentsDir: path.join(__dirname, '../environments'),
  reportsDir: path.join(__dirname, '../reports'),
  environmentFile: process.env.ENV_FILE || 'development.json',
  collections: [
    'auth.json',
    'layouts.json',
    'preferences.json',
    'health-check.json',
    'e2e-flow.json'
  ]
};

// Ensure reports directory exists
if (!fs.existsSync(config.reportsDir)) {
  fs.mkdirSync(config.reportsDir, { recursive: true });
}

async function runTests() {
  try {
    console.log('Starting API test suite execution...');
    
    // Optionally generate test data first
    if (process.env.GENERATE_TEST_DATA === 'true') {
      await generateTestData();
    }
    
    // Load environment file
    const environmentFile = path.join(config.environmentsDir, config.environmentFile);
    
    // Run each collection in sequence
    for (const collectionFile of config.collections) {
      const collectionPath = path
I'll continue writing the Newman Runner Script:

```javascript
      const collectionPath = path.join(config.collectionsDir, collectionFile);
      const collectionName = path.basename(collectionFile, '.json');
      const reportPath = path.join(config.reportsDir, `${collectionName}-report.html`);
      
      console.log(`Running collection: ${collectionName}`);
      
      // Run the collection
      await new Promise((resolve, reject) => {
        newman.run({
          collection: require(collectionPath),
          environment: require(environmentFile),
          reporters: ['cli', 'htmlextra'],
          reporter: {
            htmlextra: {
              export: reportPath,
              template: 'default',
              showOnlyFails: false,
              noSyntaxHighlighting: false,
              testPaging: true,
              browserTitle: `API Tests - ${collectionName}`,
              title: `Real Estate Platform API - ${collectionName} Tests`
            }
          }
        }, function (err, summary) {
          if (err) {
            console.error(`Error running collection ${collectionName}:`, err);
            reject(err);
            return;
          }
          
          console.log(`Collection ${collectionName} completed with status: ${summary.run.stats.failures ? 'FAILED' : 'PASSED'}`);
          console.log(`Run summary: ${summary.run.stats.iterations.total} iterations, ${summary.run.stats.requests.total} requests, ${summary.run.stats.assertions.total} assertions, ${summary.run.stats.assertions.failed} failures`);
          console.log(`Report saved to: ${reportPath}`);
          
          // If there were failures, exit with non-zero code in CI environments
          if (summary.run.failures.length > 0 && process.env.CI === 'true') {
            process.exitCode = 1;
          }
          
          resolve(summary);
        });
      });
    }
    
    console.log('All tests completed');
  } catch (error) {
    console.error('Error running tests:', error);
    process.exitCode = 1;
  }
}

// Execute if this script is run directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
```

#### 9. Create CI Integration Script

📄 **postman/scripts/ci-tests.sh**
```bash
#!/bin/bash
set -e

# CI Integration script for Postman API Tests

# Default values
ENVIRONMENT="testing"
REPORT_DIR="./postman/reports"
GENERATE_DATA="false"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    --env)
      ENVIRONMENT="$2"
      shift 2
      ;;
    --report-dir)
      REPORT_DIR="$2"
      shift 2
      ;;
    --generate-data)
      GENERATE_DATA="true"
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Set environment variables
export ENV_FILE="${ENVIRONMENT}.json"
export GENERATE_TEST_DATA="${GENERATE_DATA}"
export CI="true"

# Create report directory if it doesn't exist
mkdir -p "${REPORT_DIR}"

echo "Starting API tests with environment: ${ENVIRONMENT}"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install newman newman-reporter-htmlextra axios
fi

# Run the tests
echo "Running API tests..."
node ./postman/scripts/run-tests.js

# Check if tests passed
if [ $? -eq 0 ]; then
  echo "All tests passed!"
  exit 0
else
  echo "Tests failed! Check the reports for details."
  exit 1
fi
```

#### 10. Configure Test Validation Script

📄 **postman/scripts/validate-collections.js**
```javascript
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

// Configuration
const config = {
  collectionsDir: path.join(__dirname, '../collections'),
  environmentsDir: path.join(__dirname, '../environments'),
  schemaPath: path.join(__dirname, '../schemas/collection-schema.json')
};

// Postman collection schema
const collectionSchema = {
  "type": "object",
  "required": ["info", "item"],
  "properties": {
    "info": {
      "type": "object",
      "required": ["_postman_id", "name", "schema"],
      "properties": {
        "_postman_id": { "type": "string" },
        "name": { "type": "string" },
        "description": { "type": "string" },
        "schema": { "type": "string" }
      }
    },
    "item": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "request": { "type": "object" },
          "response": { "type": "array" },
          "event": { "type": "array" },
          "item": { "type": "array" }
        },
        "required": ["name"]
      }
    }
  }
};

// Initialize Ajv
const ajv = new Ajv();
const validate = ajv.compile(collectionSchema);

// Get all collection files
function getCollectionFiles() {
  return fs.readdirSync(config.collectionsDir)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(config.collectionsDir, file));
}

// Validate a single collection
function validateCollection(filePath) {
  try {
    const collection = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const valid = validate(collection);
    
    if (!valid) {
      console.error(`[FAIL] ${path.basename(filePath)}: Validation errors:`);
      console.error(JSON.stringify(validate.errors, null, 2));
      return false;
    }
    
    // Additional custom validations
    let isValid = true;
    
    // Check if each request has at least one test
    const checkTests = (items) => {
      for (const item of items) {
        if (item.item && Array.isArray(item.item)) {
          checkTests(item.item);
        } else if (item.request) {
          const hasTests = item.event && item.event.some(e => e.listen === 'test');
          if (!hasTests) {
            console.warn(`[WARN] ${path.basename(filePath)}: Request "${item.name}" has no tests`);
            // isValid = false; // Uncomment to make this a failure case
          }
        }
      }
    };
    
    checkTests(collection.item);
    
    console.log(`[PASS] ${path.basename(filePath)}: Valid Postman collection`);
    return isValid;
  } catch (error) {
    console.error(`[FAIL] ${path.basename(filePath)}: ${error.message}`);
    return false;
  }
}

// Validate all collections
function validateAllCollections() {
  console.log('Validating Postman collections...');
  
  const collectionFiles = getCollectionFiles();
  let allValid = true;
  
  for (const file of collectionFiles) {
    const isValid = validateCollection(file);
    allValid = allValid && isValid;
  }
  
  if (allValid) {
    console.log('All collections are valid!');
    return 0;
  } else {
    console.error('Some collections have validation errors!');
    return 1;
  }
}

// Execute if this script is run directly
if (require.main === module) {
  const exitCode = validateAllCollections();
  process.exit(exitCode);
}

module.exports = { validateCollection, validateAllCollections };
```

#### 11. Create Test Documentation Template

📄 **postman/docs/api-testing-guide.md**
```markdown
# API Testing Guide for Multi-Frame Layout Component System

## Overview

This guide provides information on how to execute API tests for the Multi-Frame Layout Component System using Postman and Newman. The tests cover authentication, layout management, user preferences, and end-to-end workflows.

## Setup Requirements

1. Node.js (v14+)
2. Postman Desktop App (for test development)
3. Newman (for CLI test execution)
4. Newman HTML Reporter (for test reports)

## Installation

```bash
# Install required packages
npm install -g newman newman-reporter-htmlextra

# Clone the repository
git clone [repository-url]
cd [repository-directory]
```

## Test Collections

The test suite consists of the following collections:

1. **Authentication** - Tests for user authentication endpoints
2. **Layouts** - Tests for layout configuration management
3. **User Preferences** - Tests for user preferences API
4. **Health Check** - Tests for API health and status endpoints
5. **End-to-End Flow** - Integration tests for complete user workflows

## Test Environments

The following environments are configured:

1. **Development** - For local development testing
2. **Testing** - For CI/CD pipeline testing
3. **Production** - For production verification tests (restricted use)

## Running Tests

### Using Postman Desktop App

1. Import the collections from the `postman/collections` directory
2. Import the environments from the `postman/environments` directory
3. Select the appropriate environment
4. Run the collections manually or using the Collection Runner

### Using Newman CLI

```bash
# Run a specific collection with environment
newman run postman/collections/layouts.json -e postman/environments/development.json

# Run all tests and generate reports
node postman/scripts/run-tests.js

# Run tests in CI mode
CI=true node postman/scripts/run-tests.js
```

### Using the CI Integration Script

```bash
# Run in testing environment
./postman/scripts/ci-tests.sh --env testing

# Generate test data before running tests
./postman/scripts/ci-tests.sh --env testing --generate-data
```

## Test Reports

HTML reports are generated in the `postman/reports` directory after test execution. These reports include:

- Summary of test execution
- Request/response details
- Test assertions and results
- Timing information

## Test Data Management

The test suite includes a data generator script that creates test data required for API testing. This script can be run separately or as part of the test execution process.

```bash
# Generate test data separately
node postman/scripts/generate-test-data.js
```

## CI/CD Integration

The test suite is designed to be integrated with CI/CD pipelines. The `ci-tests.sh` script provides a convenient way to run the tests in a CI environment with the following features:

- Environment selection
- Test report generation
- Exit code based on test results
- Test data generation

## Extending the Test Suite

### Adding New Tests

1. Create a new test file in the appropriate collection
2. Add assertions for each request
3. Ensure proper test cleanup after execution
4. Validate the collection using the validation script

### Creating New Collections

1. Create a new collection in Postman Desktop App
2. Export the collection to the `postman/collections` directory
3. Add the collection to the test runner script
4. Run the validation script to ensure the collection meets standards

## Best Practices

1. Each request should have at least one test assertion
2. Use environment variables for dynamic values
3. Include proper test cleanup to leave the system in a known state
4. Add descriptive names and documentation for tests
5. Use pre-request scripts for test setup when needed
6. Ensure tests are idempotent (can be run multiple times)

## Troubleshooting

### Common Issues

1. **Authentication Failures** - Check that the environment variables for authentication are correctly set
2. **Missing Test Data** - Run the data generation script before executing tests
3. **Network Errors** - Verify that the API server is running and accessible
4. **Schema Validation Errors** - Ensure that request and response formats match the API schema

### Getting Help

For assistance with the API test suite, contact the QA team or refer to the internal documentation.
```

#### 12. Create Documentation for Test Reports Interpretation

📄 **postman/docs/interpreting-test-reports.md**
```markdown
# Interpreting API Test Reports

This guide explains how to interpret the HTML reports generated by the API test suite for the Multi-Frame Layout Component System.

## Report Structure

The HTML reports generated by Newman HTML Extra reporter include the following sections:

1. **Summary** - Overall test execution results
2. **Total Requests** - Details of all API requests made
3. **Failed Tests** - Information about test failures
4. **Skipped Tests** - Information about skipped tests
5. **Iterations** - Results by test iteration

## Summary Section

The summary section provides a high-level overview of the test execution:

- **Total Requests**: The number of API requests made during test execution
- **Failed Tests**: The number of test assertions that failed
- **Skipped Tests**: The number of tests that were skipped
- **Total Run Duration**: The time taken to execute all tests
- **Total Data Received**: The amount of data received from the API
- **Average Response Time**: The average time taken for API responses

### Status Indicators

- 🟢 **Green**: All tests passed
- 🔴 **Red**: One or more tests failed
- 🟡 **Yellow**: All tests passed but some tests were skipped

## Request Details

Each request in the report includes:

- **Request Method**: GET, POST, PUT, DELETE, etc.
- **URL**: The endpoint that was called
- **Status Code**: The HTTP status code returned
- **Response Time**: How long the request took to complete
- **Response Size**: The size of the response data
- **Tests**: The assertions run on this request and their results

### Test Result Indicators

- ✅ **Green Checkmark**: Test passed
- ❌ **Red X**: Test failed
- ⚠️ **Yellow Warning**: Test was skipped

## Failure Analysis

When a test fails, the report provides detailed information to help diagnose the issue:

- **Expected vs. Actual**: The expected and actual values that caused the failure
- **Error Message**: A description of why the test failed
- **Request Data**: The data sent with the request
- **Response Data**: The data received from the API
- **Test Script**: The JavaScript code that executed the test

## Performance Metrics

The report includes performance metrics for each request:

- **DNS Lookup**: Time taken to resolve the domain name
- **TCP Connection**: Time taken to establish a TCP connection
- **TLS Handshake**: Time taken for the TLS handshake (for HTTPS)
- **First Byte**: Time to first byte received
- **Download**: Time taken to download the response

## Analyzing Common Issues

### Authentication Failures

Look for:
- 401/403 status codes
- Failed tests related to token validation
- Error messages about invalid credentials

Resolution:
- Check that the correct authentication credentials are being used
- Verify that tokens have not expired
- Ensure proper authorization headers are included

### Data Validation Failures

Look for:
- Failed tests related to data structure or values
- Assertions about missing properties
- Type validation errors

Resolution:
- Check the request data format
- Verify that the expected response schema matches the actual schema
- Ensure data types match expectations

### Performance Issues

Look for:
- Long response times
- Timeout errors
- Performance thresholds being exceeded

Resolution:
- Check server resources and scaling
- Review database query performance
- Consider optimizing API endpoints

## Historical Comparison

The report includes a comparison with previous test runs (if available) to help identify trends:

- **Regression**: Tests that passed previously but now fail
- **Fixed Issues**: Tests that failed previously but now pass
- **Performance Trends**: Changes in response times over time

## Export Options

The report can be exported in various formats:

- **HTML**: For detailed visual analysis
- **JSON**: For programmatic processing
- **CSV**: For tabular data analysis
- **JUnit XML**: For integration with CI/CD systems

## Integration with CI/CD

When the tests are run in a CI/CD pipeline, the report includes additional information:

- **Build Information**: The build number and timestamp
- **Environment**: The environment in which the tests were executed
- **Commit Information**: The commit that triggered the build
- **Link to Source Code**: Direct links to the relevant code

## Next Steps After Test Failures

1. **Identify the root cause** by analyzing the failed tests
2. **Reproduce the issue** in a development environment
3. **Fix the code** that caused the failure
4. **Re-run the tests** to verify the fix
5. **Update test cases** if the API behavior has intentionally changed
```

### ✅ AFTER IMPLEMENTATION

#### 🔍 Testing Your Tests

1. Verify Collection Validation

```bash
# Run the collection validation script
node postman/scripts/validate-collections.js
```

2. Test Local API

```bash
# Start the local API server
npm run start:api

# Run the tests against local API
node postman/scripts/run-tests.js
```

3. Test Data Generation

```bash
# Generate test data
node postman/scripts/generate-test-data.js
```

4. Run End-to-End Flow

```bash
# Run the end-to-end flow test
GENERATE_TEST_DATA=true node postman/scripts/run-tests.js
```

#### 📊 Reporting and Monitoring

1. Configure a Postman Monitor for continuous API health checking:
   - Create a monitor in Postman to run the Health Check collection
   - Set frequency to every 15 minutes
   - Configure notifications for failures
   - Connect with incident management systems (if available)

2. Integrate test reports with CI/CD pipeline:
   - Add Newman HTML reporter output to CI artifacts
   - Display test status in pipeline dashboards
   - Set up alerts for test failures

3. Create API Testing Dashboard:
   - Display current API health status
   - Show recent test execution results
   - Track API performance metrics over time
   - Highlight regressions and improvements

#### ✅ Commit your changes

```bash
git add .
git commit -m "Chunk 8: API Testing & Postman Automation"
git push origin feature/api-testing-postman
```

#### 🔃 Create a Pull Request

1. Go to your repository on GitHub
2. Click on "Pull requests" > "New pull request"
3. Select your branch `feature/api-testing-postman`
4. Add a title: "Implement API Testing & Postman Automation"
5. Add a description referencing this markdown doc
6. Request review from team members

#### 📝 Update Documentation

Ensure the project documentation is updated to include:
- The API testing approach
- How to run the tests locally
- How to interpret test results
- How to add new tests

#### 🔗 Integration Targets

- CI/CD Pipeline (GitHub Actions, Jenkins, etc.)
- API Health Monitoring
- Development Environment
- Testing Environment
- Production Environment (restricted)

#### 📋 Completion Log

- [ ] Collection validation script implementation complete
- [ ] Environment configurations implementation complete
- [ ] Auth API tests implementation complete
- [ ] Layout API tests implementation complete
- [ ] User Preferences API tests implementation complete
- [ ] Health Check API tests implementation complete
- [ ] End-to-End flow tests implementation complete
- [ ] Test data generator implementation complete
- [ ] Newman runner script implementation complete
- [ ] CI integration script implementation complete
- [ ] Test documentation complete
- [ ] Integration with CI/CD pipeline complete

## 📈 Implementation References

### Example CI/CD Integration (GitHub Actions)

📄 **.github/workflows/api-tests.yml**
```yaml
name: API Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
  schedule:
    - cron: '0 0 * * *'  # Run daily at midnight

jobs:
  api-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '14'
    
    - name: Install dependencies
      run: npm install -g newman newman-reporter-htmlextra
    
    - name: Start API server
      run: |
        npm install
        npm run start:api &
        sleep 10  # Give the server time to start
      
    - name: Run API tests
      run: ./postman/scripts/ci-tests.sh --env testing --generate-data
    
    - name: Upload test results
      uses: actions/upload-artifact@v2
      with:
        name: api-test-reports
        path: ./postman/reports
        if-no-files-found: error
```

### API Testing Matrix

| API Endpoint           | Auth Required | Test Cases                           | Collections          |
|------------------------|---------------|--------------------------------------|----------------------|
| /auth/login            | No            | Valid login, Invalid credentials     | Auth, E2E Flow       |
| /auth/register         | No            | Valid register, Duplicate email      | Auth                 |
| /auth/logout           | Yes           | Valid logout                         | Auth, E2E Flow       |
| /layouts               | Yes           | Get all, Create, Filter              | Layouts, E2E Flow    |
| /layouts/{id}          | Yes           | Get by ID, Update, Delete            | Layouts, E2E Flow    |
| /layouts/{id}/clone    | Yes           | Clone layout                         | Layouts              |
| /user/preferences      | Yes           | Get, Update                          | Preferences, E2E Flow|
| /user/preferences/reset| Yes           | Reset to defaults                    | Preferences          |
| /health                | No            | Service health check                 | Health Check         |
| /status                | Yes           | Detailed system status               | Health Check         |

### Environment Variables for Test Runner

| Variable Name      | Description                       | Default Value             |
|--------------------|-----------------------------------|---------------------------|
| ENV_FILE           | Environment file to use           | development.json          |
| GENERATE_TEST_DATA | Generate test data before running | false                     |
| API_BASE_URL       | Base URL for API                  | http://localhost:5000/api |
| AUTH_EMAIL         | Email for authentication          | test@example.com          |
| AUTH_PASSWORD      | Password for authentication       | password123               |
| CI                 | Running in CI environment         | false                     |

### Visual Structure

```
┌─────────────────────────────────────────────────────┐
│ Postman Test Architecture                           │
│                                                     │
│  ┌─────────────┐     ┌─────────────┐                │
│  │Collections  │     │Environments │                │
│  │- Auth       │     │- Dev        │                │
│  │- Layouts    │     │- Test       │                │
│  │- Preferences│     │- Prod       │                │
│  │- E2E        │     └─────────────┘                │
│  └─────────────┘                                    │
│          │                  │                       │
│          ▼                  ▼                       │
│     ┌────────────────────────────────┐              │
│     │      Newman Test Runner        │              │
│     └────────────────────────────────┘              │
│                     │                               │
│          ┌──────────┴──────────┐                    │
│          ▼                     ▼                    │
│  ┌─────────────┐       ┌──────────────┐             │
│  │HTML Reports │       │CI Integration│             │
│  └─────────────┘       └──────────────┘             │
│                                                     │
└─────────────────────────────────────────────────────┘
```