import { z } from 'zod';
import {
    Tool,
    calculateTransactionsByDateTool,
    calculateTransactionsByDateRangeTool,
    calculateTransactionsByLastDaysTool,
    getSpendingByTypeTool,
    detectSpendingLeaksTool
} from './definitions';

/**
 * Registry of all available tools for the AI agent
 */
export const AVAILABLE_TOOLS = [
    calculateTransactionsByDateTool,
    calculateTransactionsByDateRangeTool,
    calculateTransactionsByLastDaysTool,
    getSpendingByTypeTool,
    detectSpendingLeaksTool
];

/**
 * Convert Zod schema to JSON Schema for OpenAI
 */
function zodToJsonSchema(schema: z.ZodSchema): any {
    const description = (schema as any).description;
    
    if (schema instanceof z.ZodObject) {
        const shape = schema.shape;
        const properties: Record<string, any> = {};
        const required: string[] = [];

        for (const [key, value] of Object.entries(shape)) {
            const fieldSchema = value as z.ZodTypeAny;
            const isOptional = fieldSchema._def.typeName === 'ZodOptional';
            const baseSchema = isOptional ? fieldSchema._def.schema : fieldSchema;

            properties[key] = zodPropertyToJsonSchema(baseSchema);
            
            if (!isOptional) {
                required.push(key);
            }
        }

        return {
            type: 'object',
            properties,
            required
        };
    }

    return { type: 'object' };
}

/**
 * Convert a single Zod property to JSON Schema
 */
function zodPropertyToJsonSchema(schema: z.ZodTypeAny): any {
    const typeName = schema._def.typeName;
    const description = schema._def.description;

    switch (typeName) {
        case 'ZodString':
            if ((schema as any)._def.checks) {
                for (const check of (schema as any)._def.checks) {
                    if (check.kind === 'regex') {
                        return {
                            type: 'string',
                            pattern: check.regex.source,
                            description
                        };
                    }
                }
            }
            return { type: 'string', description };

        case 'ZodNumber':
            return { type: 'number', description };

        case 'ZodBoolean':
            return { type: 'boolean', description };

        case 'ZodArray':
            return {
                type: 'array',
                items: zodPropertyToJsonSchema((schema as any)._def.type),
                description
            };

        case 'ZodEnum':
            return {
                type: 'string',
                enum: (schema as any)._def.values,
                description
            };

        case 'ZodOptional':
            return zodPropertyToJsonSchema((schema as any)._def.schema);

        case 'ZodDefault':
            return {
                ...zodPropertyToJsonSchema((schema as any)._def.schema),
                default: (schema as any)._def.defaultValue(),
                description
            };

        default:
            return { type: 'string', description };
    }
}

/**
 * Tool registry for easy lookup and execution
 */
export class ToolRegistry {
    private tools: Map<string, Tool>;

    constructor(toolList: Tool[] = AVAILABLE_TOOLS) {
        this.tools = new Map(toolList.map(tool => [tool.name, tool]));
    }

    /**
     * Get a tool by name
     */
    getTool(name: string): Tool | undefined {
        return this.tools.get(name);
    }

    /**
     * Execute a tool by name with given arguments
     */
    async executeTool(name: string, args: Record<string, any>): Promise<any> {
        const tool = this.getTool(name);
        if (!tool) {
            throw new Error(`Tool "${name}" not found in registry`);
        }

        // Validate arguments using Zod schema
        try {
            const validated = tool.schema.parse(args);
            return tool.execute(validated);
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw new Error(`Tool "${name}" validation failed: ${error.errors.map(e => e.message).join(', ')}`);
            }
            throw error;
        }
    }

    /**
     * Get all tools as OpenAI tool format
     */
    getToolsForOpenAI(): Array<{
        type: 'function';
        function: {
            name: string;
            description: string;
            parameters: any;
        };
    }> {
        return Array.from(this.tools.values()).map(tool => ({
            type: 'function',
            function: {
                name: tool.name,
                description: tool.description,
                parameters: zodToJsonSchema(tool.schema)
            }
        }));
    }

    /**
     * Get list of all available tool names
     */
    getToolNames(): string[] {
        return Array.from(this.tools.keys());
    }
}

/**
 * Create a default tool registry instance
 */
export const defaultToolRegistry = new ToolRegistry();

export type { Tool } from './definitions';
