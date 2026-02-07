import {
  ICredentialType,
  INodeProperties,
  IAuthenticateGeneric,
  ICredentialTestRequest,
} from "n8n-workflow";

export class DataForB2BApi implements ICredentialType {
  name = "dataForB2BApi";
  displayName = "DataForB2B API";
  documentationUrl = "https://docs.dataforb2b.ai/";

  properties: INodeProperties[] = [
    {
      displayName: "API Key",
      name: "apiKey",
      type: "string",
      default: "",
      description: "Your DataForB2B API key from https://app.dataforb2b.ai",
      typeOptions: {
        password: true,
      },
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: "generic",
    properties: {
      headers: {
        "api_key": "={{$credentials.apiKey}}",
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: "https://api.dataforb2b.ai",
      url: "/search/llm/filters",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api_key": "={{$credentials.apiKey}}",
      },
      body: {
        query: "test",
        category: "people",
      },
    },
  };
}
