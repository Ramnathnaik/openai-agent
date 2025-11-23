# OpenAI Agents SDK Examples

A comprehensive collection of examples demonstrating various patterns and capabilities of the OpenAI Agents SDK.

## 📋 Overview

This repository contains working examples that showcase different aspects of building AI agents using the OpenAI Agents SDK. From basic agent creation to complex multi-agent systems with guardrails, these examples serve as practical learning resources.

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key
- API Ninjas API key (for certain examples)

### Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key
   API_NINJA_KEY=your_api_ninjas_key
   ```

## 📚 Examples

### 1. Agent Quickstart (`agent-quickstart.js`)

The simplest possible agent implementation. Great starting point for understanding basic agent concepts.

**Key Concepts:**
- Creating a basic agent with instructions
- Running an agent with user input
- Accessing agent responses

**Run:**
```bash
node agent-quickstart.js
```

### 2. Agent with Tool (`agent-with-tool.js`)

Demonstrates how to create custom tools that agents can use to interact with external APIs.

**Key Concepts:**
- Creating tools with the `tool()` function
- Defining tool parameters using Zod schemas
- Making external API calls within tools
- Agent automatically determines when to use tools

**Run:**
```bash
node agent-with-tool.js
```

### 3. Agent with Structured Output (`agent-with-struct-output.js`)

Shows how to enforce structured, typed outputs from agents using schemas.

**Key Concepts:**
- Defining output schemas with Zod
- Setting `outputType` on agents
- Transforming unstructured API data into structured format
- Combining tools with structured outputs

**Run:**
```bash
node agent-with-struct-output.js
```

### 4. Multi-Agent System (`multi-agent.js`)

Demonstrates agent composition where specialized agents are used as tools by a coordinator agent.

**Key Concepts:**
- Converting agents to tools with `.asTool()`
- Agent composition pattern
- Specialized agents with focused responsibilities
- Main agent routing requests to sub-agents

**Run:**
```bash
node multi-agent.js
```

### 5. Multi-Agent with Handoff (`multi-agent-with-handoff.js`)

Shows the handoff pattern where control is transferred completely from one agent to another.

**Key Concepts:**
- Handoff vs. agent-as-tool patterns
- Using `handoffs` property for agent delegation
- `RECOMMENDED_PROMPT_PREFIX` for better handoff decisions
- Viewing execution history with `result.history`

**Run:**
```bash
node multi-agent-with-handoff.js
```

### 6. Guardrails Implementation (`guardrail-implementation.js`)

Advanced example showing how to implement input and output guardrails for safe agent operation.

**Key Concepts:**
- Input guardrails for request validation
- Output guardrails for response validation
- Tripwire mechanism for violation detection
- Using agents as guardrails (meta-agents)
- Error handling for guardrail violations

**Run:**
```bash
node guardrail-implementation.js
```

## 🏗️ Architecture Patterns

### Basic Agent Pattern
```
User Input → Agent → Response
```

### Agent with Tools Pattern
```
User Input → Agent → Tool Execution → Agent → Response
```

### Multi-Agent Pattern
```
User Input → Coordinator Agent → Sub-Agent (as tool) → Coordinator Agent → Response
```

### Agent Handoff Pattern
```
User Input → Coordinator Agent → [Handoff] → Specialized Agent → Response
```

### Guardrails Pattern
```
User Input → Input Guardrail → Agent → Output Guardrail → Response
```

### Conversational Thread Pattern
```
User Message → Add to Thread → Agent (with full history) → Update Thread → Response
```

## 🔑 Key Technologies

- **@openai/agents**: OpenAI Agents SDK
- **zod**: Schema validation library
- **axios**: HTTP client for API calls
- **dotenv**: Environment variable management

## 📖 Learning Path

Recommended order for exploring these examples:

1. `agent-quickstart.js` - Understand basic agent creation
2. `agent-with-tool.js` - Learn tool integration
3. `agent-with-struct-output.js` - Master structured outputs
4. `multi-agent.js` - Explore agent composition
5. `multi-agent-with-handoff.js` - Understand handoff patterns
6. `guardrail-implementation.js` - Implement safety measures

## 🛡️ Security Considerations

The guardrails example demonstrates important security patterns:
- Always validate user input before processing
- Prevent unauthorized data access
- Implement proper error handling
- Use structured outputs for consistency

## 📝 License

ISC

## 🤝 Contributing

Feel free to explore, modify, and extend these examples for your own learning and projects.

## 📧 Contact

For questions or feedback, please open an issue in the repository.
