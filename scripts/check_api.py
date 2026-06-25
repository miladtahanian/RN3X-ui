import json
with open('D:\\Projects\\RN3X-ui\\openapi.json','r') as f:
    data = json.load(f)

print("=== All server-related paths ===")
for path in sorted(data['paths'].keys()):
    if 'server' in path.lower():
        methods = list(data['paths'][path].keys())
        print(f"  {methods[0].upper()} {path}")

print("\n=== Object fields for dashboard ===")
# Check what the status response obj contains
resp_schema = data['paths'].get('/panel/api/server/status', {}).get('get', {}).get('responses', {}).get('200', {}).get('content', {}).get('application/json', {}).get('schema', {})
obj_props = resp_schema.get('properties', {}).get('obj', {})
print(f"obj type: {obj_props.get('type', 'any')}")
if 'properties' in obj_props:
    obj_fields = list(obj_props['properties'].keys())
    print(f"obj fields: {obj_fields}")
elif '$ref' in obj_props:
    ref = obj_props['$ref']
    ref_name = ref.split('/')[-1]
    ref_schema = data['components']['schemas'].get(ref_name, {})
    ref_props = ref_schema.get('properties', {})
    print(f"ref {ref_name} fields: {list(ref_props.keys())}")
