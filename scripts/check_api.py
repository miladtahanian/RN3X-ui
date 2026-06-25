import json
with open('D:\\Projects\\RN3X-ui\\openapi.json','r') as f:
    data = json.load(f)

# Check clients list response structure in detail
cl_path = data['paths'].get('/panel/api/clients/list', {}).get('get', {})
cl_resp = cl_path.get('responses',{}).get('200',{}).get('content',{}).get('application/json',{})
schema = cl_resp.get('schema',{})
print("Schema properties:", list(schema.get('properties',{}).keys()))
obj = schema.get('properties',{}).get('obj',{})
print(f"obj type: {obj.get('type')}")
print(f"obj items: {obj.get('items', 'no items')}")

# Example (if any)
example = cl_resp.get('example', {})
if example:
    print(f"\nFull example:")
    s = json.dumps(example, indent=2)
    print(s[:800])
    
# Check if there's any other path that might be the right one
print("\n=== All clients paths ===")
for path in sorted(data['paths'].keys()):
    if 'client' in path.lower():
        methods = list(data['paths'][path].keys())
        print(f"  {methods[0].upper()} {path}")
