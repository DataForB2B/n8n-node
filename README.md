# n8n-nodes-dataforb2b

Official n8n integration for DataForB2B - Access B2B data to search professionals, companies and enrich profiles.

## Installation

```bash
npm install n8n-nodes-dataforb2b
```

## Quick Start

### 1. Get API Credentials

Sign up at [app.dataforb2b.ai](https://app.dataforb2b.ai) and get your API key.

### 2. Configure in n8n

Add your DataForB2B credentials in n8n:
- **Credential Type**: DataForB2B API
- **API Key**: Your API key from the dashboard

### 3. Use in Workflows

Drag and drop DataForB2B nodes into your workflow and start automating.

## Features

### Search
- **Search People** - Find professionals using 50+ filters (name, title, company, skills, location, experience, education, certifications, languages)
- **Search Companies** - Find companies with advanced filters (name, industry, size, headquarters, growth, funding, verified status)
- **Agentic Search (LLM)** - Natural language queries with AI interpretation
- **Text to Filters** - Convert natural language to structured filters

### Enrich
- **Enrich Profile** - Retrieve detailed professional data including:
  - Full profile data (1 credit)
  - Work email (3 credits)
  - Personal email (1 credit)
  - Phone number (10 credits)
- **Enrich Company** - Retrieve comprehensive company information including metrics, growth, funding, investors, locations

## Filter System

Use structured filters with AND/OR logic:

```json
{
  "op": "and",
  "conditions": [
    {"field": "title", "op": "like", "value": "CEO"},
    {"field": "company", "op": "=", "value": "Google"}
  ]
}
```

### Supported Operators
- Comparison: `=`, `!=`, `>`, `>=`, `<`, `<=`
- Range: `between` (requires value2)
- List: `in`, `not_in`
- Text: `like`, `not_like`
- Null: `is_null`, `is_not_null`

## Documentation

- **Full API Docs**: [docs.dataforb2b.ai](https://docs.dataforb2b.ai)
- **Dashboard**: [app.dataforb2b.ai](https://app.dataforb2b.ai)

## Requirements

- Node.js: >= 18.10
- n8n: Latest version
- Valid DataForB2B API key

## License

MIT - See [LICENSE](LICENSE)

## Support

- Website: [dataforb2b.ai](https://dataforb2b.ai)
- Documentation: [docs.dataforb2b.ai](https://docs.dataforb2b.ai)
