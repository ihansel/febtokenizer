# FebTokenizer

A web application that demonstrates the key concepts of AI agents, token usage, and context windows as presented in "Agents - Getting Started" by Chris Boden of Peregian Digital Hub.

## Overview

FebTokenizer helps you understand:

1. **AI Agents**: What they are and how they work
2. **Tokens & Context Windows**: How AI models process text and manage memory
3. **Agent Memory**: How conversations are stored and older messages get "forgotten"
4. **Model Context Protocol (MCP)**: How to build AI agents that connect to external tools and data sources

## Features

### AI Agent Concepts
- Visual representation of AI agent architecture
- Explanation of how agents use LLMs, tools, and knowledge

### Token Counter & Visualizer
- Count the number of tokens in your text
- Visualize how much of a model's context window your text uses
- Compare different model context window sizes

### Agent Memory Simulator
- Simulate a conversation with an AI agent
- See how the context window fills up over time
- Visualize how older messages get "forgotten" as new ones are added

### MCP Agent Building Guide
- Introduction to the Model Context Protocol (MCP)
- Visual explanation of MCP architecture
- Code examples for implementing MCP in JavaScript
- Interactive demo of MCP tool calls
- Resources for learning more about MCP

## How to Use

1. **Open index.html** in a web browser to start using FebTokenizer
2. **Token Counter**: Type or paste text in the input area to see token usage
3. **Context Window**: Select different AI models to see how your text fits in their context window
4. **Agent Memory**: Chat with the simulated agent to see how context accumulates
5. **MCP Demo**: Click the "Run MCP Tool Demo" button to see a simulation of MCP tool calls

## Technical Details

FebTokenizer uses:
- HTML, CSS, and JavaScript (no dependencies except for the tokenizer)
- GPT Tokenizer for accurate token counting
- Visual demonstrations of AI agent concepts
- Interactive simulations of MCP tool calls

## About MCP (Model Context Protocol)

The Model Context Protocol (MCP) is an open standard developed by Anthropic that enables AI models to access external data sources and tools through a standardized interface. MCP provides:

- A unified way for AI models to interact with external systems
- The ability to switch between different LLM providers
- A growing ecosystem of pre-built integrations
- Better responses through access to relevant data and tools

Learn more about MCP at [Model Context Protocol](https://modelcontextprotocol.io/).

## About Tokens and Context Windows

Tokens are the basic units of text that AI models process. A token is roughly 4 characters in English (or a common word). Each AI model has a maximum number of tokens it can process at once, called its "context window."

Understanding token usage is important because:
- It determines how much text can fit in a single prompt
- It affects the cost of API calls to AI services
- It limits how much "memory" an AI agent has during a conversation

## Credits

This application was inspired by "Agents - Getting Started" by Chris Boden from the Peregian Digital Hub.

## License

This project is open source and available under the MIT License. 