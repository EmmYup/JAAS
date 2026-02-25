#!/usr/bin/env node

/**
 * AI Job Application MCP Server
 * 
 * Exposes tools for LLM agents to discover, score, and apply to job opportunities.
 * Built with TypeScript + MCP SDK + Streamable HTTP transport.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";
import { registerJobDiscoveryTools } from "./tools/job-discovery.js";
import { registerJobScoringTools } from "./tools/job-scoring.js";
import { registerApplicationTools } from "./tools/application-management.js";
import { registerAnalyticsTools } from "./tools/analytics.js";

// Load environment variables
dotenv.config();

/**
 * MCP Server for Job Application Automation
 */
class JobApplicationMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "job-application-automation",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools: Tool[] = [
        // Job Discovery Tools
        {
          name: "search_jobs",
          description: "Search for jobs from multiple sources (Adzuna, Greenhouse, Lever) based on keywords, location, and filters",
          inputSchema: {
            type: "object",
            properties: {
              keywords: {
                type: "array",
                items: { type: "string" },
                description: "Search keywords (role titles, skills, company names)",
              },
              location: {
                type: "string",
                description: "Job location or 'Remote'",
              },
              remote_only: {
                type: "boolean",
                description: "Filter for remote jobs only",
                default: false,
              },
              page: {
                type: "number",
                description: "Page number for pagination",
                default: 1,
              },
              limit: {
                type: "number",
                description: "Number of results per page (max 50)",
                default: 20,
              },
            },
            required: ["keywords"],
          },
        },
        {
          name: "refresh_job_listings",
          description: "Force refresh of job listings from all sources. Use sparingly to respect API rate limits.",
          inputSchema: {
            type: "object",
            properties: {
              force_update: {
                type: "boolean",
                description: "Force update even if cache is fresh",
                default: false,
              },
            },
          },
        },
        {
          name: "get_job_sources",
          description: "Get list of configured job sources and their status (API limits, last update, etc.)",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },

        // Job Scoring Tools
        {
          name: "score_job",
          description: "Score a specific job based on role match, tech stack, company stage, experience level, and location",
          inputSchema: {
            type: "object",
            properties: {
              job_id: {
                type: "string",
                description: "UUID of the job to score",
              },
            },
            required: ["job_id"],
          },
        },
        {
          name: "filter_jobs",
          description: "Filter jobs by minimum score, role type, company stage, and tech stack requirements",
          inputSchema: {
            type: "object",
            properties: {
              min_score: {
                type: "number",
                description: "Minimum overall score (0-100)",
                default: 70,
              },
              role_type: {
                type: "array",
                items: { type: "string" },
                description: "Target role types (e.g., 'Engineering Manager', 'Senior Frontend')",
              },
              company_stage: {
                type: "array",
                items: { type: "string" },
                description: "Company stages (startup, growth, faang)",
              },
              tech_stack: {
                type: "array",
                items: { type: "string" },
                description: "Required technologies",
              },
              limit: {
                type: "number",
                description: "Maximum results to return",
                default: 50,
              },
            },
          },
        },
        {
          name: "get_top_matches",
          description: "Get top scoring jobs with optional filters, sorted by overall score",
          inputSchema: {
            type: "object",
            properties: {
              limit: {
                type: "number",
                description: "Number of top matches to return",
                default: 10,
              },
              filters: {
                type: "object",
                description: "Optional filters (min_score, role_type, company_stage, tech_stack)",
              },
            },
          },
        },

        // Application Management Tools
        {
          name: "create_application",
          description: "Create a draft application for a job, selecting the best resume and generating a cover letter",
          inputSchema: {
            type: "object",
            properties: {
              job_id: {
                type: "string",
                description: "UUID of the job to apply to",
              },
              resume_version: {
                type: "string",
                description: "Override auto-selected resume version (optional)",
              },
              cover_letter_tone: {
                type: "string",
                enum: ["professional", "enthusiastic", "technical"],
                description: "Tone for cover letter generation",
                default: "professional",
              },
              custom_notes: {
                type: "string",
                description: "Custom notes for this application",
              },
            },
            required: ["job_id"],
          },
        },
        {
          name: "submit_application",
          description: "Submit a draft application. Will perform ethics checks before submission.",
          inputSchema: {
            type: "object",
            properties: {
              application_id: {
                type: "string",
                description: "UUID of the application to submit",
              },
              dry_run: {
                type: "boolean",
                description: "Test submission without actually sending",
                default: false,
              },
            },
            required: ["application_id"],
          },
        },
        {
          name: "batch_submit_applications",
          description: "Submit multiple applications with rate limiting (max 50/day, 5min intervals)",
          inputSchema: {
            type: "object",
            properties: {
              application_ids: {
                type: "array",
                items: { type: "string" },
                description: "List of application UUIDs to submit",
              },
              max_per_day: {
                type: "number",
                description: "Maximum applications to submit per day",
                default: 50,
              },
              dry_run: {
                type: "boolean",
                description: "Test submissions without actually sending",
                default: false,
              },
            },
            required: ["application_ids"],
          },
        },
        {
          name: "get_application_status",
          description: "Get detailed status of a specific application",
          inputSchema: {
            type: "object",
            properties: {
              application_id: {
                type: "string",
                description: "UUID of the application",
              },
            },
            required: ["application_id"],
          },
        },
        {
          name: "list_applications",
          description: "List applications with optional filters (status, date range)",
          inputSchema: {
            type: "object",
            properties: {
              status: {
                type: "string",
                enum: ["draft", "submitted", "interview", "rejected", "offer"],
                description: "Filter by application status",
              },
              date_from: {
                type: "string",
                description: "Start date (ISO 8601 format)",
              },
              date_to: {
                type: "string",
                description: "End date (ISO 8601 format)",
              },
              limit: {
                type: "number",
                description: "Maximum results",
                default: 50,
              },
            },
          },
        },

        // Resume & Cover Letter Tools
        {
          name: "select_best_resume",
          description: "Auto-select the best resume version for a specific job based on role type and company stage",
          inputSchema: {
            type: "object",
            properties: {
              job_id: {
                type: "string",
                description: "UUID of the job",
              },
            },
            required: ["job_id"],
          },
        },
        {
          name: "generate_cover_letter",
          description: "Generate a tailored cover letter for a specific job using Claude Sonnet 4",
          inputSchema: {
            type: "object",
            properties: {
              job_id: {
                type: "string",
                description: "UUID of the job",
              },
              tone: {
                type: "string",
                enum: ["professional", "enthusiastic", "technical"],
                description: "Cover letter tone",
                default: "professional",
              },
              length: {
                type: "string",
                enum: ["short", "medium", "long"],
                description: "Approximate word count (200/300/400 words)",
                default: "medium",
              },
            },
            required: ["job_id"],
          },
        },

        // Analytics Tools
        {
          name: "get_application_stats",
          description: "Get overall application statistics (total, by status, response rate, etc.)",
          inputSchema: {
            type: "object",
            properties: {
              date_from: {
                type: "string",
                description: "Start date for stats (ISO 8601)",
              },
              date_to: {
                type: "string",
                description: "End date for stats (ISO 8601)",
              },
            },
          },
        },
        {
          name: "get_response_rate",
          description: "Calculate response rate by company stage, role type, and resume version",
          inputSchema: {
            type: "object",
            properties: {
              group_by: {
                type: "string",
                enum: ["company_stage", "role_type", "resume_version", "source"],
                description: "Group results by this dimension",
                default: "company_stage",
              },
            },
          },
        },
        {
          name: "get_top_companies_applied",
          description: "Get list of companies with most applications and their success rates",
          inputSchema: {
            type: "object",
            properties: {
              limit: {
                type: "number",
                description: "Number of companies to return",
                default: 20,
              },
            },
          },
        },
      ];

      return { tools };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        // Route to appropriate tool handler
        if (name.startsWith("search_") || name.startsWith("refresh_") || name.startsWith("get_job_")) {
          return await registerJobDiscoveryTools(name, args);
        } else if (name.startsWith("score_") || name.startsWith("filter_") || name.startsWith("get_top_")) {
          return await registerJobScoringTools(name, args);
        } else if (
          name.includes("application") ||
          name.includes("resume") ||
          name.includes("cover_letter")
        ) {
          return await registerApplicationTools(name, args);
        } else if (name.includes("stats") || name.includes("response_rate") || name.includes("companies")) {
          return await registerAnalyticsTools(name, args);
        }

        throw new Error(`Unknown tool: ${name}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `Error executing ${name}: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Job Application MCP Server running on stdio");
  }
}

// Start server
const server = new JobApplicationMCPServer();
server.run().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
