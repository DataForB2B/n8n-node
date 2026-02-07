import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeApiError,
} from "n8n-workflow";

const DATAFORB2B_API_BASE_URL = "https://api.dataforb2b.ai";

export class DataForB2B implements INodeType {
  description: INodeTypeDescription = {
    displayName: "DataForB2B",
    name: "dataForB2B",
    icon: "file:dataforb2b.png",
    group: ["transform"],
    version: 1,
    description: "Access B2B data - Search people, companies and enrich profiles",
    defaults: {
      name: "DataForB2B",
      color: "#6366f1",
    },
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      {
        name: "dataForB2BApi",
        required: true,
      },
    ],
    properties: [
      // Resource selection
      {
        displayName: "Resource",
        name: "resource",
        type: "options",
        noDataExpression: true,
        options: [
          {
            name: "Search",
            value: "search",
          },
          {
            name: "Enrich",
            value: "enrich",
          },
        ],
        default: "search",
      },

      // === SEARCH OPERATIONS ===
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ["search"],
          },
        },
        options: [
          {
            name: "Search People",
            value: "searchPeople",
            description: "Find professionals using 50+ filters",
            action: "Search people",
          },
          {
            name: "Search Companies",
            value: "searchCompanies",
            description: "Find companies with advanced filters",
            action: "Search companies",
          },
          {
            name: "Agentic Search (LLM)",
            value: "agenticSearch",
            description: "Natural language queries with AI interpretation",
            action: "Agentic search LLM",
          },
          {
            name: "Text to Filters",
            value: "textToFilters",
            description: "Convert natural language to structured filters",
            action: "Text to filters",
          },
        ],
        default: "searchPeople",
      },

      // === ENRICH OPERATIONS ===
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ["enrich"],
          },
        },
        options: [
          {
            name: "Enrich Profile",
            value: "enrichProfile",
            description: "Retrieve detailed professional data",
            action: "Enrich profile",
          },
          {
            name: "Enrich Company",
            value: "enrichCompany",
            description: "Retrieve comprehensive company information",
            action: "Enrich company",
          },
        ],
        default: "enrichProfile",
      },

      // === SEARCH PEOPLE PARAMETERS ===
      {
        displayName: "Filters (JSON)",
        name: "filters",
        type: "json",
        default: '{"op": "and", "conditions": []}',
        description: 'FilterGroup object with conditions. Example: {"op": "and", "conditions": [{"field": "title", "op": "like", "value": "CEO"}]}',
        displayOptions: {
          show: {
            resource: ["search"],
            operation: ["searchPeople", "searchCompanies"],
          },
        },
      },
      {
        displayName: "Count",
        name: "count",
        type: "number",
        default: 10,
        description: "Number of results to return (max 1000)",
        displayOptions: {
          show: {
            resource: ["search"],
            operation: ["searchPeople", "searchCompanies"],
          },
        },
      },
      {
        displayName: "Offset",
        name: "offset",
        type: "number",
        default: 0,
        description: "Pagination offset - number of results to skip",
        displayOptions: {
          show: {
            resource: ["search"],
            operation: ["searchPeople", "searchCompanies"],
          },
        },
      },

      // === AGENTIC SEARCH PARAMETERS ===
      {
        displayName: "Query",
        name: "query",
        type: "string",
        default: "",
        required: true,
        description: "Natural language search query (min 3 characters)",
        displayOptions: {
          show: {
            resource: ["search"],
            operation: ["agenticSearch", "textToFilters"],
          },
        },
      },
      {
        displayName: "Category",
        name: "category",
        type: "options",
        options: [
          {
            name: "People",
            value: "people",
          },
          {
            name: "Company",
            value: "company",
          },
        ],
        default: "people",
        description: "Search category",
        displayOptions: {
          show: {
            resource: ["search"],
            operation: ["agenticSearch", "textToFilters"],
          },
        },
      },
      {
        displayName: "Count",
        name: "countLlm",
        type: "number",
        default: 10,
        description: "Number of results to return (max 100 for LLM search)",
        displayOptions: {
          show: {
            resource: ["search"],
            operation: ["agenticSearch"],
          },
        },
      },

      // === ENRICH PROFILE PARAMETERS ===
      {
        displayName: "Profile Identifier",
        name: "profileIdentifier",
        type: "string",
        default: "",
        required: true,
        description: "LinkedIn URL, public ID, or encoded ID",
        displayOptions: {
          show: {
            resource: ["enrich"],
            operation: ["enrichProfile"],
          },
        },
      },
      {
        displayName: "Enrich Profile",
        name: "enrichProfile",
        type: "boolean",
        default: true,
        description: "Whether to retrieve full profile data (1 credit)",
        displayOptions: {
          show: {
            resource: ["enrich"],
            operation: ["enrichProfile"],
          },
        },
      },
      {
        displayName: "Enrich Work Email",
        name: "enrichWorkEmail",
        type: "boolean",
        default: false,
        description: "Whether to retrieve professional email (3 credits)",
        displayOptions: {
          show: {
            resource: ["enrich"],
            operation: ["enrichProfile"],
          },
        },
      },
      {
        displayName: "Enrich Personal Email",
        name: "enrichPersonalEmail",
        type: "boolean",
        default: false,
        description: "Whether to retrieve personal email (1 credit)",
        displayOptions: {
          show: {
            resource: ["enrich"],
            operation: ["enrichProfile"],
          },
        },
      },
      {
        displayName: "Enrich Phone",
        name: "enrichPhone",
        type: "boolean",
        default: false,
        description: "Whether to retrieve phone number (10 credits)",
        displayOptions: {
          show: {
            resource: ["enrich"],
            operation: ["enrichProfile"],
          },
        },
      },

      // === ENRICH COMPANY PARAMETERS ===
      {
        displayName: "Company Identifier",
        name: "companyIdentifier",
        type: "string",
        default: "",
        required: true,
        description: "Company slug, LinkedIn URL, or encoded ID",
        displayOptions: {
          show: {
            resource: ["enrich"],
            operation: ["enrichCompany"],
          },
        },
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const operation = this.getNodeParameter("operation", i) as string;

      try {
        let endpoint = "";
        let body: any = {};

        // Build request based on operation
        switch (operation) {
          case "searchPeople":
            endpoint = "/search/people";
            body = {
              filters: this.getNodeParameter("filters", i),
              count: this.getNodeParameter("count", i) as number,
              offset: this.getNodeParameter("offset", i) as number,
            };
            break;

          case "searchCompanies":
            endpoint = "/search/company";
            body = {
              filters: this.getNodeParameter("filters", i),
              count: this.getNodeParameter("count", i) as number,
              offset: this.getNodeParameter("offset", i) as number,
            };
            break;

          case "agenticSearch":
            endpoint = "/search/llm";
            body = {
              query: this.getNodeParameter("query", i) as string,
              category: this.getNodeParameter("category", i) as string,
              count: this.getNodeParameter("countLlm", i) as number,
            };
            break;

          case "textToFilters":
            endpoint = "/search/llm/filters";
            body = {
              query: this.getNodeParameter("query", i) as string,
              category: this.getNodeParameter("category", i) as string,
            };
            break;

          case "enrichProfile":
            endpoint = "/enrich/profile";
            body = {
              profile_identifier: this.getNodeParameter("profileIdentifier", i) as string,
              enrich_profile: this.getNodeParameter("enrichProfile", i) as boolean,
              enrich_work_email: this.getNodeParameter("enrichWorkEmail", i) as boolean,
              enrich_personal_email: this.getNodeParameter("enrichPersonalEmail", i) as boolean,
              enrich_phone: this.getNodeParameter("enrichPhone", i) as boolean,
            };
            break;

          case "enrichCompany":
            endpoint = "/enrich/company";
            body = {
              company_identifier: this.getNodeParameter("companyIdentifier", i) as string,
            };
            break;
        }

        const requestOptions = {
          method: "POST" as const,
          url: `${DATAFORB2B_API_BASE_URL}${endpoint}`,
          headers: {
            "Content-Type": "application/json",
          },
          body,
          timeout: 60000,
        };

        const response = await this.helpers.httpRequestWithAuthentication.call(
          this,
          "dataForB2BApi",
          requestOptions
        );

        returnData.push({
          json: response || {},
          pairedItem: { item: i },
        });
      } catch (error: any) {
        if (this.continueOnFail()) {
          const payload = error?.response?.data || error?.response?.body || { error: error.message };
          returnData.push({
            json: payload,
            pairedItem: { item: i },
          });
          continue;
        }
        throw new NodeApiError(this.getNode(), error);
      }
    }

    return [returnData];
  }
}
