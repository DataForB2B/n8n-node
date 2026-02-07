import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeApiError,
  INodePropertyOptions,
} from "n8n-workflow";

const DATAFORB2B_API_BASE_URL = "https://api.dataforb2b.ai";

// Operators disponibles par type
const textOperators: INodePropertyOptions[] = [
  { name: "Equals", value: "=" },
  { name: "Not Equals", value: "!=" },
  { name: "Contains", value: "like" },
  { name: "Not Contains", value: "not_like" },
  { name: "In List", value: "in" },
  { name: "Not In List", value: "not_in" },
];

const numericOperators: INodePropertyOptions[] = [
  { name: "Equals", value: "=" },
  { name: "Not Equals", value: "!=" },
  { name: "Greater Than", value: ">" },
  { name: "Greater Than or Equal", value: ">=" },
  { name: "Less Than", value: "<" },
  { name: "Less Than or Equal", value: "<=" },
  { name: "Between", value: "between" },
];

// People filter fields
const peopleFilterFields: INodePropertyOptions[] = [
  // Profile
  { name: "First Name", value: "first_name" },
  { name: "Last Name", value: "last_name" },
  { name: "Profile Headline", value: "profile_headline" },
  { name: "Summary", value: "summary" },
  { name: "Profile Location", value: "profile_location" },
  { name: "Profile Country", value: "profile_country" },
  { name: "Profile Industry", value: "profile_industry" },
  { name: "Follower Count", value: "follower_count" },
  { name: "Keyword (Full-text)", value: "keyword" },
  // Current Job
  { name: "Current Company", value: "current_company" },
  { name: "Current Title", value: "current_title" },
  { name: "Current Job Location", value: "current_job_location" },
  { name: "Current Job Country", value: "current_job_country" },
  { name: "Current Company Industry", value: "current_company_industry" },
  { name: "Current Company Size", value: "current_company_size" },
  { name: "Current Company ID", value: "current_company_id" },
  { name: "Current Employment Type", value: "current_employment_type" },
  { name: "Years in Current Position", value: "years_in_current_position" },
  { name: "Years at Current Company", value: "years_at_current_company" },
  // Past Jobs
  { name: "Past Company", value: "past_company" },
  { name: "Past Title", value: "past_title" },
  { name: "Past Job Location", value: "past_job_location" },
  { name: "Past Job Country", value: "past_job_country" },
  { name: "Past Company Industry", value: "past_company_industry" },
  { name: "Past Company Size", value: "past_company_size" },
  { name: "Past Company ID", value: "past_company_id" },
  { name: "Past Employment Type", value: "past_employment_type" },
  { name: "Years at Past Company", value: "years_at_past_company" },
  // Skills
  { name: "Skill", value: "skill" },
  // Education
  { name: "School", value: "school" },
  { name: "Degree", value: "degree" },
  { name: "Degree Level", value: "degree_level" },
  { name: "Field of Study", value: "field_of_study" },
  // Languages
  { name: "Language", value: "language" },
  { name: "Language ISO", value: "language_iso" },
  { name: "Language Proficiency", value: "language_proficiency" },
  // Certifications
  { name: "Certification", value: "certification" },
  { name: "Certification Authority", value: "certification_authority" },
  // Experience
  { name: "Years of Experience", value: "years_of_experience" },
  { name: "Number of Total Jobs", value: "num_total_jobs" },
  { name: "Is Currently Employed", value: "is_currently_employed" },
];

