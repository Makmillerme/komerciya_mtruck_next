Fixed Docker production build failure caused by strict TypeScript tuple typing in lib/proposal-specs.ts.

Error:
- Type '[string, string | boolean][]' is not assignable to type '[string, string][]'

Change:
- In getMainSpecItems and getTechSpecItems, cast mapped values to string:
  String(data[key] ?? "")

Validation:
- npm run build passed locally.

Git:
- Commit: 956ee11
- Pushed to origin/main