// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // PDF Viewer Implementation
    const pdfPath = "Agents - Getting Started.pdf";
    const canvas = document.getElementById('pdf-canvas');
    const currentPage = document.getElementById('current-page');
    const totalPages = document.getElementById('total-pages');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    
    let pdfDoc = null;
    let pageNum = 1;
    let pageRendering = false;
    let pageNumPending = null;
    let scale = 1.5;
    
    // Initialize PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    // Load the PDF
    function loadPDF() {
        pdfjsLib.getDocument(pdfPath).promise.then(function(pdf) {
            pdfDoc = pdf;
            totalPages.textContent = pdf.numPages;
            
            // Initial page render
            renderPage(pageNum);
            
            // Update button states
            updateButtonStates();
        }).catch(function(error) {
            console.error("Error loading PDF:", error);
            const pdfContainer = document.querySelector('.pdf-frame-container');
            pdfContainer.innerHTML = '<div class="pdf-error">Error loading PDF. Please make sure the file exists and try again.</div>';
        });
    }
    
    // Render a specific page
    function renderPage(num) {
        pageRendering = true;
        
        // Update current page display
        currentPage.textContent = num;
        
        // Get the page
        pdfDoc.getPage(num).then(function(page) {
            const viewport = page.getViewport({ scale: scale });
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            const renderContext = {
                canvasContext: canvas.getContext('2d'),
                viewport: viewport
            };
            
            const renderTask = page.render(renderContext);
            
            // Wait for rendering to finish
            renderTask.promise.then(function() {
                pageRendering = false;
                
                // Check if there's a pending page
                if (pageNumPending !== null) {
                    renderPage(pageNumPending);
                    pageNumPending = null;
                }
            });
        });
        
        // Update button states
        updateButtonStates();
    }
    
    // Go to previous page
    function prevPage() {
        if (pageNum <= 1) {
            return;
        }
        pageNum--;
        queueRenderPage(pageNum);
    }
    
    // Go to next page
    function nextPage() {
        if (pageNum >= pdfDoc.numPages) {
            return;
        }
        pageNum++;
        queueRenderPage(pageNum);
    }
    
    // Queue a page for rendering
    function queueRenderPage(num) {
        if (pageRendering) {
            pageNumPending = num;
        } else {
            renderPage(num);
        }
    }
    
    // Update button states based on current page
    function updateButtonStates() {
        prevPageButton.disabled = pageNum <= 1;
        nextPageButton.disabled = pdfDoc && pageNum >= pdfDoc.numPages;
    }
    
    // Event listeners for page navigation
    prevPageButton.addEventListener('click', prevPage);
    nextPageButton.addEventListener('click', nextPage);
    
    // Initialize PDF viewer
    loadPDF();
    
    // Get references to DOM elements
    const inputText = document.getElementById('input-text');
    const tokenCount = document.getElementById('token-count');
    const charCount = document.getElementById('char-count');
    const modelSelect = document.getElementById('model-select');
    const contextFill = document.getElementById('context-fill');
    const windowStatus = document.getElementById('window-status');
    const chatMessage = document.getElementById('chat-message');
    const sendMessageButton = document.getElementById('send-message');
    const chatHistory = document.getElementById('chat-history');
    const memoryFill = document.getElementById('memory-fill');
    
    // Initialize the tokenizer
    let tokenizer;
    
    // Function to estimate tokens using a simple approximation (4 chars per token)
    // This is a fallback if the GPT tokenizer fails to load
    function estimateTokens(text) {
        return Math.ceil(text.length / 4);
    }
    
    // Function to count tokens using the GPT tokenizer
    function countTokens(text) {
        if (tokenizer) {
            try {
                // Use the tokenizer if available
                return tokenizer.encode(text).length;
            } catch (error) {
                console.error("Error using tokenizer:", error);
                // Fall back to estimation
                return estimateTokens(text);
            }
        } else {
            // Use estimation if tokenizer is not loaded
            return estimateTokens(text);
        }
    }
    
    // Function to update the token counter and visualization
    function updateTokenCounter() {
        const text = inputText.value;
        const tokens = countTokens(text);
        const chars = text.length;
        
        // Update the counters
        tokenCount.textContent = tokens;
        charCount.textContent = chars;
        
        // Update the context window visualization
        const contextWindow = parseInt(modelSelect.value);
        const percentage = Math.min(100, (tokens / contextWindow) * 100);
        
        contextFill.style.width = `${percentage}%`;
        
        // Update the color based on percentage (green to yellow to red)
        if (percentage < 50) {
            contextFill.style.backgroundColor = '#4caf50'; // Green
        } else if (percentage < 80) {
            contextFill.style.backgroundColor = '#ff9800'; // Orange
        } else {
            contextFill.style.backgroundColor = '#f44336'; // Red
        }
        
        // Update status text
        windowStatus.textContent = `${percentage.toFixed(1)}% of context window used (${tokens} / ${contextWindow} tokens)`;
    }
    
    // Function to simulate agent's memory and context window
    let memoryTokens = 0;
    const MAX_MEMORY_TOKENS = 8000; // Default memory size
    const messages = [];
    
    function updateMemoryVisualization() {
        // Update the memory meter
        const percentage = Math.min(100, (memoryTokens / MAX_MEMORY_TOKENS) * 100);
        memoryFill.style.width = `${percentage}%`;
        
        // Update color based on fill level
        if (percentage < 50) {
            memoryFill.style.backgroundColor = '#4a6bff'; // Blue
        } else if (percentage < 80) {
            memoryFill.style.backgroundColor = '#ff9800'; // Orange
        } else {
            memoryFill.style.backgroundColor = '#f44336'; // Red
        }
        
        // Update the message styling based on their "memory status"
        messages.forEach((msg, index) => {
            const msgElement = document.getElementById(`msg-${index}`);
            if (!msgElement) return;
            
            // Calculate position in memory
            // Most recent messages are remembered clearly, older ones fade
            const positionPercentage = index / messages.length;
            
            if (positionPercentage > 0.7) {
                // Newest messages are clear
                msgElement.classList.remove('faded-message', 'forgotten-message');
            } else if (positionPercentage > 0.4) {
                // Middle messages are faded
                msgElement.classList.add('faded-message');
                msgElement.classList.remove('forgotten-message');
            } else {
                // Oldest messages are "forgotten"
                msgElement.classList.add('forgotten-message');
                msgElement.classList.remove('faded-message');
            }
        });
    }
    
    // Function to add a message to the chat
    function addMessage(content, isUser) {
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(isUser ? 'user-message' : 'agent-message');
        messageElement.id = `msg-${messages.length}`;
        messageElement.textContent = content;
        
        // Add to chat history
        chatHistory.appendChild(messageElement);
        
        // Store message data
        messages.push({
            content,
            isUser,
            tokens: countTokens(content)
        });
        
        // Update memory tokens
        memoryTokens += countTokens(content);
        
        // Add system message if memory is getting full
        if (memoryTokens > MAX_MEMORY_TOKENS * 0.9 && !isUser) {
            const systemMsg = document.createElement('div');
            systemMsg.classList.add('message', 'agent-message');
            systemMsg.textContent = "Memory nearly full. Some older messages may be forgotten.";
            systemMsg.style.fontStyle = 'italic';
            systemMsg.style.opacity = '0.7';
            chatHistory.appendChild(systemMsg);
        }
        
        // Simulate forgetting old messages if context window is full
        if (memoryTokens > MAX_MEMORY_TOKENS) {
            // Remove oldest messages until we're under the limit
            while (memoryTokens > MAX_MEMORY_TOKENS * 0.8 && messages.length > 1) {
                const oldestMsg = messages.shift();
                memoryTokens -= oldestMsg.tokens;
                
                // Add a placeholder for the forgotten message
                const forgottenNotice = document.createElement('div');
                forgottenNotice.classList.add('message', 'forgotten-message');
                forgottenNotice.textContent = "Message forgotten from context...";
                forgottenNotice.style.fontStyle = 'italic';
                chatHistory.prepend(forgottenNotice);
            }
        }
        
        // Scroll to bottom
        chatHistory.scrollTop = chatHistory.scrollHeight;
        
        // Update visualization
        updateMemoryVisualization();
    }
    
    // Agent response generator
    function generateAgentResponse(userMessage) {
        // Simple responses based on user message
        const responses = [
            "I understand you're asking about " + userMessage.substring(0, 20) + "...",
            "Let me think about that for a moment...",
            "Based on my knowledge, I can tell you that " + userMessage.substring(0, 15) + " is an interesting topic.",
            "I've processed your request about " + userMessage.substring(0, 10) + " and here's what I found...",
            "I'm using my tools to analyze your question about " + userMessage.substring(0, 25) + "...",
            "Looking at my context window, I recall we've been discussing this for a while...",
            "Let me access my knowledge base for information on " + userMessage.substring(0, 15) + "...",
            "I'm an AI agent with tools and I'll help you with " + userMessage.substring(0, 20) + "..."
        ];
        
        // Return a random response
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Event listeners
    inputText.addEventListener('input', updateTokenCounter);
    modelSelect.addEventListener('change', updateTokenCounter);
    
    sendMessageButton.addEventListener('click', function() {
        const message = chatMessage.value.trim();
        if (message) {
            // Add user message
            addMessage(message, true);
            
            // Clear input
            chatMessage.value = '';
            
            // Simulate agent thinking
            setTimeout(() => {
                // Generate and add agent response
                const response = generateAgentResponse(message);
                addMessage(response, false);
            }, 1000);
        }
    });
    
    // Also listen for Enter key in chat input
    chatMessage.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessageButton.click();
        }
    });
    
    // Try to load the tokenizer
    try {
        // Using window.cl100k_base which should be loaded from the CDN
        if (window.cl100k_base) {
            tokenizer = {
                encode: function(text) {
                    return window.cl100k_base.encode(text);
                }
            };
            console.log("GPT tokenizer loaded successfully");
        } else {
            console.warn("GPT tokenizer not available, falling back to estimation");
        }
    } catch (error) {
        console.error("Error loading tokenizer:", error);
    }
    
    // Initialize visualizations
    updateTokenCounter();
    updateMemoryVisualization();
    
    // Add initial agent message
    addMessage("Hello! I'm an AI agent that can help you understand how AI agents work. I have access to tools and can maintain context in my memory. What would you like to know?", false);

    // MCP Demo Implementation
    const mcpDemoButton = document.getElementById('mcp-demo-button');
    const mcpDemoResult = document.getElementById('mcp-demo-result');
    
    // Simulate an MCP tool call and response
    const mcpDemoSteps = [
        {
            type: 'prompt',
            content: 'User prompt: "Find information about AI agents and summarize the main concepts."'
        },
        {
            type: 'tool-call',
            content: 'Tool Call: search_documents(query="AI agents concepts", limit=3)'
        },
        {
            type: 'tool-result',
            content: 'Tool Result: Found 3 documents about AI agents:\n- "Introduction to AI Agents"\n- "Building Autonomous Systems"\n- "Agent Architecture Patterns"'
        },
        {
            type: 'response',
            content: 'Based on the documents I found, AI agents are autonomous systems that combine LLMs with tools and decision-making capabilities. They typically have these key components:\n\n1. Core reasoning engine (usually an LLM)\n2. Tool access for interacting with external systems\n3. Memory/context management\n4. Planning and decision-making abilities'
        }
    ];
    
    let mcpDemoRunning = false;
    let currentStepIndex = 0;
    
    mcpDemoButton.addEventListener('click', function() {
        // Reset if already completed or start new demo
        if (!mcpDemoRunning || currentStepIndex >= mcpDemoSteps.length) {
            // Clear previous demo
            mcpDemoResult.innerHTML = '';
            currentStepIndex = 0;
            mcpDemoRunning = true;
            mcpDemoButton.textContent = 'Running Demo...';
            mcpDemoButton.disabled = true;
            
            // Start the demo sequence
            runNextMcpDemoStep();
        }
    });
    
    function runNextMcpDemoStep() {
        if (currentStepIndex < mcpDemoSteps.length) {
            const step = mcpDemoSteps[currentStepIndex];
            
            // Create and add step element with appropriate styling
            const stepElement = document.createElement('div');
            stepElement.classList.add('mcp-step');
            if (step.type === 'tool-call') {
                stepElement.classList.add('tool-call');
            } else if (step.type === 'tool-result') {
                stepElement.classList.add('tool-result');
            }
            
            stepElement.textContent = step.content;
            mcpDemoResult.appendChild(stepElement);
            
            // Schedule next step with delay for visual effect
            currentStepIndex++;
            if (currentStepIndex < mcpDemoSteps.length) {
                setTimeout(runNextMcpDemoStep, 1500);
            } else {
                // Demo completed
                mcpDemoButton.textContent = 'Run MCP Tool Demo Again';
                mcpDemoButton.disabled = false;
                mcpDemoRunning = false;
            }
        }
    }
}); 