// Company filter fields
const companyFilterFields: INodePropertyOptions[] = [
  // Basic Info
  { name: "Name", value: "name" },
  { name: "Tagline", value: "tagline" },
  { name: "Description", value: "description" },
  { name: "Domain", value: "domain" },
  { name: "Universal Name", value: "universal_name" },
  { name: "Keyword (Full-text)", value: "keyword" },
  { name: "Industry", value: "industry" },
  // Size
  { name: "Employee Count", value: "employee_count" },
  // Headquarters
  { name: "Country ISO Code", value: "country_iso_code" },
  { name: "City", value: "city" },
  { name: "Region", value: "region" },
  // Offices
  { name: "Office Country", value: "office_country" },
  { name: "Office City", value: "office_city" },
  { name: "Office Region", value: "office_region" },
  // Growth
  { name: "Employee Growth 1M (%)", value: "employee_growth_1m" },
  { name: "Employee Growth 6M (%)", value: "employee_growth_6m" },
  { name: "Employee Growth 12M (%)", value: "employee_growth_12m" },
  { name: "Recent Hires Count", value: "recent_hires_count" },
  // Metadata
  { name: "Founded Year", value: "founded_year" },
  { name: "Company Type", value: "company_type" },
  { name: "Follower Count", value: "follower_count" },
  { name: "Page Verified", value: "page_verified" },
  { name: "Category", value: "category" },
];

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
          { name: "Search", value: "search" },
          { name: "Enrich", value: "enrich" },
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
          show: { resource: ["search"] },
        },
        options: [
          { name: "Search People", value: "searchPeople", description: "Find professionals using 50+ filters", action: "Search people" },
          { name: "Search Companies", value: "searchCompanies", description: "Find companies with advanced filters", action: "Search companies" },
          { name: "Agentic Search (LLM)", value: "agenticSearch", description: "Natural language queries with AI interpretation", action: "Agentic search LLM" },
          { name: "Text to Filters", value: "textToFilters", description: "Convert natural language to structured filters", action: "Text to filters" },
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
          show: { resource: ["enrich"] },
        },
        options: [
          { name: "Enrich Profile", value: "enrichProfile", description: "Retrieve detailed professional data", action: "Enrich profile" },
          { name: "Enrich Company", value: "enrichCompany", description: "Retrieve comprehensive company information", action: "Enrich company" },
        ],
        default: "enrichProfile",
      },

      // === FILTER LOGIC (AND/OR) ===
      {
        displayName: "Filter Logic",
        name: "filterLogic",
        type: "options",
        options: [
          { name: "AND (All conditions must match)", value: "and" },
          { name: "OR (Any condition can match)", value: "or" },
        ],
        default: "and",
        description: "How to combine multiple filters",
        displayOptions: {
          show: { resource: ["search"], operation: ["searchPeople", "searchCompanies"] },
        },
      },

      // === SEARCH PEOPLE FILTERS ===
      {
        displayName: "Filters",
        name: "peopleFilters",
        type: "fixedCollection",
        typeOptions: { multipleValues: true },
        default: {},
        displayOptions: {
          show: { resource: ["search"], operation: ["searchPeople"] },
        },
        options: [
          {
            name: "conditions",
            displayName: "Conditions",
            values: [
              {
                displayName: "Field",
                name: "field",
                type: "options",
                options: peopleFilterFields,
                default: "current_title",
              },
              {
                displayName: "Operator",
                name: "operator",
                type: "options",
                options: [
                  ...textOperators,
                  ...numericOperators.filter(op => !textOperators.find(t => t.value === op.value)),
                ],
                default: "like",
              },
              {
                displayName: "Value",
                name: "value",
                type: "string",
                default: "",
                description: "For \"In List\" or \"Not In List\", use comma-separated values",
              },
              {
                displayName: "Value 2 (for Between)",
                name: "value2",
                type: "string",
                default: "",
                description: "Second value for \"Between\" operator",
                displayOptions: {
                  show: { operator: ["between"] },
                },
              },
            ],
          },
        ],
      },

      // === SEARCH COMPANIES FILTERS ===
      {
        displayName: "Filters",
        name: "companyFilters",
        type: "fixedCollection",
        typeOptions: { multipleValues: true },
        default: {},
        displayOptions: {
          show: { resource: ["search"], operation: ["searchCompanies"] },
        },
        options: [
          {
            name: "conditions",
            displayName: "Conditions",
            values: [
              {
                displayName: "Field",
                name: "field",
                type: "options",
                options: companyFilterFields,
                default: "name",
              },
              {
                displayName: "Operator",
                name: "operator",
                type: "options",
                options: [
                  ...textOperators,
                  ...numericOperators.filter(op => !textOperators.find(t => t.value === op.value)),
                ],
                default: "like",
              },
              {
                displayName: "Value",
                name: "value",
                type: "string",
                default: "",
                description: "For \"In List\" or \"Not In List\", use comma-separated values",
              },
              {
                displayName: "Value 2 (for Between)",
                name: "value2",
                type: "string",
                default: "",
                description: "Second value for \"Between\" operator",
                displayOptions: {
                  show: { operator: ["between"] },
                },
              },
            ],
          },
        ],
      },

      // === PAGINATION ===
      {
        displayName: "Count",
        name: "count",
        type: "number",
        default: 10,
        description: "Number of results to return (max 1000)",
        displayOptions: {
          show: { resource: ["search"], operation: ["searchPeople", "searchCompanies"] },
        },
      },
      {
        displayName: "Offset",
        name: "offset",
        type: "number",
        default: 0,
        description: "Pagination offset - number of results to skip",
        displayOptions: {
          show: { resource: ["search"], operation: ["searchPeople", "searchCompanies"] },
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
          show: { resource: ["search"], operation: ["agenticSearch", "textToFilters"] },
        },
      },
      {
        displayName: "Category",
        name: "category",
        type: "options",
        options: [
          { name: "People", value: "people" },
          { name: "Company", value: "company" },
        ],
        default: "people",
        description: "Search category",
        displayOptions: {
          show: { resource: ["search"], operation: ["agenticSearch", "textToFilters"] },
        },
      },
      {
        displayName: "Count",
        name: "countLlm",
        type: "number",
        default: 10,
        description: "Number of results to return (max 100 for LLM search)",
        displayOptions: {
          show: { resource: ["search"], operation: ["agenticSearch"] },
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
          show: { resource: ["enrich"], operation: ["enrichProfile"] },
        },
      },
      {
        displayName: "Enrich Profile",
        name: "enrichProfile",
        type: "boolean",
        default: true,
        description: "Whether to retrieve full profile data (1 credit)",
        displayOptions: {
          show: { resource: ["enrich"], operation: ["enrichProfile"] },
        },
      },
      {
        displayName: "Enrich Work Email",
        name: "enrichWorkEmail",
        type: "boolean",
        default: false,
        description: "Whether to retrieve professional email (3 credits)",
        displayOptions: {
          show: { resource: ["enrich"], operation: ["enrichProfile"] },
        },
      },
      {
        displayName: "Enrich Personal Email",
        name: "enrichPersonalEmail",
        type: "boolean",
        default: false,
        description: "Whether to retrieve personal email (1 credit)",
        displayOptions: {
          show: { resource: ["enrich"], operation: ["enrichProfile"] },
        },
      },
      {
        displayName: "Enrich Phone",
        name: "enrichPhone",
        type: "boolean",
        default: false,
        description: "Whether to retrieve phone number (10 credits)",
        displayOptions: {
          show: { resource: ["enrich"], operation: ["enrichProfile"] },
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
          show: { resource: ["enrich"], operation: ["enrichCompany"] },
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

        switch (operation) {
          case "searchPeople": {
            endpoint = "/search/people";
            const filterLogic = this.getNodeParameter("filterLogic", i) as string;
            const peopleFilters = this.getNodeParameter("peopleFilters", i) as { conditions?: Array<{ field: string; operator: string; value: string; value2?: string }> };

            const conditions = (peopleFilters.conditions || []).map((cond) => {
              const condition: any = {
                field: cond.field,
                op: cond.operator,
                value: cond.operator === "in" || cond.operator === "not_in"
                  ? cond.value.split(",").map((v: string) => v.trim())
                  : cond.value,
              };
              if (cond.operator === "between" && cond.value2) {
                condition.value2 = cond.value2;
              }
              return condition;
            });

            body = {
              filters: { op: filterLogic, conditions },
              count: this.getNodeParameter("count", i) as number,
              offset: this.getNodeParameter("offset", i) as number,
            };
            break;
          }

          case "searchCompanies": {
            endpoint = "/search/company";
            const filterLogic = this.getNodeParameter("filterLogic", i) as string;
            const companyFilters = this.getNodeParameter("companyFilters", i) as { conditions?: Array<{ field: string; operator: string; value: string; value2?: string }> };

            const conditions = (companyFilters.conditions || []).map((cond) => {
              const condition: any = {
                field: cond.field,
                op: cond.operator,
                value: cond.operator === "in" || cond.operator === "not_in"
                  ? cond.value.split(",").map((v: string) => v.trim())
                  : cond.value,
              };
              if (cond.operator === "between" && cond.value2) {
                condition.value2 = cond.value2;
              }
              return condition;
            });

            body = {
              filters: { op: filterLogic, conditions },
              count: this.getNodeParameter("count", i) as number,
              offset: this.getNodeParameter("offset", i) as number,
            };
            break;
          }

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
          headers: { "Content-Type": "application/json" },
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
